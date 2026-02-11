import tempfile
import os
import uuid
from typing import Dict, List, Optional

import numpy as np
import essentia.standard as es
from pydub import AudioSegment
import mutagen
from mutagen.mp3 import MP3
from mutagen.flac import FLAC

from app.models.schemas import Track
from app.services.spotify_service import spotify_service


UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AudioService:
    def __init__(self):
        self._tracks: Dict[str, Track] = {}
        self._file_paths: Dict[str, str] = {}  # track_id -> file path

    async def analyze_file(self, file_data: bytes, filename: str) -> Track:
        """Save file, extract metadata + audio features, return Track."""
        track_id = str(uuid.uuid4())
        suffix = os.path.splitext(filename)[1]
        stored_path = os.path.join(UPLOAD_DIR, f"{track_id}{suffix}")

        with open(stored_path, 'wb') as f:
            f.write(file_data)

        try:
            metadata = self._extract_metadata(stored_path, filename)

            # Try Spotify first for accurate BPM/key/energy
            audio_features = None
            title = metadata['title']
            artist = metadata['artist']
            print(f"\n{'='*50}")
            print(f"ANALYZING: '{title}' by '{artist}'")
            print(f"Spotify available: {spotify_service.sp is not None}")

            if title and artist and artist != 'Unknown Artist':
                print(f"Searching Spotify...")
                audio_features = spotify_service.lookup_audio_features(title, artist)
                if audio_features:
                    print(f"SPOTIFY MATCH: BPM={audio_features.get('bpm')}, Key={audio_features.get('key')}, Energy={audio_features.get('energy')}")
                else:
                    print(f"No Spotify match found")
            else:
                print(f"Skipping Spotify (missing metadata)")

            # Fall back to local analysis if Spotify didn't find it
            if not audio_features:
                print(f"Using LOCAL analysis...")
                audio_features = self._analyze_audio(stored_path)
                print(f"LOCAL RESULT: BPM={audio_features.get('bpm')}, Key={audio_features.get('key')}, Energy={audio_features.get('energy')}")

            print(f"{'='*50}\n")

            track = Track(
                id=track_id,
                title=metadata['title'],
                artist=metadata['artist'],
                album=metadata.get('album'),
                duration=metadata['duration'],
                bpm=audio_features.get('bpm'),
                key=audio_features.get('key'),
                energy=audio_features.get('energy'),
                genre=metadata.get('genre'),
                source='local'
            )

            self._tracks[track_id] = track
            self._file_paths[track_id] = stored_path
            return track
        except Exception:
            if os.path.exists(stored_path):
                os.unlink(stored_path)
            raise

    def _extract_metadata(self, filepath: str, original_filename: str) -> dict:
        """Extract title, artist, album, duration, genre from tags."""
        try:
            audio = mutagen.File(filepath)
            if audio is None:
                raise ValueError("Unrecognized audio format")

            duration = int(audio.info.length)

            title = None
            artist = None
            album = None
            genre = None

            if hasattr(audio, 'tags') and audio.tags:
                if isinstance(audio, MP3):
                    tags = audio.tags
                    title = str(tags.get('TIT2', [''])[0]) if tags.get('TIT2') else None
                    artist = str(tags.get('TPE1', [''])[0]) if tags.get('TPE1') else None
                    album = str(tags.get('TALB', [''])[0]) if tags.get('TALB') else None
                    genre = str(tags.get('TCON', [''])[0]) if tags.get('TCON') else None
                elif isinstance(audio, FLAC):
                    title = audio.tags.get('title', [None])[0]
                    artist = audio.tags.get('artist', [None])[0]
                    album = audio.tags.get('album', [None])[0]
                    genre = audio.tags.get('genre', [None])[0]
                else:
                    tags = audio.tags
                    if hasattr(tags, 'get'):
                        title = tags.get('title', [None])
                        artist = tags.get('artist', [None])
                        album = tags.get('album', [None])
                        genre = tags.get('genre', [None])
                        if isinstance(title, list): title = title[0] if title else None
                        if isinstance(artist, list): artist = artist[0] if artist else None
                        if isinstance(album, list): album = album[0] if album else None
                        if isinstance(genre, list): genre = genre[0] if genre else None

            # If tags are missing, parse from filename
            if not title or not artist:
                parsed_artist, parsed_title = self._parse_filename(original_filename)
                if not title:
                    title = parsed_title
                if not artist:
                    artist = parsed_artist

            return {
                'title': title,
                'artist': artist,
                'album': album,
                'duration': duration,
                'genre': genre
            }
        except Exception:
            parsed_artist, parsed_title = self._parse_filename(original_filename)
            return {
                'title': parsed_title,
                'artist': parsed_artist,
                'album': None,
                'duration': 0,
                'genre': None
            }

    def _parse_filename(self, filename: str) -> tuple:
        """Parse 'Artist - Title [extra]' from filename. Returns (artist, title)."""
        import re
        name = os.path.splitext(filename)[0]

        # Remove common suffixes: [Official Video], (Lyrics), (Official Visualizer), etc.
        name = re.sub(r'\s*[\[\(][^\]\)]*(?:official|video|audio|lyrics|visualizer|remix|prod|ft\.?|feat\.?)[^\]\)]*[\]\)]', '', name, flags=re.IGNORECASE)
        # Remove leftover empty brackets
        name = re.sub(r'\s*[\[\(]\s*[\]\)]', '', name)
        name = name.strip()

        # Try "Artist - Title" format
        if ' - ' in name:
            parts = name.split(' - ', 1)
            artist = parts[0].strip()
            title = parts[1].strip()
            return (artist, title)

        # Try "Artist — Title" (em dash)
        if ' — ' in name:
            parts = name.split(' — ', 1)
            return (parts[0].strip(), parts[1].strip())

        # No separator found — use whole name as title
        return ('Unknown Artist', name.strip())

    def _analyze_audio(self, filepath: str) -> dict:
        """Extract BPM, key, and energy using essentia."""
        try:
            # Load audio with essentia (handles mp3/wav/flac, resamples to 44100)
            audio = es.MonoLoader(filename=filepath, sampleRate=44100)()

            # --- BPM Detection (RhythmExtractor2013) ---
            rhythm_extractor = es.RhythmExtractor2013(method="multifeature")
            bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)
            bpm = round(bpm)

            # Octave correction for DJ range
            while bpm < 80:
                bpm *= 2
            while bpm > 200:
                bpm //= 2

            # --- Key Detection (KeyExtractor) ---
            key_extractor = es.KeyExtractor()
            key_name, scale, strength = key_extractor(audio)
            # Convert to Camelot notation
            mode = 1 if scale == 'major' else 0
            key_camelot = self._note_to_camelot(key_name, mode)

            # --- Energy (loudness mapped to 1-10) ---
            energy_algo = es.Energy()
            rms = np.sqrt(energy_algo(audio) / len(audio))
            energy = min(10, max(1, round(rms * 30 + 1)))

            return {
                'bpm': bpm,
                'key': key_camelot,
                'energy': energy
            }
        except Exception as e:
            print(f"Audio analysis failed: {e}")
            return {}

    def _note_to_camelot(self, key_name: str, mode: int) -> str:
        """Convert note name + mode to Camelot notation."""
        # Map note names to pitch class numbers
        note_to_pitch = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'Fb': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7,
            'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11
        }
        pitch = note_to_pitch.get(key_name)
        if pitch is None:
            return "Unknown"
        return self._pitch_to_camelot(pitch, mode)

    def _pitch_to_camelot(self, key: int, mode: int) -> str:
        """Convert pitch class and mode to Camelot notation."""
        camelot_major = ['8B', '3B', '10B', '5B', '12B', '7B', '2B', '9B', '4B', '11B', '6B', '1B']
        camelot_minor = ['5A', '12A', '7A', '2A', '9A', '4A', '11A', '6A', '1A', '8A', '3A', '10A']

        if key < 0 or key > 11:
            return "Unknown"

        if mode == 1:
            return camelot_major[key]
        else:
            return camelot_minor[key]

    def get_all_tracks(self) -> List[Track]:
        return list(self._tracks.values())

    def get_track(self, track_id: str) -> Optional[Track]:
        return self._tracks.get(track_id)

    def get_file_path(self, track_id: str) -> Optional[str]:
        return self._file_paths.get(track_id)

    def delete_track(self, track_id: str) -> bool:
        if track_id in self._tracks:
            # Remove file from disk
            file_path = self._file_paths.pop(track_id, None)
            if file_path and os.path.exists(file_path):
                os.unlink(file_path)
            del self._tracks[track_id]
            return True
        return False


audio_service = AudioService()

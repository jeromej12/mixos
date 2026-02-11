import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from typing import List, Optional
import os
import tempfile
import requests
import numpy as np
import essentia.standard as es
from app.models.schemas import Track, SpotifyAudioFeatures

class SpotifyService:
    def __init__(self):
        self._sp = None
        self._initialized = False

    @property
    def sp(self):
        """Lazy init so credentials from .env are picked up even after server start."""
        if not self._initialized:
            self._initialized = True
            client_id = os.getenv('SPOTIFY_CLIENT_ID')
            client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

            if not client_id or not client_secret or client_id == 'dummy' or client_id == 'your_client_id_here':
                print("⚠️  Spotify credentials not configured - Spotify features will be disabled")
                self._sp = None
            else:
                auth_manager = SpotifyClientCredentials(
                    client_id=client_id,
                    client_secret=client_secret
                )
                self._sp = spotipy.Spotify(auth_manager=auth_manager)
                print("✅ Spotify client initialized")
        return self._sp

    def search_tracks(self, query: str, limit: int = 10) -> List[Track]:
        """Search for tracks on Spotify"""
        if not self.sp:
            print("Spotify search skipped - no credentials")
            return []
        try:
            results = self.sp.search(q=query, type='track', limit=limit)
            tracks = []

            for item in results['tracks']['items']:
                track = self._convert_spotify_track(item)
                tracks.append(track)

            print(f"Spotify search '{query}': {len(tracks)} results")
            return tracks
        except Exception as e:
            print(f"Error searching tracks: {e}")
            return []

    def get_track(self, spotify_id: str) -> Optional[Track]:
        """Get detailed track information with BPM/key/energy via preview analysis."""
        try:
            item = self.sp.track(spotify_id)
            track = self._convert_spotify_track(item)

            # Analyze preview audio with essentia for BPM/key/energy
            preview_url = item.get('preview_url')
            if preview_url:
                features = self._analyze_preview(preview_url)
                if features:
                    track.bpm = features.get('bpm')
                    track.key = features.get('key')
                    track.energy = features.get('energy')

            return track
        except Exception as e:
            print(f"Error getting track: {e}")
            return None

    def _analyze_preview(self, preview_url: str) -> Optional[dict]:
        """Download Spotify preview clip and analyze with essentia."""
        try:
            # Download preview mp3
            resp = requests.get(preview_url, timeout=10)
            resp.raise_for_status()

            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp:
                tmp.write(resp.content)
                tmp_path = tmp.name

            try:
                audio = es.MonoLoader(filename=tmp_path, sampleRate=44100)()

                # BPM
                rhythm = es.RhythmExtractor2013(method="multifeature")
                bpm, _, _, _, _ = rhythm(audio)
                bpm = round(bpm)
                while bpm < 80:
                    bpm *= 2
                while bpm > 200:
                    bpm //= 2

                # Key
                key_extractor = es.KeyExtractor()
                key_name, scale, strength = key_extractor(audio)
                mode = 1 if scale == 'major' else 0
                key_camelot = self._note_to_camelot(key_name, mode)

                # Energy
                energy_val = es.Energy()(audio)
                rms = np.sqrt(energy_val / len(audio))
                energy = min(10, max(1, round(rms * 30 + 1)))

                return {
                    'bpm': bpm,
                    'key': key_camelot,
                    'energy': energy,
                }
            finally:
                os.unlink(tmp_path)
        except Exception as e:
            print(f"Preview analysis failed: {e}")
            return None

    def lookup_audio_features(self, title: str, artist: str) -> Optional[dict]:
        """Search Spotify for a track by title/artist and analyze its preview for BPM/key/energy."""
        if not self.sp:
            return None
        try:
            results = self.sp.search(q=f"track:{title} artist:{artist}", type='track', limit=1)
            items = results['tracks']['items']
            if not items:
                return None

            item = items[0]
            preview_url = item.get('preview_url')
            if not preview_url:
                print(f"No preview URL for Spotify match: {item['name']}")
                return None

            return self._analyze_preview(preview_url)
        except Exception as e:
            print(f"Spotify lookup failed: {e}")
            return None

    def _note_to_camelot(self, key_name: str, mode: int) -> str:
        """Convert note name + mode to Camelot notation."""
        note_to_pitch = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'Fb': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7,
            'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11
        }
        pitch = note_to_pitch.get(key_name)
        if pitch is None:
            return "Unknown"
        return self._pitch_to_camelot(pitch, mode)

    def _convert_spotify_track(self, item: dict) -> Track:
        """Convert Spotify API response to Track model"""
        return Track(
            id=item['id'],
            title=item['name'],
            artist=', '.join([artist['name'] for artist in item['artists']]),
            album=item['album']['name'],
            album_art=item['album']['images'][0]['url'] if item['album']['images'] else None,
            duration=item['duration_ms'] // 1000,
            source='spotify',
            spotify_id=item['id'],
            preview_url=item.get('preview_url')
        )

    def _pitch_to_camelot(self, key: int, mode: int) -> str:
        """Convert Spotify pitch class and mode to Camelot notation"""
        camelot_major = ['8B', '3B', '10B', '5B', '12B', '7B', '2B', '9B', '4B', '11B', '6B', '1B']
        camelot_minor = ['5A', '12A', '7A', '2A', '9A', '4A', '11A', '6A', '1A', '8A', '3A', '10A']

        if key < 0 or key > 11:
            return "Unknown"

        if mode == 1:  # Major
            return camelot_major[key]
        else:  # Minor
            return camelot_minor[key]

# Global instance
spotify_service = SpotifyService()

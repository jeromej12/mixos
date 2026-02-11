import requests
import tempfile
import os
from typing import List, Optional

import numpy as np
import essentia.standard as es

from app.models.schemas import Track


ITUNES_SEARCH_URL = "https://itunes.apple.com/search"


class ITunesService:
    def search_tracks(self, query: str, limit: int = 10) -> List[Track]:
        """Search iTunes for tracks. Returns tracks with preview URLs."""
        try:
            resp = requests.get(ITUNES_SEARCH_URL, params={
                'term': query,
                'media': 'music',
                'entity': 'song',
                'limit': limit,
            }, timeout=10)
            resp.raise_for_status()
            data = resp.json()

            tracks = []
            for item in data.get('results', []):
                track = self._convert_itunes_track(item)
                tracks.append(track)

            print(f"iTunes search '{query}': {len(tracks)} results")
            return tracks
        except Exception as e:
            print(f"iTunes search failed: {e}")
            return []

    def analyze_track(self, track: Track) -> Track:
        """Download preview and analyze with essentia for BPM/key/energy."""
        if not track.preview_url:
            return track

        features = self._analyze_preview(track.preview_url)
        if features:
            track.bpm = features.get('bpm')
            track.key = features.get('key')
            track.energy = features.get('energy')

        return track

    def _analyze_preview(self, preview_url: str) -> Optional[dict]:
        """Download preview clip and analyze with essentia."""
        try:
            resp = requests.get(preview_url, timeout=15)
            resp.raise_for_status()

            with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as tmp:
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

        camelot_major = ['8B', '3B', '10B', '5B', '12B', '7B', '2B', '9B', '4B', '11B', '6B', '1B']
        camelot_minor = ['5A', '12A', '7A', '2A', '9A', '4A', '11A', '6A', '1A', '8A', '3A', '10A']

        if mode == 1:
            return camelot_major[pitch]
        else:
            return camelot_minor[pitch]

    def _convert_itunes_track(self, item: dict) -> Track:
        """Convert iTunes API response to Track model."""
        # Get higher-res artwork (300x300 instead of 100x100)
        artwork = item.get('artworkUrl100', '')
        if artwork:
            artwork = artwork.replace('100x100', '300x300')

        return Track(
            id=str(item['trackId']),
            title=item['trackName'],
            artist=item['artistName'],
            album=item.get('collectionName'),
            album_art=artwork or None,
            duration=item.get('trackTimeMillis', 0) // 1000,
            source='itunes',
            preview_url=item.get('previewUrl'),
        )


itunes_service = ITunesService()

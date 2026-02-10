import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from typing import List, Optional
import os
from app.models.schemas import Track, SpotifyAudioFeatures

class SpotifyService:
    def __init__(self):
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    
    # Allow dummy credentials for development without Spotify
        if not client_id or not client_secret or client_id == 'dummy' or client_id == 'your_client_id_here':
            print("⚠️  Spotify credentials not configured - Spotify features will be disabled")
            self.sp = None
            return
    
        auth_manager = SpotifyClientCredentials(
            client_id=client_id,
            client_secret=client_secret
        )
        self.sp = spotipy.Spotify(auth_manager=auth_manager)
    
    def search_tracks(self, query: str, limit: int = 20) -> List[Track]:
        """Search for tracks on Spotify"""
        try:
            results = self.sp.search(q=query, type='track', limit=limit)
            tracks = []
            
            for item in results['tracks']['items']:
                track = self._convert_spotify_track(item)
                tracks.append(track)
            
            return tracks
        except Exception as e:
            print(f"Error searching tracks: {e}")
            return []
    
    def get_track(self, spotify_id: str) -> Optional[Track]:
        """Get detailed track information"""
        try:
            item = self.sp.track(spotify_id)
            track = self._convert_spotify_track(item)
            
            # Get audio features
            audio_features = self.sp.audio_features([spotify_id])[0]
            if audio_features:
                track.audio_features = SpotifyAudioFeatures(**audio_features)
                track.bpm = round(audio_features['tempo'])
                track.energy = round(audio_features['energy'] * 10, 1)
                # Convert Spotify key to Camelot notation (simplified for now)
                track.key = self._pitch_to_camelot(audio_features['key'], audio_features['mode'])
            
            return track
        except Exception as e:
            print(f"Error getting track: {e}")
            return None
    
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
        # Camelot wheel mapping
        # Major (mode=1) uses B, Minor (mode=0) uses A
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

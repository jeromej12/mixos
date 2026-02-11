from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class CamelModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        serialize_by_alias=True,
        alias_generator=lambda s: ''.join(
            word.capitalize() if i else word
            for i, word in enumerate(s.split('_'))
        ),
    )


class SpotifyAudioFeatures(CamelModel):
    danceability: float
    energy: float
    key: int
    loudness: float
    mode: int
    speechiness: float
    acousticness: float
    instrumentalness: float
    liveness: float
    valence: float
    tempo: float
    time_signature: int

class Track(CamelModel):
    id: str
    title: str
    artist: str
    album: Optional[str] = None
    album_art: Optional[str] = None
    bpm: Optional[float] = None
    key: Optional[str] = None
    energy: Optional[float] = None
    duration: int  # seconds
    genre: Optional[str] = None
    source: str  # 'spotify' or 'local'
    spotify_id: Optional[str] = None
    preview_url: Optional[str] = None
    audio_features: Optional[SpotifyAudioFeatures] = None

class Setlist(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    tracks: List[Track]
    total_duration: int
    average_bpm: Optional[float] = None
    created_at: datetime
    tags: Optional[List[str]] = None

class SpotifySearchResult(BaseModel):
    tracks: List[Track]
    total: int

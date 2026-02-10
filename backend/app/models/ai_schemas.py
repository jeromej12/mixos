from pydantic import BaseModel
from typing import List, Optional

class AITrackSuggestion(BaseModel):
    title: str
    artist: str
    bpm: int
    key: str
    energy: int  # 1-10
    position: str  # "opener", "build", "peak", "transition", "closer"
    reasoning: str

class AIPlaylistOption(BaseModel):
    name: str
    description: str
    bpm_range: str
    energy_progression: str
    recommended_track_count: int
    total_duration_estimate: int  # minutes
    genres: List[str]
    key_characteristics: List[str]
    tracks: List[AITrackSuggestion]
    transition_notes: List[str]

class AIGenerateRequest(BaseModel):
    query: str
    num_playlists: Optional[int] = 2
    target_duration: Optional[int] = None

class AIGenerateResponse(BaseModel):
    playlists: List[AIPlaylistOption]

from pydantic import BaseModel
from typing import List, Optional

class AITrackSuggestion(BaseModel):
    title: str
    artist: str
    bpm: Optional[int] = None
    key: Optional[str] = None
    energy: Optional[int] = None  # 1-10
    position: Optional[str] = None  # "opener", "build", "peak", "transition", "closer"
    reasoning: Optional[str] = None

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

class AIRefineRequest(BaseModel):
    refinement: str
    current_playlist: dict

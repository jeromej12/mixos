from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class CamelModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        serialize_by_alias=True,
        alias_generator=lambda s: ''.join(
            word.capitalize() if i else word
            for i, word in enumerate(s.split('_'))
        ),
    )


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
    source: str  # 'local' or 'itunes'
    preview_url: Optional[str] = None

class SearchResult(BaseModel):
    tracks: List[Track]
    total: int

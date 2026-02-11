from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import Track, SpotifySearchResult
from app.services.itunes_service import itunes_service

router = APIRouter(prefix="/itunes", tags=["itunes"])


@router.get("/search", response_model=SpotifySearchResult)
async def search_tracks(q: str = Query(..., description="Search query")):
    """Search for tracks on iTunes/Apple Music."""
    try:
        tracks = itunes_service.search_tracks(q)
        return SpotifySearchResult(tracks=tracks, total=len(tracks))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze", response_model=Track)
async def analyze_track(track: Track):
    """Analyze a track's preview for BPM/key/energy."""
    try:
        analyzed = itunes_service.analyze_track(track)
        return analyzed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

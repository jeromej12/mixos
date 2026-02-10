from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.schemas import Track, SpotifySearchResult
from app.services.spotify_service import spotify_service

router = APIRouter(prefix="/spotify", tags=["spotify"])

@router.get("/search", response_model=SpotifySearchResult)
async def search_tracks(q: str = Query(..., description="Search query")):
    """Search for tracks on Spotify"""
    try:
        tracks = spotify_service.search_tracks(q)
        return SpotifySearchResult(tracks=tracks, total=len(tracks))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/track/{spotify_id}", response_model=Track)
async def get_track(spotify_id: str):
    """Get detailed information for a specific track"""
    try:
        track = spotify_service.get_track(spotify_id)
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")
        return track
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

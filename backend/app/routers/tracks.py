import os
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from typing import List
from app.models.schemas import Track
from app.services.audio_service import audio_service

MIME_TYPES = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
}

router = APIRouter(prefix="/tracks", tags=["tracks"])

ALLOWED_EXTENSIONS = {'.mp3', '.wav', '.flac'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@router.post("/upload", response_model=Track)
async def upload_track(file: UploadFile = File(...)):
    """Upload an audio file for analysis. Returns extracted track metadata."""
    ext = os.path.splitext(file.filename or '')[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: mp3, wav, flac"
        )

    file_data = await file.read()

    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 50MB."
        )

    try:
        track = await audio_service.analyze_file(file_data, file.filename or 'unknown')
        return track
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/library", response_model=List[Track])
async def list_tracks():
    """List all uploaded tracks in the library."""
    return audio_service.get_all_tracks()


@router.get("/{track_id}/audio")
async def stream_track(track_id: str):
    """Stream audio file for playback."""
    file_path = audio_service.get_file_path(track_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    ext = os.path.splitext(file_path)[1].lower()
    media_type = MIME_TYPES.get(ext, 'application/octet-stream')
    return FileResponse(file_path, media_type=media_type)


@router.delete("/{track_id}")
async def delete_track(track_id: str):
    """Delete a track from the library."""
    if not audio_service.delete_track(track_id):
        raise HTTPException(status_code=404, detail="Track not found")
    return {"status": "deleted", "id": track_id}

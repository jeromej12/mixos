from fastapi import APIRouter, HTTPException
from app.models.ai_schemas import AIGenerateRequest, AIGenerateResponse, AIRefineRequest
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/generate-setlist", response_model=AIGenerateResponse)
async def generate_setlist(request: AIGenerateRequest):
    """
    Generate AI-powered setlist suggestions based on natural language query
    
    Examples:
    - "upbeat progressive house for peak time"
    - "chill downtempo opener with 120-125 BPM"
    - "high energy techno closing set"
    """
    try:
        result = ai_service.generate_setlist(
            query=request.query,
            num_playlists=request.num_playlists or 2,
            target_duration=request.target_duration
        )
        
        return AIGenerateResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/refine-setlist", response_model=AIGenerateResponse)
async def refine_setlist(request: AIRefineRequest):
    """Refine an existing AI-generated setlist based on user feedback."""
    try:
        result = ai_service.refine_setlist(
            refinement=request.refinement,
            current_playlist=request.current_playlist
        )
        return AIGenerateResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI refinement failed: {str(e)}")

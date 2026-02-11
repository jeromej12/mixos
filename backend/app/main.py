from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables BEFORE importing routers/services
load_dotenv()

from app.routers import ai, tracks, itunes

# Create FastAPI app
app = FastAPI(
    title="MixOS API",
    description="Backend API for MixOS - Professional DJ setlist management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai.router, prefix="/api")
app.include_router(tracks.router, prefix="/api")
app.include_router(itunes.router, prefix="/api")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "MixOS API is running"}

@app.get("/")
async def root():
    return {
        "message": "MixOS API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

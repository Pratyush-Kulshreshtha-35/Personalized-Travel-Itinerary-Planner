import os
import sys

# Ensure backend root is always in sys.path regardless of execution working directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.supabase_client import is_supabase_connected
from app.services.gemini_service import is_gemini_active

from app.routes import (
    preferences,
    recommendations,
    itineraries,
    trips,
    export,
    auth,
    chat
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance backend API for Personalized Travel Itinerary Planner powered by FastAPI & Supabase."
)

# Configure Cross-Origin Resource Sharing (CORS)
cors_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"]
allow_creds = False if "*" in cors_origins else True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(recommendations.router)
app.include_router(itineraries.router)
app.include_router(trips.router)
app.include_router(export.router)
app.include_router(chat.router)


@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
async def health_check():
    """System health check endpoint."""
    return {
        "status": "online",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "supabase_connected": is_supabase_connected(),
        "database_mode": "supabase_cloud" if is_supabase_connected() else "local_in_memory_persistence",
        "gemini_configured": is_gemini_active(),
        "ai_engine": "Google Gemini 2.5 Flash" if is_gemini_active() else "Curated Heuristic Engine (Offline Resilient)"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)

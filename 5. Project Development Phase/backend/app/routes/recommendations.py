from typing import List
from fastapi import APIRouter
from app.models import (
    RecommendationRequest,
    RecommendationResponseItem,
    DestinationModel,
    CityPlacesRequest,
    CityPlacesResponse
)
from app.services.recommendation_service import (
    calculate_destination_recommendations,
    DESTINATIONS_DATA
)
from app.services.gemini_service import suggest_places_with_gemini

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.post("/destinations", response_model=List[RecommendationResponseItem])
async def recommend_destinations(req: RecommendationRequest):
    """
    Milestone 3: Activity 3.3 - Destination Recommendation Engine
    Calculates multi-dimensional vibe match scores for top global destinations.
    """
    return calculate_destination_recommendations(req)

@router.get("/catalog", response_model=List[DestinationModel])
async def list_all_destinations():
    """Returns all destinations in the catalog with rich metadata."""
    return [DestinationModel(**d) for d in DESTINATIONS_DATA]

@router.post("/city-places", response_model=CityPlacesResponse)
async def get_city_places(req: CityPlacesRequest):
    """
    Feature 1: City & Places Explorer
    Curates top places, landmarks, and hidden gems for chosen country and city using AI.
    """
    return suggest_places_with_gemini(req)


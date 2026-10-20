from typing import List
from fastapi import APIRouter
from app.models import (
    ItineraryGenerateRequest,
    TripModel,
    RouteOptimizeRequest,
    RouteOptimizeResponse,
    VibePersonalizeRequest,
    DayModel
)
from app.services.itinerary_service import generate_personalized_itinerary
from app.services.route_optimizer import optimize_activity_sequence
from app.services.vibe_engine import personalize_itinerary_by_vibe
from app.routes.storage import LOCAL_TRIPS

router = APIRouter(prefix="/api/itinerary", tags=["Itinerary Generation & Personalization"])

@router.post("/generate", response_model=TripModel)
async def generate_itinerary(req: ItineraryGenerateRequest):
    """
    Milestone 4: Activity 4.1 - Daily Itinerary Builder
    Generates tailored day-by-day itineraries with Morning, Afternoon, and Evening activities.
    """
    trip = generate_personalized_itinerary(req)
    LOCAL_TRIPS[trip.id] = trip
    return trip

@router.post("/optimize-route", response_model=RouteOptimizeResponse)
async def optimize_route(req: RouteOptimizeRequest):
    """
    Milestone 4: Activity 4.2 - Route & Time Optimization
    Reorders stops geographically using Haversine distances to minimize transit delay.
    """
    return optimize_activity_sequence(req.activities)

@router.post("/personalize", response_model=List[DayModel])
async def personalize_vibe(req: VibePersonalizeRequest):
    """
    Milestone 4: Activity 4.3 - Vibe-Based Personalization
    Adapts an existing itinerary to custom vibe intensifiers (Adventure, Foodie, Sunset Chill).
    """
    updated_days = personalize_itinerary_by_vibe(req)
    if req.trip_id and req.trip_id in LOCAL_TRIPS:
        trip = LOCAL_TRIPS[req.trip_id]
        trip.days = updated_days
        trip.total_budget = round(sum(d.estimated_daily_cost for d in updated_days), 2)
        trip.vibe_style = f"{trip.vibe_style} ({req.target_vibe})"
    return updated_days

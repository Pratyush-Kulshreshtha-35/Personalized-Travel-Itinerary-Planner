from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import date, datetime

class UserPreferenceInput(BaseModel):
    user_id: Optional[str] = None
    primary_vibe: str = Field(..., description="Core travel vibe, e.g. Adventure, Cultural, Relaxation, Foodie, Nightlife")
    secondary_vibes: List[str] = Field(default=[], description="Supplementary vibes")
    travel_style: str = Field(default="Balanced", description="Luxury, Budget Backpacker, Balanced, Boutique Explorer")
    pace: str = Field(default="Moderate", description="Relaxed, Moderate, Fast-Paced / Packed")
    budget_level: str = Field(default="Moderate", description="Budget, Moderate, Luxury, Ultra-Luxury")
    daily_budget_usd: float = Field(default=150.0, description="Target daily spending budget in USD")
    dietary_preferences: List[str] = Field(default=[], description="Dietary restrictions or preferences")
    group_type: str = Field(default="Solo", description="Solo, Couple, Family, Friends Group")
    must_have_amenities: List[str] = Field(default=[])

class UserPreferenceResponse(UserPreferenceInput):
    id: str
    created_at: datetime

class DestinationModel(BaseModel):
    id: str
    name: str
    country: str
    region: Optional[str] = None
    description: str
    vibes: List[str]
    climate: Optional[str] = None
    best_season: Optional[str] = None
    avg_daily_cost: float
    latitude: float
    longitude: float
    rating: float = 4.8
    image_url: Optional[str] = None
    highlights: List[str] = []
    popular_attractions: List[Dict[str, Any]] = []

class RecommendationRequest(BaseModel):
    primary_vibe: str
    secondary_vibes: List[str] = []
    budget_level: str = "Moderate"
    daily_budget_usd: float = 150.0
    travel_style: str = "Balanced"
    pace: str = "Moderate"
    group_type: str = "Solo"

class RecommendationResponseItem(BaseModel):
    id: str
    name: str
    country: str
    region: Optional[str] = None
    match_score: int
    match_reasons: List[str]
    avg_daily_cost: float
    vibes: List[str]
    best_season: Optional[str] = None
    rating: float
    image_url: Optional[str] = None
    highlights: List[str] = []
    latitude: float
    longitude: float

class ActivityModel(BaseModel):
    id: Optional[str] = None
    time_slot: str = "Morning" # Morning, Afternoon, Evening, Night
    start_time: Optional[str] = "09:00"
    end_time: Optional[str] = "11:30"
    title: str
    description: Optional[str] = None
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    estimated_cost: float = 0.0
    duration_minutes: int = 90
    order_index: int = 0
    activity_type: str = "Sightseeing"
    vibe_match: Optional[str] = None
    transit_info_to_next: Optional[Dict[str, Any]] = None
    booking_url: Optional[str] = None
    insider_tip: Optional[str] = None

class DayModel(BaseModel):
    id: Optional[str] = None
    day_number: int
    date: Optional[str] = None
    theme_title: str
    daily_notes: Optional[str] = None
    estimated_daily_cost: float = 0.0
    activities: List[ActivityModel] = []

class ItineraryGenerateRequest(BaseModel):
    destination_name: str
    country: Optional[str] = None
    total_days: int = Field(default=3, ge=1, le=14)
    start_date: Optional[str] = None
    vibe: str = "Cultural & Foodie"
    pace: str = "Moderate"
    daily_budget: float = 150.0
    group_type: str = "Solo"
    special_interests: List[str] = []

class TripModel(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    destination_name: str
    country: str
    start_date: str
    end_date: str
    total_days: int
    total_budget: float
    vibe_style: str
    status: str = "planned"
    summary: Optional[str] = None
    cover_image_url: Optional[str] = None
    days: List[DayModel] = []
    created_at: Optional[str] = None

class RouteOptimizeRequest(BaseModel):
    activities: List[ActivityModel]

class RouteOptimizeResponse(BaseModel):
    optimized_activities: List[ActivityModel]
    original_distance_km: float
    optimized_distance_km: float
    time_saved_minutes: int
    route_efficiency_gain: str
    transit_segments: List[Dict[str, Any]] = []

class VibePersonalizeRequest(BaseModel):
    trip_id: Optional[str] = None
    current_days: List[DayModel]
    target_vibe: str # e.g. "Adrenaline & Thrill", "Foodie Heaven", "Sunset & Chill", "Heritage Culture"
    intensity: str = "High" # "Low", "Medium", "High"

# ============================================================================
# Milestone: City Places Explorer & Natural Language AI Chatbot
# ============================================================================

class PlaceItem(BaseModel):
    id: str
    name: str
    category: str = "Landmark" # Landmark, Hidden Gem, Food & Drink, Culture & Art, Scenic Viewpoint, Nature, Nightlife
    description: str
    vibe: str = "Cultural"
    estimated_cost_usd: float = 0.0
    best_time_to_visit: str = "Morning" # Morning, Afternoon, Sunset, Evening, Night
    insider_tip: str
    latitude: float
    longitude: float
    rating: float = 4.8
    image_url: Optional[str] = None
    address_or_area: Optional[str] = None

class CityPlacesRequest(BaseModel):
    country: str
    city: str
    vibe: Optional[str] = "All-Round"
    budget_level: Optional[str] = "Moderate"

class CityPlacesResponse(BaseModel):
    city: str
    country: str
    summary: str
    places: List[PlaceItem] = []

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    user_preferences: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    action_type: str = "chat" # "chat", "trip_created", "places_suggested"
    trip: Optional[TripModel] = None
    suggested_places: Optional[List[PlaceItem]] = None
    extracted_intent: Optional[Dict[str, Any]] = None


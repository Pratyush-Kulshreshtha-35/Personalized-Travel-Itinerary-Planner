import uuid
from typing import Dict, List, Optional
from datetime import datetime
from app.models import TripModel, UserPreferenceResponse, DayModel, ActivityModel

# Global thread-safe in-memory cache for local execution and offline fallback
LOCAL_TRIPS: Dict[str, TripModel] = {}
LOCAL_PREFERENCES: Dict[str, UserPreferenceResponse] = {}

# Pre-seed initial sample trip so the application opens with rich content immediately
def seed_initial_trip():
    initial_id = "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
    LOCAL_TRIPS[initial_id] = TripModel(
        id=initial_id,
        title="7-Day Ultimate Zen & Cyberpunk Explorer",
        destination_name="Kyoto & Tokyo",
        country="Japan",
        start_date="2026-11-10",
        end_date="2026-11-16",
        total_days=7,
        total_budget=1800.0,
        vibe_style="Cultural & Foodie",
        status="planned",
        summary="A meticulously balanced voyage combining the ancient spiritual tranquility of Kyoto bamboo forests with high-energy Tokyo gastronomy and neon nights.",
        cover_image_url="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        days=[
            DayModel(
                id="d1-sample",
                day_number=1,
                date="2026-11-10",
                theme_title="Sacred Torii Arches & Historic Geisha Alleys",
                daily_notes="Early start at Fushimi Inari to beat the crowds.",
                estimated_daily_cost=120.0,
                activities=[
                    ActivityModel(
                        id="act-101",
                        time_slot="Morning",
                        start_time="07:30",
                        end_time="10:30",
                        title="Hike the 10,000 Vermilion Torii Gates",
                        description="Ascend Mount Inari along tunnels of scarlet torii shrines surrounded by cedar forest.",
                        location_name="Fushimi Inari-taisha",
                        latitude=34.9671,
                        longitude=135.7727,
                        estimated_cost=0.0,
                        duration_minutes=180,
                        order_index=1,
                        activity_type="Culture",
                        vibe_match="Spiritual Zen",
                        insider_tip="Reach the Yotsutsuji intersection for panoramic views of Kyoto without the crowds."
                    ),
                    ActivityModel(
                        id="act-102",
                        time_slot="Afternoon",
                        start_time="12:00",
                        end_time="14:30",
                        title="Nishiki Market Street Food Odyssey",
                        description="Sample grilled wagyu skewers, matcha dango, crispy takoyaki, and pickled delicacies.",
                        location_name="Nishiki Market",
                        latitude=35.0050,
                        longitude=135.7649,
                        estimated_cost=35.0,
                        duration_minutes=150,
                        order_index=2,
                        activity_type="Dining",
                        vibe_match="Foodie Master",
                        insider_tip="Look for the artisanal soy sauce ice cream stall near the temple entrance."
                    ),
                    ActivityModel(
                        id="act-103",
                        time_slot="Evening",
                        start_time="18:00",
                        end_time="21:00",
                        title="Lantern-lit Stroll in Gion & Kaiseki Dinner",
                        description="Wander wooden machiya merchant houses along Shirakawa Canal and savor a multi-course dinner.",
                        location_name="Gion Shirakawa",
                        latitude=35.0037,
                        longitude=135.7772,
                        estimated_cost=85.0,
                        duration_minutes=180,
                        order_index=3,
                        activity_type="Dining",
                        vibe_match="Romance & Culture",
                        insider_tip="Book seats counter-side at an authentic izakaya for the chef tasting menu."
                    )
                ]
            )
        ],
        created_at=datetime.utcnow().isoformat()
    )

seed_initial_trip()

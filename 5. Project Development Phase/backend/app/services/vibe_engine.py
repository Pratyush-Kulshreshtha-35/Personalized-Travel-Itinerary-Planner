import uuid
from typing import List, Dict, Any
from app.models import DayModel, ActivityModel, VibePersonalizeRequest
from app.services.gemini_service import personalize_vibe_with_gemini


# Activity 3.2: Prompt Structuring Logic for AI Coding / Generation
def construct_itinerary_prompt(
    destination: str,
    country: str,
    vibe: str,
    days: int,
    pace: str,
    daily_budget: float,
    group_type: str,
    dietary: List[str]
) -> str:
    """
    Activity 3.2: Prompt Structuring Logic
    Builds a structured prompt template optimized for LLM reasoning and JSON schema output.
    """
    prompt = f"""
[SYSTEM INSTRUCTION: You are an elite bespoke Travel Curator and Local Connoisseur.]
Curate a personalized {days}-day itinerary for {destination}, {country}.

TRIP CONTEXT & VIBE PROFILE:
- Primary Vibe: {vibe}
- Exploration Pace: {pace} (Relaxed = 2-3 stops/day, Moderate = 3-4 stops/day, Fast = 5 stops/day)
- Group Dynamic: {group_type}
- Target Daily Budget: ${daily_budget} USD/day
- Dietary Needs: {', '.join(dietary) if dietary else 'None specified'}

OUTPUT REQUIREMENTS:
For each day, structure sequential slots: Morning, Afternoon, Evening, and Night.
Include precise latitude/longitude, insider local tips (avoid tourist traps), and realistic cost estimates.
Ensure geographic proximity between morning and afternoon stops to avoid excessive transit backtracking.
"""
    return prompt.strip()

# Activity 4.3: Vibe-Based Personalization Engine
VIBE_ACTIVITY_INJECTIONS: Dict[str, List[Dict[str, Any]]] = {
    "foodie": [
        {
            "title": "Secret Alley Tasting Tour & Street Gastronomy",
            "time_slot": "Evening",
            "start_time": "18:30",
            "end_time": "21:00",
            "activity_type": "Dining",
            "vibe_match": "Foodie & Culinary",
            "estimated_cost": 45.0,
            "duration_minutes": 150,
            "insider_tip": "Look for the vendor with the longest queue of local grandmothers."
        },
        {
            "title": "Artisanal Market & Morning Coffee Roastery",
            "time_slot": "Morning",
            "start_time": "08:30",
            "end_time": "10:30",
            "activity_type": "Dining",
            "vibe_match": "Foodie & Culinary",
            "estimated_cost": 20.0,
            "duration_minutes": 120,
            "insider_tip": "Ask for the single-origin pour-over and seasonal pastry pairing."
        }
    ],
    "adventure": [
        {
            "title": "High-Ridge Panoramic Via Ferrata & Scramble",
            "time_slot": "Morning",
            "start_time": "07:30",
            "end_time": "11:30",
            "activity_type": "Adventure",
            "vibe_match": "Adrenaline & Thrill",
            "estimated_cost": 65.0,
            "duration_minutes": 240,
            "insider_tip": "Bring lightweight climbing gloves and a high-energy snack."
        },
        {
            "title": "Sunset Kayak or Coastal Jet Boat Expedition",
            "time_slot": "Afternoon",
            "start_time": "15:00",
            "end_time": "17:30",
            "activity_type": "Adventure",
            "vibe_match": "Adrenaline & Thrill",
            "estimated_cost": 50.0,
            "duration_minutes": 150,
            "insider_tip": "Waterproof phone pouch provided on-site."
        }
    ],
    "relaxation": [
        {
            "title": "Natural Thermal Mineral Baths & Sound Healing",
            "time_slot": "Afternoon",
            "start_time": "14:00",
            "end_time": "16:30",
            "activity_type": "Relaxation",
            "vibe_match": "Sunset & Chill",
            "estimated_cost": 40.0,
            "duration_minutes": 150,
            "insider_tip": "Reserve the private cedar tub overlooking the valley for golden hour."
        },
        {
            "title": "Golden Hour Cliffside Aperitivo Lounge",
            "time_slot": "Evening",
            "start_time": "18:00",
            "end_time": "20:00",
            "activity_type": "Relaxation",
            "vibe_match": "Sunset & Chill",
            "estimated_cost": 30.0,
            "duration_minutes": 120,
            "insider_tip": "Arrive 45 minutes before sunset for prime lounge daybeds."
        }
    ],
    "cultural": [
        {
            "title": "Master Craftsman Workshop & Heritage Guild",
            "time_slot": "Morning",
            "start_time": "09:30",
            "end_time": "12:00",
            "activity_type": "Culture",
            "vibe_match": "Heritage & Culture",
            "estimated_cost": 35.0,
            "duration_minutes": 150,
            "insider_tip": "Participate in the hands-on pottery wheel or textile session."
        },
        {
            "title": "Centuries-Old Monastery Archives & Twilight Walk",
            "time_slot": "Evening",
            "start_time": "17:30",
            "end_time": "19:30",
            "activity_type": "Culture",
            "vibe_match": "Heritage & Culture",
            "estimated_cost": 15.0,
            "duration_minutes": 120,
            "insider_tip": "Listen for the acoustic bell chime echoing across the historic plaza."
        }
    ]
}

def personalize_itinerary_by_vibe(req: VibePersonalizeRequest) -> List[DayModel]:
    """
    Activity 4.3: Vibe-Based Personalization
    Adapts an existing itinerary by infusing activities specifically tailored to the target vibe.
    """
    # 1. Attempt dynamic vibe rewriting via Google Gemini API if key is present
    ai_personalized = personalize_vibe_with_gemini(req)
    if ai_personalized:
        return ai_personalized

    target_key = "relaxation"

    lower_target = req.target_vibe.lower()
    if "food" in lower_target or "culinary" in lower_target:
        target_key = "foodie"
    elif "adventure" in lower_target or "thrill" in lower_target:
        target_key = "adventure"
    elif "culture" in lower_target or "heritage" in lower_target:
        target_key = "cultural"
    elif "chill" in lower_target or "relax" in lower_target or "wellness" in lower_target:
        target_key = "relaxation"

    injections = VIBE_ACTIVITY_INJECTIONS.get(target_key, VIBE_ACTIVITY_INJECTIONS["relaxation"])
    updated_days: List[DayModel] = []

    for day in req.current_days:
        # Clone day
        new_day = DayModel(
            id=day.id or str(uuid.uuid4()),
            day_number=day.day_number,
            date=day.date,
            theme_title=f"{day.theme_title} ({req.target_vibe} Focus)",
            daily_notes=f"Personalized with enhanced {req.target_vibe} vibe parameters.",
            estimated_daily_cost=day.estimated_daily_cost,
            activities=[]
        )

        # Check if an injection matches this day
        injection_candidate = injections[(day.day_number - 1) % len(injections)]
        
        # Merge existing activities and replace or add injection
        existing = [a for a in day.activities]
        replaced = False
        for i, act in enumerate(existing):
            if act.time_slot == injection_candidate["time_slot"]:
                # Swap activity with personalized vibe activity while keeping local location reference
                injected_act = ActivityModel(
                    id=str(uuid.uuid4()),
                    time_slot=injection_candidate["time_slot"],
                    start_time=injection_candidate["start_time"],
                    end_time=injection_candidate["end_time"],
                    title=f"{injection_candidate['title']} @ {act.location_name}",
                    description=f"Vibe enhanced experience tailored for {req.target_vibe}.",
                    location_name=act.location_name,
                    latitude=act.latitude,
                    longitude=act.longitude,
                    estimated_cost=injection_candidate["estimated_cost"],
                    duration_minutes=injection_candidate["duration_minutes"],
                    order_index=act.order_index,
                    activity_type=injection_candidate["activity_type"],
                    vibe_match=injection_candidate["vibe_match"],
                    insider_tip=injection_candidate["insider_tip"]
                )
                existing[i] = injected_act
                replaced = True
                break

        if not replaced and existing:
            # Append as an extra night or evening highlight
            extra_act = ActivityModel(
                id=str(uuid.uuid4()),
                time_slot=injection_candidate["time_slot"],
                start_time=injection_candidate["start_time"],
                end_time=injection_candidate["end_time"],
                title=injection_candidate["title"],
                description=f"Exclusive addition for {req.target_vibe} lovers.",
                location_name=existing[0].location_name,
                latitude=existing[0].latitude,
                longitude=existing[0].longitude,
                estimated_cost=injection_candidate["estimated_cost"],
                duration_minutes=injection_candidate["duration_minutes"],
                order_index=len(existing) + 1,
                activity_type=injection_candidate["activity_type"],
                vibe_match=injection_candidate["vibe_match"],
                insider_tip=injection_candidate["insider_tip"]
            )
            existing.append(extra_act)

        new_day.activities = existing
        new_day.estimated_daily_cost = sum(a.estimated_cost for a in existing)
        updated_days.append(new_day)

    return updated_days

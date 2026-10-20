import json
import logging
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import httpx

from app.config import settings
from app.models import (
    ItineraryGenerateRequest,
    TripModel,
    DayModel,
    ActivityModel,
    VibePersonalizeRequest,
    CityPlacesRequest,
    CityPlacesResponse,
    PlaceItem,
    ChatRequest,
    ChatResponse,
    ChatMessage
)
from app.services.route_optimizer import optimize_activity_sequence

logger = logging.getLogger("travel_planner.gemini")

def get_api_key() -> Optional[str]:
    """Retrieves the Gemini API key from settings or environment."""
    key = settings.GEMINI_API_KEY
    if key and key.strip() and not key.startswith("your_"):
        return key.strip()
    return None

def is_gemini_active() -> bool:
    """Returns True if a valid Gemini API key is configured."""
    return get_api_key() is not None

def generate_itinerary_with_gemini(req: ItineraryGenerateRequest) -> Optional[TripModel]:
    """
    Generates a personalized multi-day itinerary using Google Gemini AI.
    Returns TripModel on success, or None to fall back to the curated template engine.
    """
    api_key = get_api_key()
    if not api_key:
        return None

    start_dt = datetime.now() + timedelta(days=14)
    if req.start_date:
        try:
            start_dt = datetime.strptime(req.start_date, "%Y-%m-%d")
        except Exception:
            pass

    end_dt = start_dt + timedelta(days=req.total_days - 1)

    prompt = f"""
You are an expert luxury travel curator. Curate a detailed {req.total_days}-day travel itinerary for {req.destination_name}, {req.country or ''}.

TRAVELER PROFILE:
- Primary Vibe: {req.vibe}
- Exploration Pace: {req.pace}
- Target Daily Budget: ${req.daily_budget} USD/day
- Group Dynamic: {req.group_type}
- Start Date: {start_dt.strftime('%Y-%m-%d')}

REQUIREMENTS:
Return a JSON object strictly matching this schema:
{{
  "title": "{req.total_days}-Day {req.vibe} in {req.destination_name}",
  "summary": "Short 2-sentence inspirational summary of the journey",
  "days": [
    {{
      "day_number": 1,
      "date": "{start_dt.strftime('%Y-%m-%d')}",
      "theme_title": "Day 1: Theme title",
      "daily_notes": "Local advice for this day",
      "activities": [
        {{
          "time_slot": "Morning",
          "start_time": "09:00",
          "end_time": "11:30",
          "title": "Activity name",
          "description": "Engaging description",
          "location_name": "Specific place name",
          "latitude": 46.5475,
          "longitude": 7.9822,
          "estimated_cost": 25.0,
          "duration_minutes": 150,
          "activity_type": "Culture",
          "vibe_match": "{req.vibe}",
          "insider_tip": "Secret local tip"
        }},
        {{
          "time_slot": "Afternoon",
          "start_time": "13:00",
          "end_time": "15:30",
          "title": "Activity name",
          "description": "Engaging description",
          "location_name": "Specific place name",
          "latitude": 46.5480,
          "longitude": 7.9830,
          "estimated_cost": 35.0,
          "duration_minutes": 150,
          "activity_type": "Dining",
          "vibe_match": "{req.vibe}",
          "insider_tip": "Secret local tip"
        }},
        {{
          "time_slot": "Evening",
          "start_time": "18:00",
          "end_time": "21:00",
          "title": "Activity name",
          "description": "Engaging description",
          "location_name": "Specific place name",
          "latitude": 46.6975,
          "longitude": 7.8525,
          "estimated_cost": 65.0,
          "duration_minutes": 180,
          "activity_type": "Relaxation",
          "vibe_match": "Sunset & Chill",
          "insider_tip": "Secret local tip"
        }}
      ]
    }}
  ]
}}

Generate all {req.total_days} days. Ensure realistic coordinates in {req.destination_name} and creative local recommendations.
"""

    # Candidate models verified for high-quality structured generation
    candidate_models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"]

    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            with httpx.Client(timeout=25.0) as client:
                res = client.post(
                    url,
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"response_mime_type": "application/json"}
                    }
                )

                if res.status_code == 200:
                    resp_json = res.json()
                    candidates = resp_json.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
                        data = json.loads(raw_text)

                        # Assemble TripModel
                        trip_id = str(uuid.uuid4())
                        days_list: List[DayModel] = []

                        for d_idx, day_data in enumerate(data.get("days", [])):
                            day_num = day_data.get("day_number", d_idx + 1)
                            c_date = (start_dt + timedelta(days=day_num - 1)).strftime("%Y-%m-%d")

                            acts: List[ActivityModel] = []
                            for a_idx, act_data in enumerate(day_data.get("activities", [])):
                                acts.append(
                                    ActivityModel(
                                        id=str(uuid.uuid4()),
                                        time_slot=act_data.get("time_slot", "Morning"),
                                        start_time=act_data.get("start_time", "09:00"),
                                        end_time=act_data.get("end_time", "11:30"),
                                        title=act_data.get("title", f"Stop {a_idx+1}"),
                                        description=act_data.get("description", ""),
                                        location_name=act_data.get("location_name", req.destination_name),
                                        latitude=float(act_data.get("latitude", 46.5)),
                                        longitude=float(act_data.get("longitude", 7.9)),
                                        estimated_cost=float(act_data.get("estimated_cost", 25.0)),
                                        duration_minutes=int(act_data.get("duration_minutes", 120)),
                                        order_index=a_idx + 1,
                                        activity_type=act_data.get("activity_type", "Sightseeing"),
                                        vibe_match=act_data.get("vibe_match", req.vibe),
                                        insider_tip=act_data.get("insider_tip", "Enjoy this local gem.")
                                    )
                                )

                            opt_res = optimize_activity_sequence(acts)

                            days_list.append(
                                DayModel(
                                    id=str(uuid.uuid4()),
                                    day_number=day_num,
                                    date=c_date,
                                    theme_title=day_data.get("theme_title", f"Day {day_num}: {req.destination_name}"),
                                    daily_notes=day_data.get("daily_notes", f"Curated by Gemini AI for {req.vibe} vibes."),
                                    estimated_daily_cost=sum(a.estimated_cost for a in opt_res.optimized_activities),
                                    activities=opt_res.optimized_activities
                                )
                            )

                        total_cost = sum(d.estimated_daily_cost for d in days_list)

                        trip = TripModel(
                            id=trip_id,
                            title=data.get("title", f"{req.total_days}-Day {req.vibe} in {req.destination_name}"),
                            destination_name=req.destination_name,
                            country=req.country or "Global",
                            start_date=start_dt.strftime("%Y-%m-%d"),
                            end_date=end_dt.strftime("%Y-%m-%d"),
                            total_days=req.total_days,
                            total_budget=round(total_cost, 2),
                            vibe_style=f"{req.vibe} (Gemini AI)",
                            status="planned",
                            summary=data.get("summary", f"A bespoke {req.total_days}-day itinerary generated by Google Gemini AI."),
                            cover_image_url="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
                            days=days_list,
                            created_at=datetime.utcnow().isoformat()
                        )
                        logger.info(f"Successfully generated itinerary with Gemini ({model_name}) in {req.destination_name}")
                        return trip
                else:
                    logger.warning(f"Gemini model {model_name} returned status {res.status_code}")
        except Exception as e:
            logger.warning(f"Gemini call to {model_name} failed: {e}. Trying fallback.")
            continue

    logger.warning("All Gemini candidates failed or timed out. Falling back to heuristic generator.")
    return None

def personalize_vibe_with_gemini(req: VibePersonalizeRequest) -> Optional[List[DayModel]]:
    """
    Uses Google Gemini to creatively adapt existing itinerary days with a new vibe modifier.
    """
    api_key = get_api_key()
    if not api_key:
        return None

    days_summary = []
    for d in req.current_days:
        days_summary.append({
            "day_number": d.day_number,
            "theme_title": d.theme_title,
            "activities": [{"time_slot": a.time_slot, "title": a.title, "location": a.location_name} for a in d.activities]
        })

    prompt = f"""
You are an expert travel editor. Adapt the following itinerary to intensely reflect the vibe modifier: "{req.target_vibe}" with "{req.intensity}" intensity.

CURRENT ITINERARY:
{json.dumps(days_summary, indent=2)}

INSTRUCTIONS:
Return a valid JSON array of days matching this structure:
[
  {{
    "day_number": 1,
    "theme_title": "Day 1 theme with {req.target_vibe}",
    "daily_notes": "Vibe adaptation summary",
    "activities": [
      {{
        "time_slot": "Morning",
        "start_time": "09:00",
        "end_time": "11:30",
        "title": "Activity name matching {req.target_vibe}",
        "description": "Vibrant description",
        "location_name": "Location",
        "latitude": 46.5475,
        "longitude": 7.9822,
        "estimated_cost": 30.0,
        "duration_minutes": 150,
        "activity_type": "Culture",
        "vibe_match": "{req.target_vibe}",
        "insider_tip": "Insider secret tip"
      }}
    ]
  }}
]
"""

    candidate_models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"]

    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            with httpx.Client(timeout=25.0) as client:
                res = client.post(
                    url,
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"response_mime_type": "application/json"}
                    }
                )

                if res.status_code == 200:
                    resp_json = res.json()
                    candidates = resp_json.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        raw_text = candidates[0]["content"]["parts"][0]["text"].strip()
                        days_data = json.loads(raw_text)
                        result_days: List[DayModel] = []

                        for d_idx, day_dict in enumerate(days_data):
                            acts: List[ActivityModel] = []
                            for a_idx, act_d in enumerate(day_dict.get("activities", [])):
                                acts.append(
                                    ActivityModel(
                                        id=str(uuid.uuid4()),
                                        time_slot=act_d.get("time_slot", "Morning"),
                                        start_time=act_d.get("start_time", "09:00"),
                                        end_time=act_d.get("end_time", "11:30"),
                                        title=act_d.get("title", "Personalized Activity"),
                                        description=act_d.get("description", ""),
                                        location_name=act_d.get("location_name", "Local Spot"),
                                        latitude=float(act_d.get("latitude", 46.5)),
                                        longitude=float(act_d.get("longitude", 7.9)),
                                        estimated_cost=float(act_d.get("estimated_cost", 30.0)),
                                        duration_minutes=int(act_d.get("duration_minutes", 120)),
                                        order_index=a_idx + 1,
                                        activity_type=act_d.get("activity_type", "Sightseeing"),
                                        vibe_match=req.target_vibe,
                                        insider_tip=act_d.get("insider_tip", "Locals favorite.")
                                    )
                                )

                            opt_res = optimize_activity_sequence(acts)
                            orig_day = req.current_days[d_idx] if d_idx < len(req.current_days) else None

                            result_days.append(
                                DayModel(
                                    id=str(uuid.uuid4()),
                                    day_number=day_dict.get("day_number", d_idx + 1),
                                    date=orig_day.date if orig_day else None,
                                    theme_title=day_dict.get("theme_title", f"Day {d_idx + 1}: {req.target_vibe}"),
                                    daily_notes=day_dict.get("daily_notes", f"Infused with {req.target_vibe} by Gemini AI."),
                                    estimated_daily_cost=sum(a.estimated_cost for a in opt_res.optimized_activities),
                                    activities=opt_res.optimized_activities
                                )
                            )

                        return result_days
        except Exception as e:
            logger.warning(f"Gemini vibe personalization with {model_name} failed: {e}")
            continue

    return None


# ============================================================================
# CURATED CITY PLACES CATALOG (Offline Resilient)
# ============================================================================

FALLBACK_CITY_PLACES: Dict[str, Dict[str, Any]] = {
    "paris": {
        "city": "Paris",
        "country": "France",
        "summary": "The City of Light dazzles with iconic monument skylines, historic bohemian quarters, tranquil Seine river walks, and exquisite culinary craftsmanship.",
        "places": [
            {
                "id": "paris-eiffel",
                "name": "Eiffel Tower & Champ de Mars",
                "category": "Landmark",
                "description": "The timeless wrought-iron spire of France offering 360-degree vistas across Paris and twinkling golden illuminations every hour after sunset.",
                "vibe": "Romantic & Panoramic",
                "estimated_cost_usd": 32.0,
                "best_time_to_visit": "Sunset",
                "insider_tip": "Book summit elevator tickets 60 days in advance or head to Pont de Bir-Hakeim for stunning photography without the crowds.",
                "latitude": 48.8584,
                "longitude": 2.2945,
                "rating": 4.92,
                "image_url": "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Champ de Mars, 7th Arrondissement"
            },
            {
                "id": "paris-louvre",
                "name": "Musée du Louvre & Tuileries Garden",
                "category": "Culture & Art",
                "description": "The world's foremost art museum housed in a majestic former royal palace, home to the Mona Lisa, Winged Victory, and Venus de Milo.",
                "vibe": "Cultural Heritage",
                "estimated_cost_usd": 24.0,
                "best_time_to_visit": "Morning",
                "insider_tip": "Enter via the Carrousel du Louvre underground mall entrance rather than the main glass pyramid to bypass long outdoor lines.",
                "latitude": 48.8606,
                "longitude": 2.3376,
                "rating": 4.88,
                "image_url": "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Rue de Rivoli, 1st Arrondissement"
            },
            {
                "id": "paris-montmartre",
                "name": "Montmartre & Sacré-Cœur Basilica",
                "category": "Scenic Viewpoint",
                "description": "A fairytale hilltop village with cobbled alleyways, portrait artists, and a gleaming white dome offering the highest vista over Paris.",
                "vibe": "Bohemian & Romantic",
                "estimated_cost_usd": 0.0,
                "best_time_to_visit": "Sunset",
                "insider_tip": "Wander behind the basilica towards Place Dalida and La Maison Rose for charming quiet alleys away from tourist crowds.",
                "latitude": 48.8867,
                "longitude": 2.3431,
                "rating": 4.89,
                "image_url": "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Montmartre, 18th Arrondissement"
            },
            {
                "id": "paris-marais",
                "name": "Le Marais & Rue des Rosiers",
                "category": "Food & Drink",
                "description": "Chic historical district buzzing with trendy fashion boutiques, artisanal pastry shops, world-famous l'As du Fallafel, and hidden courtyards.",
                "vibe": "Foodie & Trendy",
                "estimated_cost_usd": 18.0,
                "best_time_to_visit": "Afternoon",
                "insider_tip": "Grab a hot pita at L'As du Fallafel and stroll over to the tranquil manicured arcades of Place des Vosges.",
                "latitude": 48.8575,
                "longitude": 2.3584,
                "rating": 4.93,
                "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Le Marais, 4th Arrondissement"
            },
            {
                "id": "paris-sainte-chapelle",
                "name": "Sainte-Chapelle Stained Glass Jewel",
                "category": "Hidden Gem",
                "description": "Gothic masterpiece with 15-meter tall 13th-century stained glass windows soaring into heaven on the Île de la Cité.",
                "vibe": "Architecture & Art",
                "estimated_cost_usd": 15.0,
                "best_time_to_visit": "Morning",
                "insider_tip": "Visit on a sunny morning between 10 AM and noon when sunlight bathes the upper chapel in sapphire and ruby tones.",
                "latitude": 48.8554,
                "longitude": 2.3450,
                "rating": 4.91,
                "image_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Île de la Cité, 1st Arrondissement"
            },
            {
                "id": "paris-seine-cruise",
                "name": "Seine River Sunset Bateaux Cruise",
                "category": "Scenic Viewpoint",
                "description": "Gliding under ancient carved stone bridges past floodlit monuments as twilight sets behind the Eiffel Tower.",
                "vibe": "Romance & Relaxation",
                "estimated_cost_usd": 20.0,
                "best_time_to_visit": "Evening",
                "insider_tip": "Board at Pont Neuf on smaller wooden salon boats for live acoustic jazz and open-air decks.",
                "latitude": 48.8569,
                "longitude": 2.3412,
                "rating": 4.87,
                "image_url": "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Pont Neuf / Port de la Bourdonnais"
            }
        ]
    },
    "tokyo": {
        "city": "Tokyo",
        "country": "Japan",
        "summary": "An exhilarating collision of neon cyberpunk skylines, ancient Meiji shrines, Michelin-starred back-alleys, and futuristic transit.",
        "places": [
            {
                "id": "tokyo-shibuya-sky",
                "name": "Shibuya Sky Observation Deck",
                "category": "Scenic Viewpoint",
                "description": "An open-air 360-degree rooftop deck 229 meters above the world-famous Shibuya Scramble Crossing, looking out to Mount Fuji.",
                "vibe": "Cyberpunk & Modern",
                "estimated_cost_usd": 18.0,
                "best_time_to_visit": "Sunset",
                "insider_tip": "Time your ticket entry 45 minutes before sunset to capture daylight, golden hour, and the city lights awakening.",
                "latitude": 35.6580,
                "longitude": 139.7016,
                "rating": 4.94,
                "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Shibuya Scramble Square, Shibuya"
            },
            {
                "id": "tokyo-sensoji",
                "name": "Senso-ji Temple & Nakamise-dori",
                "category": "Landmark",
                "description": "Tokyo's oldest and most sacred Buddhist temple, entered through the giant Kaminarimon lantern gate and traditional snack stalls.",
                "vibe": "Cultural Heritage",
                "estimated_cost_usd": 0.0,
                "best_time_to_visit": "Morning",
                "insider_tip": "Visit before 8:30 AM before tour buses arrive, or at 9 PM when the temple is gorgeously illuminated without crowds.",
                "latitude": 35.7148,
                "longitude": 139.7967,
                "rating": 4.9,
                "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Asakusa, Taito City"
            },
            {
                "id": "tokyo-tsukiji",
                "name": "Tsukiji Outer Food Market",
                "category": "Food & Drink",
                "description": "A sensory maze of over 400 culinary stalls serving fresh otoro sashimi, grilled tamagoyaki omelettes, and uni sea urchin bowls.",
                "vibe": "Foodie Heaven",
                "estimated_cost_usd": 25.0,
                "best_time_to_visit": "Morning",
                "insider_tip": "Try the standing sashimi counters at Yamacho for freshly rolled sweet egg skewers for only 150 yen.",
                "latitude": 35.6655,
                "longitude": 139.7706,
                "rating": 4.91,
                "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Tsukiji, Chuo City"
            },
            {
                "id": "tokyo-shinjuku-gyoen",
                "name": "Shinjuku Gyoen National Garden",
                "category": "Nature",
                "description": "Sprawling 144-acre oasis combining traditional Japanese landscape gardens, English lawns, and French formal rose gardens.",
                "vibe": "Relaxation & Zen",
                "estimated_cost_usd": 5.0,
                "best_time_to_visit": "Afternoon",
                "insider_tip": "Visit the traditional wooden teahouse in the Japanese garden for matcha and seasonal wagashi sweets.",
                "latitude": 35.6852,
                "longitude": 139.7101,
                "rating": 4.88,
                "image_url": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Shinjuku / Shibuya border"
            },
            {
                "id": "tokyo-omoide",
                "name": "Omoide Yokocho (Memory Lane)",
                "category": "Hidden Gem",
                "description": "Intimate lantern-lit alleyway packed with tiny charcoal yakitori bars seating only 5-6 patrons each, reminiscent of 1950s Tokyo.",
                "vibe": "Nightlife & Heritage",
                "estimated_cost_usd": 28.0,
                "best_time_to_visit": "Evening",
                "insider_tip": "Squeeze into a counter seat and order the chef's yakitori assortment with highball or draft Kirin beer.",
                "latitude": 35.6931,
                "longitude": 139.6998,
                "rating": 4.86,
                "image_url": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Nishi-Shinjuku, Shinjuku"
            }
        ]
    },
    "rome": {
        "city": "Rome",
        "country": "Italy",
        "summary": "The Eternal City enchants with ancient imperial colosseums, sun-drenched baroque piazzas, bubbling fountains, and sublime handmade cacio e pepe.",
        "places": [
            {
                "id": "rome-colosseum",
                "name": "Colosseum & Roman Forum",
                "category": "Landmark",
                "description": "The titanic gladiatorial amphitheater that once held 50,000 spectators, flanked by the ruined marble temples of the Roman Forum.",
                "vibe": "Ancient History",
                "estimated_cost_usd": 24.0,
                "best_time_to_visit": "Morning",
                "insider_tip": "Book the Underground & Arena Floor access ticket to walk where gladiators once waited in subterranean chambers.",
                "latitude": 41.8902,
                "longitude": 12.4922,
                "rating": 4.93,
                "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Piazza del Colosseo"
            },
            {
                "id": "rome-pantheon",
                "name": "The Pantheon & Piazza della Rotonda",
                "category": "Landmark",
                "description": "A 2,000-year-old architectural marvel with the world's largest unreinforced concrete dome and open celestial oculus.",
                "vibe": "Architectural Wonder",
                "estimated_cost_usd": 6.0,
                "best_time_to_visit": "Afternoon",
                "insider_tip": "Stop right outside at Sant'Eustachio Il Caffè for Rome's most legendary frothy espresso.",
                "latitude": 41.8986,
                "longitude": 12.4769,
                "rating": 4.92,
                "image_url": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Piazza della Rotonda"
            },
            {
                "id": "rome-trastevere",
                "name": "Trastevere Cobblestone Culinary Walk",
                "category": "Food & Drink",
                "description": "Charming medieval quarter wrapped in ivy, bustling with trattorias serving authentic carbonara, amatriciana, and natural wines.",
                "vibe": "Foodie & Social",
                "estimated_cost_usd": 30.0,
                "best_time_to_visit": "Evening",
                "insider_tip": "Dine around Piazza Santa Maria in Trastevere and finish with artisanal pistachio gelato at Frigidarium.",
                "latitude": 41.8893,
                "longitude": 12.4704,
                "rating": 4.89,
                "image_url": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Trastevere, West Tiber Bank"
            },
            {
                "id": "rome-trevi",
                "name": "Trevi Fountain & Spanish Steps",
                "category": "Scenic Viewpoint",
                "description": "Dramatic Baroque fountain carved with sea gods and cascading travertine stone pools in the heart of Rome.",
                "vibe": "Romance & Beauty",
                "estimated_cost_usd": 0.0,
                "best_time_to_visit": "Night",
                "insider_tip": "Toss a coin with your right hand over your left shoulder at 6:30 AM or midnight when the piazza is peacefully empty.",
                "latitude": 41.9009,
                "longitude": 12.4833,
                "rating": 4.88,
                "image_url": "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=800&q=80",
                "address_or_area": "Piazza di Trevi"
            }
        ]
    }
}


def resolve_place_image(place_name: str, city_name: str, category: str = "", vibe: str = "") -> str:
    """Returns a guaranteed valid, high-resolution Unsplash photo URL for any place, landmark, or category."""
    p_lower = (place_name or "").lower()
    c_lower = (city_name or "").lower()
    cat_lower = (category or "").lower()
    v_lower = (vibe or "").lower()

    # Landmark-specific overrides
    if "eiffel" in p_lower:
        return "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80"
    if "louvre" in p_lower:
        return "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80"
    if "montmartre" in p_lower or "sacre" in p_lower or "sacré" in p_lower:
        return "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80"
    if "sainte-chapelle" in p_lower or "chapelle" in p_lower or "notre dame" in p_lower:
        return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80"
    if "seine" in p_lower or "cruise" in p_lower or "bateau" in p_lower:
        return "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=800&q=80"
    if "arc de triomphe" in p_lower:
        return "https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?auto=format&fit=crop&w=800&q=80"
    if "versailles" in p_lower:
        return "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80"

    # Tokyo / Japan landmarks
    if "shibuya" in p_lower:
        return "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
    if "senso" in p_lower or "asakusa" in p_lower or "temple" in p_lower:
        return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"
    if "shinjuku" in p_lower or "cyberpunk" in v_lower:
        return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80"

    # Rome / Italy landmarks
    if "colosseum" in p_lower or "colosseo" in p_lower:
        return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80"
    if "trevi" in p_lower:
        return "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=800&q=80"

    # New York landmarks
    if "central park" in p_lower:
        return "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80"
    if "times square" in p_lower or "broadway" in p_lower:
        return "https://images.unsplash.com/photo-1508873696983-2df5703bc398?auto=format&fit=crop&w=800&q=80"

    # Category / Vibe based matching
    if "food" in cat_lower or "dining" in cat_lower or "restaurant" in cat_lower or "culinary" in v_lower or "market" in p_lower or "bistro" in p_lower:
        return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
    if "viewpoint" in cat_lower or "panoramic" in v_lower or "sunset" in p_lower or "scenic" in cat_lower:
        return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    if "museum" in cat_lower or "art" in cat_lower or "culture" in cat_lower:
        return "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80"
    if "nightlife" in cat_lower or "social" in cat_lower or "bar" in p_lower or "club" in p_lower:
        return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"

    # City-level defaults
    if "paris" in c_lower:
        return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
    if "tokyo" in c_lower or "kyoto" in c_lower or "osaka" in c_lower:
        return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80"
    if "rome" in c_lower or "florence" in c_lower or "venice" in c_lower:
        return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80"
    if "london" in c_lower:
        return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80"
    if "new york" in c_lower:
        return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80"
    if "barcelona" in c_lower or "madrid" in c_lower:
        return "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80"
    if "bali" in c_lower:
        return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"

    # Universal high-res travel fallback
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"


def suggest_places_with_gemini(req: CityPlacesRequest) -> CityPlacesResponse:
    """
    Feature 1: City & Places Explorer
    Curates top attractions, hidden gems, and culinary hotspots for any city worldwide using Gemini AI.
    Falls back gracefully to curated catalog and algorithmic synthesis.
    """
    api_key = get_api_key()
    city_clean = req.city.strip().title()
    country_clean = req.country.strip().title()
    city_key = city_clean.lower()

    if api_key:
        prompt = f"""
You are an expert global travel curator. Recommend 6 to 8 top places to visit in {city_clean}, {country_clean}.
Travel Vibe Preference: {req.vibe or 'All-Round'}
Target Budget Level: {req.budget_level or 'Moderate'}

Ensure an authentic, diverse, and captivating mix:
- Iconic world-renowned landmarks
- Cultural and historic treasures
- Outstanding local foodie & dining spots
- Panoramic viewpoints or sunset chill spots
- Inspiring hidden gems known to locals

Return ONLY a JSON object strictly matching this schema:
{{
  "city": "{city_clean}",
  "country": "{country_clean}",
  "summary": "Captivating 2-sentence summary of what makes {city_clean} unforgettable.",
  "places": [
    {{
      "id": "place-1",
      "name": "Place Name",
      "category": "Landmark",
      "description": "Engaging description explaining why this place is unmissable.",
      "vibe": "Romantic & Panoramic",
      "estimated_cost_usd": 25.0,
      "best_time_to_visit": "Sunset",
      "insider_tip": "Concrete insider advice for visitors.",
      "latitude": 48.8584,
      "longitude": 2.2945,
      "rating": 4.9,
      "address_or_area": "Neighborhood or district"
    }}
  ]
}}
"""
        candidate_models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"]
        for model_name in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            try:
                with httpx.Client(timeout=25.0) as client:
                    res = client.post(
                        url,
                        json={
                            "contents": [{"parts": [{"text": prompt}]}],
                            "generationConfig": {"response_mime_type": "application/json"}
                        }
                    )
                    if res.status_code == 200:
                        raw = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                        data = json.loads(raw)
                        places_items = []
                        for idx, p in enumerate(data.get("places", [])):
                            p_name = p.get("name", f"Spot in {city_clean}")
                            p_cat = p.get("category", "Landmark")
                            p_vibe = p.get("vibe", req.vibe or "Cultural")
                            valid_img = resolve_place_image(
                                place_name=p_name,
                                city_name=city_clean,
                                category=p_cat,
                                vibe=p_vibe
                            )
                            places_items.append(
                                PlaceItem(
                                    id=p.get("id") or f"{city_clean.lower()}-{idx+1}",
                                    name=p_name,
                                    category=p_cat,
                                    description=p.get("description", ""),
                                    vibe=p_vibe,
                                    estimated_cost_usd=float(p.get("estimated_cost_usd", 15.0)),
                                    best_time_to_visit=p.get("best_time_to_visit", "Morning"),
                                    insider_tip=p.get("insider_tip", "Enjoy this local treasure."),
                                    latitude=float(p.get("latitude", 48.85)),
                                    longitude=float(p.get("longitude", 2.35)),
                                    rating=float(p.get("rating", 4.8)),
                                    image_url=valid_img,
                                    address_or_area=p.get("address_or_area", city_clean)
                                )
                            )
                        logger.info(f"Gemini generated {len(places_items)} places for {city_clean}, {country_clean}")
                        return CityPlacesResponse(
                            city=city_clean,
                            country=country_clean,
                            summary=data.get("summary", f"Explore the finest sights and culinary magic of {city_clean}."),
                            places=places_items
                        )
            except Exception as e:
                logger.warning(f"Gemini place suggestion failed with {model_name}: {e}")
                continue

    # Fallback to curated dictionary if available
    for key, val in FALLBACK_CITY_PLACES.items():
        if key in city_key or city_key in key:
            places = [PlaceItem(**p) for p in val["places"]]
            return CityPlacesResponse(
                city=val["city"],
                country=val["country"],
                summary=val["summary"],
                places=places
            )

    # Generic dynamic generator for any world city
    return CityPlacesResponse(
        city=city_clean,
        country=country_clean,
        summary=f"{city_clean} is a mesmerizing destination in {country_clean} offering vibrant streets, rich cultural heritage, and memorable local flavors.",
        places=[
            PlaceItem(
                id=f"{city_clean.lower()}-historic-center",
                name=f"Historic Old Town & Central Plaza",
                category="Landmark",
                description=f"The pulsating historical heartbeat of {city_clean}, lined with preserved architecture, lively outdoor cafes, and civic monuments.",
                vibe="Cultural Heritage",
                estimated_cost_usd=0.0,
                best_time_to_visit="Morning",
                insider_tip="Begin early at the central square before shop doors open for peaceful morning light and artisan bakeries.",
                latitude=48.8566 if 'paris' in city_key else 40.7128,
                longitude=2.3522 if 'paris' in city_key else -74.0060,
                rating=4.87,
                image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
                address_or_area=f"Central {city_clean}"
            ),
            PlaceItem(
                id=f"{city_clean.lower()}-market-hall",
                name=f"{city_clean} Artisanal Food & Produce Market",
                category="Food & Drink",
                description=f"A bustling sensory market showcasing traditional dishes, local street specialties, and regional delicacies made fresh daily.",
                vibe="Foodie Experience",
                estimated_cost_usd=22.0,
                best_time_to_visit="Afternoon",
                insider_tip="Seek out stalls with the longest lines of locals for authentic seasonal specialties.",
                latitude=48.8570 if 'paris' in city_key else 40.7135,
                longitude=2.3530 if 'paris' in city_key else -74.0050,
                rating=4.91,
                image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
                address_or_area=f"Market Quarter, {city_clean}"
            ),
            PlaceItem(
                id=f"{city_clean.lower()}-panoramic-point",
                name=f"{city_clean} Panoramic Sunset Overlook",
                category="Scenic Viewpoint",
                description=f"An elevated vista point delivering awe-inspiring sweeping panoramas over the city skyline, surrounding rivers or hills.",
                vibe="Romantic & Scenic",
                estimated_cost_usd=0.0,
                best_time_to_visit="Sunset",
                insider_tip="Bring a camera 30 minutes before dusk to watch the golden sun dip below the city horizon.",
                latitude=48.8580 if 'paris' in city_key else 40.7140,
                longitude=2.3540 if 'paris' in city_key else -74.0040,
                rating=4.89,
                image_url="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
                address_or_area=f"Highland Promenade, {city_clean}"
            ),
            PlaceItem(
                id=f"{city_clean.lower()}-cultural-museum",
                name=f"Museum of Fine Arts & Heritage",
                category="Culture & Art",
                description=f"Renowned collection of classical masterpieces, historical artifacts, and immersive modern installations celebrating local history.",
                vibe="Art & Intellect",
                estimated_cost_usd=16.0,
                best_time_to_visit="Afternoon",
                insider_tip="Audio guides are often free on the museum app; download beforehand.",
                latitude=48.8590 if 'paris' in city_key else 40.7150,
                longitude=2.3550 if 'paris' in city_key else -74.0030,
                rating=4.85,
                image_url="https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80",
                address_or_area=f"Museum Row, {city_clean}"
            )
        ]
    )


# ============================================================================
# NATURAL LANGUAGE TRAVEL ASSISTANT CHATBOT
# ============================================================================

def process_travel_chat(req: ChatRequest) -> ChatResponse:
    """
    Feature 2: Natural Language AI Trip Chatbot
    Parses conversational user instructions (e.g. 'plan a trip for 100 usd to paris for 5 days'),
    extracts target destination, duration, budget, and vibe, and seamlessly curates the full itinerary.
    """
    from app.services.itinerary_service import generate_personalized_itinerary
    from app.routes.storage import LOCAL_TRIPS

    api_key = get_api_key()
    user_msg = req.message.strip()

    history_lines = []
    for m in req.conversation_history[-6:]:
        history_lines.append(f"{m.role.upper()}: {m.content}")
    history_text = "\n".join(history_lines) if history_lines else "None (New conversation)"

    if api_key:
        prompt = f"""
You are "Travel Vibe AI Companion", an expert AI travel architect embedded in the Personalized Travel Itinerary Planner.

USER QUERY:
"{user_msg}"

CONVERSATION CONTEXT:
{history_text}

MISSION:
Evaluate whether the user is giving an order/request to plan or create a travel trip (e.g. "plan a trip for 100 usd to paris for 5 days", "create an itinerary for Tokyo", "3 days in Rome on a budget", "plan 5 days in Bali", etc.) OR asking a general travel question / chatting.

If the user IS requesting a trip plan (even if some details are implied):
1. "is_trip_order": true
2. "destination_name": Identified city or destination (e.g. "Paris", "Tokyo", "Rome", "Bali", "Interlaken").
3. "country": Country of destination (e.g. "France", "Japan", "Italy", "Indonesia", "Switzerland").
4. "total_days": Integer between 1 and 14 (default to 5 if not specified).
5. "daily_budget_usd": Float estimated daily budget in USD (if user said "$100 to Paris for 5 days", assume 100 or calculate total/days).
6. "vibe": One of "Cultural & Foodie", "Romantic Escape", "Adventure & Thrills", "Relaxation & Zen", "Scenic Nature", "Nightlife & Social".
7. "pace": "Moderate", "Relaxed", or "Fast-Paced".
8. "reply": A warm, high-vibe 2-sentence conversational confirmation announcing the curated itinerary is ready to load into the planner.

If the user is NOT ordering a trip plan:
1. "is_trip_order": false
2. "reply": A charming, highly knowledgeable response providing travel advice, insider tips, or asking how they'd like their dream vacation curated.

Strictly output a valid JSON object:
{{
  "is_trip_order": true,
  "destination_name": "Paris",
  "country": "France",
  "total_days": 5,
  "daily_budget_usd": 100.0,
  "vibe": "Cultural & Foodie",
  "pace": "Moderate",
  "reply": "I've crafted a comprehensive 5-day Paris itinerary for you tailored for a $100/day budget! You can review each day's morning, afternoon, and evening stops below, and load it straight into your planner."
}}
"""
        candidate_models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"]
        for model_name in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            try:
                with httpx.Client(timeout=25.0) as client:
                    res = client.post(
                        url,
                        json={
                            "contents": [{"parts": [{"text": prompt}]}],
                            "generationConfig": {"response_mime_type": "application/json"}
                        }
                    )
                    if res.status_code == 200:
                        raw = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                        data = json.loads(raw)
                        if data.get("is_trip_order"):
                            dest = data.get("destination_name") or "Paris"
                            country = data.get("country") or "France"
                            days = max(1, min(14, int(data.get("total_days", 5))))
                            budget = float(data.get("daily_budget_usd", 100.0))
                            vibe = data.get("vibe", "Cultural & Foodie")
                            pace = data.get("pace", "Moderate")

                            itinerary_req = ItineraryGenerateRequest(
                                destination_name=dest,
                                country=country,
                                total_days=days,
                                daily_budget=budget,
                                vibe=vibe,
                                pace=pace,
                                group_type="Solo"
                            )
                            trip = generate_personalized_itinerary(itinerary_req)
                            LOCAL_TRIPS[trip.id] = trip

                            return ChatResponse(
                                reply=data.get("reply", f"I have curated an exclusive {days}-day itinerary for {dest} with a daily budget of ${budget:.0f}!"),
                                action_type="trip_created",
                                trip=trip,
                                extracted_intent={
                                    "destination_name": dest,
                                    "country": country,
                                    "total_days": days,
                                    "daily_budget": budget,
                                    "vibe": vibe
                                }
                            )
                        else:
                            return ChatResponse(
                                reply=data.get("reply", "I'm ready to curate your dream trip. Tell me your destination, budget, or preferred vibe!"),
                                action_type="chat"
                            )
            except Exception as e:
                logger.warning(f"Gemini chat processing with {model_name} failed: {e}")
                continue

    # Fallback heuristic processor
    return fallback_chat_processor(req, user_msg)


def fallback_chat_processor(req: ChatRequest, user_msg: str) -> ChatResponse:
    """Offline heuristic natural language parser for trip orders."""
    import re
    from app.services.itinerary_service import generate_personalized_itinerary
    from app.routes.storage import LOCAL_TRIPS

    msg_lower = user_msg.lower()

    # Detect days
    days_match = re.search(r'(\d+)\s*(?:days?|day)', msg_lower)
    days = int(days_match.group(1)) if days_match else 5
    days = max(1, min(14, days))

    # Detect budget
    budget_match = re.search(r'(?:for\s+)?(?:\$|usd\s*)?(\d+)\s*(?:usd|dollars|\$)?', msg_lower)
    budget = float(budget_match.group(1)) if budget_match else 150.0

    # Common destinations detector
    city_map = {
        "paris": ("Paris", "France", "Cultural & Romance"),
        "tokyo": ("Tokyo", "Japan", "Cyberpunk & Foodie"),
        "kyoto": ("Kyoto", "Japan", "Spiritual Zen & Heritage"),
        "bali": ("Bali", "Indonesia", "Relaxation & Wellness"),
        "rome": ("Rome", "Italy", "Ancient Romance & Foodie"),
        "swiss": ("Interlaken", "Switzerland", "Alpine Adventure"),
        "interlaken": ("Interlaken", "Switzerland", "Alpine Adventure"),
        "amalfi": ("Amalfi Coast", "Italy", "Coastal Romance"),
        "iceland": ("Reykjavik", "Iceland", "Glacial Nature"),
        "new zealand": ("Queenstown", "New Zealand", "Adrenaline Thrill"),
        "queenstown": ("Queenstown", "New Zealand", "Adrenaline Thrill"),
        "mexico": ("Oaxaca", "Mexico", "Foodie & Culture"),
        "oaxaca": ("Oaxaca", "Mexico", "Foodie & Culture"),
        "london": ("London", "United Kingdom", "Cultural & Heritage"),
        "barcelona": ("Barcelona", "Spain", "Art & Nightlife"),
        "new york": ("New York", "USA", "Metropolitan Buzz"),
        "dubai": ("Dubai", "UAE", "Luxury & Architecture")
    }

    matched_dest = None
    for k, v in city_map.items():
        if k in msg_lower:
            matched_dest = v
            break

    # If user says "to <Capitalized City>"
    if not matched_dest:
        to_match = re.search(r'\bto\s+([A-Za-z\s]+?)(?:\s+for|\s+with|\s+in|$)', user_msg, re.I)
        if to_match:
            city_name = to_match.group(1).strip().title()
            matched_dest = (city_name, "International", "Cultural & Scenic")

    if matched_dest or "plan" in msg_lower or "trip" in msg_lower:
        dest_name, country_name, default_vibe = matched_dest if matched_dest else ("Paris", "France", "Cultural & Romance")
        itinerary_req = ItineraryGenerateRequest(
            destination_name=dest_name,
            country=country_name,
            total_days=days,
            daily_budget=budget,
            vibe=default_vibe,
            pace="Moderate",
            group_type="Solo"
        )
        trip = generate_personalized_itinerary(itinerary_req)
        LOCAL_TRIPS[trip.id] = trip

        return ChatResponse(
            reply=f"Voil\u00e0! I have structured a complete {days}-day travel itinerary for {dest_name}, {country_name} on a ${budget:,.0f} budget. You can review each scheduled morning, afternoon, and evening stop below and load it directly into your trip builder!",
            action_type="trip_created",
            trip=trip,
            extracted_intent={
                "destination_name": dest_name,
                "country": country_name,
                "total_days": days,
                "daily_budget": budget,
                "vibe": default_vibe
            }
        )

    # General chat response
    return ChatResponse(
        reply="Hello traveler! I am your AI Travel Assistant. You can tell me things like: \"Plan a trip for 100 USD to Paris for 5 days\" or ask me for hidden gems, budget tips, and restaurant recommendations for any city in the world!",
        action_type="chat"
    )


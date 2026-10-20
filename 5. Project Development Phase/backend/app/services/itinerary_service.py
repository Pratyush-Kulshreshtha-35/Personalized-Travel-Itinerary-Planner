import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models import ItineraryGenerateRequest, TripModel, DayModel, ActivityModel
from app.services.recommendation_service import get_destination_by_name_or_id
from app.services.route_optimizer import optimize_activity_sequence
from app.services.gemini_service import generate_itinerary_with_gemini


# Comprehensive catalog of curated activity blueprints per destination
DESTINATION_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {
    "Kyoto & Tokyo": [
        {
            "theme": "Spiritual Shrines & Traditional Tea Ceremony",
            "activities": [
                {
                    "time_slot": "Morning",
                    "start_time": "08:00",
                    "end_time": "11:00",
                    "title": "Fushimi Inari Torii Gate Sunrise Walk",
                    "description": "Walk among thousands of vermilion shrine gates winding up sacred Mount Inari through shaded cedar forest.",
                    "location_name": "Fushimi Inari-taisha, Kyoto",
                    "latitude": 34.9671,
                    "longitude": 135.7727,
                    "estimated_cost": 0.0,
                    "duration_minutes": 180,
                    "activity_type": "Culture",
                    "vibe_match": "Cultural & Spiritual",
                    "insider_tip": "Continue past the halfway point to Yotsutsuji for breathtaking panoramic views of Kyoto without the crowds."
                },
                {
                    "time_slot": "Afternoon",
                    "start_time": "12:30",
                    "end_time": "15:00",
                    "title": "Nishiki Market Street Gastronomy Safari",
                    "description": "Kyoto's legendary 400-year-old pantry featuring grilled wagyu, matcha dango, and artisanal soy crackers.",
                    "location_name": "Nishiki Market, Nakagyo",
                    "latitude": 35.0050,
                    "longitude": 135.7649,
                    "estimated_cost": 30.0,
                    "duration_minutes": 150,
                    "activity_type": "Dining",
                    "vibe_match": "Foodie Mastery",
                    "insider_tip": "Cash is king at the smaller stalls; try the freshly fried octopus skewers."
                },
                {
                    "time_slot": "Evening",
                    "start_time": "17:30",
                    "end_time": "20:30",
                    "title": "Gion Historic Preservation District & Kaiseki",
                    "description": "Atmospheric lantern-lit stroll along stone-paved alleys and canals, followed by a multi-course seasonal dinner.",
                    "location_name": "Gion Shirakawa, Kyoto",
                    "latitude": 35.0037,
                    "longitude": 135.7772,
                    "estimated_cost": 75.0,
                    "duration_minutes": 180,
                    "activity_type": "Dining",
                    "vibe_match": "Heritage & Romance",
                    "insider_tip": "Please be respectful of working Geiko/Maiko and refrain from blocking pathways."
                }
            ]
        },
        {
            "theme": "Arashiyama Bamboo Grove & Golden Zen Reflections",
            "activities": [
                {
                    "time_slot": "Morning",
                    "start_time": "08:30",
                    "end_time": "11:30",
                    "title": "Arashiyama Bamboo Sanctuary & Tenryu-ji Garden",
                    "description": "Step into towering jade bamboo stalks whispering in the morning breeze and explore UNESCO Zen landscape gardens.",
                    "location_name": "Arashiyama Bamboo Grove, Ukyo",
                    "latitude": 35.0170,
                    "longitude": 135.6713,
                    "estimated_cost": 10.0,
                    "duration_minutes": 180,
                    "activity_type": "Scenic Nature",
                    "vibe_match": "Zen Tranquility",
                    "insider_tip": "Visit the Okochi Sanso villa garden at the top of the path for complimentary matcha and quiet garden vistas."
                },
                {
                    "time_slot": "Afternoon",
                    "start_time": "13:00",
                    "end_time": "15:30",
                    "title": "Kinkaku-ji (The Golden Pavilion)",
                    "description": "Marvel at the top two floors of this Zen temple entirely covered in pure gold leaf shimmering over Mirror Pond.",
                    "location_name": "Kinkaku-ji Temple, Kita",
                    "latitude": 35.0394,
                    "longitude": 135.7292,
                    "estimated_cost": 12.0,
                    "duration_minutes": 150,
                    "activity_type": "Culture",
                    "vibe_match": "Cultural Icon",
                    "insider_tip": "Afternoon light captures the best golden reflections across the water."
                },
                {
                    "time_slot": "Evening",
                    "start_time": "18:00",
                    "end_time": "21:00",
                    "title": "Pontocho Alley Izakaya Hop",
                    "description": "A narrow alley packed with intimate izakayas, yakitori grills, craft beer bars, and riverside dining terraces.",
                    "location_name": "Pontocho Alley, Kyoto",
                    "latitude": 35.0062,
                    "longitude": 135.7712,
                    "estimated_cost": 50.0,
                    "duration_minutes": 180,
                    "activity_type": "Dining",
                    "vibe_match": "Foodie & Nightlife",
                    "insider_tip": "Reserve a Kawayuka platform seat overlooking the Kamogawa river in warm months."
                }
            ]
        },
        {
            "theme": "Shinkansen Transit & Tokyo Cyberpunk Neon",
            "activities": [
                {
                    "time_slot": "Morning",
                    "start_time": "09:00",
                    "end_time": "12:00",
                    "title": "Bullet Train Transit with Mt. Fuji Views",
                    "description": "Experience Japan's high-speed Shinkansen gliding at 300 km/h past the snow-capped peak of Mount Fuji into Tokyo.",
                    "location_name": "Kyoto Station to Tokyo Station",
                    "latitude": 35.6812,
                    "longitude": 139.7671,
                    "estimated_cost": 110.0,
                    "duration_minutes": 180,
                    "activity_type": "Transit",
                    "vibe_match": "Futuristic Transit",
                    "insider_tip": "Book seat Row E on the Nozomi train for direct views of Mt. Fuji on clear days."
                },
                {
                    "time_slot": "Afternoon",
                    "start_time": "13:30",
                    "end_time": "16:30",
                    "title": "Akihabara Electric Town & Retro Tech Arcade",
                    "description": "Immerse in Japanese pop culture, vintage video games, multi-story electronics department stores, and anime culture.",
                    "location_name": "Akihabara, Chiyoda, Tokyo",
                    "latitude": 35.6983,
                    "longitude": 139.7731,
                    "estimated_cost": 25.0,
                    "duration_minutes": 180,
                    "activity_type": "Culture",
                    "vibe_match": "Futuristic & Cyberpunk",
                    "insider_tip": "Head to Super Potato for 4 floors of vintage retro Nintendo and arcade gaming."
                },
                {
                    "time_slot": "Evening",
                    "start_time": "18:00",
                    "end_time": "21:30",
                    "title": "Shibuya Scramble Crossing & Rooftop Sky Panorama",
                    "description": "Cross the busiest pedestrian intersection in the world then take the elevator up to Shibuya Sky 360 observatory.",
                    "location_name": "Shibuya Scramble Square, Tokyo",
                    "latitude": 35.6580,
                    "longitude": 139.7016,
                    "estimated_cost": 35.0,
                    "duration_minutes": 210,
                    "activity_type": "Sightseeing",
                    "vibe_match": "Urban Energy",
                    "insider_tip": "Pre-book Shibuya Sky sunset slots 4 weeks in advance for breathtaking golden hour."
                }
            ]
        }
    ],
    "Bali (Ubud & Canggu)": [
        {
            "theme": "Sacred Terraces & Ubud Healing Sanctuary",
            "activities": [
                {
                    "time_slot": "Morning",
                    "start_time": "08:00",
                    "end_time": "11:00",
                    "title": "Tegallalang Rice Terrace & Jungle Swing",
                    "description": "Lush emerald-green stepped paddies carved into river valleys, complete with authentic palm tree swings.",
                    "location_name": "Tegallalang Rice Terraces, Ubud",
                    "latitude": -8.4312,
                    "longitude": 115.2809,
                    "estimated_cost": 15.0,
                    "duration_minutes": 180,
                    "activity_type": "Scenic Nature",
                    "vibe_match": "Tropical Zen",
                    "insider_tip": "Walk all the way down across the stream and hike the far ridge to escape the tour buses."
                },
                {
                    "time_slot": "Afternoon",
                    "start_time": "13:00",
                    "end_time": "15:30",
                    "title": "Sacred Monkey Forest & Organic Vegan Feast",
                    "description": "Centuries-old mossy stone temples nestled under towering banyan trees with hundreds of playful Balinese macaques.",
                    "location_name": "Sacred Monkey Forest Sanctuary, Ubud",
                    "latitude": -8.5188,
                    "longitude": 115.2585,
                    "estimated_cost": 20.0,
                    "duration_minutes": 150,
                    "activity_type": "Culture",
                    "vibe_match": "Wellness & Nature",
                    "insider_tip": "Keep all sunglasses, loose jewelry, and food tightly zipped inside your backpack."
                },
                {
                    "time_slot": "Evening",
                    "start_time": "18:00",
                    "end_time": "21:00",
                    "title": "Kecak Fire Dance Performance & Balinese Dinner",
                    "description": "Dramatic open-air choral vocal chant dance reenacting the Ramayana epic amidst swirling torches.",
                    "location_name": "Ubud Palace Amphitheatre",
                    "latitude": -8.5069,
                    "longitude": 115.2625,
                    "estimated_cost": 30.0,
                    "duration_minutes": 180,
                    "activity_type": "Culture",
                    "vibe_match": "Spiritual Heritage",
                    "insider_tip": "Get front row seats 20 minutes prior to showtime for the fire finale."
                }
            ]
        },
        {
            "theme": "Coastal Cliffs & Canggu Beachfront Sunsets",
            "activities": [
                {
                    "time_slot": "Morning",
                    "start_time": "08:30",
                    "end_time": "11:30",
                    "title": "Boutique Surf Lesson at Echo Beach",
                    "description": "Catch gentle warm peeling waves with private local instructors along Canggu's black volcanic sands.",
                    "location_name": "Echo Beach, Canggu",
                    "latitude": -8.6539,
                    "longitude": 115.1278,
                    "estimated_cost": 35.0,
                    "duration_minutes": 180,
                    "activity_type": "Adventure",
                    "vibe_match": "Coastal Thrill",
                    "insider_tip": "Morning offshore trade winds provide glassy clean waves."
                },
                {
                    "time_slot": "Afternoon",
                    "start_time": "14:00",
                    "end_time": "16:30",
                    "title": "Holistic Herbal Spa & Floral Bath",
                    "description": "Indulge in traditional Balinese deep tissue massage and flower petal mineral baths in open-air bamboo pavilions.",
                    "location_name": "Canggu Eco Spa Sanctuary",
                    "latitude": -8.6480,
                    "longitude": 115.1380,
                    "estimated_cost": 30.0,
                    "duration_minutes": 150,
                    "activity_type": "Relaxation",
                    "vibe_match": "Wellness & Chill",
                    "insider_tip": "Try the lemongrass herbal tea post-massage."
                },
                {
                    "time_slot": "Evening",
                    "start_time": "17:30",
                    "end_time": "21:30",
                    "title": "Uluwatu Sunset Temple & Cliffside Lounge",
                    "description": "Dramatic 70-meter cliff hanging over crashing ocean waves, followed by seafood barbecue under the stars.",
                    "location_name": "Uluwatu Temple, South Kuta",
                    "latitude": -8.8291,
                    "longitude": 115.0849,
                    "estimated_cost": 40.0,
                    "duration_minutes": 240,
                    "activity_type": "Sightseeing",
                    "vibe_match": "Sunset & Chill",
                    "insider_tip": "Watch the sunset glow illuminate the Indian Ocean swells."
                }
            ]
        }
    ],
    "Interlaken & Zermatt": [
        {
            "theme": "Jungfraujoch Top of Europe & Glacial Ice Palace",
            "activities": [
                {
                    "time_slot": "Morning",
                    "start_time": "08:00",
                    "end_time": "11:30",
                    "title": "Eiger Express & Jungfraujoch Sphinx Observatory",
                    "description": "Ascend by state-of-the-art tricable gondola along the Eiger North Face to Europe's highest railway station at 3,454m.",
                    "location_name": "Jungfraujoch, Interlaken",
                    "latitude": 46.5475,
                    "longitude": 7.9822,
                    "estimated_cost": 120.0,
                    "duration_minutes": 210,
                    "activity_type": "Adventure",
                    "vibe_match": "Alpine Thrill",
                    "insider_tip": "Step out onto the Plateau for photos with the iconic Swiss flag against the Aletsch Glacier."
                },
                {
                    "time_slot": "Afternoon",
                    "start_time": "13:00",
                    "end_time": "15:30",
                    "title": "Ice Palace Tunnels & Glacier Trek",
                    "description": "Wander through mirrored corridors carved deep inside the eternal glacier featuring crystalline ice sculptures.",
                    "location_name": "Jungfraujoch Ice Palace",
                    "latitude": 46.5480,
                    "longitude": 7.9830,
                    "estimated_cost": 0.0,
                    "duration_minutes": 150,
                    "activity_type": "Sightseeing",
                    "vibe_match": "Scenic Wonder",
                    "insider_tip": "Wear shoes with deep traction treads; the ice path can be slick."
                },
                {
                    "time_slot": "Evening",
                    "start_time": "18:00",
                    "end_time": "21:00",
                    "title": "Harder Kulm Sunset & Swiss Alpine Fondue",
                    "description": "Funicular ascent to the Two Lakes Bridge overlooking Lakes Thun & Brienz, followed by bubbling Gruyère fondue.",
                    "location_name": "Harder Kulm Panorama Restaurant",
                    "latitude": 46.6975,
                    "longitude": 7.8525,
                    "estimated_cost": 55.0,
                    "duration_minutes": 180,
                    "activity_type": "Dining",
                    "vibe_match": "Romance & Scenic",
                    "insider_tip": "The glass-bottom section of the bridge offers a dizzying view straight down to Interlaken."
                }
            ]
        },
        {
            "theme": "Matterhorn Glacier Paradise & Zermatt Village",
            "activities": [
                {
                    "time_slot": "Morning",
                    "start_time": "08:30",
                    "end_time": "11:30",
                    "title": "Gornergrat Cogwheel Railway to Matterhorn Vista",
                    "description": "Historic open-air electric cogwheel train climbing through fragrant pine forests to 3,089m with 360-degree alpine views.",
                    "location_name": "Gornergrat Bahn, Zermatt",
                    "latitude": 45.9836,
                    "longitude": 7.7836,
                    "estimated_cost": 85.0,
                    "duration_minutes": 180,
                    "activity_type": "Scenic Nature",
                    "vibe_match": "Matterhorn Splendor",
                    "insider_tip": "Stop at Riffelsee to photograph the perfect mirror reflection of the Matterhorn in the lake."
                },
                {
                    "time_slot": "Afternoon",
                    "start_time": "13:30",
                    "end_time": "16:00",
                    "title": "Car-Free Zermatt Old Village Walking Tour",
                    "description": "Explore 500-year-old sun-blackened larch wood barns on stilts with stone slabs protecting stored grain.",
                    "location_name": "Hinterdorfstrasse, Zermatt",
                    "latitude": 46.0207,
                    "longitude": 7.7491,
                    "estimated_cost": 0.0,
                    "duration_minutes": 150,
                    "activity_type": "Culture",
                    "vibe_match": "Heritage & Charm",
                    "insider_tip": "Look for the Valais Blacknose sheep emblems carved on traditional chalets."
                },
                {
                    "time_slot": "Evening",
                    "start_time": "18:30",
                    "end_time": "21:30",
                    "title": "Artisanal Raclette & Swiss Wine Tasting",
                    "description": "Savor melted wheels of Swiss Valais raclette cheese served with baby potatoes, gherkins, and local Fendant white wine.",
                    "location_name": "Restaurant Schäferstube, Zermatt",
                    "latitude": 46.0215,
                    "longitude": 7.7485,
                    "estimated_cost": 60.0,
                    "duration_minutes": 180,
                    "activity_type": "Dining",
                    "vibe_match": "Foodie & Cozy",
                    "insider_tip": "Pair with a crisp glass of Petite Arvine from local hillside vineyards."
                }
            ]
        },
        {
            "theme": "Lake Brienz Turquoise Waters & First Cliff Walk",
            "activities": [
                {
                    "time_slot": "Morning",
                    "start_time": "09:00",
                    "end_time": "11:30",
                    "title": "Grindelwald-First Cliff Walk by Tissot",
                    "description": "High-altitude suspension bridge and steel catwalk clinging to sheer rock faces with dizzying alpine drop-offs.",
                    "location_name": "First Cliff Walk, Grindelwald",
                    "latitude": 46.6586,
                    "longitude": 8.0536,
                    "estimated_cost": 45.0,
                    "duration_minutes": 150,
                    "activity_type": "Adventure",
                    "vibe_match": "Adrenaline Rush",
                    "insider_tip": "Try the First Flyer zip line on the descent for an incredible rush."
                },
                {
                    "time_slot": "Afternoon",
                    "start_time": "13:30",
                    "end_time": "16:00",
                    "title": "Turquoise Lake Brienz Kayak or Cruise",
                    "description": "Paddle across glacial turquoise waters surrounded by plunging forested waterfalls and historic Ringgenberg castle.",
                    "location_name": "Lake Brienz Pier, Bönigen",
                    "latitude": 46.6872,
                    "longitude": 7.8890,
                    "estimated_cost": 35.0,
                    "duration_minutes": 150,
                    "activity_type": "Scenic Nature",
                    "vibe_match": "Tranquil Water",
                    "insider_tip": "Visit Giessbach Falls where 14 cascading tiers tumble directly into the lake."
                },
                {
                    "time_slot": "Evening",
                    "start_time": "18:00",
                    "end_time": "21:00",
                    "title": "Unterseen Historic Riverside Promenade",
                    "description": "Stroll wooden covered bridges over the roaring Aare River and enjoy lakeside dining at sunset.",
                    "location_name": "Unterseen Old Town, Interlaken",
                    "latitude": 46.6865,
                    "longitude": 7.8505,
                    "estimated_cost": 40.0,
                    "duration_minutes": 180,
                    "activity_type": "Relaxation",
                    "vibe_match": "Sunset & Chill",
                    "insider_tip": "The riverside terrace serves freshly baked warm apple strudel with vanilla sauce."
                }
            ]
        }
    ]
}


def generate_default_day(day_num: int, start_dt: datetime, dest_data: Dict[str, Any], vibe: str) -> DayModel:
    current_date = (start_dt + timedelta(days=day_num - 1)).strftime("%Y-%m-%d")
    lat = dest_data.get("latitude", 35.0)
    lng = dest_data.get("longitude", 135.0)
    dest_name = dest_data.get("name", "Destination")
    highlights = dest_data.get("highlights", ["Historic Old Town", "Scenic Viewpoint", "Artisanal Market"])
    h_idx = (day_num - 1) % len(highlights)

    activities = [
        ActivityModel(
            id=str(uuid.uuid4()),
            time_slot="Morning",
            start_time="09:00",
            end_time="11:30",
            title=f"Explore {highlights[h_idx]}",
            description=f"Iconic landmark exploration and morning walking route through {dest_name}.",
            location_name=f"{highlights[h_idx]}, {dest_name}",
            latitude=lat + 0.005 * day_num,
            longitude=lng + 0.005 * day_num,
            estimated_cost=25.0,
            duration_minutes=150,
            order_index=1,
            activity_type="Culture",
            vibe_match=vibe,
            insider_tip="Beat the afternoon rush by arriving during early opening hours."
        ),
        ActivityModel(
            id=str(uuid.uuid4()),
            time_slot="Afternoon",
            start_time="13:00",
            end_time="15:30",
            title=f"Local Flavor & Cultural Discovery in {dest_name}",
            description=f"Authentic local dining experience and cultural immersion matching {vibe} vibes.",
            location_name=f"Historic District, {dest_name}",
            latitude=lat - 0.003 * day_num,
            longitude=lng + 0.004 * day_num,
            estimated_cost=35.0,
            duration_minutes=150,
            order_index=2,
            activity_type="Dining",
            vibe_match=vibe,
            insider_tip="Order the regional chef specialty accompanied by local craft beverages."
        ),
        ActivityModel(
            id=str(uuid.uuid4()),
            time_slot="Evening",
            start_time="18:00",
            end_time="21:00",
            title=f"Golden Hour Sunset & Twilight Panorama",
            description=f"Unwind with scenic viewpoints and fine evening ambiance in {dest_name}.",
            location_name=f"Promenade & Scenic Vista, {dest_name}",
            latitude=lat + 0.002 * day_num,
            longitude=lng - 0.006 * day_num,
            estimated_cost=45.0,
            duration_minutes=180,
            order_index=3,
            activity_type="Relaxation",
            vibe_match="Sunset & Chill",
            insider_tip="Camera friendly: great natural lighting between 18:00 and 19:15."
        )
    ]

    return DayModel(
        id=str(uuid.uuid4()),
        day_number=day_num,
        date=current_date,
        theme_title=f"Day {day_num}: {highlights[h_idx]} & Cultural Highlights",
        daily_notes=f"Optimized for {vibe} travel style.",
        estimated_daily_cost=sum(a.estimated_cost for a in activities),
        activities=activities
    )

def generate_personalized_itinerary(req: ItineraryGenerateRequest) -> TripModel:
    """
    Activity 4.1: Daily Itinerary Builder
    Generates a complete multi-day schedule with Morning, Afternoon, and Evening slots.
    """
    # 1. First attempt generation with Google Gemini API if key is present
    gemini_trip = generate_itinerary_with_gemini(req)
    if gemini_trip:
        return gemini_trip

    dest_data = get_destination_by_name_or_id(req.destination_name)
    start_dt = datetime.now() + timedelta(days=14)

    if req.start_date:
        try:
            start_dt = datetime.strptime(req.start_date, "%Y-%m-%d")
        except Exception:
            pass

    end_dt = start_dt + timedelta(days=req.total_days - 1)
    
    trip_id = str(uuid.uuid4())
    days_list: List[DayModel] = []
    
    templates = DESTINATION_TEMPLATES.get(dest_data["name"])

    for day_num in range(1, req.total_days + 1):
        if templates and day_num <= len(templates):
            tmpl = templates[day_num - 1]
            current_date = (start_dt + timedelta(days=day_num - 1)).strftime("%Y-%m-%d")
            acts: List[ActivityModel] = []
            for idx, a_data in enumerate(tmpl["activities"]):
                acts.append(
                    ActivityModel(
                        id=str(uuid.uuid4()),
                        time_slot=a_data["time_slot"],
                        start_time=a_data.get("start_time"),
                        end_time=a_data.get("end_time"),
                        title=a_data["title"],
                        description=a_data["description"],
                        location_name=a_data["location_name"],
                        latitude=a_data["latitude"],
                        longitude=a_data["longitude"],
                        estimated_cost=a_data["estimated_cost"],
                        duration_minutes=a_data["duration_minutes"],
                        order_index=idx + 1,
                        activity_type=a_data["activity_type"],
                        vibe_match=a_data.get("vibe_match", req.vibe),
                        insider_tip=a_data.get("insider_tip")
                    )
                )
            
            # Run initial route optimization on day activities to ensure minimum transit
            opt_res = optimize_activity_sequence(acts)

            days_list.append(
                DayModel(
                    id=str(uuid.uuid4()),
                    day_number=day_num,
                    date=current_date,
                    theme_title=f"Day {day_num}: {tmpl['theme']}",
                    daily_notes=f"Tailored to {req.vibe} with {req.pace} pacing.",
                    estimated_daily_cost=sum(a.estimated_cost for a in opt_res.optimized_activities),
                    activities=opt_res.optimized_activities
                )
            )
        else:
            default_day = generate_default_day(day_num, start_dt, dest_data, req.vibe)
            days_list.append(default_day)

    total_cost = sum(d.estimated_daily_cost for d in days_list)

    trip = TripModel(
        id=trip_id,
        title=f"{req.total_days}-Day {req.vibe} Experience in {dest_data['name']}",
        destination_name=dest_data["name"],
        country=dest_data["country"],
        start_date=start_dt.strftime("%Y-%m-%d"),
        end_date=end_dt.strftime("%Y-%m-%d"),
        total_days=req.total_days,
        total_budget=round(total_cost, 2),
        vibe_style=req.vibe,
        status="planned",
        summary=f"A meticulously crafted {req.total_days}-day itinerary celebrating {req.vibe} across {dest_data['name']}, {dest_data['country']}.",
        cover_image_url=dest_data.get("image_url"),
        days=days_list,
        created_at=datetime.utcnow().isoformat()
    )

    return trip

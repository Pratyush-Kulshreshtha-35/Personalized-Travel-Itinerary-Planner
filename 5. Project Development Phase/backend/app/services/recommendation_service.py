import uuid
from typing import List, Dict, Any
from app.models import DestinationModel, RecommendationRequest, RecommendationResponseItem

# Curated catalog of world-class travel destinations across diverse vibes
DESTINATIONS_DATA: List[Dict[str, Any]] = [
    {
        "id": "dest-tokyo-kyoto",
        "name": "Kyoto & Tokyo",
        "country": "Japan",
        "region": "East Asia",
        "description": "A harmonious blend of neon-lit futuristic cyberpunk streets, serene thousand-year-old Zen temples, and peerless culinary mastery.",
        "vibes": ["Cultural", "Foodie", "Scenic Nature", "Futuristic"],
        "climate": "Temperate",
        "best_season": "March - May / Oct - Nov",
        "avg_daily_cost": 140.0,
        "latitude": 35.0116,
        "longitude": 135.7681,
        "rating": 4.95,
        "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        "highlights": ["Fushimi Inari Torii Gates", "Akihabara Electric Town", "Tsukiji Outer Market", "Arashiyama Bamboo Grove"],
        "popular_attractions": [
            {"name": "Fushimi Inari-taisha", "lat": 34.9671, "lng": 135.7727},
            {"name": "Gion Historic Quarter", "lat": 35.0037, "lng": 135.7772},
            {"name": "Kinkaku-ji Golden Pavilion", "lat": 35.0394, "lng": 135.7292}
        ]
    },
    {
        "id": "dest-bali",
        "name": "Bali (Ubud & Canggu)",
        "country": "Indonesia",
        "region": "Southeast Asia",
        "description": "Lush emerald rice terraces, cliffside ocean sunsets, spiritual wellness sanctuaries, and bohemian beachfront beach clubs.",
        "vibes": ["Relaxation", "Wellness", "Adventure", "Nightlife"],
        "climate": "Tropical",
        "best_season": "April - October",
        "avg_daily_cost": 65.0,
        "latitude": -8.5069,
        "longitude": 115.2625,
        "rating": 4.88,
        "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "highlights": ["Tegallalang Rice Terraces", "Uluwatu Sunset Temple", "Mount Batur Sunrise Trek", "Canggu Beach Clubs"],
        "popular_attractions": [
            {"name": "Tegallalang Rice Terrace", "lat": -8.4312, "lng": 115.2809},
            {"name": "Sacred Monkey Forest", "lat": -8.5188, "lng": 115.2585},
            {"name": "Uluwatu Temple", "lat": -8.8291, "lng": 115.0849}
        ]
    },
    {
        "id": "dest-swiss-alps",
        "name": "Interlaken & Zermatt",
        "country": "Switzerland",
        "region": "Central Europe",
        "description": "Epic alpine majesty with towering jagged snow peaks, crystal glacial lakes, cogwheel mountain trains, and world-class fondue.",
        "vibes": ["Adventure", "Scenic Nature", "Luxury", "Romance"],
        "climate": "Alpine",
        "best_season": "June - September (Hiking) / Dec - March (Skiing)",
        "avg_daily_cost": 240.0,
        "latitude": 46.6863,
        "longitude": 7.8632,
        "rating": 4.92,
        "image_url": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
        "highlights": ["Matterhorn Glacier Viewpoint", "Jungfraujoch Top of Europe", "Lake Brienz Kayaking", "Grindelwald Cliff Walk"],
        "popular_attractions": [
            {"name": "Matterhorn Glacier Paradise", "lat": 45.9383, "lng": 7.7297},
            {"name": "Jungfraujoch", "lat": 46.5475, "lng": 7.9822},
            {"name": "Harder Kulm Panorama", "lat": 46.6975, "lng": 7.8525}
        ]
    },
    {
        "id": "dest-amalfi-rome",
        "name": "Amalfi Coast & Rome",
        "country": "Italy",
        "region": "Southern Europe",
        "description": "Ancient imperial colosseums, romantic pastel cliffside villas hanging over the cobalt Mediterranean sea, and divine pasta.",
        "vibes": ["Romance", "Cultural", "Foodie", "Scenic Nature"],
        "climate": "Mediterranean",
        "best_season": "May - October",
        "avg_daily_cost": 180.0,
        "latitude": 40.6340,
        "longitude": 14.6027,
        "rating": 4.91,
        "image_url": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "highlights": ["Positano Cliffside Walk", "Path of the Gods Hike", "Colosseum & Roman Forum", "Artisanal Limoncello Tastings"],
        "popular_attractions": [
            {"name": "Colosseum Rome", "lat": 41.8902, "lng": 12.4922},
            {"name": "Positano Marina Grande", "lat": 40.6281, "lng": 14.4850},
            {"name": "Ravello Villa Rufolo", "lat": 40.6503, "lng": 14.6124}
        ]
    },
    {
        "id": "dest-iceland",
        "name": "Reykjavik & Golden Circle",
        "country": "Iceland",
        "region": "Northern Europe",
        "description": "Surreal alien landscapes of erupting geysers, thundering glacial waterfalls, geothermal turquoise hot lagoons, and Northern Lights.",
        "vibes": ["Adventure", "Scenic Nature", "Wellness"],
        "climate": "Subpolar Oceanic",
        "best_season": "Sept - April (Auroras) / June - August (Midnight Sun)",
        "avg_daily_cost": 195.0,
        "latitude": 64.1466,
        "longitude": -21.9426,
        "rating": 4.89,
        "image_url": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
        "highlights": ["Blue Lagoon Geothermal Spa", "Gullfoss Waterfall", "Thingvellir Tectonic Rift", "Skogafoss Rainbow Falls"],
        "popular_attractions": [
            {"name": "Blue Lagoon", "lat": 63.8804, "lng": -22.4495},
            {"name": "Gullfoss Waterfall", "lat": 64.3271, "lng": -20.1199},
            {"name": "Strokkur Geysir", "lat": 64.3104, "lng": -20.3024}
        ]
    },
    {
        "id": "dest-queenstown",
        "name": "Queenstown & Milford Sound",
        "country": "New Zealand",
        "region": "Oceania",
        "description": "The adrenaline adventure capital of the world surrounded by sheer glacial fjords, mirror alpine lakes, and legendary hiking trails.",
        "vibes": ["Adventure", "Scenic Nature", "Thrill"],
        "climate": "Maritime Alpine",
        "best_season": "November - April",
        "avg_daily_cost": 160.0,
        "latitude": -45.0312,
        "longitude": 168.6626,
        "rating": 4.94,
        "image_url": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80",
        "highlights": ["Nevis Bungee Jump", "Milford Sound Scenic Cruise", "Skyline Gondola & Luge", "Routeburn Track Day Hike"],
        "popular_attractions": [
            {"name": "Skyline Gondola", "lat": -45.0287, "lng": 168.6558},
            {"name": "Milford Sound Pier", "lat": -44.6713, "lng": 167.9262},
            {"name": "Kawarau Gorge Bridge", "lat": -45.0076, "lng": 168.9004}
        ]
    },
    {
        "id": "dest-oaxaca",
        "name": "Oaxaca & Mexico City",
        "country": "Mexico",
        "region": "Latin America",
        "description": "Vibrant indigenous craft traditions, world-renowned street taco markets, ancient Aztec & Zapotec ruins, and smoky mezcal distilleries.",
        "vibes": ["Foodie", "Cultural", "Nightlife"],
        "climate": "Subtropical Highland",
        "best_season": "October - May",
        "avg_daily_cost": 75.0,
        "latitude": 17.0732,
        "longitude": -96.7266,
        "rating": 4.87,
        "image_url": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80",
        "highlights": ["Monte Alban Zapotec Pyramid", "Mercado 20 de Noviembre Food Market", "Hierve el Agua Petrified Waterfalls", "Artisanal Mezcal Tasting"],
        "popular_attractions": [
            {"name": "Santo Domingo Church", "lat": 17.0652, "lng": -96.7235},
            {"name": "Monte Alban Ruins", "lat": 17.0438, "lng": -96.7681},
            {"name": "Mercado 20 de Noviembre", "lat": 17.0592, "lng": -96.7259}
        ]
    },
    {
        "id": "dest-santorini",
        "name": "Santorini & Cyclades",
        "country": "Greece",
        "region": "Southern Europe",
        "description": "Whitewashed cubist villages draped over sheer volcanic cliffs, legendary Aegean sunsets, and secluded black sand beaches.",
        "vibes": ["Romance", "Relaxation", "Scenic Nature", "Luxury"],
        "climate": "Mediterranean",
        "best_season": "May - October",
        "avg_daily_cost": 210.0,
        "latitude": 36.3932,
        "longitude": 25.4615,
        "rating": 4.90,
        "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
        "highlights": ["Oia Blue Dome Sunset", "Akrotiri Minoan Ruins", "Red Beach Catamaran Cruise", "Volcanic Wine Tasting"],
        "popular_attractions": [
            {"name": "Oia Castle Viewpoint", "lat": 36.4618, "lng": 25.3753},
            {"name": "Fira Town", "lat": 36.4166, "lng": 25.4316},
            {"name": "Akrotiri Excavations", "lat": 36.3512, "lng": 25.4035}
        ]
    }
]

def calculate_destination_recommendations(req: RecommendationRequest) -> List[RecommendationResponseItem]:
    """
    Activity 3.3: Destination Recommendation Engine
    Computes multidimensional affinity scores matching user vibe, budget, and travel style.
    """
    results: List[RecommendationResponseItem] = []
    
    target_primary = req.primary_vibe.lower()
    target_secondaries = [v.lower() for v in req.secondary_vibes]
    target_daily_budget = req.daily_budget_usd or 150.0

    for d in DESTINATIONS_DATA:
        dest_vibes_lower = [v.lower() for v in d["vibes"]]
        match_reasons: List[str] = []
        score = 50.0 # baseline score

        # 1. Primary Vibe Affinity (+25 pts)
        if any(target_primary in v or v in target_primary for v in dest_vibes_lower):
            score += 25.0
            match_reasons.append(f"Premier destination for {req.primary_vibe} experiences")
        else:
            # Check partial synonym or related category
            score += 8.0

        # 2. Secondary Vibes (+15 pts total)
        secondary_matches = 0
        for sv in target_secondaries:
            if any(sv in v or v in sv for v in dest_vibes_lower):
                score += 8.0
                secondary_matches += 1
        if secondary_matches > 0:
            match_reasons.append(f"Matches {secondary_matches} of your secondary travel interests")

        # 3. Budget Compatibility (+15 pts)
        cost_diff = target_daily_budget - d["avg_daily_cost"]
        if cost_diff >= 0:
            # Under or equal to budget
            score += 15.0
            match_reasons.append(f"Daily cost (~${int(d['avg_daily_cost'])}) comfortably fits within your ${int(target_daily_budget)} budget")
        elif abs(cost_diff) <= 40:
            score += 8.0
            match_reasons.append(f"Daily cost (~${int(d['avg_daily_cost'])}) is close to your ${int(target_daily_budget)} target")
        else:
            score -= 10.0

        # 4. Rating bonus (+5 pts)
        if d.get("rating", 4.5) >= 4.9:
            score += 5.0
            match_reasons.append("Top-tier traveler rating (4.9+ out of 5)")

        # Cap score between 40 and 99
        final_score = int(min(99, max(42, score)))

        results.append(
            RecommendationResponseItem(
                id=d["id"],
                name=d["name"],
                country=d["country"],
                region=d.get("region"),
                match_score=final_score,
                match_reasons=match_reasons if match_reasons else [f"Exquisite match for {req.travel_style} travel"],
                avg_daily_cost=d["avg_daily_cost"],
                vibes=d["vibes"],
                best_season=d.get("best_season"),
                rating=d.get("rating", 4.8),
                image_url=d.get("image_url"),
                highlights=d.get("highlights", []),
                latitude=d["latitude"],
                longitude=d["longitude"]
            )
        )

    # Sort descending by match score
    results.sort(key=lambda x: x.match_score, reverse=True)
    return results

def get_destination_by_name_or_id(identifier: str) -> Dict[str, Any]:
    id_lower = identifier.lower().strip()
    for d in DESTINATIONS_DATA:
        if d["id"].lower() == id_lower or id_lower in d["name"].lower() or d["name"].lower() in id_lower:
            return d

    # Additional popular destinations dictionary
    city_presets = {
        "paris": {
            "name": "Paris",
            "country": "France",
            "latitude": 48.8566,
            "longitude": 2.3522,
            "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            "highlights": ["Eiffel Tower", "Louvre Museum", "Montmartre", "Seine Sunset"],
            "vibes": ["Romantic", "Cultural", "Foodie"]
        },
        "rome": {
            "name": "Rome",
            "country": "Italy",
            "latitude": 41.8902,
            "longitude": 12.4922,
            "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
            "highlights": ["Colosseum", "Pantheon", "Trevi Fountain", "Trastevere"],
            "vibes": ["Ancient History", "Romantic", "Foodie"]
        },
        "london": {
            "name": "London",
            "country": "United Kingdom",
            "latitude": 51.5074,
            "longitude": -0.1278,
            "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
            "highlights": ["Big Ben", "Tower Bridge", "British Museum", "Borough Market"],
            "vibes": ["Cultural", "Heritage", "Nightlife"]
        },
        "barcelona": {
            "name": "Barcelona",
            "country": "Spain",
            "latitude": 41.3851,
            "longitude": 2.1734,
            "image_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80",
            "highlights": ["Sagrada Familia", "Park Guell", "Gothic Quarter", "Barceloneta"],
            "vibes": ["Art & Architecture", "Foodie", "Nightlife"]
        },
        "new york": {
            "name": "New York",
            "country": "United States",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
            "highlights": ["Central Park", "Times Square", "Brooklyn Bridge", "The Met"],
            "vibes": ["Metropolitan", "Cultural", "Foodie"]
        }
    }

    for k, v in city_presets.items():
        if k in id_lower or id_lower in k:
            return {
                "id": f"dest-{k}",
                "name": v["name"],
                "country": v["country"],
                "region": "Global",
                "description": f"Curated voyage through the iconic streets, culture, and cuisine of {v['name']}.",
                "vibes": v["vibes"],
                "climate": "Temperate",
                "best_season": "All Year",
                "avg_daily_cost": 150.0,
                "latitude": v["latitude"],
                "longitude": v["longitude"],
                "rating": 4.9,
                "image_url": v["image_url"],
                "highlights": v["highlights"],
                "popular_attractions": []
            }

    # Dynamic fallback for any world destination
    clean_title = identifier.title()
    return {
        "id": f"dest-{clean_title.lower().replace(' ', '-')}",
        "name": clean_title,
        "country": "International",
        "region": "Global",
        "description": f"A breathtaking personalized discovery journey across {clean_title}.",
        "vibes": ["Cultural", "Scenic Nature", "Foodie"],
        "climate": "Temperate",
        "best_season": "Spring - Autumn",
        "avg_daily_cost": 135.0,
        "latitude": 48.8566,
        "longitude": 2.3522,
        "rating": 4.88,
        "image_url": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
        "highlights": [f"Historic {clean_title}", "Local Gastronomy", "Scenic Landmarks"],
        "popular_attractions": []
    }


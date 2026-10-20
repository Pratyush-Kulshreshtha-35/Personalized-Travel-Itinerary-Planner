# REST API Reference: Personalized Travel Itinerary Planner

The **Personalized Travel Itinerary Planner API** is built using **FastAPI (Python)**, providing automatic OpenAPI (Swagger) documentation, asynchronous request handling, and strict Pydantic model validation.

- **Base URL (Local)**: `http://localhost:8000`
- **Base URL (Production)**: `https://travel-planner-api.onrender.com`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 1. System Health

### `GET /api/health`
Checks server status and database connectivity.

**Response (200 OK):**
```json
{
  "status": "online",
  "version": "1.0.0",
  "environment": "development",
  "database": "supabase_connected"
}
```

---

## 2. Milestone 3: Preferences & Recommendation Engine

### `POST /api/preferences`
Captures and saves user travel preferences.

**Request Body:**
```json
{
  "user_id": "optional-uuid",
  "primary_vibe": "Adventure",
  "secondary_vibes": ["Scenic Nature", "Foodie"],
  "travel_style": "Boutique Explorer",
  "pace": "Moderate",
  "budget_level": "Moderate",
  "daily_budget_usd": 150.0,
  "dietary_preferences": ["Vegetarian"],
  "group_type": "Couple"
}
```

**Response (201 Created):**
```json
{
  "id": "7b8849b2-97b7-4a0b-9df2-50d4d6a45e77",
  "primary_vibe": "Adventure",
  "created_at": "2026-10-16T15:00:00Z"
}
```

---

### `POST /api/recommendations/destinations`
Activity 3.3: Computes AI vibe match scores (0–100%) against all destinations based on vibe affinity, budget compatibility, preferred pace, and group style.

**Request Body:**
```json
{
  "primary_vibe": "Cultural",
  "secondary_vibes": ["Foodie", "Scenic Nature"],
  "budget_level": "Moderate",
  "daily_budget_usd": 150.0,
  "travel_style": "Balanced",
  "pace": "Moderate"
}
```

**Response (200 OK):**
```json
[
  {
    "id": "e8381283-4a87-4357-9d7a-112345678901",
    "name": "Kyoto & Tokyo",
    "country": "Japan",
    "match_score": 96,
    "match_reasons": [
      "Flawless alignment with Cultural and Foodie vibes",
      "Daily budget ($140) fits right within your $150 limit",
      "Unmatched culinary and spiritual heritage exploration"
    ],
    "avg_daily_cost": 140.0,
    "vibes": ["Cultural", "Foodie", "Scenic Nature", "Futuristic"],
    "best_season": "March - May / Oct - Nov",
    "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    "highlights": ["Fushimi Inari Shrine", "Akihabara Tech District", "Michelin Ramen Alleys"]
  }
]
```

---

## 3. Milestone 4: Itinerary Generation & Personalization

### `POST /api/itinerary/generate`
Activity 4.1: Generates a complete day-by-day itinerary with Morning, Afternoon, Evening, and Night time slots, insider tips, and estimated costs.

**Request Body:**
```json
{
  "destination_name": "Kyoto & Tokyo",
  "country": "Japan",
  "total_days": 5,
  "start_date": "2026-11-01",
  "vibe": "Cultural & Foodie",
  "pace": "Moderate",
  "daily_budget": 150.0
}
```

**Response (200 OK):**
```json
{
  "trip_id": "uuid-or-generated",
  "title": "5-Day Cultural & Foodie Immersion in Kyoto & Tokyo",
  "destination": "Kyoto & Tokyo",
  "total_days": 5,
  "estimated_total_cost": 710.0,
  "days": [
    {
      "day_number": 1,
      "date": "2026-11-01",
      "theme": "Sacred Torii Gates & Historic Gion",
      "activities": [
        {
          "time_slot": "Morning",
          "start_time": "08:00",
          "title": "Fushimi Inari Sunrise Hike",
          "location_name": "Fushimi Inari-taisha",
          "latitude": 34.9671,
          "longitude": 135.7727,
          "duration_minutes": 150,
          "estimated_cost": 0.0,
          "vibe_match": "Cultural",
          "insider_tip": "Start before 8 AM to experience the gates in meditative silence."
        }
      ]
    }
  ]
}
```

---

### `POST /api/itinerary/optimize-route`
Activity 4.2: Employs geographic clustering and 2-opt Traveling Salesperson optimization using the Haversine formula to minimize transit travel time and reorder activities sequentially.

**Request Body:**
```json
{
  "activities": [
    { "id": "act-1", "title": "Golden Pavilion", "lat": 35.0394, "lng": 135.7292 },
    { "id": "act-2", "title": "Fushimi Inari", "lat": 34.9671, "lng": 135.7727 },
    { "id": "act-3", "title": "Nishiki Market", "lat": 35.0050, "lng": 135.7649 }
  ]
}
```

**Response (200 OK):**
```json
{
  "optimized_activities": [ ... ],
  "original_distance_km": 18.4,
  "optimized_distance_km": 11.2,
  "time_saved_minutes": 32,
  "route_efficiency_gain": "39.1%"
}
```

---

### `POST /api/itinerary/personalize`
Activity 4.3: Dynamically adapts an existing itinerary to custom vibe intensifiers (e.g. increase "Culinary & Street Food" by +50%, or switch to "Sunset & Chill Mode").

**Request Body:**
```json
{
  "trip_id": "trip-uuid",
  "current_days": [ ... ],
  "target_vibe": "Foodie & Culinary",
  "intensity": "High"
}
```

---

## 4. Milestone 5: Trip Save & Management

### `GET /api/trips`
Retrieves all saved trips for the user.

### `POST /api/trips`
Persists a new or generated itinerary into Supabase / local storage.

### `GET /api/trips/{id}`
Retrieves complete day and activity details for a specific trip.

### `PUT /api/trips/{id}`
Updates itinerary notes, activity order, or trip dates.

### `DELETE /api/trips/{id}`
Deletes a trip and cascades removal of days and activities.

---

## 5. Export Module

### `GET /api/trips/{id}/export/json`
Exports trip payload as standard JSON for backup or external API consumption.

### `GET /api/trips/{id}/export/ical`
Exports schedule as an iCalendar (`.ics`) file importable directly into Google Calendar, Apple Calendar, or Outlook.

### `GET /api/trips/{id}/export/html`
Generates a printable, luxury travel itinerary dossier formatted for PDF printing.

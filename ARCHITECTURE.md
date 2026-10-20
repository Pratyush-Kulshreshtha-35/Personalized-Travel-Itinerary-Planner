# System Architecture: Personalized Travel Itinerary Planner

This document provides a comprehensive architectural breakdown of the **Personalized Travel Itinerary Planner**, detailing the client-server interaction, database schema, data flow pipelines, and AI recommendation logic.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Client["Client Browser<br/>(React 18 + Vite SPA)"]
    Vercel["Frontend Host<br/>(Vercel / Render Static)"]
    API["FastAPI Backend Server<br/>(Python 3.11 on Render)"]
    Supabase["Supabase Cloud Platform<br/>(PostgreSQL + RLS + Auth)"]
    Optimizer["Route & Time Optimizer<br/>(Haversine + 2-Opt TSP Engine)"]
    VibeEngine["AI Vibe & Recommendation Engine<br/>(Multi-Factor Vector Scoring)"]
    ExportEngine["Export Subsystem<br/>(iCalendar .ics / JSON / Print PDF)"]

    Client -->|HTTPS / REST API| API
    Client -->|Direct Read/Cache| Supabase
    API -->|Async SQLAlchemy / REST| Supabase
    API --> VibeEngine
    API --> Optimizer
    API --> ExportEngine
    Vercel -.-> Client
```

---

## 2. Component Hierarchy & Layering

```mermaid
classDiagram
    class FrontendApp {
        +Navbar
        +PreferenceCapture
        +RecommendationGrid
        +ItineraryBuilder
        +RouteOptimizer
        +VibeCustomizer
        +SavedTripsDashboard
        +ExportModal
    }

    class FastAPIServices {
        +RecommendationService
        +ItineraryGeneratorService
        +RouteOptimizationEngine
        +VibePersonalizationEngine
        +ExportService
    }

    class SupabaseDatabase {
        +user_profiles
        +user_preferences
        +destinations
        +trips
        +itinerary_days
        +itinerary_activities
        +saved_recommendations
    }

    FrontendApp --> FastAPIServices : REST Endpoints
    FastAPIServices --> SupabaseDatabase : SQL Operations
```

---

## 3. Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER_PROFILES ||--o{ USER_PREFERENCES : has
    USER_PROFILES ||--o{ TRIPS : creates
    USER_PROFILES ||--o{ SAVED_RECOMMENDATIONS : saves
    DESTINATIONS ||--o{ SAVED_RECOMMENDATIONS : matched_in

    TRIPS ||--|{ ITINERARY_DAYS : contains
    ITINERARY_DAYS ||--|{ ITINERARY_ACTIVITIES : schedules

    USER_PROFILES {
        uuid id PK
        string email
        string full_name
        timestamp created_at
    }

    USER_PREFERENCES {
        uuid id PK
        uuid user_id FK
        string primary_vibe
        string[] secondary_vibes
        string travel_style
        string pace
        decimal daily_budget_usd
        string group_type
    }

    DESTINATIONS {
        uuid id PK
        string name
        string country
        string[] vibes
        decimal avg_daily_cost
        float latitude
        float longitude
        float rating
        string[] highlights
    }

    TRIPS {
        uuid id PK
        uuid user_id FK
        string title
        string destination_name
        date start_date
        date end_date
        int total_days
        decimal total_budget
        string vibe_style
        string status
    }

    ITINERARY_DAYS {
        uuid id PK
        uuid trip_id FK
        int day_number
        date date
        string theme_title
        decimal estimated_daily_cost
    }

    ITINERARY_ACTIVITIES {
        uuid id PK
        uuid day_id FK
        uuid trip_id FK
        string time_slot
        time start_time
        string title
        string location_name
        float latitude
        float longitude
        decimal estimated_cost
        int duration_minutes
        int order_index
        string vibe_match
    }
```

---

## 4. Algorithmic Engines

### 4.1 Destination Recommendation Engine (Activity 3.3)
The engine calculates a match coefficient $M \in [0, 100]$ using multi-criteria weighted scoring:

$$M = w_v \cdot S_{\text{vibe}} + w_b \cdot S_{\text{budget}} + w_p \cdot S_{\text{pace}} + w_r \cdot S_{\text{rating}}$$

Where:
- $S_{\text{vibe}}$: Jaccard similarity between user vibe tags and destination vibe tags plus primary vibe weighting.
- $S_{\text{budget}}$: Cost-efficiency curve matching user daily budget with destination average daily expenditure.
- $S_{\text{pace}}$: Density of scheduled attractions corresponding to user's desired pace (`Relaxed` = 2 activities/day, `Moderate` = 3-4 activities/day, `Fast-Paced` = 5+ activities/day).
- $S_{\text{rating}}$: Normalized destination review score.

### 4.2 Route & Time Optimization Engine (Activity 4.2)
To minimize transit fatigue and carbon footprint, the optimizer computes the distance between geographic coordinates using the **Haversine Formula**:

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

An approximation of the 2-opt heuristic reorders day activities into an optimal geographic sequence, calculating walking or transit time between sequential pins to eliminate zigzag backtracking.

---

## 5. Security & Isolation
- **Row Level Security (RLS)**: Enforced directly at the PostgreSQL layer in Supabase. Users can only query and mutate their own trips and preferences.
- **CORS Protection**: FastAPI dynamically restricts incoming cross-origin headers to authorized frontend deployment domains.
- **Fail-Safe Offline Mode**: Built-in state fallback ensures zero UI crashes even in disconnected or sandboxed environments.

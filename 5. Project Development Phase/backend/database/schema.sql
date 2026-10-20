-- ============================================================================
-- Personalized Travel Itinerary Planner
-- Supabase PostgreSQL Database Schema
-- Milestone 2: Supabase Database Setup (Activity 2.1 & 2.2)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if needed (clean migration support)
DROP TABLE IF EXISTS itinerary_activities CASCADE;
DROP TABLE IF EXISTS itinerary_days CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USER PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    home_currency TEXT DEFAULT 'USD',
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. USER PREFERENCES (Activity 3.1)
-- ----------------------------------------------------------------------------
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    primary_vibe TEXT NOT NULL, -- e.g. 'Adventure', 'Relaxation', 'Cultural', 'Foodie', 'Nightlife', 'Scenic Nature'
    secondary_vibes TEXT[] DEFAULT '{}',
    travel_style TEXT DEFAULT 'Balanced', -- 'Luxury', 'Budget Backpacker', 'Balanced', 'Boutique Explorer'
    pace TEXT DEFAULT 'Moderate', -- 'Relaxed', 'Moderate', 'Fast-Paced / Packed'
    budget_level TEXT DEFAULT 'Moderate', -- 'Budget', 'Moderate', 'Luxury', 'Ultra-Luxury'
    daily_budget_usd NUMERIC(10, 2) DEFAULT 150.00,
    dietary_preferences TEXT[] DEFAULT '{}', -- 'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'No Restrictions'
    group_type TEXT DEFAULT 'Solo', -- 'Solo', 'Couple', 'Family', 'Friends Group'
    must_have_amenities TEXT[] DEFAULT '{}', -- 'Fast WiFi', 'Pool', 'Central Location'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. DESTINATIONS (Activity 3.3)
-- ----------------------------------------------------------------------------
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT,
    description TEXT NOT NULL,
    vibes TEXT[] NOT NULL,
    climate TEXT,
    best_season TEXT,
    avg_daily_cost NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.8,
    image_url TEXT,
    highlights TEXT[] DEFAULT '{}',
    popular_attractions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. TRIPS (Milestone 5: Activity 5.1)
-- ----------------------------------------------------------------------------
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    country TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    total_budget NUMERIC(10, 2) DEFAULT 0.00,
    vibe_style TEXT NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'planned', 'active', 'completed', 'archived'
    summary TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ITINERARY DAYS (Activity 4.1)
-- ----------------------------------------------------------------------------
CREATE TABLE itinerary_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE,
    theme_title TEXT NOT NULL,
    daily_notes TEXT,
    estimated_daily_cost NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (trip_id, day_number)
);

-- ----------------------------------------------------------------------------
-- 6. ITINERARY ACTIVITIES (Activity 4.1, 4.2 Route & Time Optimization)
-- ----------------------------------------------------------------------------
CREATE TABLE itinerary_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    time_slot TEXT NOT NULL, -- 'Morning', 'Afternoon', 'Evening', 'Night'
    start_time TIME WITHOUT TIME ZONE,
    end_time TIME WITHOUT TIME ZONE,
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
    duration_minutes INTEGER DEFAULT 90,
    order_index INTEGER DEFAULT 0,
    activity_type TEXT DEFAULT 'Sightseeing', -- 'Sightseeing', 'Dining', 'Adventure', 'Culture', 'Relaxation', 'Transit'
    vibe_match TEXT,
    transit_info_to_next JSONB DEFAULT '{}'::jsonb, -- {"transit_mode": "walk", "duration_mins": 15, "distance_km": 1.2}
    booking_url TEXT,
    insider_tip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. SAVED RECOMMENDATIONS & MATCH SCORES
-- ----------------------------------------------------------------------------
CREATE TABLE saved_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL,
    match_reasons TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ----------------------------------------------------------------------------
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_destinations_vibes ON destinations USING GIN(vibes);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX idx_itinerary_activities_day_id ON itinerary_activities(day_id);
CREATE INDEX idx_itinerary_activities_trip_id ON itinerary_activities(trip_id);

-- ----------------------------------------------------------------------------
-- AUTOMATIC UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER trg_user_preferences_updated
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER trg_trips_updated
BEFORE UPDATE ON trips
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to curated destinations
CREATE POLICY "Public destinations are viewable by everyone" 
ON destinations FOR SELECT USING (true);

-- Allow authenticated users to manage their own profiles and trips
CREATE POLICY "Users can view and edit their own profiles" 
ON user_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own preferences" 
ON user_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own trips" 
ON trips FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage itinerary days" 
ON itinerary_days FOR ALL USING (true);

CREATE POLICY "Users can manage itinerary activities" 
ON itinerary_activities FOR ALL USING (true);

CREATE POLICY "Users can manage saved recommendations" 
ON saved_recommendations FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- ----------------------------------------------------------------------------
-- SEED DATA: Curated Destinations Across All Travel Vibes
-- ----------------------------------------------------------------------------
INSERT INTO destinations (name, country, region, description, vibes, climate, best_season, avg_daily_cost, latitude, longitude, rating, image_url, highlights, popular_attractions)
VALUES 
(
    'Kyoto & Tokyo',
    'Japan',
    'East Asia',
    'A harmonious blend of neon-lit futuristic cyberpunk streets, serene thousand-year-old Zen temples, and peerless culinary mastery.',
    ARRAY['Cultural', 'Foodie', 'Scenic Nature', 'Futuristic'],
    'Temperate',
    'March - May / Oct - Nov',
    140.00,
    35.0116,
    135.7681,
    4.95,
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Fushimi Inari Shrine', 'Akihabara Tech District', 'Michelin Ramen Alleys', 'Arashiyama Bamboo Grove'],
    '[{"name": "Fushimi Inari-taisha", "lat": 34.9671, "lng": 135.7727}, {"name": "Gion Historic District", "lat": 35.0037, "lng": 135.7772}, {"name": "Kinkaku-ji Golden Pavilion", "lat": 35.0394, "lng": 135.7292}]'::jsonb
),
(
    'Bali (Ubud & Canggu)',
    'Indonesia',
    'Southeast Asia',
    'Lush emerald rice terraces, cliffside ocean sunsets, spiritual wellness sanctuaries, and bohemian beachfront beach clubs.',
    ARRAY['Relaxation', 'Wellness', 'Adventure', 'Nightlife'],
    'Tropical',
    'April - October',
    65.00,
    -8.5069,
    115.2625,
    4.88,
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Tegallalang Rice Terraces', 'Uluwatu Sunset Temple', 'Mount Batur Sunrise Trek', 'Canggu Beach Clubs'],
    '[{"name": "Tegallalang Rice Terrace", "lat": -8.4312, "lng": 115.2809}, {"name": "Sacred Monkey Forest", "lat": -8.5188, "lng": 115.2585}, {"name": "Uluwatu Temple", "lat": -8.8291, "lng": 115.0849}]'::jsonb
),
(
    'Interlaken & Zermatt',
    'Switzerland',
    'Central Europe',
    'Epic alpine majesty with towering jagged snow peaks, crystal glacial lakes, cogwheel mountain trains, and world-class fondue.',
    ARRAY['Adventure', 'Scenic Nature', 'Luxury', 'Romance'],
    'Alpine',
    'June - September (Hiking) / Dec - March (Skiing)',
    240.00,
    46.6863,
    7.8632,
    4.92,
    'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Matterhorn Viewpoint', 'Jungfraujoch Top of Europe', 'Lake Brienz Kayaking', 'Grindelwald Cliff Walk'],
    '[{"name": "Matterhorn Glacier Paradise", "lat": 45.9383, "lng": 7.7297}, {"name": "Jungfraujoch", "lat": 46.5475, "lng": 7.9822}, {"name": "Harder Kulm Panorama", "lat": 46.6975, "lng": 7.8525}]'::jsonb
),
(
    'Amalfi Coast & Rome',
    'Italy',
    'Southern Europe',
    'Ancient imperial colosseums, romantic pastel cliffside villas hanging over the cobalt Mediterranean sea, and divine pasta.',
    ARRAY['Romance', 'Cultural', 'Foodie', 'Scenic Nature'],
    'Mediterranean',
    'May - October',
    180.00,
    40.6340,
    14.6027,
    4.91,
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Positano Cliffside Walk', 'Path of the Gods Hike', 'Colosseum & Roman Forum', 'Limoncello Tastings'],
    '[{"name": "Colosseum Rome", "lat": 41.8902, "lng": 12.4922}, {"name": "Positano Marina Grande", "lat": 40.6281, "lng": 14.4850}, {"name": "Ravello Villa Rufolo", "lat": 40.6503, "lng": 14.6124}]'::jsonb
),
(
    'Reykjavik & The Golden Circle',
    'Iceland',
    'Northern Europe',
    'Surreal alien landscapes of erupting geysers, thundering glacial waterfalls, geothermal turquoise hot lagoons, and Northern Lights.',
    ARRAY['Adventure', 'Scenic Nature', 'Solo Explorer'],
    'Subpolar Oceanic',
    'Sept - April (Auroras) / June - August (Midnight Sun)',
    195.00,
    64.1466,
    -21.9426,
    4.89,
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Blue Lagoon Geothermal Spa', 'Gullfoss Waterfall', 'Thingvellir Tectonic Rift', 'Skogafoss Rainbow Falls'],
    '[{"name": "Blue Lagoon", "lat": 63.8804, "lng": -22.4495}, {"name": "Gullfoss Waterfall", "lat": 64.3271, "lng": -20.1199}, {"name": "Strokkur Geysir", "lat": 64.3104, "lng": -20.3024}]'::jsonb
),
(
    'Queenstown & Milford Sound',
    'New Zealand',
    'Oceania',
    'The adrenaline adventure capital of the world surrounded by sheer glacial fjords, mirror alpine lakes, and legendary hiking trails.',
    ARRAY['Adventure', 'Scenic Nature', 'Thrill'],
    'Maritime Alpine',
    'November - April (Summer) / June - August (Snowsports)',
    160.00,
    -45.0312,
    168.6626,
    4.94,
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Nevis Bungee Jump', 'Milford Sound Cruise', 'Skyline Gondola & Luge', 'Routeburn Track Day Hike'],
    '[{"name": "Skyline Gondola", "lat": -45.0287, "lng": 168.6558}, {"name": "Milford Sound Pier", "lat": -44.6713, "lng": 167.9262}, {"name": "Kawarau Gorge Bridge", "lat": -45.0076, "lng": 168.9004}]'::jsonb
),
(
    'Oaxaca & Mexico City',
    'Mexico',
    'Latin America',
    'Vibrant indigenous craft traditions, world-renowned street taco markets, ancient Aztec & Zapotec ruins, and smoky mezcal distilleries.',
    ARRAY['Foodie', 'Cultural', 'Budget Backpacker', 'Nightlife'],
    'Subtropical Highland',
    'October - May',
    75.00,
    17.0732,
    -96.7266,
    4.87,
    'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Monte Alban Zapotec Pyramid', 'Mercado 20 de Noviembre Food Market', 'Hierve el Agua Petrified Waterfalls', 'Artisanal Mezcal Tasting Tour'],
    '[{"name": "Santo Domingo Church", "lat": 17.0652, "lng": -96.7235}, {"name": "Monte Alban Ruins", "lat": 17.0438, "lng": -96.7681}, {"name": "Mercado 20 de Noviembre", "lat": 17.0592, "lng": -96.7259}]'::jsonb
);

-- ----------------------------------------------------------------------------
-- SAMPLE INITIAL TRIP FOR INSTANT DEMO
-- ----------------------------------------------------------------------------
INSERT INTO trips (id, title, destination_name, country, start_date, end_date, total_days, total_budget, vibe_style, summary, cover_image_url)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    '7-Day Ultimate Zen & Cyberpunk Explorer',
    'Kyoto & Tokyo',
    'Japan',
    '2026-11-10',
    '2026-11-16',
    7,
    1800.00,
    'Cultural & Foodie',
    'A meticulously balanced voyage combining the ancient spiritual tranquility of Kyoto bamboo forests with high-energy Tokyo gastronomy and neon nights.',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO itinerary_days (id, trip_id, day_number, date, theme_title, daily_notes, estimated_daily_cost)
VALUES 
('d1a1b2c3-0001-4a5b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 1, '2026-11-10', 'Sacred Arches & Ancient Geisha Alleys', 'Early morning start to avoid crowds at the torii gates.', 120.00),
('d2a1b2c3-0002-4a5b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 2, '2026-11-11', 'Bamboo Whispers & Golden Zen Reflections', 'Scenic tram ride to Arashiyama and tea ceremony.', 150.00),
('d3a1b2c3-0003-4a5b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 3, '2026-11-12', 'Bullet Train Transit & Shibuya Crossing Neon', 'Shinkansen ride through Mount Fuji vista to Tokyo.', 180.00);

INSERT INTO itinerary_activities (day_id, trip_id, time_slot, start_time, end_time, title, description, location_name, latitude, longitude, estimated_cost, duration_minutes, order_index, activity_type, vibe_match, insider_tip)
VALUES 
('d1a1b2c3-0001-4a5b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Morning', '07:30', '10:30', 'Hike the 10,000 Vermilion Torii Gates', 'Ascend Mount Inari along tunnels of scarlet torii shrines surrounded by cedar forest.', 'Fushimi Inari-taisha', 34.9671, 135.7727, 0.00, 180, 1, 'Culture', 'Spiritual Zen', 'Reach the Yotsutsuji intersection for panoramic views of Kyoto without the crowds.'),
('d1a1b2c3-0001-4a5b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Afternoon', '12:00', '14:30', 'Nishiki Market Street Food Odyssey', 'Sample grilled wagyu skewers, matcha dango, crispy takoyaki, and pickled delicacies.', 'Nishiki Market', 35.0050, 135.7649, 35.00, 150, 2, 'Dining', 'Foodie Master', 'Look for the artisanal soy sauce ice cream stall near the temple entrance.'),
('d1a1b2c3-0001-4a5b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Evening', '18:00', '21:00', 'Lantern-lit Stroll in Gion & Kaiseki Dinner', 'Wander wooden machiya merchant houses along Shirakawa Canal and savor a multi-course dinner.', 'Gion Shirakawa', 35.0037, 135.7772, 85.00, 180, 3, 'Dining', 'Romance & Culture', 'Book seats counter-side at an authentic izakaya for the chef tasting menu.');

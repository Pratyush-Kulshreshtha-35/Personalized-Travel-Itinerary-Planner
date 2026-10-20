import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import PreferenceForm from './components/PreferenceForm';
import RecommendationGrid from './components/RecommendationGrid';
import ItineraryBuilder from './components/ItineraryBuilder';
import RouteOptimizerView from './components/RouteOptimizerView';
import VibeCustomizer from './components/VibeCustomizer';
import SavedTrips from './components/SavedTrips';
import ExportModal from './components/ExportModal';
import SupabaseStatusModal from './components/SupabaseStatusModal';
import CityExplorer from './components/CityExplorer';
import TravelChatbot from './components/TravelChatbot';
import { api } from './services/api';
import { Sparkles, Compass, MapPin, Zap, ArrowRight, Home, Globe } from 'lucide-react';

export default function App() {
  // Navigation & View State: 'landing' (default) or 'dashboard'
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('preferences');
  
  // User Authentication State
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'

  // Application Data States
  const [preferences, setPreferences] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [activeOptimizerDay, setActiveOptimizerDay] = useState(null);
  const [exportModalTrip, setExportModalTrip] = useState(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);


  // Initial load: check saved user & fetch trips
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('travel_planner_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Could not parse stored user profile:', e);
    }

    api.getTrips().then((trips) => {
      setSavedTrips(trips);
      if (trips && trips.length > 0) {
        setActiveTrip(trips[0]);
      }
    });
  }, []);

  // Auth Handlers
  const handleOpenAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    setCurrentView('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('travel_planner_user');
    setCurrentView('landing');
  };

  const handleStartPlanning = () => {
    // If user is already logged in, jump straight to dashboard
    if (user) {
      setCurrentView('dashboard');
    } else {
      // Open Sign Up / Login modal
      setAuthMode('signup');
      setIsAuthModalOpen(true);
    }
  };

  // Milestone 3: Handle Preference submission & Recommendation search
  const handleSearchRecommendations = async (userPrefs) => {
    setIsLoading(true);
    setPreferences(userPrefs);
    try {
      await api.savePreferences(userPrefs);
      const recs = await api.getRecommendations(userPrefs);
      setRecommendations(recs);
      setActiveTab('recommendations');
    } catch (e) {
      console.error('Error fetching recommendations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Milestone 4: Handle destination selection to generate itinerary
  const handleSelectDestination = async (destination) => {
    setIsLoading(true);
    try {
      const trip = await api.generateItinerary({
        destination_name: destination.name,
        country: destination.country,
        total_days: preferences?.total_days || 5,
        vibe: preferences?.primary_vibe || destination.vibes[0] || 'Cultural',
        pace: preferences?.pace || 'Moderate',
        daily_budget: preferences?.daily_budget_usd || destination.avg_daily_cost || 150.0,
        group_type: preferences?.group_type || 'Solo'
      });
      setActiveTrip(trip);
      setActiveTab('itinerary');
      // Refresh saved trips list
      const updatedTrips = await api.getTrips();
      setSavedTrips(updatedTrips);
    } catch (e) {
      console.error('Error generating itinerary:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Milestone 4: Route Optimizer transitions
  const handleGoToOptimizer = (day) => {
    setActiveOptimizerDay(day || (activeTrip?.days ? activeTrip.days[0] : null));
    setActiveTab('optimizer');
  };

  const handleApplyOptimizedRoute = (dayNumber, optimizedActivities) => {
    if (!activeTrip || !activeTrip.days) return;
    const updatedDays = activeTrip.days.map((d) => {
      if (d.day_number === dayNumber) {
        return {
          ...d,
          activities: optimizedActivities,
          estimated_daily_cost: optimizedActivities.reduce((acc, a) => acc + (a.estimated_cost || 0), 0)
        };
      }
      return d;
    });

    const updatedTrip = {
      ...activeTrip,
      days: updatedDays,
      total_budget: updatedDays.reduce((acc, d) => acc + (d.estimated_daily_cost || 0), 0)
    };

    setActiveTrip(updatedTrip);
    api.saveTrip(updatedTrip);
  };

  // Milestone 4: Vibe Tuner transitions
  const handleGoToVibeTuner = () => {
    setActiveTab('vibe');
  };

  const handleUpdateTripDays = (newDays, vibeLabel) => {
    if (!activeTrip) return;
    const updatedTrip = {
      ...activeTrip,
      days: newDays,
      vibe_style: `${activeTrip.vibe_style} (${vibeLabel})`,
      total_budget: newDays.reduce((acc, d) => acc + (d.estimated_daily_cost || 0), 0)
    };
    setActiveTrip(updatedTrip);
    api.saveTrip(updatedTrip);
  };

  // Milestone 5: Trip Save & Management
  const handleSaveTrip = async (tripToSave) => {
    await api.saveTrip(tripToSave);
    const updatedTrips = await api.getTrips();
    setSavedTrips(updatedTrips);
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip itinerary?')) {
      await api.deleteTrip(tripId);
      const updatedTrips = await api.getTrips();
      setSavedTrips(updatedTrips);
      if (activeTrip && activeTrip.id === tripId) {
        setActiveTrip(updatedTrips[0] || null);
      }
    }
  };

  // Feature 1: City Explorer place adding & planning
  const handleAddPlaceToTrip = async (place, cityName, countryName) => {
    const city = cityName || 'Paris';
    const country = countryName || 'France';

    const newActivity = {
      id: place.id || ('act-' + Date.now()),
      time_slot: place.best_time_to_visit || 'Afternoon',
      start_time: '14:00',
      end_time: '16:00',
      title: place.name,
      description: place.description,
      location_name: place.address_or_area || place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      estimated_cost: place.estimated_cost_usd || 0.0,
      duration_minutes: 120,
      activity_type: place.category || 'Sightseeing',
      vibe_match: place.vibe || 'Cultural',
      insider_tip: place.insider_tip,
      image_url: place.image_url
    };

    // Check if current activeTrip matches this destination
    const matchesActiveTrip = activeTrip && (
      activeTrip.destination_name?.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(activeTrip.destination_name?.toLowerCase())
    );

    if (matchesActiveTrip) {
      // Add activity directly to current active trip
      const updatedDays = [...activeTrip.days];
      const firstDay = updatedDays[0] || { day_number: 1, theme_title: `Day 1: ${city} Exploration`, activities: [] };
      const currentActs = firstDay.activities || [];
      const alreadyExists = currentActs.some(a => a.title?.toLowerCase() === place.name?.toLowerCase());

      if (!alreadyExists) {
        newActivity.order_index = currentActs.length + 1;
        updatedDays[0] = {
          ...firstDay,
          activities: [...currentActs, newActivity],
          estimated_daily_cost: (firstDay.estimated_daily_cost || 0) + (place.estimated_cost_usd || 0)
        };
      }

      const updatedTrip = {
        ...activeTrip,
        days: updatedDays,
        total_budget: updatedDays.reduce((acc, d) => acc + (d.estimated_daily_cost || 0), 0)
      };

      setActiveTrip(updatedTrip);
      await api.saveTrip(updatedTrip);
      const updatedTrips = await api.getTrips();
      setSavedTrips(updatedTrips);
      return updatedTrip;
    }

    // Otherwise, check if user already has an existing saved trip for this city
    const existingCityTrip = savedTrips.find(t =>
      t.destination_name?.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(t.destination_name?.toLowerCase())
    );

    if (existingCityTrip) {
      const updatedDays = [...(existingCityTrip.days || [])];
      const firstDay = updatedDays[0] || { day_number: 1, theme_title: `Day 1: ${city} Highlights`, activities: [] };
      const currentActs = firstDay.activities || [];
      const alreadyExists = currentActs.some(a => a.title?.toLowerCase() === place.name?.toLowerCase());

      if (!alreadyExists) {
        newActivity.order_index = currentActs.length + 1;
        updatedDays[0] = {
          ...firstDay,
          activities: [...currentActs, newActivity],
          estimated_daily_cost: (firstDay.estimated_daily_cost || 0) + (place.estimated_cost_usd || 0)
        };
      }

      const updatedTrip = {
        ...existingCityTrip,
        days: updatedDays,
        total_budget: updatedDays.reduce((acc, d) => acc + (d.estimated_daily_cost || 0), 0)
      };

      setActiveTrip(updatedTrip);
      await api.saveTrip(updatedTrip);
      const updatedTrips = await api.getTrips();
      setSavedTrips(updatedTrips);
      return updatedTrip;
    }

    // If no trip for this city exists, CREATE a new dedicated trip for this city!
    const newCityTrip = {
      id: `trip-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      title: `Curated Voyage in ${city}, ${country}`,
      destination_name: city,
      country: country,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      total_days: 3,
      total_budget: (place.estimated_cost_usd || 35.0) + 120.0,
      vibe_style: place.vibe || 'Cultural & Romantic',
      status: 'planned',
      summary: `A personalized discovery journey across ${city}, ${country} tailored around premier landmarks, hidden gems, and iconic sights.`,
      cover_image_url: place.image_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString(),
      days: [
        {
          id: `day-1-${Date.now()}`,
          day_number: 1,
          date: new Date().toISOString().split('T')[0],
          theme_title: `Day 1: Iconic Sights of ${city}`,
          daily_notes: `Signature attractions and cultural wonders in ${city}.`,
          estimated_daily_cost: place.estimated_cost_usd || 35.0,
          activities: [{ ...newActivity, order_index: 1 }]
        },
        {
          id: `day-2-${Date.now()}`,
          day_number: 2,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          theme_title: `Day 2: Historic Quarters & Gastronomy`,
          daily_notes: `Artisan boutiques, scenic walks, and local culinary discoveries.`,
          estimated_daily_cost: 65.0,
          activities: []
        },
        {
          id: `day-3-${Date.now()}`,
          day_number: 3,
          date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          theme_title: `Day 3: Panoramic Sunset & Evening Vibe`,
          daily_notes: `Sunset vistas and atmospheric twilight dining.`,
          estimated_daily_cost: 55.0,
          activities: []
        }
      ]
    };

    setActiveTrip(newCityTrip);
    await api.saveTrip(newCityTrip);
    const updatedTrips = await api.getTrips();
    setSavedTrips(updatedTrips);
    return newCityTrip;
  };

  const handlePlanTripForCity = async (cityName, countryName) => {
    setIsLoading(true);
    try {
      const trip = await api.generateItinerary({
        destination_name: cityName,
        country: countryName,
        total_days: 5,
        daily_budget: 120.0,
        vibe: 'Cultural & Foodie',
        pace: 'Moderate',
        group_type: 'Solo'
      });
      await api.saveTrip(trip);
      setActiveTrip(trip);
      const updatedTrips = await api.getTrips();
      setSavedTrips(updatedTrips);
      setActiveTab('itinerary');
    } catch (e) {
      console.error('Error generating trip for city:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Feature 2: Natural Language AI Trip Chatbot integration
  const handleLoadChatTrip = async (chatTrip) => {
    setActiveTrip(chatTrip);
    await api.saveTrip(chatTrip);
    const updatedTrips = await api.getTrips();
    setSavedTrips(updatedTrips);
    setCurrentView('dashboard');
    setActiveTab('itinerary');
  };

  // ==========================================================================
  // VIEW 1: LANDING MARKETING PAGE (Before opening the dashboard)
  // ==========================================================================
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onStartPlanning={handleStartPlanning}
          onOpenAuth={handleOpenAuth}
          user={user}
          onGoToDashboard={() => setCurrentView('dashboard')}
        />

        {/* Floating Natural Language AI Assistant Chatbot */}
        <TravelChatbot
          isOpen={isChatOpen}
          onToggleOpen={() => setIsChatOpen(!isChatOpen)}
          onLoadTripIntoPlanner={handleLoadChatTrip}
          activeTrip={activeTrip}
        />

        {/* Login / Sign Up Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // ==========================================================================
  // VIEW 2: PLANNER DASHBOARD
  // ==========================================================================
  return (
    <div className="app-layout">
      {/* Top Navbar with Home Return and User Profile */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        tripCount={savedTrips.length}
        onBackToLanding={() => setCurrentView('landing')}
        user={user}
        onSignOut={handleSignOut}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Main Workspace */}
      <main className="main-content">
        {/* Dynamic Hero Banner in Dashboard */}
        <div className="hero-banner">
          <div className="hero-text">
            <h2>
              Personalized <span>Travel Itinerary</span> Planner
            </h2>
            <p>
              Curate bespoke multi-day travel itineraries aligned with your unique vibe, explore top places across world cities with AI, and order complete journeys via natural language.
            </p>
          </div>

          <div className="hero-badges">
            <div className="stat-chip">
              <strong>12+</strong>
              <span>Curated Vibes</span>
            </div>
            <div className="stat-chip">
              <strong>City</strong>
              <span>Place Explorer</span>
            </div>
            <div className="stat-chip">
              <strong>Gemini AI</strong>
              <span>Trip Chatbot</span>
            </div>
          </div>
        </div>

        {/* View Switcher based on Active Tab */}
        {activeTab === 'city-explorer' && (
          <CityExplorer
            activeTrip={activeTrip}
            onAddPlaceToTrip={handleAddPlaceToTrip}
            onPlanTripForCity={handlePlanTripForCity}
            onSelectDestination={handleSelectDestination}
            onGoToItinerary={() => setActiveTab('itinerary')}
          />
        )}

        {activeTab === 'preferences' && (
          <PreferenceForm
            onSearchRecommendations={handleSearchRecommendations}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationGrid
            recommendations={recommendations.length > 0 ? recommendations : [
              {
                id: 'dest-tokyo-kyoto',
                name: 'Kyoto & Tokyo',
                country: 'Japan',
                match_score: 96,
                match_reasons: [
                  'Top rated match for Cultural and Foodie exploration',
                  'Balanced daily costs fit comfortably in your budget',
                  'Bamboo groves, historic shrines, and futuristic neon'
                ],
                avg_daily_cost: 140.0,
                vibes: ['Cultural', 'Foodie', 'Scenic Nature', 'Futuristic'],
                best_season: 'March - May / Oct - Nov',
                rating: 4.95,
                image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'
              },
              {
                id: 'dest-bali',
                name: 'Bali (Ubud & Canggu)',
                country: 'Indonesia',
                match_score: 93,
                match_reasons: [
                  'Emerald rice terraces and tropical cliffside sunsets',
                  'High luxury-per-dollar value under $70/day',
                  'Bohemian wellness, surf breaks, and coastal beach clubs'
                ],
                avg_daily_cost: 65.0,
                vibes: ['Relaxation', 'Wellness', 'Adventure', 'Nightlife'],
                best_season: 'April - October',
                rating: 4.88,
                image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
              },
              {
                id: 'dest-swiss-alps',
                name: 'Interlaken & Zermatt',
                country: 'Switzerland',
                match_score: 91,
                match_reasons: [
                  'Jagged alpine peaks and glacial turquoise lakes',
                  'Iconic Matterhorn viewpoints and cogwheel trains',
                  'Thrilling mountain cliff walks and pristine nature'
                ],
                avg_daily_cost: 240.0,
                vibes: ['Adventure', 'Scenic Nature', 'Luxury', 'Romance'],
                best_season: 'June - Sept / Dec - March',
                rating: 4.92,
                image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80'
              },
              {
                id: 'dest-amalfi-rome',
                name: 'Amalfi Coast & Rome',
                country: 'Italy',
                match_score: 89,
                match_reasons: [
                  'Pastel cliffside villages draped over the Mediterranean',
                  'Classical Colosseum antiquity meets Michelin pasta',
                  'Romantic coastal walks and artisanal limoncello'
                ],
                avg_daily_cost: 180.0,
                vibes: ['Romance', 'Cultural', 'Foodie', 'Scenic Nature'],
                best_season: 'May - October',
                rating: 4.91,
                image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'
              }
            ]}
            onSelectDestination={handleSelectDestination}
            onBackToPreferences={() => setActiveTab('preferences')}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryBuilder
            trip={activeTrip}
            savedTrips={savedTrips}
            onSelectTrip={(selectedTrip) => setActiveTrip(selectedTrip)}
            onSaveTrip={handleSaveTrip}
            onOpenExportModal={() => setExportModalTrip(activeTrip)}
            onGoToOptimizer={handleGoToOptimizer}
            onGoToVibeTuner={handleGoToVibeTuner}
          />
        )}

        {activeTab === 'optimizer' && (
          <RouteOptimizerView
            day={activeOptimizerDay || (activeTrip?.days ? activeTrip.days[0] : null)}
            onApplyOptimizedRoute={handleApplyOptimizedRoute}
            onBackToItinerary={() => setActiveTab('itinerary')}
          />
        )}

        {activeTab === 'vibe' && (
          <VibeCustomizer
            trip={activeTrip}
            onUpdateTripDays={handleUpdateTripDays}
            onBackToItinerary={() => setActiveTab('itinerary')}
          />
        )}

        {activeTab === 'saved-trips' && (
          <SavedTrips
            trips={savedTrips}
            onSelectTrip={(trip) => {
              setActiveTrip(trip);
              setActiveTab('itinerary');
            }}
            onDeleteTrip={handleDeleteTrip}
            onOpenExportModal={(trip) => setExportModalTrip(trip)}
            onNewTrip={() => setActiveTab('preferences')}
          />
        )}
      </main>

      {/* Dashboard Footer with 2026 Copyright */}
      <Footer
        onNavigateSection={() => setCurrentView('landing')}
        onOpenAuth={handleOpenAuth}
      />

      {/* Export Modal (Milestone 5 Activity 5.2) */}
      {exportModalTrip && (
        <ExportModal
          trip={exportModalTrip}
          onClose={() => setExportModalTrip(null)}
        />
      )}

      {/* Supabase Database Status Modal (Milestones 2 & 7) */}
      {isSupabaseModalOpen && (
        <SupabaseStatusModal
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      )}

      {/* Login / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Floating Natural Language AI Assistant Chatbot */}
      <TravelChatbot
        isOpen={isChatOpen}
        onToggleOpen={() => setIsChatOpen(!isChatOpen)}
        onLoadTripIntoPlanner={handleLoadChatTrip}
        activeTrip={activeTrip}
      />
    </div>
  );
}


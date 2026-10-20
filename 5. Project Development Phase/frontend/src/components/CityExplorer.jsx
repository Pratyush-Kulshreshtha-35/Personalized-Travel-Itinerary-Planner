import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  Search,
  DollarSign,
  Clock,
  Star,
  Plus,
  Check,
  ArrowRight,
  Globe,
  SlidersHorizontal,
  Loader2,
  BookmarkPlus,
  Map,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

const COUNTRY_CITY_PRESETS = [
  {
    country: 'France',
    flag: '🇫🇷',
    cities: ['Paris', 'Nice', 'Lyon', 'Marseille']
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    cities: ['Tokyo', 'Kyoto', 'Osaka', 'Sapporo']
  },
  {
    country: 'Italy',
    flag: '🇮🇹',
    cities: ['Rome', 'Florence', 'Venice', 'Milan']
  },
  {
    country: 'Spain',
    flag: '🇪🇸',
    cities: ['Barcelona', 'Madrid', 'Seville', 'Valencia']
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    cities: ['New York', 'San Francisco', 'Miami', 'Los Angeles']
  },
  {
    country: 'Indonesia',
    flag: '🇮🇩',
    cities: ['Bali (Ubud)', 'Canggu', 'Jakarta', 'Lombok']
  },
  {
    country: 'Switzerland',
    flag: '🇨🇭',
    cities: ['Interlaken', 'Zermatt', 'Zurich', 'Lucerne']
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    cities: ['London', 'Edinburgh', 'Manchester', 'Bath']
  },
  {
    country: 'Thailand',
    flag: '🇹🇭',
    cities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Krabi']
  },
  {
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    cities: ['Dubai', 'Abu Dhabi']
  },
  {
    country: 'India',
    flag: '🇮🇳',
    cities: ['Jaipur', 'Goa', 'Mumbai', 'Varanasi']
  },
  {
    country: 'Greece',
    flag: '🇬🇷',
    cities: ['Santorini', 'Athens', 'Mykonos', 'Crete']
  }
];

const VIBE_FILTERS = [
  { id: 'All-Round', label: 'All-Round Vibe', emoji: '✨' },
  { id: 'Cultural & Historic', label: 'Cultural & Historic', emoji: '🏛️' },
  { id: 'Foodie & Culinary', label: 'Foodie & Culinary', emoji: '🍜' },
  { id: 'Scenic Nature', label: 'Scenic Viewpoints', emoji: '🏔️' },
  { id: 'Romantic Escape', label: 'Romantic & Sunset', emoji: '🥂' },
  { id: 'Hidden Gems', label: 'Secret Hidden Gems', emoji: '💎' },
  { id: 'Nightlife & Social', label: 'Nightlife & Social', emoji: '🪩' }
];

const getFallbackPlaceImage = (place, city) => {
  const p = (place?.name || '').toLowerCase();
  const c = (city || '').toLowerCase();
  const cat = (place?.category || '').toLowerCase();

  // Specific landmarks
  if (p.includes('eiffel')) return 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80';
  if (p.includes('louvre')) return 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80';
  if (p.includes('montmartre') || p.includes('sacr') || p.includes('sacre')) return 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80';
  if (p.includes('sainte-chapelle') || p.includes('chapelle') || p.includes('notre dame') || p.includes('church') || p.includes('cathedral')) return 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80';
  if (p.includes('seine') || p.includes('cruise') || p.includes('bateau') || p.includes('boat')) return 'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=800&q=80';
  if (p.includes('arc de triomphe')) return 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?auto=format&fit=crop&w=800&q=80';
  if (p.includes('versailles')) return 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80';
  if (p.includes('shibuya')) return 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80';
  if (p.includes('senso') || p.includes('temple')) return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80';
  if (p.includes('colosseum')) return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80';
  if (p.includes('trevi')) return 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=800&q=80';
  if (p.includes('central park')) return 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80';
  if (p.includes('big ben')) return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80';

  // Categories & Vibes
  if (cat.includes('food') || cat.includes('dining') || cat.includes('market') || cat.includes('restaurant') || p.includes('marais') || p.includes('bistro') || p.includes('cafe')) {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('viewpoint') || cat.includes('scenic') || cat.includes('sunset') || p.includes('overlook') || p.includes('panoramic')) {
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('museum') || cat.includes('art') || cat.includes('culture') || cat.includes('gallery')) {
    return 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('nightlife') || cat.includes('social') || cat.includes('bar') || cat.includes('club')) {
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
  }

  // City defaults
  if (c.includes('paris')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80';
  if (c.includes('tokyo') || c.includes('kyoto')) return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80';
  if (c.includes('rome')) return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80';
  if (c.includes('london')) return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80';
  if (c.includes('new york')) return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80';
  if (c.includes('barcelona')) return 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80';
  if (c.includes('bali')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80';

  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
};

export default function CityExplorer({
  activeTrip,
  onAddPlaceToTrip,
  onPlanTripForCity,
  onSelectDestination,
  onGoToItinerary
}) {
  const [selectedCountry, setSelectedCountry] = useState('France');
  const [selectedCity, setSelectedCity] = useState('Paris');
  const [customCountry, setCustomCountry] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState('All-Round');
  const [budgetLevel, setBudgetLevel] = useState('Moderate');

  const [isLoading, setIsLoading] = useState(false);
  const [placesData, setPlacesData] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [addedPlaces, setAddedPlaces] = useState({});
  const [toastNotification, setToastNotification] = useState(null);

  // Fetch default city (Paris, France) on mount
  useEffect(() => {
    fetchPlaces('France', 'Paris', 'All-Round');
  }, []);

  const fetchPlaces = async (country, city, vibe) => {
    if (!city || !country) return;
    setIsLoading(true);
    try {
      const data = await api.getCityPlaces({
        country,
        city,
        vibe,
        budget_level: budgetLevel
      });
      setPlacesData(data);
    } catch (e) {
      console.error('Error fetching city places:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryPresetClick = (preset) => {
    setSelectedCountry(preset.country);
    setSelectedCity(preset.cities[0]);
    setIsCustomMode(false);
    fetchPlaces(preset.country, preset.cities[0], selectedVibe);
  };

  const handleCityPresetClick = (city) => {
    setSelectedCity(city);
    fetchPlaces(selectedCountry, city, selectedVibe);
  };

  const handleCustomSearchSubmit = (e) => {
    e.preventDefault();
    if (!customCity.trim() || !customCountry.trim()) return;
    setSelectedCountry(customCountry.trim());
    setSelectedCity(customCity.trim());
    fetchPlaces(customCountry.trim(), customCity.trim(), selectedVibe);
  };

  const handleVibeChange = (vibeId) => {
    setSelectedVibe(vibeId);
    fetchPlaces(selectedCountry, selectedCity, vibeId);
  };

  // Synchronized place checker (checks local added state + activeTrip activities)
  const isPlaceAdded = (place) => {
    if (!place) return false;
    if (addedPlaces[place.id] || addedPlaces[place.name]) return true;
    if (!activeTrip || !activeTrip.days) return false;
    return activeTrip.days.some((day) =>
      day.activities?.some(
        (act) =>
          act.id === place.id ||
          (act.title && place.name && act.title.toLowerCase() === place.name.toLowerCase()) ||
          (act.location_name && place.name && act.location_name.toLowerCase().includes(place.name.toLowerCase()))
      )
    );
  };

  const handleAddPlace = (place) => {
    if (isPlaceAdded(place)) {
      if (onGoToItinerary) onGoToItinerary();
      return;
    }
    if (onAddPlaceToTrip) {
      onAddPlaceToTrip(place, selectedCity, selectedCountry);
      setAddedPlaces((prev) => ({
        ...prev,
        [place.id]: true,
        [place.name]: true
      }));
      setToastNotification({
        placeName: place.name,
        city: selectedCity,
        country: selectedCountry
      });
    }
  };

  // Filter places by in-view category
  const displayedPlaces = placesData?.places?.filter((p) => {
    if (activeCategoryFilter === 'All') return true;
    return p.category?.toLowerCase() === activeCategoryFilter.toLowerCase();
  }) || [];

  // Extract unique categories for quick tabs
  const availableCategories = placesData?.places
    ? ['All', ...new Set(placesData.places.map((p) => p.category).filter(Boolean))]
    : ['All'];

  return (
    <div className="city-explorer-container">
      {/* 1. Header Banner */}
      <div className="glass-panel explorer-header-card">
        <div className="header-meta">
          <div className="header-pill">
            <Compass size={16} />
            <span>Destination Place Recommender</span>
          </div>
          <h2>
            Choose a <span>Country & City</span> &mdash; AI Suggests Where to Go
          </h2>
          <p>
            Select any destination across the globe. Our AI curates premier landmarks, secret hidden alleys, Michelin street treats, and panoramic sunset viewpoints tailored to your style.
          </p>
        </div>

        {/* Quick Toggle: Presets vs Custom Input */}
        <div className="explorer-mode-switch">
          <button
            type="button"
            className={`mode-btn ${!isCustomMode ? 'active' : ''}`}
            onClick={() => setIsCustomMode(false)}
          >
            <Globe size={15} />
            <span>Popular Destinations</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${isCustomMode ? 'active' : ''}`}
            onClick={() => setIsCustomMode(true)}
          >
            <Search size={15} />
            <span>Search Any World City</span>
          </button>
        </div>
      </div>

      {/* 2. Selection Bar */}
      {!isCustomMode ? (
        <div className="glass-panel explorer-selector-panel">
          <label className="section-small-title">1. Select Country:</label>
          <div className="country-preset-row">
            {COUNTRY_CITY_PRESETS.map((preset) => {
              const isSelected = selectedCountry === preset.country;
              return (
                <button
                  key={preset.country}
                  type="button"
                  className={`country-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCountryPresetClick(preset)}
                >
                  <span className="flag-icon">{preset.flag}</span>
                  <span>{preset.country}</span>
                </button>
              );
            })}
          </div>

          <label className="section-small-title" style={{ marginTop: '18px' }}>
            2. Choose City in {selectedCountry}:
          </label>
          <div className="city-preset-row">
            {COUNTRY_CITY_PRESETS.find((c) => c.country === selectedCountry)?.cities.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  className={`city-pill ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCityPresetClick(city)}
                >
                  <MapPin size={13} />
                  <span>{city}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCustomSearchSubmit} className="glass-panel explorer-custom-form">
          <div className="custom-form-grid">
            <div className="input-field-group">
              <label>Country:</label>
              <div className="input-with-icon">
                <Globe size={16} />
                <input
                  type="text"
                  placeholder="e.g. France, Japan, Italy, Spain, Brazil..."
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>City / Region:</label>
              <div className="input-with-icon">
                <MapPin size={16} />
                <input
                  type="text"
                  placeholder="e.g. Paris, Tokyo, Barcelona, Florence, Cairo..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary custom-search-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>Curate Places with AI</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Vibe Filter Bar */}
      <div className="glass-panel explorer-vibe-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <SlidersHorizontal size={14} />
          <span>Vibe Focus:</span>
        </div>
        <div className="vibe-filter-row">
          {VIBE_FILTERS.map((vf) => {
            const isSelected = selectedVibe === vf.id;
            return (
              <button
                key={vf.id}
                type="button"
                className={`vibe-filter-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleVibeChange(vf.id)}
              >
                <span>{vf.emoji}</span>
                <span>{vf.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Results Header & Places Grid */}
      {isLoading ? (
        <div className="glass-panel explorer-loading-state">
          <Loader2 size={36} className="animate-spin" color="var(--primary-color)" />
          <h3>Curating Bespoke Places for {selectedCity}...</h3>
          <p>
            Gemini AI is analyzing thousands of local attractions, foodie hidden alleys, and sunset spots in {selectedCity}, {selectedCountry}.
          </p>
        </div>
      ) : placesData ? (
        <div className="explorer-results-wrapper">
          {/* City Summary Card */}
          <div className="glass-panel city-summary-banner">
            <div className="city-summary-left">
              <div className="city-title-group">
                <MapPin size={22} color="var(--accent-cyan)" />
                <h2>
                  {placesData.city}, {placesData.country}
                </h2>
                <span className="places-count-tag">
                  {placesData.places?.length || 0} Recommended Places
                </span>
              </div>
              <p className="city-summary-text">{placesData.summary}</p>
            </div>

            {/* Quick Action: Plan Full Itinerary */}
            <div className="city-summary-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (onPlanTripForCity) {
                    onPlanTripForCity(placesData.city, placesData.country);
                  }
                }}
              >
                <Sparkles size={16} />
                <span>Plan Full Trip in {placesData.city}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Sub-Category Filter Tabs */}
          {availableCategories.length > 2 && (
            <div className="category-filter-tabs">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-tab ${activeCategoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Places Grid */}
          <div className="places-card-grid">
            {displayedPlaces.map((place) => {
              const isAdded = isPlaceAdded(place);
              const initialImg = place.image_url || getFallbackPlaceImage(place, placesData?.city || selectedCity);
              return (
                <div key={place.id} className="glass-panel place-card">
                  {/* Image Cover */}
                  <div className="place-image-wrapper">
                    <img
                      src={initialImg}
                      alt={place.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = getFallbackPlaceImage(place, placesData?.city || selectedCity);
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                    <div className="place-image-overlay"></div>

                    {/* Category Badge */}
                    <span className="place-category-badge">{place.category || 'Must-See'}</span>

                    {/* Rating Badge */}
                    <div className="place-rating-badge">
                      <Star size={13} fill="var(--accent-amber)" />
                      <span>{place.rating || 4.9}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="place-card-body">
                    <div className="place-header">
                      <h3>{place.name}</h3>
                      {place.address_or_area && (
                        <div className="place-area">
                          <MapPin size={12} />
                          <span>{place.address_or_area}</span>
                        </div>
                      )}
                    </div>

                    {/* Meta Badges */}
                    <div className="place-tags-row">
                      <span className="place-tag vibe-tag">{place.vibe}</span>
                      <span className="place-tag time-tag">
                        <Clock size={11} />
                        {place.best_time_to_visit || 'Anytime'}
                      </span>
                      <span className="place-tag cost-tag">
                        {place.estimated_cost_usd === 0
                          ? 'Free Entry'
                          : `$${place.estimated_cost_usd} est.`}
                      </span>
                    </div>

                    <p className="place-description">{place.description}</p>

                    {/* Insider Secret Tip Box */}
                    {place.insider_tip && (
                      <div className="place-insider-tip">
                        <div className="tip-header">
                          <Sparkles size={12} color="var(--accent-amber)" />
                          <span>Insider Secret Tip:</span>
                        </div>
                        <p>{place.insider_tip}</p>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="place-card-actions">
                      <button
                        type="button"
                        className={`btn ${isAdded ? 'btn-success in-trip-saved' : 'btn-secondary'} add-to-trip-btn`}
                        onClick={() => {
                          if (isAdded && onGoToItinerary) {
                            onGoToItinerary();
                          } else {
                            handleAddPlace(place);
                          }
                        }}
                        title={
                          isAdded
                            ? `Saved in your ${selectedCity} itinerary! Click to open Itinerary tab.`
                            : `Add ${place.name} to your ${selectedCity} itinerary`
                        }
                      >
                        {isAdded ? (
                          <>
                            <Check size={15} />
                            <span>In {selectedCity} Trip &bull; View &rarr;</span>
                          </>
                        ) : (
                          <>
                            <Plus size={15} />
                            <span>Add to {selectedCity} Trip</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          place.name + ' ' + (placesData.city || '')
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-icon"
                        title="Open in Google Maps"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Floating Add Notification Toast */}
      {toastNotification && (
        <div className="city-add-toast glass-panel">
          <div className="toast-left">
            <div className="toast-icon-badge">
              <Check size={18} />
            </div>
            <div className="toast-text-group">
              <strong>Added to {toastNotification.city} Trip!</strong>
              <span>&ldquo;{toastNotification.placeName}&rdquo; was added to your {toastNotification.city} itinerary.</span>
            </div>
          </div>
          <div className="toast-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (onGoToItinerary) onGoToItinerary();
              }}
            >
              <span>View Itinerary</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToastNotification(null)}
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

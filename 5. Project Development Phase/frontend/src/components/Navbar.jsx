import React from 'react';
import { Compass, Sparkles, Map, Route, Sliders, Briefcase, Database, Home, LogOut, User, Globe } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenSupabaseModal,
  tripCount = 0,
  onBackToLanding,
  user,
  onSignOut,
  onToggleChat
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={onBackToLanding || (() => setActiveTab('preferences'))} title="Personalized Travel Itinerary Planner | AI-Powered Travel Experience — Return to Home">
          <div className="brand-icon">
            <Compass size={22} />
          </div>
          <div className="brand-text">
            <h1>Personalized Travel Itinerary Planner</h1>
            <span>AI-Powered Travel Experience</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          {onBackToLanding && (
            <button
              id="nav-landing"
              className="nav-btn nav-home-btn"
              onClick={onBackToLanding}
              title="Return to Home Landing Page"
            >
              <Home size={14} />
              <span>Home</span>
            </button>
          )}

          <button
            id="nav-city-explorer"
            className={`nav-btn ${activeTab === 'city-explorer' ? 'active' : ''}`}
            onClick={() => setActiveTab('city-explorer')}
            title="Explore Places by Country & City"
          >
            <Compass size={14} />
            <span>City Explorer</span>
          </button>

          <button
            id="nav-preferences"
            className={`nav-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
            title="Travel Preferences & Vibes"
          >
            <Sparkles size={14} />
            <span>Preferences</span>
          </button>

          <button
            id="nav-recommendations"
            className={`nav-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
            title="Recommended Destinations"
          >
            <Globe size={14} />
            <span>Destinations</span>
          </button>

          <button
            id="nav-itinerary"
            className={`nav-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
            onClick={() => setActiveTab('itinerary')}
            title="Day-by-Day Daily Itinerary"
          >
            <Map size={14} />
            <span>Itinerary</span>
          </button>

          <button
            id="nav-optimizer"
            className={`nav-btn ${activeTab === 'optimizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('optimizer')}
            title="Route & Time Optimizer"
          >
            <Route size={14} />
            <span>Optimizer</span>
          </button>

          <button
            id="nav-vibe"
            className={`nav-btn ${activeTab === 'vibe' ? 'active' : ''}`}
            onClick={() => setActiveTab('vibe')}
            title="Vibe Tuner & Personalizer"
          >
            <Sliders size={14} />
            <span>Vibe Tuner</span>
          </button>

          <button
            id="nav-saved-trips"
            className={`nav-btn ${activeTab === 'saved-trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved-trips')}
            title="Saved Trips"
          >
            <Briefcase size={14} />
            <span>My Trips{tripCount > 0 ? ` (${tripCount})` : ''}</span>
          </button>
        </nav>

        {/* Actions & User State */}
        <div className="navbar-actions">
          <button
            id="btn-nav-ai-chat"
            className="ai-chat-nav-btn"
            onClick={onToggleChat}
            title="Chat with AI Trip Companion"
          >
            <Sparkles size={13} />
            <span>AI Chat</span>
          </button>

          <button
            id="btn-supabase-status"
            className="supabase-badge"
            onClick={onOpenSupabaseModal}
            title="Supabase Database Status & Configuration"
          >
            <span className="pulse-dot"></span>
            <Database size={13} />
            <span>Supabase</span>
          </button>

          {user ? (
            <div className="user-profile-chip">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar-tiny" />
              ) : (
                <User size={13} />
              )}
              <span className="user-name-display">{user.name}</span>
              <button
                className="user-logout-btn"
                onClick={onSignOut}
                title="Sign Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              className="navbar-signin-pill"
              onClick={onBackToLanding}
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

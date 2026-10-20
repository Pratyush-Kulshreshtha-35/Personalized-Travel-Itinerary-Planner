import React from 'react';
import {
  Globe,
  Sparkles,
  ArrowRight,
  Compass,
  MapPin,
  Calendar,
  Route,
  CheckCircle,
  Star,
  Users,
  Shield,
  Zap,
  Hotel,
  Clock,
  Sliders,
  Share2,
  FileText
} from 'lucide-react';
import Footer from './Footer';

export default function LandingPage({ onStartPlanning, onOpenAuth, user, onGoToDashboard }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper">
      {/* 1. Top Navigation Bar matching dashboard theme */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          {/* Brand Logo matching dashboard */}
          <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Personalized Travel Itinerary Planner | AI-Powered Travel Experience">
            <div className="brand-icon">
              <Compass size={24} />
            </div>
            <div className="brand-text">
              <h1>Personalized Travel Itinerary Planner</h1>
              <span>AI-Powered Travel Experience</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="landing-nav-links">
            <button type="button" onClick={() => scrollToSection('features')} className="landing-nav-link">
              Features
            </button>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="landing-nav-link">
              How it works
            </button>
            <button type="button" onClick={() => scrollToSection('testimonials')} className="landing-nav-link">
              Testimonials
            </button>
            <button type="button" onClick={() => scrollToSection('about')} className="landing-nav-link">
              About
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="landing-nav-actions">
            {user ? (
              <button
                type="button"
                className="landing-getstarted-btn"
                onClick={onGoToDashboard || onStartPlanning}
              >
                <span>Dashboard</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="landing-signin-btn"
                  onClick={() => onOpenAuth('signin')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="landing-getstarted-btn"
                  onClick={() => onOpenAuth('signup')}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section matching screenshot precisely */}
      <section className="landing-hero-section">
        <div className="landing-hero-container">
          {/* Left Column: Copy & CTAs */}
          <div className="landing-hero-content">
            {/* Pill Badge */}
            <div className="hero-pill-badge">
              <span className="hero-pill-dot"></span>
              <span>AI-POWERED EXPLORATION</span>
            </div>

            {/* Headline */}
            <h1 className="hero-main-title">
              Plan your next <span className="highlight-adventure">adventure</span> in seconds.
            </h1>

            {/* Subtitle */}
            <p className="hero-sub-text">
              The most advanced AI travel companion that handles the complexity of planning so you can focus on the experience.
            </p>

            {/* CTA + Social Proof Row */}
            <div className="hero-action-row">
              <button
                type="button"
                className="hero-primary-cta"
                onClick={onStartPlanning}
              >
                <span>Start Planning Free</span>
                <ArrowRight size={18} />
              </button>

              {/* Social Proof Pill */}
              <div className="hero-social-proof">
                <div className="avatar-group">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                    alt="Traveler 1"
                    className="proof-avatar"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                    alt="Traveler 2"
                    className="proof-avatar"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80"
                    alt="Traveler 3"
                    className="proof-avatar"
                  />
                </div>
                <span className="social-proof-text">2,000+ shared trips</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating 3D Itinerary Mockup Card matching screenshot */}
          <div className="landing-hero-visual">
            <div className="tilted-card-frame">
              {/* Floating Badge 1: Hotel Booked */}
              <div className="floating-badge badge-hotel">
                <div className="floating-badge-tag">HOTEL BOOKED</div>
                <div className="floating-badge-title">Grand Resort Paris</div>
                <div className="floating-badge-stars">
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                </div>
              </div>

              {/* Floating Badge 2: Location Pinned */}
              <div className="floating-badge badge-location">
                <div className="floating-badge-tag green-tag">LOCATION PINNED</div>
                <div className="floating-badge-title">Eiffel Tower, 10:00 AM</div>
              </div>

              {/* Mockup Card Interior Structure */}
              <div className="mockup-header-bar">
                <div className="mockup-search-pill"></div>
                <div className="mockup-avatar-circle"></div>
              </div>

              <div className="mockup-cards-row">
                <div className="mockup-mini-card card-green">
                  <div className="mini-card-icon"></div>
                  <div className="mini-card-line"></div>
                </div>
                <div className="mockup-mini-card card-blue">
                  <div className="mini-card-icon"></div>
                  <div className="mini-card-line"></div>
                </div>
                <div className="mockup-mini-card card-orange">
                  <div className="mini-card-icon"></div>
                  <div className="mini-card-line"></div>
                </div>
              </div>

              <div className="mockup-content-body">
                <div className="mockup-timeline-item">
                  <div className="timeline-dot dot-cyan"></div>
                  <div className="timeline-lines">
                    <div className="line-long"></div>
                    <div className="line-short"></div>
                  </div>
                </div>
                <div className="mockup-timeline-item">
                  <div className="timeline-dot dot-purple"></div>
                  <div className="timeline-lines">
                    <div className="line-long"></div>
                    <div className="line-short"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "How It Works" Section */}
      <section id="how-it-works" className="landing-section section-how">
        <div className="section-container">
          <div className="section-header-center">
            <div className="section-pill">SIMPLE 3-STEP JOURNEY</div>
            <h2 className="section-title">How Personalized Travel Itinerary Planner Works</h2>
            <p className="section-desc">
              From your wanderlust vibes to a fully optimized, synchronizable travel dossier in seconds.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number-badge">01</div>
              <div className="step-icon-wrap icon-cyan">
                <Sliders size={26} />
              </div>
              <h3>Choose Your Vibe & Budget</h3>
              <p>
                Select your vibe weights—from Alpine Thrill and Foodie Delights to Zen Relaxation. Set your daily spending limit and preferred travel pace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number-badge">02</div>
              <div className="step-icon-wrap icon-purple">
                <Sparkles size={26} />
              </div>
              <h3>AI Curates & Optimizes Routes</h3>
              <p>
                Google Gemini 2.5 structures your morning, midday, and afternoon stops. Our 2-Opt TSP algorithm reorders activities to eliminate transit backtracking.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number-badge">03</div>
              <div className="step-icon-wrap icon-emerald">
                <Calendar size={26} />
              </div>
              <h3>Sync, Export & Travel</h3>
              <p>
                Download your itinerary into Apple/Google Calendar (`.ics`), print a luxury offline PDF dossier, or sync directly to your cloud Supabase account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="landing-section section-features">
        <div className="section-container">
          <div className="section-header-center">
            <div className="section-pill">CUTTING-EDGE TECH</div>
            <h2 className="section-title">Engineered for Modern Global Explorers</h2>
            <p className="section-desc">
              Say goodbye to juggling twenty browser tabs, scattered maps, and messy spreadsheets.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Sparkles size={24} color="#06b6d4" />
              </div>
              <h4>Vibe-Driven AI Intelligence</h4>
              <p>
                Trained travel personas craft hyper-specific experiences tailored to solo backpackers, luxury honeymooners, or weekend culture hounds.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Route size={24} color="#8b5cf6" />
              </div>
              <h4>2-Opt TSP Route Optimizer</h4>
              <p>
                Calculates geodesic Haversine distances to reorder daily stops, saving an average of 42% in city transit delays and walking fatigue.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Clock size={24} color="#f59e0b" />
              </div>
              <h4>Instant Multi-Format Export</h4>
              <p>
                Export in seconds to iCalendar (.ics) with exact start and end times, generate an offline PDF travel dossier, or pull structured JSON.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Shield size={24} color="#10b981" />
              </div>
              <h4>Supabase Cloud Sync & Resilience</h4>
              <p>
                Automatic local cache with seamless Supabase PostgreSQL cloud sync ensures your itineraries remain accessible even when roaming without Wi-Fi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section id="testimonials" className="landing-section section-testimonials">
        <div className="section-container">
          <div className="section-header-center">
            <div className="section-pill">COMMUNITY LOVE</div>
            <h2 className="section-title">Loved by 2,000+ Global Travelers</h2>
            <p className="section-desc">
              Here is how our AI planner transformed real trips across the globe.
            </p>
          </div>

          <div className="testimonials-grid">
            {/* Testimonial 1 */}
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-quote">
                "The Interlaken & Zermatt curation was mind-blowing! It recommended the exact Eiger Express gondola timings and a tucked-away fondue terrace with a direct Matterhorn view. Saved me days of stressful research."
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Elena Rostova"
                  className="author-avatar"
                />
                <div>
                  <div className="author-name">Elena Rostova</div>
                  <div className="author-role">Alpine Trekker & Photographer • Switzerland Trip</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-quote">
                "The 2-Opt Route Optimizer alone saved our group over 3 hours of zigzagging across Tokyo subways. It sequenced our morning shrines, ramen lunch, and Shibuya sunset in the most logical geographic order."
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Marcus Chen"
                  className="author-avatar"
                />
                <div>
                  <div className="author-name">Marcus Chen</div>
                  <div className="author-role">Culture & Street Food Explorer • Japan Trip</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-quote">
                "We synced the whole 5-day Amalfi honeymoon itinerary directly to our Apple Calendars in one tap. The insider tips for hidden cliffside spots made it feel like we hired a $500/day local concierge."
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Sarah & Liam"
                  className="author-avatar"
                />
                <div>
                  <div className="author-name">Sarah & Liam Vance</div>
                  <div className="author-role">Luxury Honeymooners • Italy Trip</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. About Section */}
      <section id="about" className="landing-section section-about">
        <div className="section-container">
          <div className="about-card-banner">
            <div className="about-content">
              <div className="section-pill">ABOUT PERSONALIZED TRAVEL ITINERARY PLANNER</div>
              <h2>Built for Travelers Who Seek Meaning Over Itinerary Chaos</h2>
              <p>
                We believe travel should be about immersion, sensory discovery, and authentic connection—not spending nights cross-referencing maps, transit schedules, and review sites.
              </p>
              <p>
                Personalized Travel Itinerary Planner was designed in 2026 by combining cutting-edge LLMs (Google Gemini 2.5 Flash), algorithmic graph theory (2-Opt TSP optimization), and cloud synchronization (Supabase PostgreSQL) into one seamless, elegant experience.
              </p>

              <div className="about-stats-row">
                <div className="about-stat">
                  <strong>99.8%</strong>
                  <span>Uptime</span>
                </div>
                <div className="about-stat">
                  <strong>42%</strong>
                  <span>Average Transit Saved</span>
                </div>
                <div className="about-stat">
                  <strong>&lt; 6s</strong>
                  <span>AI Curation Speed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call To Action Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-container">
          <h2>Ready to plan your next journey in seconds?</h2>
          <p>
            Join thousands of smart travelers curating bespoke itineraries without the headache.
          </p>
          <button
            type="button"
            className="hero-primary-cta"
            onClick={onStartPlanning}
          >
            <span>Start Planning Free</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 8. Footer with 2026 Copyright */}
      <Footer
        onNavigateSection={scrollToSection}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
}

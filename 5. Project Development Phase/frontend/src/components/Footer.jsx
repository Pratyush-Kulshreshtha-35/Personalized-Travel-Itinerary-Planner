import React from 'react';
import { Compass, Globe, Heart, Shield, Sparkles, MapPin, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigateSection, onOpenAuth }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Top Brand Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="globe-icon-badge">
                <Compass size={20} />
              </div>
              <h3>Personalized Travel Itinerary Planner</h3>
            </div>
            <p className="footer-tagline">
              AI-Powered Travel Experience &bull; The most advanced travel companion that handles the complexity of planning so you can focus on the experience.
            </p>
            <div className="footer-status-pill">
              <span className="footer-dot-live"></span>
              <span>Gemini 2.5 AI & Supabase Live</span>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Explore</h4>
              <ul>
                <li>
                  <a href="#features" onClick={(e) => { e.preventDefault(); onNavigateSection && onNavigateSection('features'); }}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" onClick={(e) => { e.preventDefault(); onNavigateSection && onNavigateSection('how-it-works'); }}>
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#testimonials" onClick={(e) => { e.preventDefault(); onNavigateSection && onNavigateSection('testimonials'); }}>
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); onNavigateSection && onNavigateSection('about'); }}>
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Destinations</h4>
              <ul>
                <li><span className="footer-dest-link">Interlaken & Zermatt</span></li>
                <li><span className="footer-dest-link">Kyoto & Tokyo</span></li>
                <li><span className="footer-dest-link">Amalfi Coast</span></li>
                <li><span className="footer-dest-link">Reykjavik & Golden Circle</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Account & Support</h4>
              <ul>
                <li>
                  <button className="footer-action-btn" onClick={() => onOpenAuth && onOpenAuth('signin')}>
                    Sign In
                  </button>
                </li>
                <li>
                  <button className="footer-action-btn" onClick={() => onOpenAuth && onOpenAuth('signup')}>
                    Get Started Free
                  </button>
                </li>
                <li>
                  <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="footer-external-link">
                    API Docs <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <span className="footer-dest-link">Privacy & Security</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Bar with 2026 Copyright */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; 2026 Personalized Travel Itinerary Planner | AI-Powered Travel Experience. All rights reserved.
          </p>
          <div className="footer-sub-links">
            <span>Powered by Google Gemini AI</span>
            <span className="separator">•</span>
            <span>2-Opt TSP Route Engine</span>
            <span className="separator">•</span>
            <span>Crafted for Global Explorers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

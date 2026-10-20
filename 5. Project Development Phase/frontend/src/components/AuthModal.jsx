import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../services/supabase';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initialMode when modal opens
  React.useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Please enter your full name or explorer handle.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      let syncedUser = null;

      if (mode === 'signup') {
        // 1. Sync to Supabase user_profiles table via backend
        syncedUser = await api.registerUser({
          email: cleanEmail,
          full_name: name.trim(),
          password: password,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        });

        // 2. Also attempt direct Supabase client upsert
        try {
          await supabase.from('user_profiles').upsert({
            email: cleanEmail,
            full_name: name.trim(),
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
          }, { onConflict: 'email' });
        } catch (dbErr) {
          console.warn('Direct Supabase upsert note:', dbErr);
        }
      } else {
        syncedUser = await api.loginUser({
          email: cleanEmail,
          password: password
        });
      }

      const userProfile = {
        id: syncedUser?.id || 'usr-' + Date.now(),
        name: mode === 'signup' ? name.trim() : (syncedUser?.full_name || cleanEmail.split('@')[0]),
        email: cleanEmail,
        avatar: syncedUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        memberSince: '2026',
        tripsCount: 1
      };

      localStorage.setItem('travel_planner_user', JSON.stringify(userProfile));
      onAuthSuccess(userProfile);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoType) => {
    setIsSubmitting(true);
    const demoUser = demoType === 'couple' ? {
      name: 'Elena & Marcus',
      email: 'elena.marcus@travelvibe.ai',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      memberSince: '2026',
      tripsCount: 4,
      preferredVibe: 'Romantic & Foodie'
    } : {
      name: 'Pratyush S.',
      email: 'pratyush@travelvibe.ai',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      memberSince: '2026',
      tripsCount: 5,
      preferredVibe: 'Adventure & Alpine Trekking'
    };

    try {
      // Sync demo user into Supabase user_profiles table as well!
      await api.registerUser({
        email: demoUser.email,
        full_name: demoUser.name,
        avatar_url: demoUser.avatar
      });
    } catch (e) {
      console.warn('Demo profile sync note:', e);
    }

    localStorage.setItem('travel_planner_user', JSON.stringify(demoUser));
    onAuthSuccess(demoUser);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-icon-badge">
            <Sparkles size={24} />
          </div>
          <h2>{mode === 'signin' ? 'Welcome Back, Explorer' : 'Begin Your AI Travel Journey'}</h2>
          <p>
            {mode === 'signin'
              ? 'Access your personalized itineraries, route plans, and synced trips.'
              : 'Sign up to curate bespoke vibes, optimize travel routes, and export anywhere.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Logins */}
        <div className="demo-login-box">
          <div className="demo-login-label">
            <ShieldCheck size={14} />
            <span>Instant Demo Access (No password required)</span>
          </div>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoLogin('solo')}
              disabled={isSubmitting}
            >
              🚀 Login as Solo Explorer
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleDemoLogin('couple')}
              disabled={isSubmitting}
            >
              ✨ Login as Luxury Couple
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>OR CONTINUE WITH EMAIL</span>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-input-group">
              <label>Full Name or Handle</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label>Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-label-row">
              <label>Password</label>
              {mode === 'signin' && (
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to registered email.'); }} className="forgot-link">
                  Forgot?
                </a>
              )}
            </div>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="auth-extra-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Authenticating...'
            ) : mode === 'signin' ? (
              <>
                Sign In to Planner <ArrowRight size={18} />
              </>
            ) : (
              <>
                Create Account & Explore <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-text">
          {mode === 'signin' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already an explorer?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => { setMode('signin'); setError(''); }}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

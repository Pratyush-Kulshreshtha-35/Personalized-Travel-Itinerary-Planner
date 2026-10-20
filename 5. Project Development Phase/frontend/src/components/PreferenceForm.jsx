import React, { useState } from 'react';
import { Sparkles, DollarSign, Clock, Users, ArrowRight, Compass } from 'lucide-react';

const VIBE_OPTIONS = [
  { id: 'Adventure', label: 'Adventure & Thrills', emoji: '🧗', desc: 'Hiking, climbing, extreme sports' },
  { id: 'Relaxation', label: 'Relaxation & Zen', emoji: '🧘', desc: 'Beaches, hot springs, peaceful wellness' },
  { id: 'Cultural', label: 'Cultural & Heritage', emoji: '🏛️', desc: 'Ancient temples, museums, local history' },
  { id: 'Foodie', label: 'Foodie & Culinary', emoji: '🍜', desc: 'Street food markets, Michelin degustation' },
  { id: 'Romance', label: 'Romantic Escape', emoji: '🥂', desc: 'Sunsets, fine dining, intimate boutique stays' },
  { id: 'Futuristic', label: 'Cyberpunk & Modern', emoji: '🏙️', desc: 'Neon skylines, high-tech, futuristic transit' },
  { id: 'Scenic Nature', label: 'Scenic Nature & Fjords', emoji: '🏔️', desc: 'Lakes, mountains, national parks' },
  { id: 'Nightlife', label: 'Nightlife & Social', emoji: '🪩', desc: 'Rooftops, live music, bustling night markets' },
];

const SECONDARY_TAGS = [
  'Photography', 'Coffee Culture', 'Art & Architecture', 'Wildlife Watching', 
  'Water Sports', 'Wine Tasting', 'Historic Castles', 'Local Handcrafts'
];

const TRAVEL_STYLES = ['Boutique Explorer', 'Balanced', 'Luxury', 'Budget Backpacker'];
const PACES = [
  { id: 'Relaxed', label: 'Relaxed', desc: '2 leisurely stops/day' },
  { id: 'Moderate', label: 'Moderate', desc: '3-4 stops with breaks' },
  { id: 'Fast-Paced', label: 'High Energy', desc: '5+ stops fully packed' },
];

export default function PreferenceForm({ onSearchRecommendations, isLoading }) {
  const [primaryVibe, setPrimaryVibe] = useState('Cultural');
  const [secondaryVibes, setSecondaryVibes] = useState(['Foodie', 'Scenic Nature']);
  const [travelStyle, setTravelStyle] = useState('Boutique Explorer');
  const [pace, setPace] = useState('Moderate');
  const [dailyBudget, setDailyBudget] = useState(150);
  const [groupType, setGroupType] = useState('Solo');
  const [totalDays, setTotalDays] = useState(5);
  const [dietary, setDietary] = useState([]);

  const toggleSecondaryVibe = (tag) => {
    if (secondaryVibes.includes(tag)) {
      setSecondaryVibes(secondaryVibes.filter(t => t !== tag));
    } else {
      if (secondaryVibes.length < 4) {
        setSecondaryVibes([...secondaryVibes, tag]);
      }
    }
  };

  const toggleDietary = (item) => {
    if (dietary.includes(item)) {
      setDietary(dietary.filter(d => d !== item));
    } else {
      setDietary([...dietary, item]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchRecommendations({
      primary_vibe: primaryVibe,
      secondary_vibes: secondaryVibes,
      travel_style: travelStyle,
      pace: pace,
      daily_budget_usd: Number(dailyBudget),
      group_type: groupType,
      total_days: Number(totalDays),
      dietary: dietary
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
          <Sparkles size={20} />
          <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Milestone 3 &bull; Activity 3.1 & 3.2
          </span>
        </div>
        <h2>Define Your Travel Vibe & Preferences</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
          Tell our AI recommendation engine what fuels your wanderlust. We synthesize your vibe, pacing, and budget into curated destinations and optimized daily routes.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 1. Primary Vibe Selector */}
        <div className="form-section">
          <label className="form-label">
            1. Select Your Primary Travel Vibe <span style={{ color: 'var(--primary-color)' }}>*</span>
          </label>
          <div className="vibe-grid">
            {VIBE_OPTIONS.map((v) => {
              const isSelected = primaryVibe === v.id;
              return (
                <div
                  key={v.id}
                  id={`vibe-${v.id.toLowerCase()}`}
                  className={`vibe-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setPrimaryVibe(v.id)}
                >
                  <span className="emoji">{v.emoji}</span>
                  <span className="vibe-label">{v.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', lineHeight: 1.2 }}>
                    {v.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Secondary Vibes / Interests */}
        <div className="form-section">
          <label className="form-label">
            2. Secondary Interests & Passions (Pick up to 4)
          </label>
          <div className="chip-group">
            {SECONDARY_TAGS.map((tag) => {
              const active = secondaryVibes.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  className={`choice-chip ${active ? 'active' : ''}`}
                  onClick={() => toggleSecondaryVibe(tag)}
                >
                  {active ? '✓ ' : '+ '}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid for Budget, Pace, Duration, Style */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', margin: '24px 0' }}>
          {/* Daily Budget Slider */}
          <div className="form-section" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Target Daily Budget
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                ${dailyBudget} <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>USD/day</span>
              </span>
            </div>
            <div className="range-slider-wrapper">
              <input
                id="input-daily-budget"
                type="range"
                min="40"
                max="500"
                step="10"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                className="range-slider"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
              <span>$40 (Backpacker)</span>
              <span>$150 (Balanced)</span>
              <span>$500+ (Ultra-Luxe)</span>
            </div>
          </div>

          {/* Travel Pace */}
          <div className="form-section" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Exploration Pace
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {PACES.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPace(p.id)}
                  style={{
                    background: pace === p.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${pace === p.id ? 'var(--primary-color)' : 'var(--border-subtle)'}`,
                    borderRadius: '8px',
                    padding: '8px 4px',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{p.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Trip Duration Stepper */}
          <div className="form-section" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Trip Duration
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                id="input-trip-days"
                type="number"
                min="1"
                max="14"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Days in Itinerary</span>
            </div>
          </div>

          {/* Group Style & Dynamic */}
          <div className="form-section" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Travel Dynamic
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Solo', 'Couple', 'Family', 'Friends'].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGroupType(g)}
                  className={`choice-chip ${groupType === g ? 'active' : ''}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="form-section" style={{ marginTop: '16px' }}>
          <label className="form-label">Dietary Preferences & Requirements</label>
          <div className="chip-group">
            {['No Restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free'].map((d) => {
              const active = dietary.includes(d);
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDietary(d)}
                  className={`choice-chip ${active ? 'active' : ''}`}
                >
                  {active ? '✓ ' : '+ '}
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit CTA */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="btn-generate-recommendations"
            type="submit"
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '15px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Analyzing Travel Vibes...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Calculate Destination Recommendations</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

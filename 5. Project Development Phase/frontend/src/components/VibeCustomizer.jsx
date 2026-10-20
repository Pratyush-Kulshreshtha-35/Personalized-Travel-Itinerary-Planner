import React, { useState } from 'react';
import { Sliders, Sparkles, Flame, Check, ArrowRight, Zap, Coffee } from 'lucide-react';
import { api } from '../services/api';

const VIBE_PRESETS = [
  { id: 'Foodie & Culinary', label: '🍜 Deep Foodie & Street Gastronomy', desc: 'Inject secret alley tastings, artisanal markets, and local foodie haunts.' },
  { id: 'Adrenaline & Thrill', label: '🧗 Crank Up Adventure & Thrill (+40%)', desc: 'Adds high-energy coastal expeditions, scenic scrambles, and outdoor rushes.' },
  { id: 'Sunset & Chill', label: '🧘 Sunset & Chill Mode', desc: 'Infuses thermal baths, beach club lounges, and slow-paced golden hour spots.' },
  { id: 'Heritage & Culture', label: '🏛️ Ancient Heritage & Temple Immersion', desc: 'Replaces generic stops with artisan guild workshops and historic sanctuaries.' },
];

export default function VibeCustomizer({ trip, onUpdateTripDays, onBackToItinerary }) {
  const [selectedVibe, setSelectedVibe] = useState('Foodie & Culinary');
  const [intensity, setIntensity] = useState('High');
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!trip || !trip.days) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
        <h2>No Active Itinerary</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px' }}>
          Select an itinerary to personalize its activities and vibe intensity.
        </p>
        <button className="btn btn-primary" onClick={onBackToItinerary}>
          Back to Itinerary
        </button>
      </div>
    );
  }

  const handleApplyVibe = async () => {
    setIsApplying(true);
    try {
      const updatedDays = await api.personalizeVibe({
        trip_id: trip.id,
        current_days: trip.days,
        target_vibe: selectedVibe,
        intensity: intensity
      });
      onUpdateTripDays(updatedDays, selectedVibe);
      setApplied(true);
      setTimeout(() => {
        onBackToItinerary();
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', marginBottom: '4px' }}>
            <Sparkles size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
              Milestone 4 &bull; Activity 4.3 Vibe-Based Personalization
            </span>
          </div>
          <h2>Dynamic Vibe Personalization Engine</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Adapt your itinerary on the fly. Shift the ambiance toward high adrenaline, chill relaxation, or culinary mastery with one click.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={onBackToItinerary}>
          Back to Itinerary
        </button>
      </div>

      {/* Preset Cards */}
      <div style={{ marginBottom: '28px' }}>
        <label className="form-label">Choose Target Vibe Modifier</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {VIBE_PRESETS.map((p) => {
            const isSelected = selectedVibe === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedVibe(p.id)}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(15, 23, 42, 0.55)',
                  border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {p.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Intensity Selector */}
      <div style={{ marginBottom: '32px', background: 'rgba(15, 23, 42, 0.4)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Vibe Injection Intensity</span>
          <span style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 600 }}>{intensity} Boost</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {['Subtle / Low', 'Balanced / Medium', 'High / Signature'].map((lvl) => {
            const shortLvl = lvl.split(' / ')[1];
            const active = intensity === shortLvl;
            return (
              <button
                key={lvl}
                type="button"
                className={`choice-chip ${active ? 'active' : ''}`}
                style={{ textAlign: 'center', padding: '10px' }}
                onClick={() => setIntensity(shortLvl)}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          id="btn-apply-vibe-personalization"
          className="btn btn-primary"
          style={{ padding: '12px 28px', fontSize: '15px' }}
          onClick={handleApplyVibe}
          disabled={isApplying}
        >
          {isApplying ? (
            <span>Personalizing Schedule...</span>
          ) : applied ? (
            <>
              <Check size={18} />
              <span>Itinerary Personalization Applied!</span>
            </>
          ) : (
            <>
              <Flame size={18} />
              <span>Apply {selectedVibe} Personalization</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

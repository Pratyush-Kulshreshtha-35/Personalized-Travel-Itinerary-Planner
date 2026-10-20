import React from 'react';
import { Compass, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';
import DestinationCard from './DestinationCard';

export default function RecommendationGrid({ recommendations, onSelectDestination, onBackToPreferences }) {
  return (
    <div>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
            <Sparkles size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
              Milestone 3 &bull; Activity 3.3
            </span>
          </div>
          <h2>AI Recommended Destinations</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Ranked by multi-factor vector affinity matching your specific vibe, pacing, and daily budget constraints.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={onBackToPreferences}
        >
          <SlidersHorizontal size={16} />
          <span>Adjust Preferences</span>
        </button>
      </div>

      {/* Grid */}
      <div className="destinations-grid">
        {recommendations.map((dest) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            onSelectDestination={onSelectDestination}
          />
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Star, MapPin, Calendar, DollarSign, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function DestinationCard({ dest, onSelectDestination }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onSelectDestination(dest);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel dest-card">
      {/* Cover Image with Match Badge */}
      <div className="dest-cover">
        <img src={dest.image_url} alt={dest.name} loading="lazy" />
        <div className="dest-cover-overlay"></div>
        <div className="match-badge-ring">
          <CheckCircle2 size={15} color="var(--accent-emerald)" />
          <span>{dest.match_score}% VIBE MATCH</span>
        </div>
      </div>

      {/* Body */}
      <div className="dest-body">
        <div className="dest-header">
          <div>
            <h3>{dest.name}</h3>
            <div className="dest-location">
              <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {dest.country}
            </div>
          </div>
          <div className="dest-rating">
            <Star size={15} fill="var(--accent-amber)" />
            <span>{dest.rating || 4.9}</span>
          </div>
        </div>

        {/* Vibe Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {dest.vibes?.map((v) => (
            <span
              key={v}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#c7d2fe',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              {v}
            </span>
          ))}
        </div>

        {/* Match Rationale */}
        {dest.match_reasons && dest.match_reasons.length > 0 && (
          <div className="dest-reasons">
            <div style={{ fontWeight: 700, fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase' }}>
              Why It Matches You:
            </div>
            <ul>
              {dest.match_reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta Stats: Cost & Best Season */}
        <div className="dest-meta">
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '11px' }}>EST. DAILY COST</span>
            <span className="cost">${dest.avg_daily_cost} / day</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '11px' }}>BEST SEASON</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{dest.best_season || 'All Year'}</span>
          </div>
        </div>

        {/* Build Itinerary Action */}
        <button
          id={`btn-build-itinerary-${dest.id}`}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 'auto' }}
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Curating Itinerary...</span>
            </>
          ) : (
            <>
              <span>Curate Itinerary for {dest.name.split(' ')[0]}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}


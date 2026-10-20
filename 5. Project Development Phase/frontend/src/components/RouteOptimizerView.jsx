import React, { useState } from 'react';
import { Route, Sparkles, Navigation, Clock, Check, ArrowRight, Zap, MapPin } from 'lucide-react';
import { api } from '../services/api';

export default function RouteOptimizerView({ day, onApplyOptimizedRoute, onBackToItinerary }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [applied, setApplied] = useState(false);

  if (!day || !day.activities || day.activities.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
        <h2>No Day Activities Selected</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px' }}>
          Please select a day from your itinerary to analyze and optimize its geographic routing.
        </p>
        <button className="btn btn-primary" onClick={onBackToItinerary}>
          Back to Itinerary
        </button>
      </div>
    );
  }

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const result = await api.optimizeRoute(day.activities);
      setOptimizationResult(result);
    } catch (err) {
      console.error('Route optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    if (optimizationResult && optimizationResult.optimized_activities) {
      onApplyOptimizedRoute(day.day_number, optimizationResult.optimized_activities);
      setApplied(true);
      setTimeout(() => {
        onBackToItinerary();
      }, 1200);
    }
  };

  const activitiesToShow = optimizationResult ? optimizationResult.optimized_activities : day.activities;

  return (
    <div className="glass-panel optimizer-panel">
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
            <Zap size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
              Milestone 4 &bull; Activity 4.2 Route & Time Optimization
            </span>
          </div>
          <h2>Geographic Route & Transit Optimizer</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Applies the Haversine distance formula and a 2-Opt Traveling Salesperson (TSP) heuristic to reorder stops and eliminate backtracking transit delay.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={onBackToItinerary}>
          Back to Itinerary
        </button>
      </div>

      {/* Metrics Comparison Banner */}
      <div className="metrics-comparison">
        <div className="metric-box">
          <div className="label">Original vs Optimized Dist</div>
          <div className="val val-cyan">
            {optimizationResult ? (
              <span>
                <s style={{ fontSize: '18px', color: 'var(--text-dim)', marginRight: '8px' }}>
                  {optimizationResult.original_distance_km} km
                </s>
                {optimizationResult.optimized_distance_km} km
              </span>
            ) : (
              'Calculated on Run'
            )}
          </div>
        </div>

        <div className="metric-box">
          <div className="label">Transit Time Saved</div>
          <div className="val val-green">
            {optimizationResult ? `${optimizationResult.time_saved_minutes} mins` : '—'}
          </div>
        </div>

        <div className="metric-box">
          <div className="label">Route Efficiency Gain</div>
          <div className="val val-purple">
            {optimizationResult ? optimizationResult.route_efficiency_gain : '—'}
          </div>
        </div>
      </div>

      {/* Trigger & Apply Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <button
          id="btn-run-tsp-optimizer"
          className="btn btn-primary"
          onClick={handleRunOptimizer}
          disabled={isOptimizing}
          style={{ padding: '12px 24px' }}
        >
          {isOptimizing ? (
            <span>Computing 2-Opt TSP Matrix...</span>
          ) : (
            <>
              <Sparkles size={16} />
              <span>{optimizationResult ? 'Re-Run Optimization' : 'Compute Optimal Route Sequence'}</span>
            </>
          )}
        </button>

        {optimizationResult && (
          <button
            id="btn-apply-optimized-route"
            className="btn btn-secondary"
            onClick={handleApply}
            style={{ 
              borderColor: 'var(--accent-emerald)', 
              color: 'var(--accent-emerald)',
              background: 'rgba(16, 185, 129, 0.1)'
            }}
          >
            {applied ? (
              <>
                <Check size={16} />
                <span>Sequence Applied! Redirecting...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Commit Optimized Sequence to Day {day.day_number}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Sequenced Route Flow */}
      <div>
        <h4 style={{ fontSize: '15px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          {optimizationResult ? '✨ Optimized Visiting Tour Order' : 'Current Stop Order (Day ' + day.day_number + ')'}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activitiesToShow.map((act, idx) => (
            <React.Fragment key={act.id || idx}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--grad-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '15px',
                    color: '#fff'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{act.title}</h4>
                    <div style={{ fontSize: '13px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} />
                      <span>{act.location_name}</span>
                      {act.latitude && act.longitude && (
                        <span style={{ color: 'var(--text-dim)', fontSize: '11px', marginLeft: '6px' }}>
                          ({act.latitude.toFixed(4)}, {act.longitude.toFixed(4)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`slot-tag slot-${act.time_slot}`}>
                    {act.time_slot}
                  </span>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {act.duration_minutes || 90} mins
                  </div>
                </div>
              </div>

              {/* Transit Connector */}
              {idx < activitiesToShow.length - 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '-4px 0 -4px 34px',
                  paddingLeft: '18px',
                  borderLeft: '2px dashed rgba(99, 102, 241, 0.4)',
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                  height: '32px'
                }}>
                  <Navigation size={12} color="var(--accent-cyan)" />
                  <span>
                    {act.transit_info_to_next ? (
                      `${act.transit_info_to_next.recommended_mode}: ${act.transit_info_to_next.distance_km} km (${act.transit_info_to_next.duration_mins} min)`
                    ) : (
                      'Direct sequential transit connection'
                    )}
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

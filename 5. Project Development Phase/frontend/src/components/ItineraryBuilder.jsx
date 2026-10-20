import React, { useState } from 'react';
import { 
  Calendar, MapPin, Clock, DollarSign, Lightbulb, 
  Route, Sliders, Download, Bookmark, Check, ArrowRight 
} from 'lucide-react';

export default function ItineraryBuilder({ 
  trip, 
  savedTrips,
  onSelectTrip,
  onSaveTrip, 
  onOpenExportModal, 
  onGoToOptimizer, 
  onGoToVibeTuner 
}) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  if (!trip || !trip.days || trip.days.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
        <h2>No Itinerary Selected</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 24px' }}>
          Select a destination from the Recommendations tab or configure your vibe preferences to curate a personalized schedule.
        </p>
      </div>
    );
  }

  const activeDay = trip.days[selectedDayIndex] || trip.days[0];

  const handleSave = () => {
    onSaveTrip(trip);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div>
      {/* Trip Switcher if Multiple Saved Trips exist */}
      {savedTrips && savedTrips.length > 1 && (
        <div className="glass-panel trip-switcher-bar" style={{ marginBottom: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Switch Trip Itinerary:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {savedTrips.map((st) => {
              const isSelected = st.id === trip?.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    borderRadius: '9999px',
                    fontSize: '13px',
                    padding: '6px 14px',
                    boxShadow: isSelected ? '0 0 16px rgba(168, 85, 247, 0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => onSelectTrip && onSelectTrip(st)}
                >
                  <MapPin size={13} />
                  <span>{st.destination_name ? `${st.destination_name} (${st.total_days}D)` : st.title}</span>
                  {isSelected && (
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trip Header Banner */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ 
                background: 'rgba(99, 102, 241, 0.2)', 
                color: '#c7d2fe', 
                fontSize: '11px', 
                fontWeight: 700, 
                padding: '3px 10px', 
                borderRadius: '9999px',
                border: '1px solid rgba(99, 102, 241, 0.4)'
              }}>
                {trip.vibe_style} VIBE
              </span>
              <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                &bull; {trip.total_days} Days Scheduled
              </span>
            </div>
            <h2>{trip.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '750px', marginTop: '6px' }}>
              {trip.summary}
            </p>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="btn-optimize-route-top"
              className="btn btn-secondary"
              onClick={() => onGoToOptimizer(activeDay)}
              title="Optimize Visiting Sequence with 2-Opt TSP"
            >
              <Route size={16} />
              <span>Optimize Route</span>
            </button>

            <button
              id="btn-tune-vibe-top"
              className="btn btn-secondary"
              onClick={onGoToVibeTuner}
              title="Adjust Vibe Parameters in Real-Time"
            >
              <Sliders size={16} />
              <span>Vibe Tuner</span>
            </button>

            <button
              id="btn-export-top"
              className="btn btn-secondary"
              onClick={onOpenExportModal}
              title="Download iCal, JSON or PDF Dossier"
            >
              <Download size={16} />
              <span>Export</span>
            </button>

            <button
              id="btn-save-trip-top"
              className={`btn ${isSaved ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleSave}
            >
              {isSaved ? (
                <>
                  <Check size={16} color="var(--accent-emerald)" />
                  <span style={{ color: 'var(--accent-emerald)' }}>Saved to Supabase!</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  <span>Save Trip</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px', 
          marginTop: '24px', 
          paddingTop: '20px', 
          borderTop: '1px solid var(--border-subtle)' 
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Destination</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{trip.destination_name}, {trip.country}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Dates</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{trip.start_date} &rarr; {trip.end_date}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Est. Total Budget</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-emerald)' }}>${trip.total_budget?.toFixed(2)} USD</div>
          </div>
        </div>
      </div>

      {/* Main Day-by-Day Workspace */}
      <div className="itinerary-view">
        {/* Left Sidebar: Day Tabs */}
        <div className="day-tabs-sidebar">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Days Overview
          </div>
          {trip.days.map((day, idx) => {
            const isDaySelected = idx === selectedDayIndex;
            return (
              <div
                key={day.id || idx}
                id={`tab-day-${day.day_number}`}
                className={`day-tab-card ${isDaySelected ? 'active' : ''}`}
                onClick={() => setSelectedDayIndex(idx)}
              >
                <div>
                  <div className="day-title">Day {day.day_number}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {day.theme_title?.replace(/Day \d+:\s*/, '')}
                  </div>
                </div>
                <div className="day-cost">
                  ${day.estimated_daily_cost?.toFixed(0)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Pane: Timeline Activities */}
        <div>
          <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {activeDay.date ? `Date: ${activeDay.date}` : `Day ${activeDay.day_number}`}
                </span>
                <h3 style={{ fontSize: '22px', marginTop: '2px' }}>{activeDay.theme_title}</h3>
                {activeDay.daily_notes && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    <em>{activeDay.daily_notes}</em>
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>DAILY ESTIMATE</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  ${activeDay.estimated_daily_cost?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Cards Timeline */}
          <div className="activity-timeline">
            {activeDay.activities.map((act, actIdx) => (
              <React.Fragment key={act.id || actIdx}>
                <div className="activity-card" id={`activity-card-${act.id || actIdx}`}>
                  {/* Slot & Time */}
                  <div className="act-slot-col">
                    <span className={`slot-tag slot-${act.time_slot}`}>
                      {act.time_slot}
                    </span>
                    <span className="act-time-val">
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {act.start_time || '09:00'} - {act.end_time || '11:30'}
                    </span>
                  </div>

                  {/* Main Details */}
                  <div className="act-main-col">
                    <h4>{act.title}</h4>
                    <div className="act-location-text">
                      <MapPin size={13} />
                      <span>{act.location_name}</span>
                    </div>
                    {act.description && (
                      <p className="act-description">{act.description}</p>
                    )}
                    {act.insider_tip && (
                      <div className="act-insider-tip">
                        <Lightbulb size={14} color="var(--accent-amber)" />
                        <span><strong>Insider Tip:</strong> {act.insider_tip}</span>
                      </div>
                    )}
                  </div>

                  {/* Meta: Cost & Vibe Match */}
                  <div className="act-meta-col">
                    <div className="act-cost-badge">
                      ${act.estimated_cost?.toFixed(2)}
                    </div>
                    {act.vibe_match && (
                      <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: 600 }}>
                        {act.vibe_match}
                      </span>
                    )}
                  </div>
                </div>

                {/* Transit Divider between activities */}
                {act.transit_info_to_next && (
                  <div className="transit-divider">
                    <span>&darr;</span>
                    <span>
                      {act.transit_info_to_next.recommended_mode || 'Transit'} &bull; {act.transit_info_to_next.duration_mins} mins ({act.transit_info_to_next.distance_km} km)
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

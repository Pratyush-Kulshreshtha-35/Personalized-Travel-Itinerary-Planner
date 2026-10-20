import React from 'react';
import { Briefcase, Calendar, MapPin, Trash2, Download, Eye, Plus, DollarSign } from 'lucide-react';

export default function SavedTrips({ trips, onSelectTrip, onDeleteTrip, onOpenExportModal, onNewTrip }) {
  if (!trips || trips.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 32px', textAlign: 'center' }}>
        <Briefcase size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 16px' }} />
        <h2>No Saved Trips Yet</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px auto 24px', maxWidth: '480px' }}>
          Capture your dream travel vibes, generate an optimized itinerary, and save your trip to manage it here anytime.
        </p>
        <button className="btn btn-primary" onClick={onNewTrip}>
          <Plus size={16} />
          <span>Curate Your First Trip</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            Milestone 5 &bull; Activity 5.1
          </span>
          <h2>My Saved Travel Itineraries</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Trips synchronized with Supabase cloud database & client storage.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onNewTrip}>
          <Plus size={16} />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Grid of Trip Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {trips.map((trip) => (
          <div key={trip.id} className="glass-panel dest-card" id={`trip-card-${trip.id}`}>
            {/* Cover Image */}
            <div className="dest-cover">
              <img src={trip.cover_image_url || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'} alt={trip.title} />
              <div className="dest-cover-overlay"></div>
              <span style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: 'var(--accent-emerald)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                {trip.status?.toUpperCase() || 'PLANNED'}
              </span>
            </div>

            {/* Body */}
            <div className="dest-body">
              <div style={{ marginBottom: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#c7d2fe',
                  background: 'rgba(99, 102, 241, 0.2)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginBottom: '6px'
                }}>
                  {trip.vibe_style}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{trip.title}</h3>
                <div style={{ fontSize: '13px', color: 'var(--accent-cyan)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} />
                  <span>{trip.destination_name}, {trip.country}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', margin: '12px 0' }}>
                <div>
                  <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {trip.total_days} Days
                </div>
                <div>
                  <DollarSign size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  ${trip.total_budget?.toFixed(0)} Est. Total
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px 14px', fontSize: '13px' }}
                  onClick={() => onSelectTrip(trip)}
                >
                  <Eye size={14} />
                  <span>Open Itinerary</span>
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px' }}
                  onClick={() => onOpenExportModal(trip)}
                  title="Export Itinerary"
                >
                  <Download size={14} />
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', color: 'var(--accent-rose)' }}
                  onClick={() => onDeleteTrip(trip.id)}
                  title="Delete Trip"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

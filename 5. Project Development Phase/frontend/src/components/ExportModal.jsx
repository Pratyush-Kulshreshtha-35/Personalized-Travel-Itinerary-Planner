import React, { useState } from 'react';
import { 
  Download, 
  Calendar, 
  FileText, 
  Printer, 
  Share2, 
  Check, 
  X, 
  ExternalLink,
  Sparkles,
  FileCode,
  Info
} from 'lucide-react';
import { 
  downloadJsonFile, 
  downloadIcalFile, 
  openPrintableDossier, 
  downloadHtmlDossier 
} from '../utils/exportHelpers';

export default function ExportModal({ trip, onClose }) {
  const [copied, setCopied] = useState(false);
  const [jsonDownloaded, setJsonDownloaded] = useState(false);
  const [icalDownloaded, setIcalDownloaded] = useState(false);
  const [pdfTriggered, setPdfTriggered] = useState(false);
  const [htmlDownloaded, setHtmlDownloaded] = useState(false);

  if (!trip) return null;

  // Handle RFC 5545 Calendar .ics export
  const handleDownloadIcal = () => {
    const success = downloadIcalFile(trip);
    if (success) {
      setIcalDownloaded(true);
      setTimeout(() => setIcalDownloaded(false), 3000);
    }
  };

  // Handle structured Machine-Readable JSON export
  const handleDownloadJson = () => {
    const success = downloadJsonFile(trip);
    if (success) {
      setJsonDownloaded(true);
      setTimeout(() => setJsonDownloaded(false), 3000);
    }
  };

  // Handle Luxury Printable PDF Dossier (Opens dedicated clean print dossier and auto-triggers print)
  const handlePrintPdf = () => {
    setPdfTriggered(true);
    openPrintableDossier(trip, true);
    setTimeout(() => setPdfTriggered(false), 3500);
  };

  // Preview Dossier in New Window without auto-opening print dialog
  const handlePreviewDossier = (e) => {
    e.stopPropagation();
    openPrintableDossier(trip, false);
  };

  // Download Standalone HTML Dossier
  const handleDownloadHtml = (e) => {
    e.stopPropagation();
    const success = downloadHtmlDossier(trip);
    if (success) {
      setHtmlDownloaded(true);
      setTimeout(() => setHtmlDownloaded(false), 3000);
    }
  };

  // Handle Shareable Itinerary Link copy
  const handleCopyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?trip=${trip.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
    } else {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activityCount = (trip.days || []).reduce((acc, d) => acc + (d.activities?.length || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', padding: '32px' }}
      >
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', marginBottom: '6px' }}>
            <Download size={18} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Milestone 5 &bull; Activity 5.2 Export Module
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0' }}>
            Export &amp; Synchronize Trip
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {trip.title} &bull; <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{trip.total_days || (trip.days ? trip.days.length : 1)} Days</span> ({activityCount} activities)
          </p>
        </div>

        {/* Informational Guidance Alert */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#cbd5e1'
        }}>
          <Info size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
          <div>
            <strong>PDF Export Tip:</strong> Click <strong>"Print / Save PDF"</strong> below. When the print preview opens, select <strong>"Save as PDF"</strong> (or <em>Microsoft Print to PDF</em>) in the Destination dropdown.
          </div>
        </div>

        {/* Export Options Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          
          {/* 1. Luxury Print / PDF Dossier (Highlighted primary) */}
          <div
            id="btn-export-pdf"
            onClick={handlePrintPdf}
            style={{
              background: pdfTriggered 
                ? 'rgba(168, 85, 247, 0.15)' 
                : 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: pdfTriggered 
                ? '1px solid var(--accent-purple)' 
                : '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent-purple)', marginBottom: '10px' }}>
                <Printer size={28} />
              </div>
              <span style={{
                background: 'rgba(168, 85, 247, 0.2)',
                color: 'var(--accent-purple)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase'
              }}>
                Recommended
              </span>
            </div>

            <h4 style={{ fontSize: '16px', marginBottom: '4px', color: '#ffffff' }}>Printable Travel Dossier (PDF)</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              Generates a clean, luxury offline itinerary ready for printing or saving directly to PDF.
            </p>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                color: pdfTriggered ? 'var(--accent-emerald)' : 'var(--accent-purple)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {pdfTriggered ? (
                  <>
                    <Check size={16} />
                    <span>Print Dialog Opened!</span>
                  </>
                ) : (
                  <span>Print / Save PDF &rarr;</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePreviewDossier}
                  title="Preview clean dossier in new browser tab"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#e2e8f0',
                    fontSize: '11px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ExternalLink size={12} />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  title="Download standalone HTML file"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: htmlDownloaded ? 'var(--accent-emerald)' : '#e2e8f0',
                    fontSize: '11px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Download size={12} />
                  <span>{htmlDownloaded ? '✓ .html' : '.html'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Machine-Readable JSON */}
          <div
            id="btn-export-json"
            onClick={handleDownloadJson}
            style={{
              background: jsonDownloaded 
                ? 'rgba(245, 158, 11, 0.15)' 
                : 'rgba(15, 23, 42, 0.65)',
              border: jsonDownloaded 
                ? '1px solid var(--accent-amber)' 
                : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <div style={{ color: 'var(--accent-amber)', marginBottom: '10px' }}>
              <FileCode size={28} />
            </div>
            <h4 style={{ fontSize: '16px', marginBottom: '4px', color: '#ffffff' }}>Machine-Readable JSON</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              Raw structured JSON dataset containing all activities, coordinates, timings, and daily costs.
            </p>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: jsonDownloaded ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {jsonDownloaded ? (
                <>
                  <Check size={16} />
                  <span>✓ JSON File Downloaded!</span>
                </>
              ) : (
                <span>Download JSON &rarr;</span>
              )}
            </div>
          </div>

          {/* 3. Apple / Google Calendar .ics */}
          <div
            id="btn-export-ical"
            onClick={handleDownloadIcal}
            style={{
              background: icalDownloaded 
                ? 'rgba(6, 182, 212, 0.15)' 
                : 'rgba(15, 23, 42, 0.65)',
              border: icalDownloaded 
                ? '1px solid var(--accent-cyan)' 
                : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '10px' }}>
              <Calendar size={28} />
            </div>
            <h4 style={{ fontSize: '16px', marginBottom: '4px', color: '#ffffff' }}>Apple / Google Calendar</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              Download standard RFC 5545 .ics calendar file to sync your travel schedule to phone or desktop.
            </p>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: icalDownloaded ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {icalDownloaded ? (
                <>
                  <Check size={16} />
                  <span>✓ Calendar (.ics) Downloaded!</span>
                </>
              ) : (
                <span>Download .ics &rarr;</span>
              )}
            </div>
          </div>

          {/* 4. Shareable Link */}
          <div
            id="btn-export-share"
            onClick={handleCopyShareLink}
            style={{
              background: copied 
                ? 'rgba(244, 63, 94, 0.15)' 
                : 'rgba(15, 23, 42, 0.65)',
              border: copied 
                ? '1px solid var(--accent-rose)' 
                : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <div style={{ color: 'var(--accent-rose)', marginBottom: '10px' }}>
              <Share2 size={28} />
            </div>
            <h4 style={{ fontSize: '16px', marginBottom: '4px', color: '#ffffff' }}>Shareable Itinerary Link</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              Copy unique trip URL to share your planned vacation with travel companions or family.
            </p>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 700, 
              color: copied ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {copied ? (
                <>
                  <Check size={16} />
                  <span>✓ Link Copied to Clipboard!</span>
                </>
              ) : (
                <span>Copy Share Link &rarr;</span>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '18px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Files are formatted client-side &amp; verified for offline storage.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

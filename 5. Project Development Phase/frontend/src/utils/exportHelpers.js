/**
 * Export and Synchronization Utilities
 * Milestone 5 - Activity 5.2: Calendar (iCal), Machine-Readable JSON & Luxury PDF Travel Dossier
 */

/**
 * Downloads trip data as structured, formatted JSON file.
 * Handles modern browser security policies by appending the anchor element to the DOM.
 */
export function downloadJsonFile(trip) {
  if (!trip) return false;
  try {
    const exportData = {
      ...trip,
      _metadata: {
        exported_at: new Date().toISOString(),
        format_version: "2.0",
        generator: "Personalized Travel Itinerary Planner"
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const safeTitle = (trip.destination_name || trip.title || 'trip')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    link.download = `${safeTitle || 'trip'}-itinerary.json`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 300);

    return true;
  } catch (err) {
    console.error('Failed to export JSON:', err);
    return false;
  }
}

/**
 * Generates and downloads RFC 5545 compliant iCalendar (.ics) file for Apple, Google, Outlook.
 */
export function downloadIcalFile(trip) {
  if (!trip) return false;
  try {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Personalized Travel Itinerary Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${(trip.title || 'Travel Itinerary').replace(/[,;]/g, ' ')}`,
      'X-WR-TIMEZONE:UTC'
    ];

    const fallbackDate = new Date().toISOString().split('T')[0].replace(/-/g, '');

    trip.days?.forEach((day, dayIdx) => {
      let dayDateStr = fallbackDate;
      if (day.date) {
        dayDateStr = day.date.replace(/-/g, '');
      }

      day.activities?.forEach((act, actIdx) => {
        let startH = '09';
        let startM = '00';
        if (act.start_time && act.start_time.includes(':')) {
          const parts = act.start_time.split(':');
          startH = parts[0].padStart(2, '0');
          startM = parts[1].padStart(2, '0');
        }

        let endH = '11';
        let endM = '30';
        if (act.end_time && act.end_time.includes(':')) {
          const parts = act.end_time.split(':');
          endH = parts[0].padStart(2, '0');
          endM = parts[1].padStart(2, '0');
        }

        const uid = `${trip.id || 'trip'}-d${day.day_number || dayIdx + 1}-a${act.id || actIdx}@travelplanner.local`;
        const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const summary = `[${act.time_slot || 'Activity'}] ${act.title || 'Sightseeing'}`.replace(/[,;]/g, ' ');
        const location = (act.location_name || trip.destination_name || '').replace(/[,;]/g, ' ');
        const description = `${act.description || ''} | Cost: $${act.estimated_cost || 0} | Tip: ${act.insider_tip || ''}`.replace(/\r?\n/g, ' ');

        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${uid}`);
        lines.push(`DTSTAMP:${dtstamp}`);
        lines.push(`DTSTART:${dayDateStr}T${startH}${startM}00`);
        lines.push(`DTEND:${dayDateStr}T${endH}${endM}00`);
        lines.push(`SUMMARY:${summary}`);
        lines.push(`LOCATION:${location}`);
        lines.push(`DESCRIPTION:${description}`);
        lines.push('STATUS:CONFIRMED');
        lines.push('END:VEVENT');
      });
    });

    lines.push('END:VCALENDAR');

    const icsBlob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(icsBlob);
    const link = document.createElement('a');
    link.href = url;

    const safeTitle = (trip.destination_name || trip.title || 'trip')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    link.download = `${safeTitle || 'itinerary'}-calendar.ics`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 300);

    return true;
  } catch (err) {
    console.error('Failed to export iCal:', err);
    return false;
  }
}

/**
 * Builds standalone, print-optimized luxury HTML dossier for PDF generation and physical printing.
 */
export function generatePrintableDossierHtml(trip, autoPrint = false) {
  if (!trip) return '';

  const totalCost = Number(trip.total_budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const destination = [trip.destination_name, trip.country].filter(Boolean).join(', ') || 'Global Destination';
  const dates = (trip.start_date && trip.end_date) 
    ? `${trip.start_date} &rarr; ${trip.end_date}` 
    : (trip.start_date || 'Flexible Dates');

  const daysHtml = (trip.days || []).map((day, idx) => {
    const dayNumber = day.day_number || (idx + 1);
    const dayCost = Number(day.estimated_daily_cost || 0).toFixed(2);
    
    const activitiesHtml = (day.activities || []).map((act) => {
      const actCost = Number(act.estimated_cost || 0).toFixed(2);
      const timeRange = (act.start_time && act.end_time) 
        ? `${act.start_time} - ${act.end_time}` 
        : (act.start_time || 'Flexible Time');

      return `
        <div class="activity-row">
          <div class="act-time-col">
            <span class="slot-badge slot-${(act.time_slot || 'day').toLowerCase()}">${escapeHtml(act.time_slot || 'Activity')}</span>
            <span class="time-range">${escapeHtml(timeRange)}</span>
          </div>
          <div class="act-content-col">
            <h4 class="act-title">${escapeHtml(act.title || 'Experience')}</h4>
            <div class="act-location">📍 ${escapeHtml(act.location_name || trip.destination_name || '')}</div>
            ${act.description ? `<p class="act-desc">${escapeHtml(act.description)}</p>` : ''}
            ${act.insider_tip ? `
              <div class="act-tip">
                <span class="tip-icon">💡</span>
                <div><strong>Insider Tip:</strong> ${escapeHtml(act.insider_tip)}</div>
              </div>
            ` : ''}
          </div>
          <div class="act-meta-col">
            <div class="act-cost">$${actCost}</div>
            ${act.vibe_match ? `<div class="act-vibe">${escapeHtml(act.vibe_match)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <section class="day-card">
        <header class="day-header">
          <div class="day-title-group">
            <span class="day-pill">Day ${dayNumber}</span>
            <h3 class="day-theme">${escapeHtml(day.theme_title || `Day ${dayNumber} Itinerary`)}</h3>
          </div>
          <div class="day-meta-right">
            ${day.date ? `<span class="day-date">${escapeHtml(day.date)}</span>` : ''}
            <span class="day-cost">Est. Daily: <strong>$${dayCost}</strong></span>
          </div>
        </header>
        ${day.daily_notes ? `<div class="day-notes"><em>Curator Note: ${escapeHtml(day.daily_notes)}</em></div>` : ''}
        <div class="activities-list">
          ${activitiesHtml || '<p class="empty-text">No scheduled activities for this day.</p>'}
        </div>
      </section>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(trip.title || 'Travel Itinerary')} - Personalized Travel Dossier</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4f46e5;
      --primary-dark: #3730a3;
      --accent: #0ea5e9;
      --text-dark: #0f172a;
      --text-muted: #475569;
      --text-dim: #64748b;
      --border: #e2e8f0;
      --bg-subtle: #f8fafc;
      --font-heading: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: var(--font-body);
      color: var(--text-dark);
      background: #f1f5f9;
      line-height: 1.55;
      padding: 0;
      margin: 0;
    }

    /* Top Sticky Action Bar (Hidden in Print) */
    .top-action-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: #ffffff;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .top-action-bar .brand-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
    }

    .top-action-bar .brand-label strong {
      color: #38bdf8;
    }

    .action-btn-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-print-main {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.15s ease, filter 0.15s ease;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    }

    .btn-print-main:hover {
      transform: translateY(-1px);
      filter: brightness(1.1);
    }

    .btn-action-secondary {
      background: rgba(255, 255, 255, 0.12);
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 9px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }

    .btn-action-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Print Tip Banner */
    .print-tip-banner {
      background: #eff6ff;
      border-bottom: 1px solid #bfdbfe;
      padding: 10px 24px;
      font-size: 13px;
      color: #1e40af;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Page Container */
    .document-wrapper {
      max-width: 900px;
      margin: 32px auto;
      background: #ffffff;
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    /* Hero Header */
    .dossier-hero {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 28px;
      margin-bottom: 32px;
    }

    .hero-top-badges {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .badge-vibe {
      background: #eef2ff;
      color: #4f46e5;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 4px 12px;
      border-radius: 9999px;
      border: 1px solid #c7d2fe;
    }

    .badge-milestone {
      background: #ecfdf5;
      color: #059669;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      border: 1px solid #a7f3d0;
    }

    .dossier-hero h1 {
      font-family: var(--font-heading);
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      margin-bottom: 12px;
    }

    .dossier-hero .trip-summary {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.6;
      max-width: 760px;
    }

    /* Meta Grid */
    .meta-overview-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 20px;
      margin-top: 24px;
    }

    .meta-box {
      display: flex;
      flex-direction: column;
    }

    .meta-box strong {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      margin-bottom: 4px;
    }

    .meta-box span {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-dark);
    }

    .meta-box .val-highlight {
      color: #059669;
    }

    /* Day Cards */
    .day-card {
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 28px;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding-bottom: 14px;
      margin-bottom: 16px;
    }

    .day-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .day-pill {
      background: #4f46e5;
      color: #ffffff;
      font-family: var(--font-heading);
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.02em;
    }

    .day-theme {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-dark);
    }

    .day-meta-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .day-date {
      font-size: 13px;
      color: var(--text-dim);
      font-weight: 500;
    }

    .day-cost {
      font-size: 13px;
      color: var(--text-muted);
    }

    .day-cost strong {
      color: #059669;
      font-weight: 700;
    }

    .day-notes {
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #334155;
      margin-bottom: 18px;
    }

    /* Activities */
    .activity-row {
      display: grid;
      grid-template-columns: 140px 1fr 110px;
      gap: 18px;
      padding: 16px 0;
      border-bottom: 1px dashed var(--border);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .activity-row:last-child {
      border-bottom: none;
      padding-bottom: 4px;
    }

    .act-time-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .slot-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      width: fit-content;
      letter-spacing: 0.02em;
    }

    .slot-morning { background: #fef3c7; color: #92400e; }
    .slot-afternoon { background: #e0e7ff; color: #3730a3; }
    .slot-evening { background: #fae8ff; color: #86198f; }
    .slot-night { background: #e2e8f0; color: #1e293b; }
    .slot-day { background: #f1f5f9; color: #334155; }

    .time-range {
      font-size: 12px;
      color: var(--text-dim);
      font-weight: 600;
    }

    .act-title {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .act-location {
      font-size: 13px;
      color: #475569;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .act-desc {
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
    }

    .act-tip {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      color: #92400e;
      margin-top: 8px;
    }

    .act-meta-col {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .act-cost {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .act-vibe {
      font-size: 11px;
      color: #7c3aed;
      background: #f5f3ff;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      font-weight: 600;
    }

    /* Footer */
    .dossier-footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 12px;
      color: var(--text-dim);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Print Specific Media Styles */
    @media print {
      body {
        background: #ffffff !important;
        color: #0f172a !important;
      }

      .no-print {
        display: none !important;
      }

      .document-wrapper {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }

      .day-card {
        border: 1px solid #cbd5e1 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin-bottom: 20px !important;
      }

      .activity-row {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      @page {
        margin: 15mm 12mm;
        size: A4 portrait;
      }
    }
  </style>
</head>
<body>
  <!-- Top Action Bar (Visible in browser, hidden when printed) -->
  <header class="top-action-bar no-print">
    <div class="brand-label">
      <span>Personalized Travel Itinerary Planner &bull; <strong>AI-Powered Travel Experience</strong></span>
    </div>
    <div class="action-btn-group">
      <button class="btn-print-main" onclick="window.print()">
        🖨️ Print / Save to PDF
      </button>
      <button class="btn-action-secondary" onclick="downloadHtmlSource()">
        ⬇️ Download .html
      </button>
      <button class="btn-action-secondary" onclick="window.close()">
        ✕ Close
      </button>
    </div>
  </header>

  <!-- Helpful Print Guidance Tip Banner -->
  <div class="print-tip-banner no-print">
    <div>
      💡 <strong>How to save as PDF:</strong> Click <em>"Print / Save to PDF"</em> above, then change the <strong>Destination</strong> printer to <strong>"Save as PDF"</strong> or <strong>"Microsoft Print to PDF"</strong>.
    </div>
    <button onclick="this.parentElement.style.display='none'" style="background:none;border:none;cursor:pointer;color:#1e40af;font-size:16px;">✕</button>
  </div>

  <!-- Main Travel Dossier Content -->
  <main class="document-wrapper">
    <header class="dossier-hero">
      <div class="hero-top-badges">
        <span class="badge-vibe">${escapeHtml(trip.vibe_style || 'Curated')} Vibe</span>
        <span class="badge-milestone">Milestone 5 Verified Dossier</span>
      </div>
      <h1>${escapeHtml(trip.title || 'Personalized Travel Itinerary')}</h1>
      ${trip.summary ? `<p class="trip-summary">${escapeHtml(trip.summary)}</p>` : ''}

      <div class="meta-overview-grid">
        <div class="meta-box">
          <strong>Destination</strong>
          <span>${escapeHtml(destination)}</span>
        </div>
        <div class="meta-box">
          <strong>Travel Dates</strong>
          <span>${dates}</span>
        </div>
        <div class="meta-box">
          <strong>Duration</strong>
          <span>${trip.total_days || (trip.days ? trip.days.length : 1)} Days</span>
        </div>
        <div class="meta-box">
          <strong>Estimated Budget</strong>
          <span class="val-highlight">$${totalCost} USD</span>
        </div>
      </div>
    </header>

    <!-- Day By Day Itinerary Section -->
    <div class="itinerary-days-container">
      ${daysHtml || '<p>No days found in itinerary.</p>'}
    </div>

    <!-- Dossier Footer -->
    <footer class="dossier-footer">
      <div>Curated with ❤️ by <strong>Personalized Travel Itinerary Planner</strong></div>
      <div>Generated on ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </footer>
  </main>

  <script>
    function downloadHtmlSource() {
      const htmlContent = '<!DOCTYPE html>' + document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '${(trip.destination_name || 'trip').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-dossier.html';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 500);
    }

    ${autoPrint ? `
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto print was blocked or failed:', e);
        }
      }, 350);
    });
    ` : ''}
  </script>
</body>
</html>`;
}

/**
 * Opens the printable dossier in a fresh clean window and triggers the print dialog.
 */
export function openPrintableDossier(trip, autoPrint = true) {
  if (!trip) return;
  const html = generatePrintableDossierHtml(trip, autoPrint);

  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      return true;
    }
  } catch (err) {
    console.warn('window.open failed, falling back to Blob URL:', err);
  }

  // Fallback if popup blocker or sandboxing prevented window.open
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);
    return true;
  } catch (e) {
    console.error('All methods to open dossier failed:', e);
    return false;
  }
}

/**
 * Directly downloads the standalone HTML Dossier file for offline usage.
 */
export function downloadHtmlDossier(trip) {
  if (!trip) return false;
  try {
    const html = generatePrintableDossierHtml(trip, false);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (trip.destination_name || trip.title || 'trip')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    link.download = `${safeTitle || 'itinerary'}-dossier.html`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 300);
    return true;
  } catch (e) {
    console.error('Failed to download HTML dossier:', e);
    return false;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

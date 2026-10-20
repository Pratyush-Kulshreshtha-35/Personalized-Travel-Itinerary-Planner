import json
from datetime import datetime
from typing import Dict, Any
from app.models import TripModel

def export_trip_to_json(trip: TripModel) -> str:
    """Exports trip model into clean indented JSON string."""
    return trip.model_dump_json(indent=2)

def export_trip_to_icalendar(trip: TripModel) -> str:
    """
    Activity 5.2: Export Module - iCalendar .ics generator
    Builds RFC 5545 compliant iCalendar string for Apple Calendar, Google Calendar, Outlook.
    """
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Personalized Travel Itinerary Planner//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{trip.title}",
        f"X-WR-TIMEZONE:UTC"
    ]

    for day in trip.days:
        day_date_str = day.date.replace("-", "") if day.date else datetime.utcnow().strftime("%Y%m%d")
        for act in day.activities:
            # Format time or default
            start_hour = "09"
            start_min = "00"
            if act.start_time and ":" in act.start_time:
                parts = act.start_time.split(":")
                start_hour = parts[0].zfill(2)
                start_min = parts[1].zfill(2)

            dur_mins = act.duration_minutes or 90
            end_total_mins = int(start_hour) * 60 + int(start_min) + dur_mins
            end_hour = str((end_total_mins // 60) % 24).zfill(2)
            end_min = str(end_total_mins % 60).zfill(2)

            dtstart = f"{day_date_str}T{start_hour}{start_min}00"
            dtend = f"{day_date_str}T{end_hour}{end_min}00"

            summary = f"[{act.time_slot}] {act.title}"
            description = (
                f"{act.description or ''}\\n\\n"
                f"Vibe: {act.vibe_match or 'Travel'}\\n"
                f"Estimated Cost: ${act.estimated_cost}\\n"
                f"Insider Tip: {act.insider_tip or 'Enjoy every moment!'}"
            )
            location = act.location_name or trip.destination_name

            lines.append("BEGIN:VEVENT")
            lines.append(f"UID:{act.id or act.title[:10]}@travelplanner.local")
            lines.append(f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}")
            lines.append(f"DTSTART:{dtstart}")
            lines.append(f"DTEND:{dtend}")
            lines.append(f"SUMMARY:{summary}")
            lines.append(f"LOCATION:{location}")
            lines.append(f"DESCRIPTION:{description}")
            if act.latitude and act.longitude:
                lines.append(f"GEO:{act.latitude};{act.longitude}")
            lines.append("STATUS:CONFIRMED")
            lines.append("END:VEVENT")

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)

def export_trip_to_printable_html(trip: TripModel) -> str:
    """
    Activity 5.2: Generates a luxury, high-aesthetic printable HTML dossier.
    """
    days_html = ""
    for day in trip.days:
        acts_html = ""
        for act in day.activities:
            acts_html += f"""
            <div class="activity-row">
                <div class="act-time">
                    <span class="slot-badge">{act.time_slot}</span>
                    <span class="time-range">{act.start_time or '09:00'} - {act.end_time or '11:30'}</span>
                </div>
                <div class="act-details">
                    <h4>{act.title}</h4>
                    <p class="location">📍 {act.location_name}</p>
                    <p class="desc">{act.description or ''}</p>
                    {f'<p class="tip">💡 <strong>Insider Tip:</strong> {act.insider_tip}</p>' if act.insider_tip else ''}
                </div>
                <div class="act-cost">
                    <span class="cost-tag">${float(act.estimated_cost or 0.0):.2f}</span>
                    <span class="vibe-tag">{act.vibe_match or ''}</span>
                </div>
            </div>
            """
        days_html += f"""
        <div class="day-card">
            <div class="day-header">
                <h3>Day {day.day_number} &bull; {day.theme_title}</h3>
                <span class="date-tag">{day.date or ''}</span>
                <span class="cost-summary">Est. Cost: ${float(day.estimated_daily_cost or 0.0):.2f}</span>
            </div>
            {f'<p class="day-notes"><em>{day.daily_notes}</em></p>' if day.daily_notes else ''}
            <div class="activities-container">
                {acts_html}
            </div>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{trip.title} - Personalized Travel Dossier</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1a202c;
            background: #ffffff;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
        }}
        .header-hero {{
            border-bottom: 3px solid #6366f1;
            padding-bottom: 24px;
            margin-bottom: 32px;
        }}
        .badge {{
            display: inline-block;
            background: #eef2ff;
            color: #4f46e5;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 12px;
        }}
        h1 {{ margin: 0 0 10px 0; color: #0f172a; font-size: 28px; }}
        .meta-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px;
            margin-top: 20px;
        }}
        .meta-item {{ font-size: 14px; }}
        .meta-item strong {{ display: block; color: #64748b; font-size: 12px; text-transform: uppercase; }}
        .day-card {{
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            margin-bottom: 28px;
            padding: 20px;
            page-break-inside: avoid;
        }}
        .day-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 12px;
            margin-bottom: 12px;
        }}
        .day-header h3 {{ margin: 0; color: #1e293b; font-size: 18px; }}
        .cost-summary {{ color: #10b981; font-weight: 600; font-size: 14px; }}
        .activity-row {{
            display: grid;
            grid-template-columns: 140px 1fr 100px;
            gap: 16px;
            padding: 12px 0;
            border-bottom: 1px dashed #f1f5f9;
        }}
        .slot-badge {{
            background: #f1f5f9;
            color: #334155;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 4px;
            display: inline-block;
        }}
        .time-range {{ display: block; font-size: 12px; color: #64748b; margin-top: 4px; }}
        .act-details h4 {{ margin: 0 0 4px 0; color: #0f172a; font-size: 15px; }}
        .act-details .location {{ font-size: 13px; color: #475569; margin: 0 0 6px 0; }}
        .act-details .desc {{ font-size: 13px; color: #64748b; margin: 0; }}
        .act-details .tip {{ font-size: 12px; color: #d97706; background: #fffbeb; padding: 6px 10px; border-radius: 6px; margin: 8px 0 0 0; }}
        .cost-tag {{ display: block; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right; }}
        .vibe-tag {{ display: block; font-size: 11px; color: #8b5cf6; text-align: right; margin-top: 4px; }}
        @media print {{
            body {{ padding: 0; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">
            🖨️ Print / Save to PDF
        </button>
    </div>
    <div class="header-hero">
        <span class="badge">{trip.vibe_style} VIBE</span>
        <h1>{trip.title}</h1>
        <p>{trip.summary or ''}</p>
        <div class="meta-grid">
            <div class="meta-item">
                <strong>Destination</strong>
                {trip.destination_name}, {trip.country}
            </div>
            <div class="meta-item">
                <strong>Dates</strong>
                {trip.start_date} to {trip.end_date}
            </div>
            <div class="meta-item">
                <strong>Duration</strong>
                {trip.total_days} Days
            </div>
            <div class="meta-item">
                <strong>Est. Total Budget</strong>
                ${float(trip.total_budget or 0.0):.2f} USD
            </div>
        </div>
    </div>

    {days_html}

    <footer style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        Curated with ❤️ by Personalized Travel Itinerary Planner &bull; Powered by FastAPI & Supabase
    </footer>
</body>
</html>
"""
    return html

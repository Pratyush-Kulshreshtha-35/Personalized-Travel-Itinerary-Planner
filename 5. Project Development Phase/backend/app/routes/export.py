from fastapi import APIRouter, HTTPException, Response
from app.models import TripModel
from app.routes.storage import LOCAL_TRIPS
from app.services.export_service import (
    export_trip_to_json,
    export_trip_to_icalendar,
    export_trip_to_printable_html
)

router = APIRouter(tags=["Export Module"])

def resolve_trip(trip_id: str) -> TripModel:
    if trip_id in LOCAL_TRIPS:
        return LOCAL_TRIPS[trip_id]
    raise HTTPException(status_code=404, detail="Trip not found in active session. Please export directly or save trip first.")

# GET by Trip ID
@router.get("/api/trips/{trip_id}/export/json")
async def export_json_by_id(trip_id: str):
    """Activity 5.2: Export Module - Standard JSON format by Trip ID."""
    trip = resolve_trip(trip_id)
    safe_name = (trip.destination_name or 'trip').lower().replace(' ', '_')
    return Response(
        content=export_trip_to_json(trip),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={safe_name}-{trip_id}.json"}
    )

@router.get("/api/trips/{trip_id}/export/ical")
async def export_ical_by_id(trip_id: str):
    """Activity 5.2: Export Module - iCalendar .ics format for calendar import."""
    trip = resolve_trip(trip_id)
    safe_name = (trip.destination_name or 'trip').lower().replace(' ', '_')
    ics_content = export_trip_to_icalendar(trip)
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename={safe_name}-{trip_id}.ics"}
    )

@router.get("/api/trips/{trip_id}/export/html")
async def export_html_by_id(trip_id: str):
    """Activity 5.2: Export Module - Printable luxury travel dossier (HTML/PDF)."""
    trip = resolve_trip(trip_id)
    html_content = export_trip_to_printable_html(trip)
    return Response(
        content=html_content,
        media_type="text/html"
    )

# POST with Trip Payload (Guarantees zero-404 exports even if local memory restarted or trip is freshly generated)
@router.post("/api/trips/export/json")
async def export_json_payload(trip: TripModel):
    """Activity 5.2: Export Module - Direct JSON export from Trip payload."""
    LOCAL_TRIPS[trip.id] = trip
    safe_name = (trip.destination_name or 'trip').lower().replace(' ', '_')
    return Response(
        content=export_trip_to_json(trip),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={safe_name}-{trip.id}.json"}
    )

@router.post("/api/trips/export/ical")
async def export_ical_payload(trip: TripModel):
    """Activity 5.2: Export Module - Direct iCal export from Trip payload."""
    LOCAL_TRIPS[trip.id] = trip
    safe_name = (trip.destination_name or 'trip').lower().replace(' ', '_')
    ics_content = export_trip_to_icalendar(trip)
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename={safe_name}-{trip.id}.ics"}
    )

@router.post("/api/trips/export/html")
async def export_html_payload(trip: TripModel):
    """Activity 5.2: Export Module - Direct Printable HTML dossier from Trip payload."""
    LOCAL_TRIPS[trip.id] = trip
    html_content = export_trip_to_printable_html(trip)
    return Response(
        content=html_content,
        media_type="text/html"
    )

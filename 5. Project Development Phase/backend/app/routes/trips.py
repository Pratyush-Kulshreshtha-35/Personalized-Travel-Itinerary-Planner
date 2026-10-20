import uuid
import logging
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models import TripModel, DayModel, ActivityModel
from app.supabase_client import get_supabase
from app.routes.storage import LOCAL_TRIPS

logger = logging.getLogger("travel_planner.trips")
router = APIRouter(prefix="/api/trips", tags=["Trip Management"])

def is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError):
        return False

def parse_supabase_trip(row: dict) -> TripModel:
    """Parses a Supabase trips record along with joined days and activities."""
    raw_days = row.get("itinerary_days") or []
    raw_days.sort(key=lambda d: d.get("day_number") or 1)

    parsed_days: List[DayModel] = []
    for d in raw_days:
        raw_acts = d.get("itinerary_activities") or []
        raw_acts.sort(key=lambda a: a.get("order_index") or 0)
        parsed_acts = [
            ActivityModel(
                id=str(a.get("id")),
                time_slot=a.get("time_slot") or "Morning",
                start_time=str(a.get("start_time") or "09:00")[:5],
                end_time=str(a.get("end_time") or "11:30")[:5],
                title=a.get("title") or "Activity",
                description=a.get("description"),
                location_name=a.get("location_name") or "Destination",
                latitude=a.get("latitude"),
                longitude=a.get("longitude"),
                estimated_cost=float(a.get("estimated_cost") or 0.0),
                duration_minutes=int(a.get("duration_minutes") or 90),
                order_index=int(a.get("order_index") or 0),
                activity_type=a.get("activity_type") or "Culture",
                vibe_match=a.get("vibe_match"),
                transit_info_to_next=a.get("transit_info_to_next"),
                booking_url=a.get("booking_url"),
                insider_tip=a.get("insider_tip")
            )
            for a in raw_acts
        ]
        parsed_days.append(
            DayModel(
                id=str(d.get("id")),
                day_number=int(d.get("day_number") or 1),
                date=str(d.get("date")) if d.get("date") else None,
                theme_title=d.get("theme_title") or f"Day {d.get('day_number')}",
                daily_notes=d.get("daily_notes"),
                estimated_daily_cost=float(d.get("estimated_daily_cost") or 0.0),
                activities=parsed_acts
            )
        )

    return TripModel(
        id=str(row.get("id")),
        user_id=str(row.get("user_id")) if row.get("user_id") else None,
        title=row.get("title") or "Travel Itinerary",
        destination_name=row.get("destination_name") or "Global",
        country=row.get("country") or "",
        start_date=str(row.get("start_date") or ""),
        end_date=str(row.get("end_date") or ""),
        total_days=int(row.get("total_days") or len(parsed_days) or 1),
        total_budget=float(row.get("total_budget") or 0.0),
        vibe_style=row.get("vibe_style") or "Curated",
        status=row.get("status") or "planned",
        summary=row.get("summary"),
        cover_image_url=row.get("cover_image_url"),
        days=parsed_days,
        created_at=str(row.get("created_at") or "")
    )

@router.get("", response_model=List[TripModel])
async def list_trips():
    """
    Milestone 5: Activity 5.1 - Trip Save & Management
    Lists all saved trips from Supabase cloud database with local fallback.
    """
    supabase = get_supabase()
    if supabase:
        try:
            res = supabase.table("trips").select("*, itinerary_days(*, itinerary_activities(*))").order("created_at", desc=True).execute()
            if res.data:
                for row in res.data:
                    trip = parse_supabase_trip(row)
                    LOCAL_TRIPS[trip.id] = trip
        except Exception as e:
            logger.warning(f"Error fetching trips from Supabase: {e}")

    return list(LOCAL_TRIPS.values())

@router.post("", response_model=TripModel)
async def create_trip(trip: TripModel):
    """Saves a new trip to the Supabase database along with all its days and activities."""
    if not trip.id or not is_valid_uuid(trip.id):
        trip.id = str(uuid.uuid4())
    if not trip.created_at:
        trip.created_at = datetime.utcnow().isoformat()

    supabase = get_supabase()
    if supabase:
        try:
            # 1. Upsert into trips table
            supabase.table("trips").upsert({
                "id": trip.id,
                "user_id": trip.user_id if trip.user_id and is_valid_uuid(trip.user_id) else None,
                "title": trip.title,
                "destination_name": trip.destination_name,
                "country": trip.country,
                "start_date": trip.start_date,
                "end_date": trip.end_date,
                "total_days": trip.total_days,
                "total_budget": float(trip.total_budget or 0.0),
                "vibe_style": trip.vibe_style,
                "status": trip.status,
                "summary": trip.summary,
                "cover_image_url": trip.cover_image_url,
                "updated_at": datetime.utcnow().isoformat()
            }).execute()

            # 2. Insert days & activities
            for day in trip.days:
                if not day.id or not is_valid_uuid(day.id):
                    day.id = str(uuid.uuid4())

                supabase.table("itinerary_days").upsert({
                    "id": day.id,
                    "trip_id": trip.id,
                    "day_number": day.day_number,
                    "date": day.date if day.date else None,
                    "theme_title": day.theme_title,
                    "daily_notes": day.daily_notes,
                    "estimated_daily_cost": float(day.estimated_daily_cost or 0.0)
                }).execute()

                for act in day.activities:
                    if not act.id or not is_valid_uuid(act.id):
                        act.id = str(uuid.uuid4())

                    supabase.table("itinerary_activities").upsert({
                        "id": act.id,
                        "day_id": day.id,
                        "trip_id": trip.id,
                        "time_slot": act.time_slot or "Morning",
                        "start_time": act.start_time if act.start_time else "09:00",
                        "end_time": act.end_time if act.end_time else "11:30",
                        "title": act.title,
                        "description": act.description,
                        "location_name": act.location_name or trip.destination_name,
                        "latitude": act.latitude,
                        "longitude": act.longitude,
                        "estimated_cost": float(act.estimated_cost or 0.0),
                        "duration_minutes": act.duration_minutes or 90,
                        "order_index": act.order_index or 0,
                        "activity_type": act.activity_type or "Sightseeing",
                        "vibe_match": act.vibe_match,
                        "transit_info_to_next": act.transit_info_to_next or {},
                        "booking_url": act.booking_url,
                        "insider_tip": act.insider_tip
                    }).execute()
        except Exception as e:
            logger.warning(f"Error persisting trip to Supabase: {e}")

    LOCAL_TRIPS[trip.id] = trip
    return trip

@router.get("/{trip_id}", response_model=TripModel)
async def get_trip(trip_id: str):
    if trip_id in LOCAL_TRIPS:
        return LOCAL_TRIPS[trip_id]

    supabase = get_supabase()
    if supabase and is_valid_uuid(trip_id):
        try:
            res = supabase.table("trips").select("*, itinerary_days(*, itinerary_activities(*))").eq("id", trip_id).execute()
            if res.data and len(res.data) > 0:
                trip = parse_supabase_trip(res.data[0])
                LOCAL_TRIPS[trip.id] = trip
                return trip
        except Exception as e:
            logger.warning(f"Error loading trip {trip_id} from Supabase: {e}")

    raise HTTPException(status_code=404, detail="Trip not found")

@router.put("/{trip_id}", response_model=TripModel)
async def update_trip(trip_id: str, updated_trip: TripModel):
    updated_trip.id = trip_id
    supabase = get_supabase()
    if supabase and is_valid_uuid(trip_id):
        try:
            supabase.table("trips").update({
                "title": updated_trip.title,
                "destination_name": updated_trip.destination_name,
                "country": updated_trip.country,
                "total_budget": float(updated_trip.total_budget or 0.0),
                "vibe_style": updated_trip.vibe_style,
                "summary": updated_trip.summary,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", trip_id).execute()
        except Exception as e:
            logger.warning(f"Error updating trip {trip_id} in Supabase: {e}")

    LOCAL_TRIPS[trip_id] = updated_trip
    return updated_trip

@router.delete("/{trip_id}")
async def delete_trip(trip_id: str):
    supabase = get_supabase()
    if supabase and is_valid_uuid(trip_id):
        try:
            supabase.table("trips").delete().eq("id", trip_id).execute()
        except Exception as e:
            logger.warning(f"Error deleting trip {trip_id} from Supabase: {e}")

    if trip_id in LOCAL_TRIPS:
        del LOCAL_TRIPS[trip_id]
        return {"message": "Trip successfully deleted", "id": trip_id}

    return {"message": "Trip deleted from storage", "id": trip_id}

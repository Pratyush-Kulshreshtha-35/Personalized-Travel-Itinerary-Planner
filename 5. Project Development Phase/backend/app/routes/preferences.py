import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models import UserPreferenceInput, UserPreferenceResponse
from app.supabase_client import get_supabase
from app.routes.storage import LOCAL_PREFERENCES

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])

@router.post("", response_model=UserPreferenceResponse)
async def save_user_preferences(prefs: UserPreferenceInput):
    """
    Milestone 3: Activity 3.1 - User Preference Capture
    Saves travel preferences (vibes, budget, style, pace, diet).
    """
    pref_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    response_item = UserPreferenceResponse(
        id=pref_id,
        user_id=prefs.user_id,
        primary_vibe=prefs.primary_vibe,
        secondary_vibes=prefs.secondary_vibes,
        travel_style=prefs.travel_style,
        pace=prefs.pace,
        budget_level=prefs.budget_level,
        daily_budget_usd=prefs.daily_budget_usd,
        dietary_preferences=prefs.dietary_preferences,
        group_type=prefs.group_type,
        must_have_amenities=prefs.must_have_amenities,
        created_at=now
    )

    # Attempt Supabase sync
    supabase = get_supabase()
    if supabase:
        try:
            supabase.table("user_preferences").insert({
                "id": pref_id,
                "user_id": prefs.user_id,
                "primary_vibe": prefs.primary_vibe,
                "secondary_vibes": prefs.secondary_vibes,
                "travel_style": prefs.travel_style,
                "pace": prefs.pace,
                "budget_level": prefs.budget_level,
                "daily_budget_usd": prefs.daily_budget_usd,
                "dietary_preferences": prefs.dietary_preferences,
                "group_type": prefs.group_type,
                "must_have_amenities": prefs.must_have_amenities
            }).execute()
        except Exception as e:
            # Fall back to local store
            pass

    LOCAL_PREFERENCES[pref_id] = response_item
    return response_item

@router.get("/{pref_id}", response_model=UserPreferenceResponse)
async def get_preferences(pref_id: str):
    if pref_id in LOCAL_PREFERENCES:
        return LOCAL_PREFERENCES[pref_id]

    supabase = get_supabase()
    if supabase:
        try:
            res = supabase.table("user_preferences").select("*").eq("id", pref_id).execute()
            if res.data:
                return UserPreferenceResponse(**res.data[0])
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Preferences not found")

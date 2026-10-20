import uuid
import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.supabase_client import get_supabase

logger = logging.getLogger("travel_planner.auth")
router = APIRouter(prefix="/api/auth", tags=["User Authentication & Profiles"])

class UserRegisterRequest(BaseModel):
    email: str
    full_name: str
    password: Optional[str] = None
    avatar_url: Optional[str] = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    home_currency: Optional[str] = "USD"
    preferred_language: Optional[str] = "en"

class UserLoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    home_currency: Optional[str] = "USD"
    preferred_language: Optional[str] = "en"
    created_at: Optional[str] = None

@router.post("/register", response_model=UserProfileResponse)
async def register_user(req: UserRegisterRequest):
    """
    Creates a new user profile in the Supabase `user_profiles` table.
    """
    supabase = get_supabase()
    user_id = str(uuid.uuid4())
    profile_data = {
        "id": user_id,
        "email": req.email.strip().lower(),
        "full_name": req.full_name.strip(),
        "avatar_url": req.avatar_url,
        "home_currency": req.home_currency,
        "preferred_language": req.preferred_language
    }

    if supabase:
        try:
            res = supabase.table("user_profiles").upsert(profile_data, on_conflict="email").execute()
            if res.data and len(res.data) > 0:
                logger.info(f"User profile synced to Supabase: {req.email}")
                return UserProfileResponse(**res.data[0])
        except Exception as e:
            logger.error(f"Error syncing user profile to Supabase: {e}")
            # Fallback to local return
            return UserProfileResponse(**profile_data)

    return UserProfileResponse(**profile_data)

@router.post("/login", response_model=UserProfileResponse)
async def login_user(req: UserLoginRequest):
    """
    Authenticates or retrieves user profile from Supabase `user_profiles`.
    """
    supabase = get_supabase()
    email_clean = req.email.strip().lower()

    if supabase:
        try:
            res = supabase.table("user_profiles").select("*").eq("email", email_clean).execute()
            if res.data and len(res.data) > 0:
                return UserProfileResponse(**res.data[0])
            
            # If user not found, auto-create profile
            new_profile = {
                "id": str(uuid.uuid4()),
                "email": email_clean,
                "full_name": email_clean.split("@")[0].capitalize(),
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
                "home_currency": "USD",
                "preferred_language": "en"
            }
            create_res = supabase.table("user_profiles").upsert(new_profile, on_conflict="email").execute()
            if create_res.data:
                return UserProfileResponse(**create_res.data[0])
        except Exception as e:
            logger.error(f"Error in Supabase login query: {e}")

    # Fallback response
    return UserProfileResponse(
        id=str(uuid.uuid4()),
        email=email_clean,
        full_name=email_clean.split("@")[0].capitalize(),
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    )

@router.get("/profiles", response_model=List[UserProfileResponse])
async def list_profiles():
    """
    Returns all registered user profiles from Supabase.
    """
    supabase = get_supabase()
    if supabase:
        try:
            res = supabase.table("user_profiles").select("*").order("created_at", desc=True).execute()
            return [UserProfileResponse(**p) for p in res.data]
        except Exception as e:
            logger.error(f"Error reading user profiles from Supabase: {e}")
            return []
    return []

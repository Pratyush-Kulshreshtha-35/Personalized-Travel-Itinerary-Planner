import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger("travel_planner.supabase")

_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
        try:
            from supabase import create_client, Client
            _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Successfully connected to Supabase cloud instance.")
            return _supabase_client
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to internal persistence store.")
    
    return None

def is_supabase_connected() -> bool:
    client = get_supabase()
    return client is not None

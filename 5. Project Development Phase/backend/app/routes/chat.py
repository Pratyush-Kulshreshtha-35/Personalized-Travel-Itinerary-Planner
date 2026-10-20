from fastapi import APIRouter
from app.models import ChatRequest, ChatResponse
from app.services.gemini_service import process_travel_chat

router = APIRouter(prefix="/api/chat", tags=["AI Travel Chatbot"])

@router.post("/message", response_model=ChatResponse)
async def chat_message(req: ChatRequest):
    """
    Feature 2: Natural Language Travel Assistant Chatbot
    Accepts plain conversational instructions like 'plan a trip for 100 usd to paris for 5 days',
    extracts the travel parameters, automatically curates the itinerary with Gemini AI,
    and returns an interactive response with the attached trip dossier.
    """
    return process_travel_chat(req)

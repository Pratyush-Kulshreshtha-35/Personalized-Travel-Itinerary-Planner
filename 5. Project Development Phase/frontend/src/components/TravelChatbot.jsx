import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Calendar,
  DollarSign,
  MapPin,
  ArrowRight,
  Bot,
  User,
  Check,
  RefreshCw,
  Compass,
  Zap,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  'Plan a trip for 100 usd to paris for 5 days',
  'Tokyo 7-day foodie & cyberpunk tour on $160/day',
  'Plan 4 days in Bali for $60/day with wellness',
  'Swiss Alps 4-day scenic adventure trip'
];

export default function TravelChatbot({
  isOpen,
  onToggleOpen,
  onLoadTripIntoPlanner,
  activeTrip
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        '👋 Welcome to **Personalized Travel Itinerary Planner**! Your AI-Powered Travel Experience companion. Give me an order like **"Plan a trip for 100 usd to paris for 5 days"** or ask for recommendations for any city in the world.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadedTripIds, setLoadedTripIds] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const historyForApi = messages
        .filter((m) => m.id !== 'welcome-msg')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await api.sendChatMessage({
        message: text,
        conversation_history: historyForApi
      });

      const assistantMsg = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: response.reply,
        action_type: response.action_type,
        trip: response.trip,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error('Chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: 'Sorry, I hit a momentary snag. Please try asking again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadTrip = (trip) => {
    if (onLoadTripIntoPlanner) {
      onLoadTripIntoPlanner(trip);
      setLoadedTripIds((prev) => ({ ...prev, [trip.id]: true }));
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        content:
          '✨ Chat history reset! How can I curate your next trip? Try: **"Plan a trip for 100 usd to paris for 5 days"**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* 1. Floating Launcher Button in Bottom Right */}
      {!isOpen && (
        <button
          id="btn-chatbot-launcher"
          className="chatbot-launcher-floating"
          onClick={onToggleOpen}
          aria-label="Open AI Travel Chatbot"
        >
          <div className="launcher-pulse-ring"></div>
          <div className="launcher-icon">
            <Sparkles size={22} />
          </div>
          <div className="launcher-text-pill">
            <span className="pill-dot"></span>
            <span>AI Travel Assistant</span>
          </div>
        </button>
      )}

      {/* 2. Floating Chat Drawer / Window */}
      {isOpen && (
        <div className={`chatbot-window-floating ${isExpanded ? 'expanded' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">
                <Sparkles size={18} />
                <span className="bot-online-indicator"></span>
              </div>
              <div>
                <h4>Personalized Travel Itinerary Planner</h4>
                <span className="bot-status-tag">AI-Powered Travel Experience &bull; Gemini 2.5</span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-icon-btn"
                onClick={clearChat}
                title="Clear Conversation"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                className="chat-icon-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore Size' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                className="chat-icon-btn"
                onClick={onToggleOpen}
                title="Close Assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="chat-messages-container">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              const hasTrip = m.trip && m.trip.days && m.trip.days.length > 0;
              const isTripLoaded = m.trip && loadedTripIds[m.trip.id];

              return (
                <div key={m.id} className={`chat-message-row ${isUser ? 'user-row' : 'bot-row'}`}>
                  {!isUser && (
                    <div className="message-avatar bot-avatar-mini">
                      <Bot size={14} />
                    </div>
                  )}

                  <div className="message-bubble-wrapper">
                    <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
                      {/* Formatted Text with bold support */}
                      <p className="bubble-text">{m.content}</p>

                      {/* Interactive Trip Card inside AI response */}
                      {hasTrip && (
                        <div className="chat-trip-preview-card">
                          <div className="chat-trip-card-cover">
                            <img
                              src={
                                m.trip.cover_image_url ||
                                'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
                              }
                              alt={m.trip.destination_name}
                            />
                            <div className="chat-trip-cover-overlay"></div>
                            <div className="chat-trip-badge">
                              <Sparkles size={12} />
                              <span>AI Generated Itinerary</span>
                            </div>
                          </div>

                          <div className="chat-trip-card-body">
                            <h5>{m.trip.title}</h5>
                            <div className="chat-trip-stats-row">
                              <span className="stat-pill">
                                <Calendar size={12} />
                                {m.trip.total_days} Days
                              </span>
                              <span className="stat-pill">
                                <DollarSign size={12} />${m.trip.total_budget} Total
                              </span>
                              <span className="stat-pill vibe-stat">
                                <Compass size={12} />
                                {m.trip.vibe_style?.split('(')[0] || 'Curated Vibe'}
                              </span>
                            </div>

                            {/* Day preview highlights */}
                            <div className="chat-trip-days-preview">
                              {m.trip.days?.slice(0, 3).map((d) => (
                                <div key={d.id || d.day_number} className="chat-day-line">
                                  <span className="day-number-tag">Day {d.day_number}</span>
                                  <span className="day-title-text">{d.theme_title?.replace(/Day \d+:\s*/, '')}</span>
                                </div>
                              ))}
                              {m.trip.days?.length > 3 && (
                                <div className="chat-days-more">
                                  + {m.trip.days.length - 3} more curated days
                                </div>
                              )}
                            </div>

                            {/* Load into Planner Action Button */}
                            <button
                              type="button"
                              className={`btn ${isTripLoaded ? 'btn-success' : 'btn-primary'} chat-load-trip-btn`}
                              onClick={() => handleLoadTrip(m.trip)}
                            >
                              {isTripLoaded ? (
                                <>
                                  <Check size={15} />
                                  <span>Active in Planner!</span>
                                </>
                              ) : (
                                <>
                                  <span>Load Into Itinerary Planner</span>
                                  <ArrowRight size={15} />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <span className="bubble-timestamp">{m.timestamp}</span>
                    </div>
                  </div>

                  {isUser && (
                    <div className="message-avatar user-avatar-mini">
                      <User size={14} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="chat-message-row bot-row">
                <div className="message-avatar bot-avatar-mini">
                  <Bot size={14} />
                </div>
                <div className="message-bubble bot-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-label">Gemini AI is crafting your trip...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="chat-quick-prompts-bar">
            <span className="quick-label">Try Asking:</span>
            <div className="quick-scroll-row">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-prompt-pill"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isTyping}
                >
                  <span>{prompt}</span>
                  <ChevronRight size={12} />
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="chat-input-bar">
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. Plan a trip for 100 usd to paris for 5 days..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              type="button"
              className="chat-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

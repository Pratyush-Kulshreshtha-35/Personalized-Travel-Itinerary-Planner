# Personalized Travel Itinerary Planner 🌍✈️

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-8E75B2?logo=google&logoColor=white)](https://aistudio.google.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Render](https://img.shields.io/badge/Render-Deployment-46E3B7?logo=render&logoColor=white)](https://render.com)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=white)](https://vercel.com)

A state-of-the-art **Personalized Travel Itinerary Planner** that transforms your abstract travel desires ("chill sunsets", "high-adrenaline adventure", "Michelin street foodie", "deep cultural immersion") into day-by-day, geographically optimized, and budget-conscious travel itineraries powered by **Google Gemini AI**.

---

## ✨ Key Features

- 🤖 **Google Gemini 2.5 Flash AI**: Automatic natural-language itinerary generation, vibe prompt crafting, and real-time personalized schedule adaptations.
- 🎯 **Vibe & Preference Engine**: Multi-dimensional scoring evaluating pace, budget, travel companion style, and niche vibes.
- 🗺️ **AI Destination Recommendation**: Match percentage calculation and detailed suitability analysis for world destinations.
- 📅 **Dynamic Itinerary Builder**: Comprehensive morning-to-night timeline scheduling with activity duration, estimated costs, and local insider tips.
- ⚡ **Route & Time Optimization**: Geographic clustering and 2-opt TSP route solver minimizing daily transit times.
- 🎛️ **Vibe-Based Personalization**: Real-time slider adaptation (+40% Adventure, Sunset & Chill Mode, Deep Culture).
- 💾 **Trip Save & Management**: Save, edit, duplicate, and archive itineraries with Supabase PostgreSQL cloud sync.
- 📤 **Multi-Format Export Module**: One-click download of `.ics` calendar events (Apple/Google Calendar), raw JSON, or printable luxury PDF dossiers.


---

## 📂 Folder Structure

```
PERSONALIZED TRAVEL ITINERARY PLANNER/
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── supabase_client.py
│   │   ├── models.py
│   │   ├── routes/
│   │   │   ├── preferences.py
│   │   │   ├── recommendations.py
│   │   │   ├── itineraries.py
│   │   │   ├── trips.py
│   │   │   └── export.py
│   │   └── services/
│   │       ├── recommendation_service.py
│   │       ├── itinerary_service.py
│   │       ├── route_optimizer.py
│   │       ├── vibe_engine.py
│   │       └── export_service.py
│   ├── database/
│   │   └── schema.sql                # Supabase PostgreSQL DDL & Seed Data
│   ├── requirements.txt              # FastAPI dependencies
│   ├── .env.example
│   └── main.py                       # FastAPI Application Entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/               # UI Component Hierarchy
│   │   ├── services/                 # API & Supabase Client
│   │   ├── App.jsx                   # Main Application Shell
│   │   ├── index.css                 # Bespoke Glassmorphism Design System
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── .gitignore
├── API.md                            # OpenAPI / REST Endpoints
├── ARCHITECTURE.md                   # System Architecture & Mermaid Diagrams
├── DEPLOYMENT.md                     # Render & Vercel Deployment Guide
├── PROJECT_COMPLETION.md             # 7-Milestone Verification Report
├── README.md                         # Project Overview
├── render.yaml                       # Render Infrastructure Blueprint
└── SETUP.md                          # Local Development Guide
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+ & **npm**
- **Python** 3.10+ & **pip**
- (Optional) Free account at [supabase.com](https://supabase.com)

### 2. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 3. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🗄️ Database Setup (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and paste the code from [`backend/database/schema.sql`](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/backend/database/schema.sql).
3. Copy your project credentials into `backend/.env` and `frontend/.env`.

---

## 📖 Complete Documentation Links
- 📘 [Developer Setup Guide (`SETUP.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/SETUP.md)
- 🔌 [REST API Documentation (`API.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/API.md)
- 🏗️ [System Architecture & ERD (`ARCHITECTURE.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/ARCHITECTURE.md)
- 🚀 [Production Deployment (`DEPLOYMENT.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/DEPLOYMENT.md)
- 🏆 [Milestone Completion Report (`PROJECT_COMPLETION.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/PROJECT_COMPLETION.md)
- ⚙️ [Render Blueprint (`render.yaml`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/render.yaml)

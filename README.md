# Personalized Travel Itinerary Planner 🌍✈️

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-8E75B2?logo=google&logoColor=white)](https://aistudio.google.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Live%20Demo-black?logo=vercel&logoColor=white)](https://personalized-travel-itinerary-plann-lac.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A state-of-the-art **Personalized Travel Itinerary Planner** that transforms your abstract travel desires ("chill sunsets", "high-adrenaline adventure", "Michelin street foodie", "deep cultural immersion") into day-by-day, geographically optimized, and budget-conscious travel itineraries powered by **Google Gemini AI**.

---

## 🔗 Quick Links

- 🌐 **Live Application**: [https://personalized-travel-itinerary-plann-lac.vercel.app/](https://personalized-travel-itinerary-plann-lac.vercel.app/)
- 🐙 **GitHub Repository**: [https://github.com/Pratyush-Kulshreshtha-35/Personalized-Travel-Itinerary-Planner](https://github.com/Pratyush-Kulshreshtha-35/Personalized-Travel-Itinerary-Planner)
- 🎥 **Video Demonstration**: [Watch Video Demo](https://drive.google.com/file/d/1_ybPblR5YJTY-4poagXpQloV_GE0qdKe/view?usp=sharing)

---

## ✨ Key Features

- 🤖 **Google Gemini 2.5 Flash AI**: Automatic natural-language itinerary generation, vibe prompt crafting, and real-time personalized schedule adaptations.
- 🎯 **Vibe & Preference Engine**: Multi-dimensional scoring evaluating pace, budget, travel companion style, and niche vibes.
- 🗺️ **AI Destination Recommendation**: Match percentage calculation and detailed suitability analysis for world destinations.
- 📅 **Dynamic Itinerary Builder**: Comprehensive morning-to-night timeline scheduling with activity duration, estimated costs, and local insider tips.
- ⚡ **Route & Time Optimization**: Geographic clustering and 2-opt TSP route solver minimizing daily transit times.
- 🎛️ **Vibe-Based Personalization**: Real-time slider adaptation (+40% Adventure, Sunset & Chill Mode, Deep Culture).
- 💬 **Interactive AI Travel Chatbot**: Conversational travel assistant to answer trip queries and refine plans dynamically.
- 💾 **Trip Save & Management**: Save, edit, duplicate, and archive itineraries with Supabase PostgreSQL cloud sync.
- 📤 **Multi-Format Export Module**: One-click download of `.ics` calendar events (Apple/Google Calendar), raw JSON, or printable luxury PDF dossiers.

---

## 📂 Folder Structure

```
PERSONALIZED TRAVEL ITINERARY PLANNER/
├── 1. Brainstorming & Ideation/      # Ideation notes & problem statements
├── 2. Requirement Analysis/          # Functional & non-functional requirements
├── 3. Project Design Phase/          # UI wireframes, system diagrams & architecture
├── 4. Project Planning Phase/        # Milestones, task breakdown & timelines
├── 5. Project Development Phase/     # Core Application Source Code
│   ├── backend/                      # FastAPI Python Application
│   │   ├── app/
│   │   │   ├── config.py             # Environment configurations
│   │   │   ├── models.py             # Pydantic schemas & data models
│   │   │   ├── supabase_client.py    # Supabase PostgreSQL client
│   │   │   ├── routes/               # API Endpoints
│   │   │   │   ├── auth.py           # Authentication routes
│   │   │   │   ├── chat.py           # AI Chatbot endpoint
│   │   │   │   ├── export.py         # PDF, ICS & JSON exports
│   │   │   │   ├── itineraries.py    # Itinerary management
│   │   │   │   ├── preferences.py    # User vibe & preferences
│   │   │   │   ├── recommendations.py# Destination recommendations
│   │   │   │   ├── storage.py        # Cloud media storage
│   │   │   │   └── trips.py          # Saved trips CRUD
│   │   │   └── services/             # Core Business & AI Logic
│   │   │       ├── export_service.py # PDF / ICS generator
│   │   │       ├── gemini_service.py # Google Gemini 2.5 Flash integration
│   │   │       ├── itinerary_service.py # Itinerary generation & scheduling
│   │   │       ├── recommendation_service.py # AI match scoring
│   │   │       ├── route_optimizer.py # 2-opt TSP distance optimizer
│   │   │       └── vibe_engine.py    # Multi-dimensional vibe engine
│   │   ├── database/
│   │   │   └── schema.sql            # Supabase PostgreSQL DDL & Seed Data
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── .env.example              # Backend environment template
│   │   └── main.py                   # FastAPI Application Entrypoint
│   └── frontend/                     # React (Vite) Web Application
│       ├── src/
│       │   ├── components/           # Glassmorphic UI Components
│       │   ├── services/             # API & Supabase Client
│       │   ├── utils/                # Helper utilities
│       │   ├── App.jsx               # Main React Application
│       │   ├── index.css             # Glassmorphism Design System
│       │   └── main.jsx              # React Entrypoint
│       ├── package.json              # NPM dependencies & scripts
│       ├── vite.config.js            # Vite configuration
│       └── index.html                # HTML entrypoint
├── 6. Project Testing/               # Test suites, unit tests & QA reports
├── 7. Project Documentation/         # Comprehensive project docs & user guides
├── 8. Project Demonstration/         # Demo slides, scripts & presentation assets
├── API.md                            # OpenAPI / REST Endpoints
├── ARCHITECTURE.md                   # System Architecture & Mermaid Diagrams
├── DEPLOYMENT.md                     # Render & Vercel Deployment Guide
├── README.md                         # Project Overview
├── render.yaml                       # Render Cloud Blueprint
└── SETUP.md                          # Local Development Guide
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Pratyush-Kulshreshtha-35/Personalized-Travel-Itinerary-Planner.git
cd Personalized-Travel-Itinerary-Planner
```

### 2. Backend Setup (FastAPI)
```bash
cd "5. Project Development Phase/backend"

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload --port 8000
```
- **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 3. Frontend Setup (React + Vite)
Open a new terminal window:
```bash
cd "5. Project Development Phase/frontend"

# Install dependencies
npm install

# Start the development server
npm run dev
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)

---

## 🗄️ Database Setup (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the SQL code from [`5. Project Development Phase/backend/database/schema.sql`](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/5.%20Project%20Development%20Phase/backend/database/schema.sql).
4. Configure your credentials in:
   - `5. Project Development Phase/backend/.env`
   - `5. Project Development Phase/frontend/.env`

---

## 📖 Documentation Links
- 🌐 [Live Deployment](https://personalized-travel-itinerary-plann-lac.vercel.app/)
- 🎥 [Video Demonstration](https://drive.google.com/file/d/1_ybPblR5YJTY-4poagXpQloV_GE0qdKe/view?usp=sharing)
- 📘 [Developer Setup Guide (`SETUP.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/SETUP.md)
- 🔌 [REST API Documentation (`API.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/API.md)
- 🏗️ [System Architecture & Diagrams (`ARCHITECTURE.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/ARCHITECTURE.md)
- 🚀 [Production Deployment Guide (`DEPLOYMENT.md`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/DEPLOYMENT.md)
- ⚙️ [Render Cloud Blueprint (`render.yaml`)](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/render.yaml)

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

**By - Pratyush Kulshreshtha**

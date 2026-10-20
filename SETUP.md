# Developer Setup Guide: Personalized Travel Itinerary Planner

Welcome to the **Personalized Travel Itinerary Planner** codebase. This guide covers setup from Milestone 1 through Milestone 7 for local development and cloud production.

---

## Milestone 1: Vibe Coding Environment Setup

### Activity 1.1: Install Cursor IDE, Node.js, and Set Up GitHub Repo
1. **Cursor IDE Setup**:
   - Download and install Cursor from [cursor.com](https://cursor.com/download).
   - Sign in and configure your preferred AI model (Claude 3.5 Sonnet / GPT-4o / Gemini).
2. **Node.js Installation**:
   - Ensure Node.js (v18.0.0 or higher) and npm are installed:
     ```bash
     node -v
     npm -v
     ```
3. **Python Installation**:
   - Ensure Python 3.10+ is installed:
     ```bash
     python --version
     ```
4. **Git Repository Setup**:
   - Initialize git tracking and commit:
     ```bash
     git init
     git add .
     git commit -m "feat: initial commit with travel planner architecture"
     ```

### Activity 1.2: Enable AI Coding Tools
- Open Cursor IDE and press `Ctrl+L` (or `Cmd+L`) to launch the Cursor AI Chat, and `Ctrl+K` for in-line edits.
- Use prompt templates provided in `backend/app/services/prompt_templates.py` to instruct AI generation of vibe-aligned recommendations and schedules.

### Activity 1.3: Generate Folder Structure
The repository structure is organized as follows:
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
│   │   └── schema.sql
│   ├── requirements.txt
│   ├── .env.example
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PreferenceForm.jsx
│   │   │   ├── RecommendationGrid.jsx
│   │   │   ├── DestinationCard.jsx
│   │   │   ├── ItineraryBuilder.jsx
│   │   │   ├── RouteOptimizerView.jsx
│   │   │   ├── VibeCustomizer.jsx
│   │   │   ├── SavedTrips.jsx
│   │   │   ├── ExportModal.jsx
│   │   │   └── SupabaseStatusModal.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── .gitignore
├── API.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── PROJECT_COMPLETION.md
├── README.md
├── render.yaml
└── SETUP.md
```

---

## Milestone 2: Supabase Database Setup

### Activity 2.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Select your nearest database region and set a strong database password.

### Activity 2.2: Create Tables via SQL Editor
1. In your Supabase dashboard, navigate to **SQL Editor**.
2. Click **New query** and copy the complete contents of [`backend/database/schema.sql`](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/backend/database/schema.sql).
3. Click **Run**. This creates:
   - `user_profiles`
   - `user_preferences`
   - `destinations` (with initial curated seed data)
   - `trips`
   - `itinerary_days`
   - `itinerary_activities`
   - `saved_recommendations`
   - RLS security policies & auto-updating timestamp triggers.

### Activity 2.3: Store API Keys in `.env`
1. In Supabase, go to **Project Settings** > **API**.
2. Copy your **Project URL** and **anon public key** (and optionally **service_role key**).
3. Create `backend/.env`:
   ```ini
   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-service-role-or-anon-key
   PORT=8000
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ENVIRONMENT=development

   # Google Gemini API Integration (Free at https://aistudio.google.com)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Create `frontend/.env`:
   ```ini
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Activity 2.4: Google Gemini AI Setup (Free)
1. Navigate to [Google AI Studio](https://aistudio.google.com/app/apikey) and click **Create API Key**.
2. Copy your key and add it to `backend/.env`:
   ```ini
   GEMINI_API_KEY=AIzaSy...
   ```
3. The backend uses the official `google-genai` SDK and `gemini-2.5-flash` model to generate dynamic day-by-day itineraries and handle vibe adjustments.
4. *(Resilient Fallback)*: If no Gemini key is provided, the backend seamlessly switches to its built-in curated heuristic engine, guaranteeing 100% uptime with zero crashes.


---

## Local Development Execution

### 1. Run the FastAPI Backend
```bash
# Navigate to backend and install dependencies
cd backend
pip install -r requirements.txt

# Start FastAPI development server with hot-reload
uvicorn main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Run the React Vite Frontend
```bash
# In another terminal window:
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

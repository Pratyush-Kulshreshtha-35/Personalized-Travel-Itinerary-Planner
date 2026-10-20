# Production Deployment Guide: Personalized Travel Itinerary Planner

This guide covers full deployment procedures for **Milestone 6: Deployment** (Activity 6.1 and Activity 6.2) targeting **Render** and **Vercel**.

---

## 1. Overview of Deployment Architecture

| Tier | Service | Provider | Configuration File |
| :--- | :--- | :--- | :--- |
| **Backend API** | FastAPI (Python 3.11) | Render (Web Service) | [`render.yaml`](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/render.yaml) |
| **Frontend SPA** | React 18 + Vite | Vercel / Render Static | `vercel.json` / `render.yaml` |
| **Database & Auth**| PostgreSQL | Supabase | [`backend/database/schema.sql`](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/backend/database/schema.sql) |

---

## 2. Milestone 6.2: Deploy Backend to Render

### Option A: Automated Deployment via `render.yaml`
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New** > **Blueprint**.
3. Connect your GitHub repository.
4. Render will parse [`render.yaml`](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/render.yaml) and automatically configure the `travel-planner-api` service.

### Option B: Manual Web Service Setup
1. Click **New** > **Web Service**.
2. Select your repository.
3. Configure the service settings:
   - **Name**: `travel-planner-api`
   - **Language**: `Python`
   - **Branch**: `main`
   - **Root Directory**: (Leave blank or set to `.`)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_KEY`: `your-supabase-service-key`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:5173`
   - `ENVIRONMENT`: `production`
5. Click **Create Web Service**.

---

## 3. Milestone 6.1: Deploy Frontend to Vercel (or Render)

### Deploying Frontend to Vercel
1. Install Vercel CLI (optional) or navigate to [vercel.com](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Set the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variables:
   - `VITE_API_URL`: `https://travel-planner-api.onrender.com`
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
6. Click **Deploy**.

### Alternative: Deploying Frontend to Render Static Site
If you prefer hosting both services on Render, [`render.yaml`](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/render.yaml) already declares the static frontend site:
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Rewrite Rule**: `/*` -> `/index.html`

---

## 4. Supabase Cloud Database Migration
1. Log in to [Supabase](https://supabase.com/dashboard).
2. Open **SQL Editor**.
3. Paste the contents of [`backend/database/schema.sql`](file:///c:/Users/praty/OneDrive/Desktop/Personalized%20Travel%20Itinerary%20Planner/backend/database/schema.sql) and execute.
4. Verify all 7 tables (`user_profiles`, `user_preferences`, `destinations`, `trips`, `itinerary_days`, `itinerary_activities`, `saved_recommendations`) are populated.

---

## 5. Post-Deployment Verification Checklist
- [ ] Backend health check returns 200: `https://travel-planner-api.onrender.com/api/health`
- [ ] Swagger API docs load: `https://travel-planner-api.onrender.com/docs`
- [ ] Frontend connects smoothly to backend without CORS warnings.
- [ ] Creating an itinerary saves correctly to Supabase database.
- [ ] Export module generates valid PDF view and `.ics` calendar files.

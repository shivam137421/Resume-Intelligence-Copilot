# ANTIGRAVITY_SETUP.md — RESUMESYNC SETUP & CONFIGURATION GUIDE

This document provides step-by-step instructions for configuring all external services, environment variables, Supabase PostgreSQL schemas, and deployment targets for **ResumeSync (Resume Intelligence Copilot)**.

---

## 1. Environment Variables Matrix (`.env`)

The project uses `.env` for local configuration. A clean `.env.example` is provided in the repository with safe placeholders.

| Variable Name | Client / Server | Required / Optional | Description | Where to Obtain |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Server | Required | Express API port (Default: `3001`) | Configured locally in `.env` |
| `NODE_ENV` | Server | Required | Environment mode (`development` or `production`) | Local configuration |
| `GEMINI_API_KEY` | Server | Optional (Live LLM) | Google Gemini 2.5 Flash API Key for conversational copilot, JD parsing, and OCR | [Google AI Studio](https://aistudio.google.com/) |
| `VITE_SUPABASE_URL` | Client & Server | **Required** (Cloud DB) | Supabase Project URL | [Supabase Dashboard -> Settings -> API](https://supabase.com/dashboard) |
| `VITE_SUPABASE_ANON_KEY` | Client (Public) | **Required** (Cloud DB) | Supabase Public Anonymous API Key | Supabase Dashboard -> Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (Secret) | Optional (Admin Ops) | Supabase Admin Service Role Key (Never expose to frontend) | Supabase Dashboard -> Settings -> API |
| `GOOGLE_CLIENT_ID` | Server | Optional (OAuth) | Google OAuth 2.0 Client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Server (Secret) | Optional (OAuth) | Google OAuth 2.0 Client Secret | [Google Cloud Console](https://console.cloud.google.com/) |

> [!NOTE]
> **Zero-Crash Graceful Fallback**: If `GEMINI_API_KEY` is not provided, the platform automatically utilizes its built-in heuristic analysis engine, local AST rules, and deterministic scoring calculations without breaking or throwing unhandled exceptions.

---

## 2. Supabase PostgreSQL Database & Auth Setup

### Step 1: Create Supabase Project
1. Navigate to [Supabase](https://supabase.com/) and create a new project.
2. Note your **Project URL** and **Anon Key** from `Project Settings -> API`.

### Step 2: Run Database Migrations
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Open `supabase/schema.sql` in this repository.
3. Paste the entire SQL script into the query window and click **Run**.
4. This script automatically creates:
   - `profiles` table (linked to `auth.users` with automated signup trigger)
   - `resumes` table (JSONB schema with primary key UUID)
   - `resume_versions` table (targeted role snapshots)
   - `content_library` table (reusable career achievements)
   - `jd_analyses` table (job requirement extracts)
   - `job_applications` table (application history tracker)
   - `user_settings` table (custom preferences)
   - **Row Level Security (RLS)** policies ensuring users can only read and write their own data.

### Step 3: Configure Authentication Providers
1. In Supabase Dashboard, go to **Authentication -> Providers**.
2. **Email**: Ensure Email provider is enabled. (Optionally disable "Confirm Email" for instant development testing).
3. **Google OAuth (Optional)**: Enable Google provider and paste your `Client ID` and `Client Secret` obtained from Google Cloud Console. Set Authorized Redirect URI to `https://<your-supabase-project>.supabase.co/auth/v1/callback`.

---

## 3. Google Gemini AI API Configuration

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API Key** -> **Create API Key**.
3. Copy the generated key.
4. Add it to your `.env` file:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Restart your backend server (`npm run dev:server`).

---

## 4. Local Development & Run Instructions

```bash
# 1. Install all dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your Supabase credentials in .env

# 3. Start fullstack development server (Frontend + Backend concurrently)
npm run dev

# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

---

## 5. Production Build & Deployment

```bash
# 1. Build client bundle and server TypeScript files
npm run build
npm run build:server

# 2. Run production server
npm start
```

### Deploying to Vercel / Netlify / Render / Railway
- **Frontend (Vercel/Netlify)**: Set Root Directory to `./`, Build Command: `npm run build`, Output Directory: `dist`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Environment Variables.
- **Backend (Render/Railway/Docker)**: Set Build Command: `npm install && npm run build:server`, Start Command: `npm start`. Add all server environment variables to the hosting service.

---

## 6. Security Hygiene & Matrix Boundaries

- **Client vs Server Boundary**: Only variables prefixed with `VITE_` are bundled into the client build. All secret keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_SECRET`) remain strictly on the backend Node.js runtime.
- **Git Secrecy**: Never commit `.env` or any file containing real API keys or service role secrets. `.gitignore` strictly protects `.env` and `.env.*`.
- **Public Key Safety**: `VITE_SUPABASE_ANON_KEY` is public by design and is governed by PostgreSQL Row Level Security (RLS) policies.

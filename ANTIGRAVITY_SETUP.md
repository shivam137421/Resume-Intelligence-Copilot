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

#### A. Email Authentication
1. In Supabase Dashboard, navigate to **Authentication -> Providers -> Email**.
2. Ensure the Email provider is enabled.
3. For local development, you may optionally toggle "Confirm email" off to allow instant sign-in without waiting for email verification links.

#### B. Google OAuth 2.0 Social Authentication Integration
ResumeSync supports one-click Google OAuth authentication powered by Supabase Auth and Google Cloud Platform OAuth 2.0.

1. **Create Google Cloud Credentials**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project (e.g., `resumesync-copilot`) or select an existing project.
   - Go to **APIs & Services -> OAuth consent screen**:
     - User Type: **External** -> Click **Create**.
     - App Information: Enter App name (`ResumeSync Copilot`) and User support email.
     - Developer contact information: Enter your email address.
     - Scopes: Add `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
     - Save and continue through the remaining steps.
   - Go to **APIs & Services -> Credentials**:
     - Click **+ CREATE CREDENTIALS** -> Select **OAuth client ID**.
     - Application type: **Web application**.
     - Name: `ResumeSync Web Client`.
     - **Authorized JavaScript origins**:
       - `http://localhost:5173`
       - `http://localhost:3001`
       - *(Production)*: `https://your-production-domain.vercel.app`
     - **Authorized redirect URIs**:
       - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
       *(Copy your exact Supabase project reference from the Supabase Dashboard URL)*
     - Click **Create**.
     - Note down the generated **Client ID** and **Client Secret**.

2. **Configure Provider in Supabase**:
   - In the Supabase Dashboard, go to **Authentication -> Providers -> Google**.
   - Toggle **Enable Google provider** to ON.
   - Enter your **Client ID** from Google Cloud Console.
   - Enter your **Client Secret** from Google Cloud Console.
   - Under **Authorized Client IDs** (optional), ensure your Client ID is listed.
   - Click **Save**.

3. **Configure URL Redirect Rules in Supabase**:
   - Go to **Authentication -> URL Configuration**.
   - Set **Site URL** to: `http://localhost:5173` (or your production URL).
   - In **Redirect URLs**, add:
     - `http://localhost:5173`
     - `http://localhost:5173/**`
     - `https://your-production-domain.vercel.app/**`
   - Click **Save**.

4. **Frontend OAuth Flow & Zero-Secret Security Matrix**:
   - When the user clicks **Continue with Google**, the client calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
   - The browser redirects to Google's consent screen and returns to Supabase's secure callback endpoint (`https://<project-ref>.supabase.co/auth/v1/callback`).
   - Supabase completes the OAuth 2.0 PKCE code exchange and redirects back to ResumeSync with session credentials.
   - The application parses redirect parameters, extracts Google user profile metadata (`full_name`, `email`, and `picture` / `avatar_url`), updates local session persistence (`ai_resume_auth_session`), and sanitizes the browser URL bar using `history.replaceState`.
   - **Zero Secret Exposure**: The `GOOGLE_CLIENT_SECRET` is stored strictly within Supabase Cloud backend and Google Cloud Console. It is **never** embedded in client-side code, `.env` client variables, or git-tracked files.

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

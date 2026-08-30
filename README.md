# Resume Intelligence Copilot (ResumeSync)

An intelligent, AI-powered conversational resume builder, LaTeX editor, and career intelligence platform.

---

## 📌 Project Overview

**Resume Intelligence Copilot** is designed to progressively build a full-featured resume workspace combining:
- Context-aware Conversational AI Copilot
- Overleaf-style bidirectional LaTeX editing & compilation
- 10-Tier deterministic ATS Resume Match Scoring
- Multi-source profile ingestion (GitHub repositories, LeetCode, Codeforces, CodeChef, GeeksforGeeks)
- Pre-export link validation and production PDF generation
- Supabase PostgreSQL persistence with Row Level Security (RLS)

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, Lucide Icons.
- **Backend API**: Node.js, Express, TypeScript.
- **AI Integration**: Google Gemini API (`@google/generative-ai`) with heuristic fallback.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS).

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start development server
npm run dev
```

---

## 🔒 Security & Privacy

- Client variables use public Supabase Anon key governed by Row Level Security (RLS).
- Server secrets are kept strictly server-side.
- Zero unauthorized AI hallucinations.

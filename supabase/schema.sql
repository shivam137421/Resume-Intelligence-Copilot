-- ===================================================
-- AI RESUME WORKSPACE — SUPABASE POSTGRESQL SCHEMA & RLS
-- ===================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  headline TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  github_username TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  template_id TEXT NOT NULL DEFAULT 'ats-minimal',
  header JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT DEFAULT '',
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  projects JSONB NOT NULL DEFAULT '[]'::jsonb,
  certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  styling JSONB NOT NULL DEFAULT '{}'::jsonb,
  latex_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESUME VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  target_company TEXT,
  target_role TEXT,
  score INTEGER,
  resume_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SMART CONTENT LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'experience', 'project', 'education', 'certification', 'skill', 'achievement'
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. JOB DESCRIPTIONS & ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.jd_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  extracted_requirements JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. APPLICATION / JOB HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  resume_version_id UUID REFERENCES public.resume_versions(id) ON DELETE SET NULL,
  match_score INTEGER,
  applied_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  default_template TEXT DEFAULT 'ats-minimal',
  ai_model_preference TEXT DEFAULT 'gemini-2.5-flash',
  auto_save_enabled BOOLEAN DEFAULT TRUE,
  export_page_limit INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jd_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Resumes RLS
CREATE POLICY "Users can manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Resume Versions RLS
CREATE POLICY "Users can manage own resume versions" ON public.resume_versions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Content Library RLS
CREATE POLICY "Users can manage own content library" ON public.content_library FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- JD Analyses RLS
CREATE POLICY "Users can manage own JD analyses" ON public.jd_analyses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Job History RLS
CREATE POLICY "Users can manage own job history" ON public.job_applications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Settings RLS
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================================================
-- INDEXES FOR PERFORMANCE & JSONB SEARCH
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON public.resume_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_content_library_user_id ON public.content_library(user_id);
CREATE INDEX IF NOT EXISTS idx_content_library_category ON public.content_library(category);
CREATE INDEX IF NOT EXISTS idx_jd_analyses_user_id ON public.jd_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_resumes_header ON public.resumes USING gin (header);
CREATE INDEX IF NOT EXISTS idx_resumes_skills ON public.resumes USING gin (skills);
CREATE INDEX IF NOT EXISTS idx_resumes_experience ON public.resumes USING gin (experience);
CREATE INDEX IF NOT EXISTS idx_content_library_data ON public.content_library USING gin (data);
CREATE INDEX IF NOT EXISTS idx_content_library_tags ON public.content_library USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_jd_analyses_extracted ON public.jd_analyses USING gin (extracted_requirements);

-- ===================================================
-- TRIGGERS & AUTOMATION
-- ===================================================

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

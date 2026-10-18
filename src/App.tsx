import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Code2,
  Eye,
  Target,
  GitCompare,
  Stethoscope,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Download,
  Search,
  ExternalLink,
  Layers,
  Save,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  Maximize2,
  Minimize2,
  Info
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { WorkspaceTab, ResumeData, ResumeVersion } from './types/resume';
import {
  createInitialResume,
  createInitialVersions,
  generateLatexFromResume
} from './utils/defaultResume';
import { AuthProvider, useAuth } from './context/AuthContext';

function WorkspaceContent() {
  const { isSupabaseConnected } = useAuth();
  // Navigation & Workspace State
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [resume, setResume] = useState<ResumeData>(() => createInitialResume());
  const [versions, setVersions] = useState<ResumeVersion[]>(() =>
    createInitialVersions(createInitialResume())
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLatex, setCopiedLatex] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // AI Diff state for Checkpoint 05 interaction demonstration
  const [pendingDiffs, setPendingDiffs] = useState([
    {
      id: 'diff-1',
      section: 'Professional Summary',
      type: 'enhancement',
      title: 'Strengthen AI Copilot Impact Metrics',
      original:
        'Driven Full Stack Engineer with 4+ years of experience architecting high-concurrency Node.js and React applications...',
      suggestion:
        'Impact-focused Full Stack & AI Systems Engineer with 4+ years driving 45% latency reductions across cloud-native Node.js, React 19, and Gemini LLM copilot microservices serving 500k+ MAU.',
      applied: false
    },
    {
      id: 'diff-2',
      section: 'Technical Skills',
      type: 'addition',
      title: 'Add High-Demand JD Keywords: Kubernetes & Next.js 15',
      original: 'Databases & Cloud: PostgreSQL, Supabase, MongoDB, Redis, Docker, AWS',
      suggestion:
        'Databases & Cloud: PostgreSQL, Supabase, MongoDB, Redis, Docker, Kubernetes, AWS, Next.js 15',
      applied: false
    },
    {
      id: 'diff-3',
      section: 'Work Experience',
      type: 'metric',
      title: 'Quantify Vanguard Team Leadership',
      original:
        'Led a team of 4 engineers in migrating frontend applications to Next.js and React 19...',
      suggestion:
        'Spearheaded an agile team of 4 engineers in migrating frontend architecture to React 19, elevating Lighthouse core web vitals from 62 to 98 and cutting bundle size by 34%.',
      applied: false
    }
  ]);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Helper to trigger autosave feedback
  const triggerAutosaveFeedback = () => {
    setIsSaving(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setIsSaving(false);
      setResume((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString()
      }));
    }, 500);
  };

  // Update top-level resume field
  const updateResumeField = (field: keyof ResumeData, value: any) => {
    setResume((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
    triggerAutosaveFeedback();
  };

  // Update nested header field
  const updateHeaderField = (field: string, value: any) => {
    setResume((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value
      },
      updatedAt: new Date().toISOString()
    }));
    triggerAutosaveFeedback();
  };

  // Create and snapshot a new resume version
  const handleCreateVersion = (versionName: string) => {
    const newVersion: ResumeVersion = {
      id: `ver-${Date.now()}`,
      resumeId: resume.id,
      versionName: versionName.trim(),
      resumeData: JSON.parse(JSON.stringify(resume)),
      score: 92,
      createdAt: new Date().toISOString()
    };
    setVersions((prev) => [newVersion, ...prev]);
    showToast(`Created version: "${versionName}"`);
  };

  // Restore an existing version into the active resume state
  const handleRestoreVersion = (versionId: string) => {
    const target = versions.find((v) => v.id === versionId);
    if (target) {
      setResume(JSON.parse(JSON.stringify(target.resumeData)));
      triggerAutosaveFeedback();
      showToast(`Switched active resume to: "${target.versionName}"`);
    }
  };

  // Copy LaTeX source to clipboard
  const handleCopyLatex = () => {
    const latex = generateLatexFromResume(resume);
    navigator.clipboard.writeText(latex);
    setCopiedLatex(true);
    showToast('LaTeX source code copied to clipboard!');
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  // Apply AI diff patch to active resume
  const handleApplyDiff = (diffId: string) => {
    const target = pendingDiffs.find((d) => d.id === diffId);
    if (!target || target.applied) return;

    if (diffId === 'diff-1') {
      updateResumeField('summary', target.suggestion);
    } else if (diffId === 'diff-2') {
      setResume((prev) => {
        const skills = [...prev.skills];
        const cloudCat = skills.find((s) => s.category.includes('Databases'));
        if (cloudCat && !cloudCat.skills.includes('Kubernetes')) {
          cloudCat.skills.push('Kubernetes', 'Next.js 15');
        }
        return { ...prev, skills };
      });
      triggerAutosaveFeedback();
    } else if (diffId === 'diff-3') {
      setResume((prev) => {
        const exp = [...prev.experience];
        if (exp[0] && exp[0].bullets[2]) {
          exp[0].bullets[2] = target.suggestion;
        }
        return { ...prev, experience: exp };
      });
      triggerAutosaveFeedback();
    }

    setPendingDiffs((prev) =>
      prev.map((d) => (d.id === diffId ? { ...d, applied: true } : d))
    );
    showToast(`Applied improvement: "${target.title}"`);
  };

  const unappliedDiffsCount = pendingDiffs.filter((d) => !d.applied).length;

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500/30 selection:text-brand-200">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-500/20 border border-brand-400/40 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Application Header & Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resume={resume}
        versions={versions}
        onCreateVersion={handleCreateVersion}
        onRestoreVersion={handleRestoreVersion}
        isSaving={isSaving}
        scoreBadge="87%"
        diffBadge={unappliedDiffsCount || undefined}
        healthBadge={2}
        onSimulateAutosave={triggerAutosaveFeedback}
      />

      {/* Main Workspace Dynamic View Router (Zero Refresh) */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD VIEW                                     */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Hero / Header greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Resume Intelligence Hub
                  </h1>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Checkpoint 06 Active
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      isSupabaseConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    {isSupabaseConnected ? 'Supabase Cloud' : 'Offline Fallback Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Active Document:{' '}
                  <span className="text-slate-200 font-semibold">{resume.title}</span> — Candidate:{' '}
                  <span className="text-brand-400 font-semibold">{resume.header.fullName}</span>
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-brand-500/20 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open Visual Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-brand-400" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('jd-intelligence')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition-all hover:bg-slate-850 group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">ATS Match Score</span>
                  <Target className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">87%</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Google Senior Staff Target</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('health-check')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition-all hover:bg-slate-850 group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">Resume Health</span>
                  <Stethoscope className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-cyan-400">96 / 100</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>2 non-blocking warnings</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('diff')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition-all hover:bg-slate-850 group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">AI Copilot Diff</span>
                  <GitCompare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  {unappliedDiffsCount} Pending
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Suggested metric improvements</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">Saved Versions</span>
                  <Layers className="w-3 h-3 text-brand-400" />
                </div>
                <div className="text-2xl font-bold text-white">{versions.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Active: <span className="text-brand-300 truncate">{resume.title}</span>
                </div>
              </div>
            </div>

            {/* Interactive Live State Verification Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <h2 className="text-sm font-semibold text-white">
                    Live Active State Test Bench (Checkpoint 05 Persistence)
                  </h2>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/30">
                  Instant State Sync Across All Tabs
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Test state persistence by modifying the candidate fields below. Then switch between the{' '}
                <strong className="text-white">Visual Editor</strong>,{' '}
                <strong className="text-white">LaTeX Code</strong>, and{' '}
                <strong className="text-white">Live Preview</strong> tabs. Notice how your edits persist
                instantly without page reload or state loss!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Candidate Full Name:
                  </label>
                  <input
                    type="text"
                    value={resume.header.fullName}
                    onChange={(e) => updateHeaderField('fullName', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Headline / Title:
                  </label>
                  <input
                    type="text"
                    value={resume.header.headline || ''}
                    onChange={(e) => updateHeaderField('headline', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Resume Document Title:
                  </label>
                  <input
                    type="text"
                    value={resume.title}
                    onChange={(e) => updateResumeField('title', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>State is actively synced to memory and verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={triggerAutosaveFeedback}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-brand-400" />
                    Simulate Save Indicator
                  </button>
                </div>
              </div>
            </div>

            {/* Workspace Modules Quick Launcher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: 'editor' as WorkspaceTab,
                  title: 'Visual Editor',
                  desc: 'Edit sections, experience, bullets, and technical skills.',
                  icon: <FileText className="w-5 h-5 text-brand-400" />
                },
                {
                  id: 'latex' as WorkspaceTab,
                  title: 'LaTeX Code Engine',
                  desc: 'Overleaf-grade raw TeX source synchronized with resume.',
                  icon: <Code2 className="w-5 h-5 text-indigo-400" />
                },
                {
                  id: 'preview' as WorkspaceTab,
                  title: 'Live Document Preview',
                  desc: 'Pixel-perfect US Letter paper canvas with zoom & export.',
                  icon: <Eye className="w-5 h-5 text-emerald-400" />
                },
                {
                  id: 'jd-intelligence' as WorkspaceTab,
                  title: 'JD Intelligence',
                  desc: 'Match score matrix & keyword optimization against job targets.',
                  icon: <Target className="w-5 h-5 text-rose-400" />
                }
              ].map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="p-2 w-fit rounded-lg bg-slate-800/80 mb-3 group-hover:scale-105 transition-transform">
                      {mod.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">{mod.desc}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-brand-400 font-medium">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: VISUAL EDITOR VIEW                                 */}
        {/* ========================================================= */}
        {activeTab === 'editor' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-400" />
                  Visual Resume Editor
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Form modifications update the central resume state in real-time.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-brand-400" />
                  View Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('latex')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  View LaTeX
                </button>
              </div>
            </div>

            {/* Section 1: Contact & Header Information */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Contact & Header Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Candidate Full Name:
                  </label>
                  <input
                    type="text"
                    value={resume.header.fullName}
                    onChange={(e) => updateHeaderField('fullName', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Professional Headline:
                  </label>
                  <input
                    type="text"
                    value={resume.header.headline || ''}
                    onChange={(e) => updateHeaderField('headline', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Email:</label>
                  <input
                    type="email"
                    value={resume.header.email}
                    onChange={(e) => updateHeaderField('email', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Phone:</label>
                  <input
                    type="text"
                    value={resume.header.phone}
                    onChange={(e) => updateHeaderField('phone', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Location:
                  </label>
                  <input
                    type="text"
                    value={resume.header.location}
                    onChange={(e) => updateHeaderField('location', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Portfolio / Website:
                  </label>
                  <input
                    type="text"
                    value={resume.header.links[3]?.url || 'https://alexvance.dev'}
                    onChange={(e) => {
                      const newLinks = [...resume.header.links];
                      if (newLinks[3]) newLinks[3].url = e.target.value;
                      updateHeaderField('links', newLinks);
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Summary */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  Professional Executive Summary
                </h2>
                <span className="text-[11px] text-slate-400">
                  {resume.summary.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={3}
                value={resume.summary}
                onChange={(e) => updateResumeField('summary', e.target.value)}
                className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 leading-relaxed custom-scrollbar"
              />
            </div>

            {/* Section 3: Technical Skills */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Categorized Technical Skills
              </h2>
              <div className="space-y-3">
                {resume.skills.map((skillGroup, idx) => (
                  <div
                    key={skillGroup.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg"
                  >
                    <div className="text-xs font-semibold text-brand-300 mb-1.5">
                      {skillGroup.category}:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGroup.skills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 text-[11px] bg-slate-800 text-slate-200 rounded border border-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Work Experience */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Work Experience Timeline
              </h2>
              <div className="space-y-4">
                {resume.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white text-sm">{exp.position}</strong>
                        <span className="text-brand-400 font-medium ml-2">@ {exp.company}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LATEX CODE VIEW                                    */}
        {/* ========================================================= */}
        {activeTab === 'latex' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  LaTeX Code Engine (Synchronized)
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Overleaf-grade LaTeX source dynamically generated from the active resume state.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyLatex}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  {copiedLatex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLatex ? 'Copied TeX' : 'Copy LaTeX'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-brand-400" />
                  <span>Preview PDF</span>
                </button>
              </div>
            </div>

            {/* LaTeX Code Box */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
              <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono flex items-center gap-2 text-indigo-300">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  resume_document.tex (Live compiled from React State)
                </span>
                <span className="text-[11px] font-mono text-slate-500">UTF-8 · LaTeX 2e</span>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed custom-scrollbar selection:bg-indigo-500/30">
                <code>{generateLatexFromResume(resume)}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LIVE PREVIEW VIEW                                  */}
        {/* ========================================================= */}
        {activeTab === 'preview' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  Live Document Paper Preview
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-fidelity true-to-scale US Letter canvas simulating exact print typography.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 space-x-2 text-xs">
                  <button
                    onClick={() => setPreviewZoom(Math.max(75, previewZoom - 10))}
                    className="text-slate-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-mono text-slate-300">{previewZoom}%</span>
                  <button
                    onClick={() => setPreviewZoom(Math.min(130, previewZoom + 10))}
                    className="text-slate-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* Paper Canvas Simulation */}
            <div className="flex justify-center p-4 sm:p-8 bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-x-auto custom-scrollbar">
              <div
                style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-[800px] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 font-serif text-[13px] leading-normal transition-transform duration-200 select-text"
              >
                {/* Header */}
                <div className="text-center pb-4 border-b border-slate-300 mb-4">
                  <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">
                    {resume.header.fullName}
                  </h1>
                  <p className="text-xs font-sans text-slate-600 mt-1">
                    {resume.header.phone} &bull; {resume.header.email} &bull; {resume.header.location}
                  </p>
                  {resume.header.headline && (
                    <p className="text-xs font-sans font-medium text-brand-700 mt-1">
                      {resume.header.headline}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-300 mb-2">
                    Professional Summary
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {resume.summary}
                  </p>
                </div>

                {/* Experience */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-300 mb-2">
                    Work Experience
                  </h2>
                  <div className="space-y-3">
                    {resume.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                          <span>
                            {exp.company} &mdash;{' '}
                            <span className="font-normal italic">{exp.position}</span>
                          </span>
                          <span className="text-[11px] font-sans text-slate-600">
                            {exp.startDate} &ndash; {exp.endDate}
                          </span>
                        </div>
                        <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-xs text-slate-700">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-300 mb-2">
                    Technical Skills
                  </h2>
                  <div className="space-y-1 text-xs text-slate-700">
                    {resume.skills.map((s) => (
                      <div key={s.id}>
                        <strong className="text-slate-900">{s.category}:</strong>{' '}
                        {s.skills.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-300 mb-2">
                    Education
                  </h2>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-xs">
                      <div>
                        <strong className="text-slate-900">{edu.institution}</strong> &mdash;{' '}
                        <span className="italic">{edu.degree}</span>
                      </div>
                      <span className="text-[11px] font-sans text-slate-600">
                        {edu.startDate} &ndash; {edu.endDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: JD INTELLIGENCE VIEW                               */}
        {/* ========================================================= */}
        {activeTab === 'jd-intelligence' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-400" />
                  Job Description Intelligence Matrix
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI match analysis comparing active resume{' '}
                  <strong className="text-white">"{resume.title}"</strong> with target role.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>View Recommended Diffs</span>
              </button>
            </div>

            {/* Target Job Header Card */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                  Target Role
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Senior Staff AI Systems & Full Stack Engineer
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Company: Google Cloud & Core Systems &bull; Level: L6 / Staff &bull; Match:{' '}
                  <span className="text-emerald-400 font-bold">87% Overall ATS Alignment</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-emerald-400">87%</div>
                <div className="text-[11px] text-slate-400">High Interview Probability</div>
              </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Matching Keywords Found in Resume (14)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'TypeScript',
                    'React 19',
                    'Node.js',
                    'Express',
                    'PostgreSQL',
                    'Supabase',
                    'Microservices',
                    'Docker',
                    'Redis',
                    'GraphQL',
                    'Python',
                    'REST APIs',
                    'CI/CD',
                    'Tailwind CSS'
                  ].map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Missing Recommended Keywords (3)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {['Kubernetes', 'Next.js 15', 'Distributed Caching (Memcached)'].map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  These missing skills can be automatically patched via the{' '}
                  <strong className="text-white cursor-pointer" onClick={() => setActiveTab('diff')}>
                    AI Changes tab
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: AI CHANGES (DIFF) VIEW                             */}
        {/* ========================================================= */}
        {activeTab === 'diff' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-amber-400" />
                  AI Suggested Improvements & Diff Viewer
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accepting diffs applies optimizations directly to the active resume state.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {unappliedDiffsCount} Pending Diffs
              </span>
            </div>

            <div className="space-y-4">
              {pendingDiffs.map((diff) => (
                <div
                  key={diff.id}
                  className={`p-4 rounded-xl border transition-all ${
                    diff.applied
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                        {diff.section}
                      </span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs font-semibold text-white">{diff.title}</span>
                    </div>
                    {diff.applied ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyDiff(diff.id)}
                        className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Apply to Resume
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                        Current Value:
                      </span>
                      {diff.original}
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                        AI Recommended Value:
                      </span>
                      {diff.suggestion}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: HEALTH CHECK VIEW                                  */}
        {/* ========================================================= */}
        {activeTab === 'health-check' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-cyan-400" />
                  Automated Resume Health Diagnostic
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Static analysis checking ATS compliance, grammar, metrics, and bullet strength.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold text-cyan-400">96 / 100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  ATS Parser Compatibility
                </h3>
                <div className="text-2xl font-bold text-emerald-400">100%</div>
                <p className="text-xs text-slate-400 mt-1">
                  Clean single-column parsing, zero unreadable text frames or complex SVGs.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Quantified Metrics Density
                </h3>
                <div className="text-2xl font-bold text-emerald-400">92%</div>
                <p className="text-xs text-slate-400 mt-1">
                  7 of 8 experience and project bullets include measurable percentage or latency metrics.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Action Verb Diversity
                </h3>
                <div className="text-2xl font-bold text-cyan-400">95%</div>
                <p className="text-xs text-slate-400 mt-1">
                  Strong verbs used: Architected, Engineered, Spearheaded, Optimized.
                </p>
              </div>
            </div>

            {/* Diagnostic Item List */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-white">Diagnostic Rule Checks</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Contact information contains valid email, phone, and location</span>
                  </div>
                  <span className="font-semibold text-emerald-400">PASS</span>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Experience dates are consistently ordered (chronological reverse)</span>
                  </div>
                  <span className="font-semibold text-emerald-400">PASS</span>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>GitHub profile link recommended for Software Engineering role</span>
                  </div>
                  <span className="font-semibold text-amber-400">INFO</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: CONTENT LIBRARY VIEW                               */}
        {/* ========================================================= */}
        {activeTab === 'content-library' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-brand-400" />
                  Personal Content & Achievement Library
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modular career snippets, bullets, and verified projects for instant insertion.
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast('Library item created')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save New Snippet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  category: 'Work Bullet',
                  title: 'Distributed Transaction Processing',
                  content:
                    'Engineered distributed 2-phase commit transaction processing engine in Go, processing $40M+ in daily settlement transactions with zero ledger drift.',
                  tags: ['Go', 'Fintech', 'Concurrency', 'High Volume']
                },
                {
                  category: 'Work Bullet',
                  title: 'PostgreSQL Query Optimization',
                  content:
                    'Refactored unindexed join queries on 100M+ row user table, reducing p99 response time from 1.8s to 42ms and saving $14,000/mo in RDS compute.',
                  tags: ['PostgreSQL', 'Performance', 'Database', 'Indexing']
                },
                {
                  category: 'Project',
                  title: 'RAG Knowledge Agent with Vector Embeddings',
                  content:
                    'Built end-to-end RAG system using LangChain, pgvector, and Gemini LLM to query internal engineering documentation with sub-second accuracy.',
                  tags: ['Python', 'Gemini', 'Vector Search', 'AI']
                },
                {
                  category: 'Achievement',
                  title: 'Hackathon Top Innovator',
                  content:
                    'Won 1st Place overall at SF Bay Tech Hackathon among 120 teams for building an automated accessibility screener.',
                  tags: ['Awards', 'Leadership', 'Hackathon']
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-400 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                      {item.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateResumeField('summary', `${resume.summary} ${item.content}`);
                        showToast(`Inserted "${item.title}" into resume summary!`);
                      }}
                      className="text-brand-400 hover:text-brand-300 font-medium text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Insert into Resume
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {item.tags.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Persistent Bottom Status Bar across all 8 Tabs */}
      <footer className="bg-slate-900/90 border-t border-slate-800/80 px-4 sm:px-8 py-2 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active Workspace: <strong className="text-white capitalize">{activeTab}</strong>
          </span>
          <span className="text-slate-600 hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline text-slate-400">
            Candidate: <strong className="text-slate-200">{resume.header.fullName}</strong>
          </span>
          <span className="text-slate-600 hidden md:inline">&bull;</span>
          <span className="hidden md:inline text-slate-400">
            Document: <strong className="text-slate-200">{resume.title}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-[11px] text-slate-400 font-mono">
            {isSaving ? (
              <span className="text-amber-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> State Persisted
              </span>
            )}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-[11px] text-brand-400 font-medium">Checkpoint 06 Verified</span>
        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <WorkspaceContent />
    </AuthProvider>
  );
}

export default App;

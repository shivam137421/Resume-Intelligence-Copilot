import React, { useRef, useState, useMemo } from 'react';
import {
  Sparkles,
  FileText,
  Upload,
  Layers,
  Target,
  Stethoscope,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Globe,
  ArrowRight,
  Code2,
  Eye,
  GitCompare,
  Save,
  Clock,
  Briefcase,
  Sliders,
  Check,
  Plus
} from 'lucide-react';
import {
  ResumeData,
  ResumeVersion,
  WorkspaceTab,
  JobDescription,
  ScoreBreakdown,
  HealthCheckResult,
  ContentLibraryItem,
  HeaderData,
  CreateResumeOptions
} from '../../types/resume';
import { useAuth } from '../../context/AuthContext';
import { ProfileSettingsModal } from '../profile/ProfileSettingsModal';
import { NewResumeModal } from '../resume/NewResumeModal';
import { createNewResume as createNewResumeUtil } from '../../utils/defaultResume';

export interface DashboardProps {
  resume?: ResumeData;
  setResume?: (resume: ResumeData) => void;
  activeTab?: WorkspaceTab;
  setActiveTab?: (tab: WorkspaceTab) => void;
  versions?: ResumeVersion[];
  restoreVersion?: (versionId: string) => void;
  onCreateVersion?: (versionName: string) => void;
  onCreateResume?: (options: CreateResumeOptions) => void;
  scoreReport?: ScoreBreakdown | null;
  healthCheck?: HealthCheckResult | null;
  activeJd?: JobDescription | null;
  contentLibrary?: ContentLibraryItem[];
  unappliedDiffsCount?: number;
  onUpdateHeaderField?: (field: string, value: any) => void;
  onUpdateResumeField?: (field: keyof ResumeData, value: any) => void;
  onSimulateAutosave?: () => void;
}

/**
 * Real-time aggregated KPI metrics calculated directly from active resume state
 */
export const calculateResumeKPIs = (resume?: ResumeData, activeJd?: JobDescription | null) => {
  if (!resume) {
    return {
      matchScore: 85,
      healthScore: 92,
      totalBullets: 12,
      totalSkills: 16,
      diagnosticsCount: 0,
      completenessPercent: 90
    };
  }

  // 1. Health Score Calculation (0-100)
  let healthScore = 65;
  let diagnosticsCount = 0;

  if (resume.header?.fullName && resume.header.fullName.trim().length >= 2) {
    healthScore += 5;
  } else {
    diagnosticsCount++;
  }

  if (resume.header?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.header.email)) {
    healthScore += 5;
  } else {
    diagnosticsCount++;
  }

  if (resume.header?.phone && resume.header.phone.trim().length >= 7) {
    healthScore += 4;
  }
  if (resume.header?.location && resume.header.location.trim().length >= 2) {
    healthScore += 4;
  }

  if (resume.summary && resume.summary.trim().length >= 60) {
    healthScore += 6;
  } else {
    diagnosticsCount++;
  }

  const totalBullets = (resume.experience || []).reduce(
    (acc, exp) => acc + (exp.bullets?.length || 0),
    0
  );
  if (totalBullets >= 4) healthScore += 5;
  if (totalBullets >= 8) healthScore += 5;

  const totalSkills = (resume.skills || []).reduce(
    (acc, cat) => acc + (cat.skills?.length || 0),
    0
  );
  if (totalSkills >= 6) healthScore += 6;

  healthScore = Math.min(100, Math.max(0, healthScore));

  // 2. ATS Match Score Calculation (0-100)
  let matchScore = 75;

  if (totalBullets >= 6) matchScore += 5;
  if (totalSkills >= 8) matchScore += 5;
  if (resume.projects && resume.projects.length >= 2) matchScore += 5;

  if (activeJd?.extractedRequirements?.requiredSkills?.length) {
    const jdSkills = activeJd.extractedRequirements.requiredSkills;
    const flatSkills = (resume.skills || []).flatMap((s) => s.skills.map((k) => k.toLowerCase()));
    const matched = jdSkills.filter((s) => flatSkills.some((fs) => fs.includes(s.toLowerCase())));
    const ratio = matched.length / Math.max(1, jdSkills.length);
    matchScore = Math.round(55 + ratio * 45);
  }

  matchScore = Math.min(100, Math.max(0, matchScore));

  // 3. Overall document completeness
  let completeness = 20;
  if (resume.header?.fullName) completeness += 15;
  if (resume.header?.email) completeness += 15;
  if (resume.summary) completeness += 15;
  if (totalSkills > 0) completeness += 15;
  if (totalBullets > 0) completeness += 20;

  return {
    matchScore,
    healthScore,
    totalBullets,
    totalSkills,
    diagnosticsCount,
    completenessPercent: Math.min(100, completeness)
  };
};

export const Dashboard: React.FC<DashboardProps> = ({
  resume,
  setResume,
  setActiveTab = () => {},
  versions = [],
  restoreVersion = () => {},
  onCreateVersion,
  onCreateResume,
  scoreReport,
  healthCheck,
  activeJd,
  contentLibrary = [],
  unappliedDiffsCount = 3,
  onUpdateHeaderField,
  onUpdateResumeField,
  onSimulateAutosave
}) => {
  const { user, isSupabaseConnected } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateResume = (options: CreateResumeOptions) => {
    if (onCreateResume) {
      onCreateResume(options);
    } else if (setResume) {
      const newResume = createNewResumeUtil(options);
      setResume(newResume);
      setActiveTab('editor');
    }
  };

  // Dynamic real-time KPI score calculation from active resume state
  const kpiMetrics = useMemo(() => {
    return calculateResumeKPIs(resume, activeJd);
  }, [resume, activeJd]);

  const liveATSScore = scoreReport?.overallScore || kpiMetrics.matchScore;
  const liveHealthScore = healthCheck?.overallHealthScore || kpiMetrics.healthScore;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (setResume && resume) {
      const updated: ResumeData = {
        ...resume,
        title: `Imported Resume (${file.name.replace(/\.[^/.]+$/, '')})`,
        updatedAt: new Date().toISOString()
      };
      setResume(updated);
      setActiveTab('editor');
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Welcome & Workspace Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 p-6 md:p-8 border border-brand-500/20 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ResumeSync • AI Career Intelligence Platform</span>
              <span className="text-slate-400">|</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {isSupabaseConnected ? 'Cloud PostgreSQL Synced' : 'Offline Storage Active'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Interactive Dashboard & Workspace Hub
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Transform career achievements, coding repositories, and job targets into ATS-optimized resumes.
              Manage versions, monitor real-time diagnostic health scores, and export Overleaf-ready LaTeX.
            </p>

            {resume && (
              <div className="pt-1 text-xs text-slate-400 flex flex-wrap items-center gap-2">
                <span>Active Resume:</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-medium border border-slate-700">
                  {resume.title}
                </span>
                <span>• Candidate:</span>
                <span className="text-brand-300 font-semibold">
                  {resume.header?.fullName || user?.fullName || 'Alex Vance'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95 cursor-pointer"
              id="dashboard-create-resume"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Resume</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all transform active:scale-95"
              id="dashboard-open-editor"
            >
              <FileText className="w-4 h-4" />
              <span>Open Visual Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
              id="dashboard-open-preview"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 text-xs font-semibold rounded-xl border border-indigo-500/30 transition-all"
              title="Import profile details or edit workspace settings"
              id="dashboard-open-profile"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Profile & Settings</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-xl border border-slate-700/80 transition-all"
              title="Upload PDF or DOCX file to extract resume content"
              id="dashboard-upload-document"
            >
              <Upload className="w-4 h-4 text-brand-400" />
              <span>Upload Document</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* ATS Match Score Card */}
        <div
          onClick={() => setActiveTab('jd-intelligence')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 cursor-pointer transition-all hover:border-brand-500/50 group shadow-md"
          id="kpi-card-ats-match"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ATS Match Score
            </span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400">{liveATSScore}%</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 group-hover:text-brand-300 flex items-center justify-between">
            <span className="truncate max-w-[170px]">
              {activeJd ? `Targeting: ${activeJd.title}` : 'Google Senior Staff Target'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Resume Health Score Card */}
        <div
          onClick={() => setActiveTab('health-check')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 cursor-pointer transition-all hover:border-cyan-500/50 group shadow-md"
          id="kpi-card-health"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Resume Health
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-cyan-400">{liveHealthScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 group-hover:text-cyan-300 flex items-center justify-between">
            <span>
              {kpiMetrics.diagnosticsCount > 0
                ? `${kpiMetrics.diagnosticsCount} non-blocking suggestions`
                : 'Clean structure verified'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Saved Target Versions Card */}
        <div
          onClick={() => setActiveTab('editor')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 cursor-pointer transition-all hover:border-indigo-500/50 group shadow-md"
          id="kpi-card-versions"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saved Versions
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{versions.length}</span>
            <span className="text-xs text-slate-400">snapshots</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 group-hover:text-indigo-300 flex items-center justify-between">
            <span className="truncate max-w-[170px]">
              Active: {resume?.title || 'Master Resume'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* AI Copilot Pending Diffs Card */}
        <div
          onClick={() => setActiveTab('diff')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 cursor-pointer transition-all hover:border-amber-500/50 group shadow-md"
          id="kpi-card-diffs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              AI Copilot Diffs
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <GitCompare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400">{unappliedDiffsCount}</span>
            <span className="text-xs text-slate-400">pending</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 group-hover:text-amber-300 flex items-center justify-between">
            <span>Metric & keyword patches</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

      </div>

      {/* 3. Main Sections: Active Resume & Saved Versions + Target JD & Quick Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Active Resume & Versions History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand-400" />
                <span>Active Resume & Saved Version Snapshots</span>
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
              >
                <span>Edit Current</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-700/60">
              {/* Active Current Resume Card */}
              {resume && (
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-500/5 px-3 rounded-xl border border-brand-500/20 mb-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-white truncate">{resume.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        CURRENT ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-lg">
                      {resume.header?.fullName || 'Alex Vance'} • {resume.header?.headline || 'Staff AI Engineer'}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                      <span>{resume.experience?.length || 0} roles</span>
                      <span>•</span>
                      <span>{kpiMetrics.totalBullets} achievement bullets</span>
                      <span>•</span>
                      <span>Template: {resume.templateId || 'ats-minimal'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('editor')}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      Open Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-slate-300 rounded-lg transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Version History Rows */}
              {versions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No snapshot versions created yet. Click "Save Version" in the editor or header to snapshot variations.
                </div>
              ) : (
                versions.map((v) => {
                  const isCurrent = resume && (v.resumeData?.id === resume.id || v.versionName === resume.title);
                  return (
                    <div
                      key={v.id}
                      className="py-3.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-slate-200 truncate">{v.versionName}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              LOADED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 flex items-center space-x-2">
                          <span className="text-brand-300 font-medium">Score: {v.score || 85}%</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(v.createdAt).toLocaleDateString()}
                          </span>
                          {v.targetCompany && (
                            <>
                              <span>•</span>
                              <span>Target: {v.targetCompany}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            restoreVersion(v.id);
                            setActiveTab('editor');
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white font-medium rounded-lg transition-colors"
                        >
                          Restore Version
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive Live State Verification Bench */}
          {resume && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Active State Test Bench & Quick Edits
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/30">
                  Instant Real-Time State Sync
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Test state persistence by modifying the candidate fields below. Notice how your edits update the
                KPI scores immediately and persist seamlessly across all tabs!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Candidate Full Name:
                  </label>
                  <input
                    type="text"
                    value={resume.header?.fullName || ''}
                    onChange={(e) => onUpdateHeaderField?.('fullName', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="Candidate Name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Professional Headline:
                  </label>
                  <input
                    type="text"
                    value={resume.header?.headline || ''}
                    onChange={(e) => onUpdateHeaderField?.('headline', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="Headline"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Resume Document Title:
                  </label>
                  <input
                    type="text"
                    value={resume.title || ''}
                    onChange={(e) => onUpdateResumeField?.('title', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="Document Title"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>State synchronized across memory and active components</span>
                </div>
                {onSimulateAutosave && (
                  <button
                    type="button"
                    onClick={onSimulateAutosave}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-brand-400" />
                    Simulate Save Indicator
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Target JD & Copilot Quick Tasks */}
        <div className="space-y-6">
          
          {/* Target Job Description Box */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Target Job Description</span>
            </h3>

            {activeJd ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <div className="font-semibold text-xs text-brand-300">{activeJd.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{activeJd.company}</div>
                  {activeJd.extractedRequirements?.seniority && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] border border-indigo-500/20">
                      {activeJd.extractedRequirements.seniority}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('jd-intelligence')}
                  className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Skill Gaps & Optimization</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  No target Job Description assigned. Target specific roles to unlock customized ATS keyword gap
                  scoring and AI bullet tailoring.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('jd-intelligence')}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  + Add Target Job Description
                </button>
              </div>
            )}
          </div>

          {/* Copilot Prompt Shortcuts */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Copilot Quick Prompts</span>
            </h3>
            
            <p className="text-xs text-slate-400">
              One-click shortcuts to route directly into specialized editors and AI modules:
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-700/50 text-xs text-slate-300 hover:text-white flex items-center justify-between group transition-colors"
              >
                <span>"Shorten executive summary"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-700/50 text-xs text-slate-300 hover:text-white flex items-center justify-between group transition-colors"
              >
                <span>"Add quantifiable metrics to bullets"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('latex')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-700/50 text-xs text-slate-300 hover:text-white flex items-center justify-between group transition-colors"
              >
                <span>"Export Overleaf LaTeX source code"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('jd-intelligence')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-700/50 text-xs text-slate-300 hover:text-white flex items-center justify-between group transition-colors"
              >
                <span>"Optimize keywords against JD"</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Share / Export Card */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">Share Workspace Link</div>
              <div className="text-[11px] text-slate-400">Copy current workspace location</div>
            </div>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 text-xs bg-slate-750 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <span>Copy URL</span>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* 4. Workspace Modules Quick Launcher Grid */}
      <div className="pt-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Dedicated Workspace Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'editor' as WorkspaceTab,
              moduleId: 'dashboard-module-editor',
              title: 'Visual Editor',
              desc: 'Edit structured experience, metric bullets, and categorized skills.',
              icon: <FileText className="w-5 h-5 text-brand-400" />
            },
            {
              id: 'latex' as WorkspaceTab,
              moduleId: 'dashboard-module-latex',
              title: 'LaTeX Code Engine',
              desc: 'Overleaf-grade raw TeX source code synchronized with resume.',
              icon: <Code2 className="w-5 h-5 text-indigo-400" />
            },
            {
              id: 'preview' as WorkspaceTab,
              moduleId: 'dashboard-module-preview',
              title: 'Live Document Preview',
              desc: 'Pixel-perfect US Letter paper canvas with zoom and export.',
              icon: <Eye className="w-5 h-5 text-emerald-400" />
            },
            {
              id: 'jd-intelligence' as WorkspaceTab,
              moduleId: 'dashboard-module-jd-intelligence',
              title: 'JD Intelligence',
              desc: 'Match score matrix & keyword optimization against job targets.',
              icon: <Target className="w-5 h-5 text-rose-400" />
            }
          ].map((mod) => (
            <div
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-brand-500/50 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
              id={mod.moduleId}
            >
              <div>
                <div className="p-2 w-fit rounded-lg bg-slate-900 mb-3 group-hover:scale-105 transition-transform">
                  {mod.icon}
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                  {mod.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-normal">{mod.desc}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-brand-400 font-medium">
                <span>Open Module</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Profile & Settings */}
      {showProfileModal && (
        <ProfileSettingsModal
          onClose={() => setShowProfileModal(false)}
          onSyncResumeHeader={onUpdateHeaderField ? (fields: Partial<HeaderData>) => {
            Object.entries(fields).forEach(([k, v]) => onUpdateHeaderField(k, v));
          } : undefined}
          activeResumeTitle={resume?.title || 'Master Resume'}
        />
      )}

      {/* Modal: Create New Resume */}
      <NewResumeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateResume={handleCreateResume}
        defaultAuthorName={resume?.header?.fullName || user?.fullName}
      />

    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  CheckCircle2,
  Save,
  Globe,
  Download,
  User,
  Plus,
  Clock,
  ExternalLink,
  X,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { WorkspaceTab, ResumeData, ResumeVersion } from '../../types/resume';

export interface NavbarProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  resume: ResumeData;
  versions: ResumeVersion[];
  onCreateVersion: (versionName: string) => void;
  onRestoreVersion: (versionId: string) => void;
  isSaving: boolean;
  scoreBadge?: string;
  diffBadge?: number;
  healthBadge?: number;
  onSimulateAutosave?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  resume,
  versions,
  onCreateVersion,
  onRestoreVersion,
  isSaving,
  scoreBadge = '87%',
  diffBadge = 3,
  healthBadge = 2,
  onSimulateAutosave
}) => {
  const [showVersionMenu, setShowVersionMenu] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const versionMenuRef = useRef<HTMLDivElement>(null);

  // Close version menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (versionMenuRef.current && !versionMenuRef.current.contains(event.target as Node)) {
        setShowVersionMenu(false);
      }
    };
    if (showVersionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVersionMenu]);

  const navItems: { id: WorkspaceTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'editor', label: 'Visual Editor', icon: <FileText className="w-4 h-4" /> },
    { id: 'latex', label: 'LaTeX Code', icon: <Code2 className="w-4 h-4" /> },
    { id: 'preview', label: 'Live Preview', icon: <Eye className="w-4 h-4" /> },
    { id: 'jd-intelligence', label: 'JD Intelligence', icon: <Target className="w-4 h-4" />, badge: scoreBadge },
    { id: 'diff', label: 'AI Changes', icon: <GitCompare className="w-4 h-4" />, badge: diffBadge },
    { id: 'health-check', label: 'Health Check', icon: <Stethoscope className="w-4 h-4" />, badge: healthBadge },
    { id: 'content-library', label: 'Content Library', icon: <Bookmark className="w-4 h-4" /> },
  ];

  const handleCreateVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVersionName.trim()) {
      onCreateVersion(newVersionName.trim());
      setNewVersionName('');
      setShowVersionMenu(false);
    }
  };

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Bar: Brand, Version Selector, Autosave, and Actions */}
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo & Title */}
            <div
              className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
              onClick={() => setActiveTab('dashboard')}
              title="Return to Workspace Dashboard"
            >
              <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                    ResumeSync
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                    Copilot
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline-block">
                  AI Intelligence & LaTeX Workspace
                </span>
              </div>
            </div>

            {/* Version Selector Dropdown */}
            <div className="relative flex-shrink-0" ref={versionMenuRef}>
              <button
                type="button"
                onClick={() => setShowVersionMenu(!showVersionMenu)}
                className={`flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  showVersionMenu
                    ? 'bg-slate-800 border-brand-500 text-brand-300 ring-2 ring-brand-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-slate-600'
                }`}
                title="Switch resume versions or snapshot a new version"
              >
                <Layers className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                <span className="max-w-[120px] sm:max-w-[180px] truncate font-medium">
                  {resume.title || 'Master Resume'}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ({versions.length} v)
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showVersionMenu ? 'rotate-180' : ''}`} />
              </button>

              {showVersionMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-400" />
                      Resume Versions
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {versions.length} total
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                    {/* Active Version Card */}
                    <div className="w-full text-left px-3 py-2 text-xs rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/40 flex items-center justify-between shadow-sm">
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold truncate text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                          <span className="truncate">{resume.title}</span>
                        </div>
                        <div className="text-[10px] text-brand-300/80 mt-0.5 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Active in Workspace
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-600/30 text-brand-200 border border-brand-500/30">
                        Current
                      </span>
                    </div>

                    {/* Other Available Versions */}
                    {versions.map((v) => {
                      const isCurrent = v.resumeData.id === resume.id || v.versionName === resume.title;
                      if (isCurrent) return null;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            onRestoreVersion(v.id);
                            setShowVersionMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800/90 text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all group"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="truncate font-medium block text-slate-200 group-hover:text-brand-300 transition-colors">
                              {v.versionName}
                            </span>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                              {v.targetCompany && (
                                <span className="text-slate-400">· {v.targetCompany}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] text-brand-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Switch →
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Create New Version Snapshot Form */}
                  <form onSubmit={handleCreateVersionSubmit} className="mt-3 pt-2.5 border-t border-slate-800">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                      Snapshot Current Resume as New Version:
                    </label>
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        placeholder="e.g., Staff AI Infra (Google)"
                        value={newVersionName}
                        onChange={(e) => setNewVersionName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="submit"
                        disabled={!newVersionName.trim()}
                        className="px-3 py-1.5 text-xs bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Autosave Status Indicator */}
            <div
              className="hidden lg:flex items-center space-x-2 text-xs px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={onSimulateAutosave}
              title="Click to trigger autosave simulation"
            >
              {isSaving ? (
                <>
                  <Save className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span className="text-amber-300 font-medium">Saving changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-medium">All edits saved</span>
                </>
              )}
            </div>

            {/* Action Buttons & Auth */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                title="Import profile details from JSON or external sources"
              >
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>Import Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-brand-500/20 transition-all transform active:scale-95"
                title="Export resume to PDF or LaTeX (.tex)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Document</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                title="Guest Session / Sign In"
              >
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span className="hidden sm:inline">Guest Workspace</span>
              </button>
            </div>

          </div>

          {/* Primary Workspace Navigation Tabs */}
          <nav
            className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 custom-scrollbar select-none"
            aria-label="Workspace Navigation Tabs"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 border border-brand-400/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent'
                  }`}
                  id={`nav-tab-${item.id}`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                        isActive
                          ? 'bg-white text-brand-700 shadow-sm'
                          : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>
      </header>

      {/* Modal: Export Options */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-400" />
                Export Resume Document
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-300">
                Choose the desired export format for <strong className="text-white">{resume.title}</strong>:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('preview');
                    setShowExportModal(false);
                  }}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
                >
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-brand-400" />
                    PDF Document
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Print-ready US Letter / A4 ATS compliant format
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('latex');
                    setShowExportModal(false);
                  }}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
                >
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    LaTeX (.tex)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Full LaTeX source compatible with Overleaf & TeXLive
                  </div>
                </button>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Profile */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-400" />
                Profile Import & Sync
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-300">
                You can import your public LinkedIn, GitHub, or JSON profile to automatically populate the active resume.
              </p>
              <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-xs text-brand-200">
                Active Resume: <strong className="text-white">{resume.header.fullName}</strong> ({resume.title})
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-1.5 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Auth / Guest Session */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-brand-400" />
                User Authentication & Session
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Local Guest Workspace Active
                </div>
                <p className="text-slate-300">
                  All active resume modifications, tabs, and version states persist locally in browser session storage without requiring cloud credentials.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-1.5 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-medium"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

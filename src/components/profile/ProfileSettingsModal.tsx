import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Briefcase,
  Phone,
  MapPin,
  Image,
  Github,
  Linkedin,
  Settings,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  Sparkles,
  Layout,
  Layers,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HeaderData, ResumeTemplateId } from '../../types/resume';

export interface ProfileSettingsModalProps {
  onClose: () => void;
  onSyncResumeHeader?: (headerFields: Partial<HeaderData>) => void;
  activeResumeTitle?: string;
  initialTab?: 'profile' | 'settings';
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  onClose,
  onSyncResumeHeader,
  activeResumeTitle = 'Master Resume',
  initialTab = 'profile'
}) => {
  const { user, settings, updateProfile, updateSettings, isSupabaseConnected } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(initialTab);

  // Profile Form States
  const [fullName, setFullName] = useState<string>(user?.fullName || '');
  const [headline, setHeadline] = useState<string>(user?.headline || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [location, setLocation] = useState<string>(user?.location || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [githubUsername, setGithubUsername] = useState<string>(user?.githubUsername || '');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(user?.linkedinUrl || '');
  const [syncToResumeHeader, setSyncToResumeHeader] = useState<boolean>(true);

  // Settings Form States
  const [defaultTemplate, setDefaultTemplate] = useState<ResumeTemplateId>(
    settings.defaultTemplate || 'ats-minimal'
  );
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(
    settings.autoSaveEnabled !== undefined ? settings.autoSaveEnabled : true
  );
  const [aiModelPreference, setAiModelPreference] = useState<string>(
    settings.aiModelPreference || 'gemini-2.5-flash'
  );
  const [exportPageLimit, setExportPageLimit] = useState<number>(
    settings.exportPageLimit || 1
  );

  // UI state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Sync inputs if user context changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setHeadline(user.headline || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setAvatarUrl(user.avatarUrl || '');
      setGithubUsername(user.githubUsername || '');
      setLinkedinUrl(user.linkedinUrl || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      if (activeTab === 'profile') {
        // 1. Update Profile in AuthContext & database
        await updateProfile({
          fullName: fullName.trim(),
          headline: headline.trim(),
          phone: phone.trim(),
          location: location.trim(),
          avatarUrl: avatarUrl.trim() || undefined,
          githubUsername: githubUsername.trim() || undefined,
          linkedinUrl: linkedinUrl.trim() || undefined
        });

        // 2. Optionally synchronize changes into active resume header fields
        if (syncToResumeHeader && onSyncResumeHeader) {
          onSyncResumeHeader({
            fullName: fullName.trim(),
            headline: headline.trim() || undefined,
            phone: phone.trim(),
            location: location.trim()
          });
        }

        setSuccessMessage('User profile updated and synchronized successfully!');
      } else {
        // Update Workspace Settings
        await updateSettings({
          defaultTemplate,
          autoSaveEnabled,
          aiModelPreference,
          exportPageLimit
        });

        setSuccessMessage('Workspace settings updated successfully!');
      }

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-settings-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6 sm:p-7 text-slate-100 space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl shadow-md shadow-brand-500/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="profile-settings-title" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                User Profile & Workspace Settings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your personal career profile and editor workspace preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-800/80 border border-slate-700/60 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Workspace Preferences</span>
          </button>
        </div>

        {/* Cloud / Local Persistence Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px]">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {isSupabaseConnected ? 'Cloud Sync: PostgreSQL (profiles & user_settings)' : 'Local Storage Cache (Offline Mode)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {user?.email || 'Guest User'}
          </span>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{successMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          
          {activeTab === 'profile' ? (
            <>
              {/* Profile Avatar & Preview Row */}
              <div className="flex items-center space-x-3.5 p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                <div className="relative flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName || 'Avatar'}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500 shadow-md"
                      onError={() => {
                        // If image fails to load, gracefully ignore
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                      {fullName ? fullName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-slate-300 font-medium block mb-1">Avatar Image URL</label>
                  <div className="relative">
                    <Image className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-850 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Full Name & Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Vance"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Professional Headline</label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Senior Full Stack & AI Systems Engineer"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* GitHub & LinkedIn Social Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">GitHub Username</label>
                  <div className="relative">
                    <Github className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="alexvance-dev"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">LinkedIn URL</label>
                  <div className="relative">
                    <Linkedin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/alexvance"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Synchronization with Active Document Checkbox */}
              <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="sync-header-toggle"
                  checked={syncToResumeHeader}
                  onChange={(e) => setSyncToResumeHeader(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
                />
                <label htmlFor="sync-header-toggle" className="text-xs text-brand-200 cursor-pointer select-none">
                  <span className="font-semibold block text-white">Sync immediately to active resume header</span>
                  Update contact fields in <strong className="text-brand-300">{activeResumeTitle}</strong> automatically upon saving.
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Workspace Settings: Default Template Preference */}
              <div>
                <label className="text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-brand-400" />
                  Default Template Preference
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'ats-minimal', label: 'ATS Minimal', desc: 'Standard single-column clean format' },
                    { id: 'modern-engineering', label: 'Modern Engineering', desc: 'Technical highlights & metric badges' },
                    { id: 'executive', label: 'Executive', desc: 'Leadership hierarchy & narrative focus' },
                    { id: 'one-page-clean', label: 'One Page Clean', desc: 'Compact whitespace maximized layout' }
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setDefaultTemplate(tpl.id as ResumeTemplateId)}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        defaultTemplate === tpl.id
                          ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500/30'
                          : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{tpl.label}</span>
                        {defaultTemplate === tpl.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {tpl.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Settings: Autosave Toggle */}
              <div className="p-3.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Automatic Background Autosave
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Persist document modifications automatically every 400ms to local storage & cloud database.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    autoSaveEnabled ? 'bg-brand-600' : 'bg-slate-700'
                  }`}
                  aria-pressed={autoSaveEnabled}
                  title={autoSaveEnabled ? 'Disable Autosave' : 'Enable Autosave'}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* AI Model Preference */}
              <div>
                <label className="text-slate-300 font-medium block mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  AI Intelligence Model Preference
                </label>
                <select
                  value={aiModelPreference}
                  onChange={(e) => setAiModelPreference(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended - Ultra Low Latency)</option>
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Career Reasoning & LaTeX Polish)</option>
                </select>
              </div>

              {/* Export Page Limit */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">Target Page Output Length</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportPageLimit(1)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      exportPageLimit === 1
                        ? 'bg-brand-600 text-white border-brand-500'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Strict 1-Page ATS Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportPageLimit(2)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      exportPageLimit === 2
                        ? 'bg-brand-600 text-white border-brand-500'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    2-Page Comprehensive CV
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

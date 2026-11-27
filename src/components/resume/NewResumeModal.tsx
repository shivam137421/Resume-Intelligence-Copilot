import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Plus,
  X,
  Check,
  Layers,
  Briefcase,
  LayoutTemplate,
  User,
  ArrowRight
} from 'lucide-react';
import { ResumeTemplateId, CreateResumeOptions } from '../../types/resume';
import { RESUME_TEMPLATES } from '../../utils/defaultResume';

export interface NewResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateResume: (options: CreateResumeOptions) => void;
  defaultAuthorName?: string;
}

export const NewResumeModal: React.FC<NewResumeModalProps> = ({
  isOpen,
  onClose,
  onCreateResume,
  defaultAuthorName = ''
}) => {
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>('ats-minimal');
  const [creationMode, setCreationMode] = useState<'sample' | 'scratch'>('sample');
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [targetRole, setTargetRole] = useState('');

  const getTemplateElementId = (id: ResumeTemplateId): string => {
    switch (id) {
      case 'ats-minimal':
        return 'template-option-ats-minimal';
      case 'modern-engineering':
        return 'template-option-modern-engineering';
      case 'executive':
        return 'template-option-executive';
      case 'one-page-clean':
        return 'template-option-one-page-clean';
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateResume({
      title: title.trim() || undefined,
      templateId: selectedTemplate,
      fromScratch: creationMode === 'scratch',
      sampleData: creationMode === 'sample',
      authorName: authorName.trim() || undefined,
      targetRole: targetRole.trim() || undefined
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      id="new-resume-modal-backdrop"
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="new-resume-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl shadow-md shadow-brand-500/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Create New Resume
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  Factory
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Initialize a clean resume from scratch or with pre-populated industry defaults.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            id="new-resume-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Starting Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Choose Starting Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCreationMode('sample')}
                className={`flex items-start space-x-3 p-3.5 rounded-xl border text-left transition-all ${
                  creationMode === 'sample'
                    ? 'bg-brand-500/15 border-brand-500 text-white ring-1 ring-brand-500/30'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                }`}
                id="creation-mode-sample"
              >
                <div className={`p-2 rounded-lg mt-0.5 ${creationMode === 'sample' ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-sm block">Professional Sample Defaults</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Pre-populated with industry-grade metrics, achievements, skills, and projects ready to customize.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCreationMode('scratch')}
                className={`flex items-start space-x-3 p-3.5 rounded-xl border text-left transition-all ${
                  creationMode === 'scratch'
                    ? 'bg-brand-500/15 border-brand-500 text-white ring-1 ring-brand-500/30'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                }`}
                id="creation-mode-scratch"
              >
                <div className={`p-2 rounded-lg mt-0.5 ${creationMode === 'scratch' ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-sm block">Start from Scratch</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Clean slate with all standard industry sections (Experience, Skills, Education) pre-wired and empty.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Title & Metadata Inputs */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Document Details & Customization
            </label>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Resume Title <span className="text-slate-500 font-normal">(e.g., Target Role or Application Variant)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer - Google, Staff Cloud Architect"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                id="new-resume-title-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  id="new-resume-author-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  Target Headline / Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior AI Infrastructure Engineer"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  id="new-resume-headline-input"
                />
              </div>
            </div>
          </div>

          {/* Template Selection Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                3. Select Resume Template & Typography
              </label>
              <span className="text-[11px] text-brand-400 font-medium flex items-center gap-1">
                <LayoutTemplate className="w-3.5 h-3.5" />
                {RESUME_TEMPLATES.length} templates available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RESUME_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-slate-800 border-brand-500 shadow-md ring-1 ring-brand-500/40'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                    id={getTemplateElementId(tmpl.id)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />}
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700/80 text-brand-300 border border-slate-600">
                        {tmpl.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug mb-2">
                      {tmpl.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 border-t border-slate-700/40 pt-2">
                      <span>Font: <strong className="text-slate-200 capitalize">{tmpl.styling.fontFamily}</strong></span>
                      <span>• Margins: <strong className="text-slate-200 capitalize">{tmpl.styling.margins}</strong></span>
                      <div className="ml-auto flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tmpl.styling.primaryColor }} />
                        <span className="text-[10px] font-mono text-slate-400">{tmpl.styling.primaryColor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all transform active:scale-95"
              id="new-resume-submit-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

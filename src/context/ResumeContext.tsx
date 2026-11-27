import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ResumeData,
  HeaderData,
  ResumeVersion,
  JobDescription,
  ScoreBreakdown,
  HealthCheckResult,
  AIDiffPatch,
  ContentLibraryItem,
  JobApplicationHistory,
  WorkspaceTab,
  ResumeTemplateId,
  CreateResumeOptions,
  TemplateMetadata
} from '../types/resume';
import {
  createInitialResume,
  createInitialVersions,
  deepCloneResume,
  deepClone,
  generateLatexFromResume,
  createNewResume as createNewResumeFactory,
  switchResumeTemplate,
  RESUME_TEMPLATES
} from '../utils/defaultResume';
import { apiClient } from '../services/apiClient';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export interface ResumeContextType {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  resume: ResumeData;
  setResume: (resume: ResumeData) => void;
  updateResumeField: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  updateHeaderField: <K extends keyof HeaderData>(field: K, value: HeaderData[K]) => void;
  versions: ResumeVersion[];
  createVersion: (versionName: string, targetRole?: string, targetCompany?: string) => void;
  restoreVersion: (versionId: string) => void;
  deleteVersion: (versionId: string) => void;
  activeJd: JobDescription | null;
  setActiveJd: (jd: JobDescription | null) => void;
  scoreReport: ScoreBreakdown | null;
  setScoreReport: (report: ScoreBreakdown | null) => void;
  recalculateScore: (jdTextOverride?: string) => Promise<void>;
  healthCheck: HealthCheckResult | null;
  setHealthCheck: (health: HealthCheckResult | null) => void;
  runHealthCheck: () => Promise<void>;
  diffPatches: AIDiffPatch[];
  setDiffPatches: React.Dispatch<React.SetStateAction<AIDiffPatch[]>>;
  acceptPatch: (patchId: string) => void;
  rejectPatch: (patchId: string) => void;
  acceptAllPatches: () => void;
  rejectAllPatches: () => void;
  latexCode: string;
  setLatexCode: (code: string) => void;
  syncLatexFromResume: () => Promise<void>;
  isSaving: boolean;
  contentLibrary: ContentLibraryItem[];
  addToLibrary: (item: Omit<ContentLibraryItem, 'id' | 'userId' | 'createdAt'>) => void;
  removeFromLibrary: (id: string) => void;
  jobHistory: JobApplicationHistory[];
  addJobApplication: (app: Omit<JobApplicationHistory, 'id'>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetToDefault: () => void;
  createNewResume: (options?: CreateResumeOptions) => ResumeData;
  initializeFromTemplate: (templateId: ResumeTemplateId, title?: string, useSampleData?: boolean) => ResumeData;
  switchTemplate: (templateId: ResumeTemplateId) => void;
  availableTemplates: TemplateMetadata[];
  activeResumeId: string;
}

export const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In private browsing or sandboxed iframe
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Storage quota or sandboxed
    }
  }
};

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');

  const [resume, setResumeState] = useState<ResumeData>(() => {
    const local = safeLocalStorage.getItem('ai_resume_active');
    if (local) {
      try {
        return JSON.parse(local) as ResumeData;
      } catch {
        // Fallback if corrupted
      }
    }
    return createInitialResume();
  });

  // Undo/Redo stack with deep cloned snapshots
  const [history, setHistory] = useState<ResumeData[]>(() => [deepCloneResume(resume)]);
  const [historyPointer, setHistoryPointer] = useState<number>(0);

  const [versions, setVersions] = useState<ResumeVersion[]>(() => {
    const local = safeLocalStorage.getItem('ai_resume_versions');
    if (local) {
      try {
        return JSON.parse(local) as ResumeVersion[];
      } catch {
        // Fallback
      }
    }
    return createInitialVersions(createInitialResume());
  });

  const [activeJd, setActiveJd] = useState<JobDescription | null>(() => {
    const local = safeLocalStorage.getItem('ai_resume_active_jd');
    if (local) {
      try {
        return JSON.parse(local) as JobDescription;
      } catch {
        // Fallback
      }
    }
    return null;
  });

  const [scoreReport, setScoreReport] = useState<ScoreBreakdown | null>(null);
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult | null>(null);
  const [diffPatches, setDiffPatches] = useState<AIDiffPatch[]>([]);
  const [latexCode, setLatexCode] = useState<string>(() => generateLatexFromResume(resume));
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [contentLibrary, setContentLibrary] = useState<ContentLibraryItem[]>(() => {
    const local = safeLocalStorage.getItem('ai_resume_content_library');
    if (local) {
      try {
        return JSON.parse(local) as ContentLibraryItem[];
      } catch {
        // Fallback
      }
    }
    return [];
  });

  const [jobHistory, setJobHistory] = useState<JobApplicationHistory[]>(() => {
    const local = safeLocalStorage.getItem('ai_resume_job_history');
    if (local) {
      try {
        return JSON.parse(local) as JobApplicationHistory[];
      } catch {
        // Fallback
      }
    }
    return [];
  });

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Central resume updater with deep cloning and history snapshotting
  const setResume = useCallback((newResume: ResumeData) => {
    setIsSaving(true);
    const clonedResume = deepCloneResume(newResume);

    setResumeState(clonedResume);
    setHistory(h => {
      const sliced = h.slice(0, historyPointer + 1);
      return [...sliced, clonedResume];
    });
    setHistoryPointer(p => p + 1);

    safeLocalStorage.setItem('ai_resume_active', JSON.stringify(clonedResume));

    // Async sync to Supabase if authenticated
    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client.from('resumes').upsert({
            id: clonedResume.id,
            user_id: session.user.id,
            title: clonedResume.title,
            template_id: clonedResume.templateId,
            header: clonedResume.header,
            summary: clonedResume.summary,
            skills: clonedResume.skills,
            experience: clonedResume.experience,
            education: clonedResume.education,
            projects: clonedResume.projects,
            certifications: clonedResume.certifications,
            custom_sections: clonedResume.customSections,
            styling: clonedResume.styling,
            updated_at: new Date().toISOString()
          }).then(({ error }) => {
            if (error) console.warn('Supabase resume sync note:', error.message);
          });
        }
      });
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setIsSaving(false), 400);
  }, [historyPointer]);

  // Strictly typed top-level field update
  const updateResumeField = useCallback(<K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setResumeState(prev => {
      const updated: ResumeData = {
        ...deepCloneResume(prev),
        [field]: value,
        updatedAt: new Date().toISOString()
      };
      setResume(updated);
      return updated;
    });
  }, [setResume]);

  // Strictly typed header field update
  const updateHeaderField = useCallback(<K extends keyof HeaderData>(field: K, value: HeaderData[K]) => {
    setResumeState(prev => {
      const updated: ResumeData = {
        ...deepCloneResume(prev),
        header: {
          ...deepClone(prev.header),
          [field]: value
        },
        updatedAt: new Date().toISOString()
      };
      setResume(updated);
      return updated;
    });
  }, [setResume]);

  // Undo immutable navigation
  const undo = useCallback(() => {
    if (historyPointer > 0 && history[historyPointer - 1]) {
      const targetIndex = historyPointer - 1;
      const prev = deepCloneResume(history[targetIndex]);
      setResumeState(prev);
      setHistoryPointer(targetIndex);
      safeLocalStorage.setItem('ai_resume_active', JSON.stringify(prev));
    }
  }, [history, historyPointer]);

  // Redo immutable navigation
  const redo = useCallback(() => {
    if (historyPointer < history.length - 1 && history[historyPointer + 1]) {
      const targetIndex = historyPointer + 1;
      const next = deepCloneResume(history[targetIndex]);
      setResumeState(next);
      setHistoryPointer(targetIndex);
      safeLocalStorage.setItem('ai_resume_active', JSON.stringify(next));
    }
  }, [history, historyPointer]);

  // Recalculate score from active resume
  const recalculateScore = useCallback(async (jdTextOverride?: string) => {
    try {
      const text = jdTextOverride || activeJd?.rawText || '';
      const score = await apiClient.scoreResume(resume, text);
      setScoreReport(score);
    } catch {
      // Graceful offline fallback
    }
  }, [resume, activeJd]);

  // Run health check
  const runHealthCheck = useCallback(async () => {
    try {
      const result = await apiClient.runHealthCheck(resume);
      setHealthCheck(result);
    } catch {
      // Graceful offline fallback
    }
  }, [resume]);

  // LaTeX compiler & source synchronizer
  const syncLatexFromResume = useCallback(async () => {
    try {
      const res = await apiClient.compileLatex(resume);
      if (res.latexSource) {
        setLatexCode(res.latexSource);
        return;
      }
    } catch {
      // Offline fallback: generate locally
    }
    setLatexCode(generateLatexFromResume(resume));
  }, [resume]);

  // Version Control
  const createVersion = useCallback((versionName: string, targetRole?: string, targetCompany?: string) => {
    const newVer: ResumeVersion = {
      id: `ver-${Date.now()}`,
      resumeId: resume.id,
      versionName: versionName.trim() || 'Untitled Version',
      targetRole,
      targetCompany,
      resumeData: deepCloneResume(resume),
      score: scoreReport?.overallScore || 88,
      createdAt: new Date().toISOString()
    };
    const updatedVers = [newVer, ...versions];
    setVersions(updatedVers);
    safeLocalStorage.setItem('ai_resume_versions', JSON.stringify(updatedVers));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client.from('resume_versions').insert({
            resume_id: resume.id,
            user_id: session.user.id,
            version_name: newVer.versionName,
            target_role: targetRole,
            target_company: targetCompany,
            score: newVer.score,
            resume_data: newVer.resumeData
          }).then(({ error }) => {
            if (error) console.warn('Supabase version sync note:', error.message);
          });
        }
      });
    }
  }, [resume, scoreReport, versions]);

  const restoreVersion = useCallback((versionId: string) => {
    const target = versions.find(v => v.id === versionId);
    if (target) {
      setResume(deepCloneResume(target.resumeData));
    }
  }, [versions, setResume]);

  const deleteVersion = useCallback((versionId: string) => {
    const updated = versions.filter(v => v.id !== versionId);
    setVersions(updated);
    safeLocalStorage.setItem('ai_resume_versions', JSON.stringify(updated));
  }, [versions]);

  // AI Diff Patch resolutions
  const acceptPatch = useCallback((patchId: string) => {
    setDiffPatches(prev => prev.map(p => p.id === patchId ? { ...p, applied: true } : p));
  }, []);

  const rejectPatch = useCallback((patchId: string) => {
    setDiffPatches(prev => prev.filter(p => p.id !== patchId));
  }, []);

  const acceptAllPatches = useCallback(() => {
    setDiffPatches(prev => prev.map(p => ({ ...p, applied: true })));
  }, []);

  const rejectAllPatches = useCallback(() => {
    setDiffPatches([]);
  }, []);

  // Content Library Management
  const addToLibrary = useCallback((item: Omit<ContentLibraryItem, 'id' | 'userId' | 'createdAt'>) => {
    const newItem: ContentLibraryItem = {
      ...item,
      id: `lib-${Date.now()}`,
      userId: 'user-local',
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...contentLibrary];
    setContentLibrary(updated);
    safeLocalStorage.setItem('ai_resume_content_library', JSON.stringify(updated));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client.from('content_library').insert({
            user_id: session.user.id,
            category: item.category,
            title: item.title,
            data: item.data,
            tags: item.tags
          }).then(({ error }) => {
            if (error) console.warn('Supabase content library sync note:', error.message);
          });
        }
      });
    }
  }, [contentLibrary]);

  const removeFromLibrary = useCallback((id: string) => {
    const updated = contentLibrary.filter(item => item.id !== id);
    setContentLibrary(updated);
    safeLocalStorage.setItem('ai_resume_content_library', JSON.stringify(updated));
  }, [contentLibrary]);

  // Job Application Tracking
  const addJobApplication = useCallback((app: Omit<JobApplicationHistory, 'id'>) => {
    const newApp: JobApplicationHistory = {
      ...app,
      id: `app-${Date.now()}`
    };
    const updated = [newApp, ...jobHistory];
    setJobHistory(updated);
    safeLocalStorage.setItem('ai_resume_job_history', JSON.stringify(updated));
  }, [jobHistory]);

  // Reset to default sample resume
  const resetToDefault = useCallback(() => {
    const initial = createInitialResume();
    setResume(initial);
  }, [setResume]);

  // Create new resume from scratch or professional template
  const createNewResume = useCallback((options?: CreateResumeOptions): ResumeData => {
    const newResume = createNewResumeFactory(options);
    setResume(newResume);
    return newResume;
  }, [setResume]);

  // Convenience helper for initializing from a specific template
  const initializeFromTemplate = useCallback(
    (templateId: ResumeTemplateId, title?: string, useSampleData: boolean = true): ResumeData => {
      return createNewResume({
        templateId,
        title,
        sampleData: useSampleData,
        fromScratch: !useSampleData
      });
    },
    [createNewResume]
  );

  // Switch template layout and styling on existing resume
  const switchTemplate = useCallback(
    (templateId: ResumeTemplateId) => {
      setResumeState(prev => {
        const updated = switchResumeTemplate(prev, templateId);
        setResume(updated);
        return updated;
      });
    },
    [setResume]
  );

  // Sync active JD to safe storage when changed
  useEffect(() => {
    if (activeJd) {
      safeLocalStorage.setItem('ai_resume_active_jd', JSON.stringify(activeJd));
    }
  }, [activeJd]);

  return (
    <ResumeContext.Provider
      value={{
        activeTab,
        setActiveTab,
        resume,
        setResume,
        updateResumeField,
        updateHeaderField,
        versions,
        createVersion,
        restoreVersion,
        deleteVersion,
        activeJd,
        setActiveJd,
        scoreReport,
        setScoreReport,
        recalculateScore,
        healthCheck,
        setHealthCheck,
        runHealthCheck,
        diffPatches,
        setDiffPatches,
        acceptPatch,
        rejectPatch,
        acceptAllPatches,
        rejectAllPatches,
        latexCode,
        setLatexCode,
        syncLatexFromResume,
        isSaving,
        contentLibrary,
        addToLibrary,
        removeFromLibrary,
        jobHistory,
        addJobApplication,
        undo,
        redo,
        canUndo: historyPointer > 0,
        canRedo: historyPointer < history.length - 1,
        resetToDefault,
        createNewResume,
        initializeFromTemplate,
        switchTemplate,
        availableTemplates: RESUME_TEMPLATES,
        activeResumeId: resume.id
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

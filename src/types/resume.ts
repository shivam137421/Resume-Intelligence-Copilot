export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'github' | 'leetcode' | 'codechef' | 'gfg' | 'codeforces' | 'portfolio' | 'other';
  label: string;
  url: string;
  enabled: boolean;
}

export interface HeaderData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline?: string;
  links: SocialLink[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  technologies?: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  relevantCoursework?: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  bullets: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
  expiryDate?: string;
}

export interface SkillCategory {
  id: string;
  category: string; // e.g. "Languages", "Frameworks & Libraries", "Databases & Cloud"
  skills: string[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  bullets: string[];
}

export interface CustomSection {
  id: string;
  title: string; // e.g. "Publications", "Awards & Hackathons", "Open Source"
  items: CustomSectionItem[];
  enabled: boolean;
}

export interface ResumeStyling {
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'sm' | 'md' | 'lg';
  margins: 'compact' | 'normal' | 'spacious';
  primaryColor: string;
  showIcons: boolean;
}

export type ResumeTemplateId = 'ats-minimal' | 'modern-engineering' | 'executive' | 'one-page-clean';

export interface ResumeData {
  id: string;
  title: string;
  templateId: ResumeTemplateId;
  header: HeaderData;
  summary: string;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  customSections: CustomSection[];
  latexSource?: string;
  styling: ResumeStyling;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionName: string; // e.g., "Google Senior Backend", "Startup Frontend"
  targetCompany?: string;
  targetRole?: string;
  resumeData: ResumeData;
  score?: number;
  createdAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  rawText: string;
  url?: string;
  extractedRequirements?: {
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    seniority: string;
    keyTerms: string[];
    educationRequirements?: string;
  };
  createdAt: string;
}

export interface ScoreCategory {
  name: string;
  score: number; // 0-100
  maxScore: number;
  weight: number;
  explanation: string;
}

export type ActionableFixPayload =
  | { field: string; value: unknown }
  | Record<string, unknown>
  | string
  | string[]
  | number
  | boolean;

export interface ActionableSuggestion {
  id: string;
  section: string;
  issue: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  autoFixAvailable?: boolean;
  fixPayload?: ActionableFixPayload;
}

export interface ScoreBreakdown {
  overallScore: number;
  categories: {
    keywordMatch: ScoreCategory;
    skillCoverage: ScoreCategory;
    experienceRelevance: ScoreCategory;
    projectRelevance: ScoreCategory;
    formatting: ScoreCategory;
    atsCompatibility: ScoreCategory;
    readability: ScoreCategory;
    contentQuality: ScoreCategory;
    missingRequirements: ScoreCategory;
  };
  missingSkills: string[];
  matchingSkills: string[];
  actionableSuggestions: ActionableSuggestion[];
}

export interface HealthCheckIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'Grammar' | 'Bullet Quality' | 'Dates' | 'Duplicate Skills' | 'Broken Links' | 'Metrics' | 'Formatting';
  message: string;
  section: string;
  elementId?: string;
  fixSuggestion?: string;
}

export interface HealthCheckResult {
  overallHealthScore: number;
  issues: HealthCheckIssue[];
  totalErrors: number;
  totalWarnings: number;
  totalInfos: number;
}

export interface AIDiffPatch {
  id: string;
  explanation: string;
  section: string;
  type: 'addition' | 'modification' | 'removal';
  originalValue?: string | string[];
  newValue?: string | string[];
  applied: boolean;
}

export type ContentLibraryData =
  | ExperienceItem
  | ProjectItem
  | EducationItem
  | CertificationItem
  | SkillCategory
  | CustomSectionItem
  | Record<string, unknown>;

export interface ContentLibraryItem {
  id: string;
  userId: string;
  category: 'experience' | 'project' | 'education' | 'certification' | 'skill' | 'achievement';
  title: string;
  data: ContentLibraryData;
  tags: string[];
  createdAt: string;
}

export interface JobApplicationHistory {
  id: string;
  companyName: string;
  roleTitle: string;
  jobDescriptionText: string;
  resumeVersionId: string;
  matchScore: number;
  appliedDate: string;
  notes?: string;
}

export interface ChatSuggestedAction {
  label: string;
  action: string;
  payload?: Record<string, unknown> | string | number | boolean | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: ChatSuggestedAction[];
  diffPatch?: AIDiffPatch[];
}

export type WorkspaceTab =
  | 'dashboard'
  | 'editor'
  | 'latex'
  | 'preview'
  | 'jd-intelligence'
  | 'diff'
  | 'health-check'
  | 'content-library';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  headline?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  isGuest?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceSettings {
  userId: string;
  defaultTemplate: ResumeTemplateId;
  aiModelPreference: string;
  autoSaveEnabled: boolean;
  exportPageLimit: number;
  themePreference?: 'dark' | 'light' | 'system';
  updatedAt?: string;
}

export interface ProfileUpdatePayload {
  fullName?: string;
  headline?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
}

export interface SettingsUpdatePayload {
  defaultTemplate?: ResumeTemplateId;
  aiModelPreference?: string;
  autoSaveEnabled?: boolean;
  exportPageLimit?: number;
  themePreference?: 'dark' | 'light' | 'system';
}

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

export interface ResumeData {
  id: string;
  title: string;
  templateId: 'ats-minimal' | 'modern-engineering' | 'executive' | 'one-page-clean';
  header: HeaderData;
  summary: string;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  customSections: CustomSection[];
  latexSource?: string;
  styling: {
    fontFamily: 'sans' | 'serif' | 'mono';
    fontSize: 'sm' | 'md' | 'lg';
    margins: 'compact' | 'normal' | 'spacious';
    primaryColor: string;
    showIcons: boolean;
  };
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
  actionableSuggestions: {
    id: string;
    section: string;
    issue: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
    autoFixAvailable?: boolean;
    fixPayload?: any;
  }[];
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

export interface ContentLibraryItem {
  id: string;
  userId: string;
  category: 'experience' | 'project' | 'education' | 'certification' | 'skill' | 'achievement';
  title: string;
  data: any;
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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
  diffPatch?: AIDiffPatch[];
}

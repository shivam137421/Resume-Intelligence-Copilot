import {
  ResumeData,
  ScoreBreakdown,
  HealthCheckResult,
  JobDescription
} from '../types/resume';

const API_BASE = '/api';

export const apiClient = {
  async getStatus(): Promise<{ status: string; uptime: number; timestamp: string }> {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Status request failed');
    return res.json();
  },

  async extractDocument(file: File): Promise<{ text: string; metadata?: Record<string, unknown> }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Extraction failed');
    return res.json();
  },

  async importProfile(url: string): Promise<Partial<ResumeData>> {
    const res = await fetch(`${API_BASE}/profile/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error('Profile extraction failed');
    return res.json();
  },

  async sendCopilotMessage(message: string, resumeData: ResumeData, targetJd?: string): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, resumeData, targetJd })
    });
    if (!res.ok) throw new Error('Copilot request failed');
    return res.json();
  },

  async askFloatingAssistant(question: string): Promise<{ answer: string }> {
    const res = await fetch(`${API_BASE}/ai/faq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!res.ok) throw new Error('FAQ request failed');
    return res.json();
  },

  async analyzeJd(jdText: string): Promise<JobDescription> {
    const res = await fetch(`${API_BASE}/ai/jd-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jdText })
    });
    if (!res.ok) throw new Error('JD Analysis failed');
    return res.json();
  },

  async scoreResume(resumeData: ResumeData, jdText: string = ''): Promise<ScoreBreakdown> {
    const res = await fetch(`${API_BASE}/ai/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, jdText })
    });
    if (!res.ok) throw new Error('Scoring failed');
    return res.json();
  },

  async runHealthCheck(resumeData: ResumeData): Promise<HealthCheckResult> {
    const res = await fetch(`${API_BASE}/health-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData })
    });
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async validateLinks(resumeData: ResumeData): Promise<{ valid: boolean; results: unknown[] }> {
    const res = await fetch(`${API_BASE}/validate-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData })
    });
    if (!res.ok) throw new Error('Link validation failed');
    return res.json();
  },

  async compileLatex(resumeData: ResumeData): Promise<{ success: boolean; latexSource?: string; pdfUrl?: string }> {
    const res = await fetch(`${API_BASE}/compile-latex`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData })
    });
    if (!res.ok) throw new Error('LaTeX compilation failed');
    return res.json();
  }
};

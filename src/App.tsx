import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Palette,
  Type,
  Layout,
  Component as ComponentIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  ShieldCheck,
  Code2,
  Zap,
  Star,
  Download,
  Search,
  FileText
} from 'lucide-react';

interface DiagnosticResponse {
  checkpoint: string;
  status: string;
  timestamp: string;
  matrix: {
    server: {
      port: number | string;
      nodeEnv: string;
      serverSecretsIsolated: boolean;
    };
    designSystem?: {
      theme: string;
      typography: string[];
      responsiveShell: string;
      glassmorphicHeaders: string;
      customScrollbars: string;
    };
  };
}

export function App() {
  const [activeTab, setActiveTab] = useState<'palette' | 'typography' | 'components' | 'responsive' | 'diagnostics'>('palette');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleInputValue, setSampleInputValue] = useState<string>('Senior Fullstack Engineer');
  const [sampleToggle, setSampleToggle] = useState<boolean>(true);
  const [accentColor, setAccentColor] = useState<string>('#0c8ee9');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/config-status');
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data: DiagnosticResponse = await res.json();
      setDiagnosticData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch diagnostic state from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const brandSwatches = [
    { label: 'brand-50', hex: '#f0f7ff', textDark: true },
    { label: 'brand-100', hex: '#e0effe', textDark: true },
    { label: 'brand-200', hex: '#bae0fd', textDark: true },
    { label: 'brand-300', hex: '#7cc8fc', textDark: true },
    { label: 'brand-400', hex: '#36abfa', textDark: false },
    { label: 'brand-500', hex: '#0c8ee9', textDark: false, primary: true },
    { label: 'brand-600', hex: '#0270c7', textDark: false },
    { label: 'brand-700', hex: '#0359a1', textDark: false },
    { label: 'brand-800', hex: '#074c85', textDark: false },
    { label: 'brand-900', hex: '#0c406e', textDark: false },
    { label: 'brand-950', hex: '#082849', textDark: false },
  ];

  const darkSlateSwatches = [
    { label: 'dark.bg', hex: '#0b1120', desc: 'App backdrop' },
    { label: 'dark.surface', hex: '#0f172a', desc: 'Panel surface' },
    { label: 'dark.card', hex: '#1e293b', desc: 'Component card' },
    { label: 'dark.card-hover', hex: '#243248', desc: 'Hover state' },
    { label: 'dark.border', hex: '#334155', desc: 'Subtle boundary' },
    { label: 'dark.muted', hex: '#64748b', desc: 'Secondary text' },
  ];

  const semanticSwatches = [
    { label: 'accent.emerald', hex: '#10b981', name: 'ATS Pass / Success' },
    { label: 'accent.amber', hex: '#f59e0b', name: 'Warning / In Progress' },
    { label: 'accent.rose', hex: '#f43f5e', name: 'Skill Gap / Destructive' },
    { label: 'accent.indigo', hex: '#6366f1', name: 'AI Copilot / Prompt' },
    { label: 'accent.violet', hex: '#8b5cf6', name: 'LaTeX Generator' },
    { label: 'accent.cyan', hex: '#06b6d4', name: 'JD Intelligence' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500/30 selection:text-brand-200">
      {/* Glassmorphic Header Shell */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 text-white h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                ResumeSync
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Checkpoint 04
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-medium">Design System & Modern UI Foundation</p>
          </div>
        </div>

        {/* Global Controls & Status Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Palette className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-mono text-[11px]">Tailwind v3.4 + Inter</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Design Tokens Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
        {/* Hero Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Modern SaaS Aesthetic Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Design System & UI Foundation
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Engineered with Tailwind CSS custom brand tokens, dark slate aesthetics, glassmorphic headers, responsive layout containers, and triple typography scales (<span className="text-brand-300 font-medium">Inter</span> for SaaS UI, <span className="text-brand-300 font-medium">Merriweather</span> for resume documents, and <span className="text-brand-300 font-medium">JetBrains Mono</span> for LaTeX & code).
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="relative z-10 flex flex-wrap gap-2 pt-6 mt-6 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('palette')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'palette'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Color Palette Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'typography'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Typography Scales</span>
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'components'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <ComponentIcon className="w-4 h-4" />
              <span>UI Component Primitives</span>
            </button>
            <button
              onClick={() => setActiveTab('responsive')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'responsive'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Responsive Shell Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'diagnostics'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Diagnostic Audit</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Color Palette Matrix */}
        {activeTab === 'palette' && (
          <div className="space-y-6">
            {/* Brand Colors */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-brand-400" />
                    <span>Brand Color Palette (brand-50 to brand-950)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Primary brand colors tailored for focus states, call-to-actions, and active navigation.</p>
                </div>
                {copiedHex && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied {copiedHex}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2.5">
                {brandSwatches.map((swatch) => (
                  <button
                    key={swatch.label}
                    onClick={() => copyToClipboard(swatch.hex)}
                    style={{ backgroundColor: swatch.hex }}
                    className={`h-24 p-2.5 rounded-xl flex flex-col justify-between transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer text-left border ${
                      swatch.primary ? 'ring-2 ring-white/50 border-white' : 'border-black/10'
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${swatch.textDark ? 'text-slate-900' : 'text-white'}`}>
                      {swatch.label.replace('brand-', '')}
                      {swatch.primary && ' ★'}
                    </span>
                    <span className={`text-[10px] font-mono ${swatch.textDark ? 'text-slate-700' : 'text-slate-200'}`}>
                      {swatch.hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Slate Surfaces & Semantic Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dark Slate UI Surfaces */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Dark Slate Surface Tokens</span>
                </h3>
                <p className="text-xs text-slate-400">Structured dark slate tones for high-contrast, eye-friendly SaaS layout hierarchy.</p>
                <div className="space-y-2">
                  {darkSlateSwatches.map((item) => (
                    <div
                      key={item.label}
                      onClick={() => copyToClipboard(item.hex)}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg border border-slate-700 shadow-inner" style={{ backgroundColor: item.hex }} />
                        <div>
                          <div className="text-xs font-semibold text-slate-200 font-mono">{item.label}</div>
                          <div className="text-[11px] text-slate-400">{item.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                        <span>{item.hex}</span>
                        <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semantic Status Colors */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Semantic & Intelligence Accents</span>
                </h3>
                <p className="text-xs text-slate-400">Distinct functional accents for ATS feedback, AI copilot actions, and status indicators.</p>
                <div className="space-y-2">
                  {semanticSwatches.map((item) => (
                    <div
                      key={item.label}
                      onClick={() => copyToClipboard(item.hex)}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg border border-white/20 shadow-inner" style={{ backgroundColor: item.hex }} />
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{item.label}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                        <span>{item.hex}</span>
                        <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Typography Scales */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sans-Serif: Inter */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    SaaS Interface
                  </span>
                  <span className="text-xs text-slate-500 font-mono">font-sans</span>
                </div>
                <h3 className="text-xl font-bold text-white font-sans">Inter</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clean, modern geometric sans-serif designed for high legibility on computer screens and dashboard interfaces.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-sans text-xs space-y-1 text-slate-300">
                  <div className="font-light">Inter Light (300) — Subtext & captions</div>
                  <div className="font-normal">Inter Regular (400) — Standard body text</div>
                  <div className="font-medium">Inter Medium (500) — Navigation & form labels</div>
                  <div className="font-semibold">Inter SemiBold (600) — Section headers</div>
                  <div className="font-bold">Inter Bold (700) — Prominent titles & metrics</div>
                </div>
              </div>

              {/* Serif: Merriweather */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Resume Document
                  </span>
                  <span className="text-xs text-slate-500 font-mono">font-serif</span>
                </div>
                <h3 className="text-xl font-bold text-white font-serif">Merriweather</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Refined editorial serif crafted for pleasant reading on executive, academic, and classical paper resume templates.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-serif text-xs space-y-1 text-slate-300">
                  <div className="font-normal">Merriweather Regular — Professional resume narrative</div>
                  <div className="font-bold">Merriweather Bold — Executive section titles</div>
                  <div className="italic">Merriweather Italic — University honors & role dates</div>
                </div>
              </div>

              {/* Monospace: JetBrains Mono */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    LaTeX & Code
                  </span>
                  <span className="text-xs text-slate-500 font-mono">font-mono</span>
                </div>
                <h3 className="text-xl font-bold text-white font-mono">JetBrains Mono</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ligature-rich monospaced font tailored for Overleaf LaTeX code editor, diff viewers, and ATS keyword tokens.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs space-y-1 text-slate-300">
                  <div>\textbf&#123;Fullstack Engineer&#125;</div>
                  <div className="text-emerald-400">+ React 19, TypeScript, Node.js</div>
                  <div className="text-slate-400">&#123; ats_score: 94, verified: true &#125;</div>
                </div>
              </div>
            </div>

            {/* Typographic Scale Hierarchy */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-semibold text-white">Typographic Hierarchy & Sizing Scale</h3>
              <div className="space-y-4 divide-y divide-slate-800">
                <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">Display Heading (3xl/4xl)</span>
                  <span className="text-xs font-mono text-slate-500">32px / 2.25rem — font-extrabold</span>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold text-slate-100">Section Header H2 (2xl)</span>
                  <span className="text-xs font-mono text-slate-500">24px / 1.5rem — font-bold</span>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-lg font-semibold text-slate-200">Subsection Header H3 (lg/xl)</span>
                  <span className="text-xs font-mono text-slate-500">18px / 1.125rem — font-semibold</span>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-sm font-normal text-slate-300">Standard Body Text (sm) — Crisp and readable for long descriptions and resume bullets</span>
                  <span className="text-xs font-mono text-slate-500">14px / 0.875rem — font-normal</span>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400">Metadata & Captions (xs / 11px) — Timestamps, badges, and helper notes</span>
                  <span className="text-xs font-mono text-slate-500">12px / 0.75rem — font-medium</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: UI Component Primitives */}
        {activeTab === 'components' && (
          <div className="space-y-6">
            {/* Buttons & Actions */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-brand-400" />
                <span>Button Primitives & Interactive Micro-Animations</span>
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Primary Brand Action</span>
                </button>
                <button className="btn-secondary">
                  <FileText className="w-4 h-4" />
                  <span>Secondary Outline</span>
                </button>
                <button className="btn-ghost">
                  <Code2 className="w-4 h-4" />
                  <span>Ghost Button</span>
                </button>
                <button className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium transition cursor-pointer active:scale-95">
                  <AlertCircle className="w-4 h-4" />
                  <span>Destructive Action</span>
                </button>
                <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Badges, Status Chips & Form Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Chips */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-semibold text-white">Status Chips & ATS Badges</h3>
                <div className="flex flex-wrap gap-2.5">
                  <span className="badge-emerald">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ATS Score: 96/100 (Pass)</span>
                  </span>
                  <span className="badge-brand">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Copilot Ready</span>
                  </span>
                  <span className="badge-amber">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Autosaving (240ms)</span>
                  </span>
                  <span className="badge-rose">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing 2 JD Keywords</span>
                  </span>
                </div>
              </div>

              {/* Form Controls & Focus States */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-semibold text-white">Form Inputs & Micro-Interactions</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={sampleInputValue}
                      onChange={(e) => setSampleInputValue(e.target.value)}
                      placeholder="Enter target job role..."
                      className="input-primary pl-10"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs font-medium text-slate-300">Enable Live ATS Dynamic Scoring</span>
                    <button
                      onClick={() => setSampleToggle(!sampleToggle)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        sampleToggle ? 'bg-brand-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          sampleToggle ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Glassmorphic Card Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">Glassmorphic Container</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tailwind backdrop-blur-md combined with translucent slate surfaces creates depth without obscuring background content.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-3 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">Interactive Card Hover</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Smooth transitions with border highlighting and glow shadow for elevated user feedback during navigation.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">Custom Scrollbar Area</h4>
                <div className="h-20 overflow-y-auto pr-2 text-xs text-slate-400 space-y-1">
                  <p>1. Tailored 6px scrollbars</p>
                  <p>2. Slate-800 background tracks</p>
                  <p>3. Slate-600 rounded thumb grips</p>
                  <p>4. Smooth scroll animations</p>
                  <p>5. Zero horizontal scroll overflow</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Responsive Layout Simulator */}
        {activeTab === 'responsive' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-brand-400" />
                    <span>Responsive Breakpoint & Viewport Simulator</span>
                  </h3>
                  <p className="text-xs text-slate-400">Test how the layout shell and component grid respond across various device widths.</p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    onClick={() => setViewportMode('desktop')}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      viewportMode === 'desktop' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop (100%)</span>
                  </button>
                  <button
                    onClick={() => setViewportMode('tablet')}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      viewportMode === 'tablet' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>Tablet (768px)</span>
                  </button>
                  <button
                    onClick={() => setViewportMode('mobile')}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      viewportMode === 'mobile' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (375px)</span>
                  </button>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-center overflow-x-auto">
                <div
                  className={`transition-all duration-300 border border-slate-800 rounded-2xl bg-slate-900/90 p-5 space-y-4 shadow-2xl ${
                    viewportMode === 'desktop'
                      ? 'w-full'
                      : viewportMode === 'tablet'
                      ? 'w-[768px]'
                      : 'w-[375px]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {viewportMode === 'desktop' ? '1280px × 800px (Desktop)' : viewportMode === 'tablet' ? '768px × 1024px (Tablet)' : '375px × 812px (Mobile)'}
                    </span>
                  </div>

                  {/* Mock Layout Wireframe */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-brand-400">Panel 1: Navigation</span>
                      <p className="text-[10px] text-slate-400">Active tab state & quick shortcuts</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-indigo-400">Panel 2: Editor</span>
                      <p className="text-[10px] text-slate-400">Live resume form fields</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-emerald-400">Panel 3: Preview</span>
                      <p className="text-[10px] text-slate-400">Paper document canvas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Diagnostic Audit */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Design System & Server Diagnostic Verification</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Validate live server endpoints and design system configuration state.</p>
                </div>
                <button
                  onClick={fetchDiagnostics}
                  disabled={loading}
                  className="btn-primary self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Auditing...' : 'Re-run Audit'}</span>
                </button>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {diagnosticData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Theme</span>
                    <span className="text-xs font-semibold text-brand-400">{diagnosticData.matrix.designSystem?.theme || 'Dark Slate & Brand Blue'}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Typography</span>
                    <span className="text-xs font-semibold text-slate-200">Inter, Merriweather, JetBrains</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Responsive Shell</span>
                    <span className="inline-flex items-center text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Glassmorphism</span>
                    <span className="inline-flex items-center text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Configured
                    </span>
                  </div>
                </div>
              )}

              {diagnosticData && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
                    <span>Diagnostic Payload:</span>
                    <span className="text-[11px] text-slate-500 font-mono">{diagnosticData.timestamp}</span>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400 bg-slate-950/90 p-4 rounded-xl border border-slate-800/80 overflow-x-auto">
                    {JSON.stringify(diagnosticData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

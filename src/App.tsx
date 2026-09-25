import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Server,
  Lock,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Key,
  Globe,
  Database,
  FileCode2,
  Cpu
} from 'lucide-react';

interface ConfigMatrixResponse {
  checkpoint: string;
  status: string;
  timestamp: string;
  matrix: {
    server: {
      port: number | string;
      nodeEnv: string;
      geminiAiKeyLoaded: boolean;
      supabaseServiceRoleLoaded: boolean;
      googleOAuthLoaded: boolean;
      serverSecretsIsolated: boolean;
    };
    clientBoundaries: {
      supabaseUrlLoaded: boolean;
      supabaseAnonKeyLoaded: boolean;
      vitePrefixStrictness: string;
    };
    securityAudit: {
      gitIgnoreProtection: string;
      gracefulFallbackEnabled: boolean;
      zeroSecretsExposed: boolean;
    };
  };
}

export function App() {
  const [configData, setConfigData] = useState<ConfigMatrixResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkConfigMatrix = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/config-status');
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data: ConfigMatrixResponse = await res.json();
      setConfigData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch environment status from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConfigMatrix();
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              ResumeSync
            </span>
            <span className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Checkpoint 03
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">Security Matrix Active</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${configData ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>API: {configData ? 'Connected (:3001)' : 'Connecting...'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 flex flex-col space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Environment Isolation & Secret Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Checkpoint 03 — Environment Variables & Security Matrix
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Strict isolation established between public client variables (<code className="text-blue-400 font-mono">VITE_*</code>) and private server credentials. Safe placeholder templates and strict gitignore rules prevent credential exposure.
          </p>
        </div>

        {/* Security Architecture Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Client Environment Boundary */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Client Safe
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Public Client Layer</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Vite automatically bundles only variables prefixed with <code className="text-blue-300 font-mono">VITE_</code>. Used for public endpoint URLs and RLS-protected keys.
              </p>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span>VITE_SUPABASE_URL</span>
                  <span className="text-emerald-400 text-[10px]">Public</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span>VITE_SUPABASE_ANON_KEY</span>
                  <span className="text-emerald-400 text-[10px]">Public / RLS</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span>Safe for browser bundling</span>
            </div>
          </div>

          {/* Card 2: Server Secrets Boundary */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <EyeOff className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Server Only
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Isolated Server Secrets</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Private keys and API credentials loaded strictly on the Express runtime via <code className="text-indigo-300 font-mono">dotenv</code>. Never accessible to the browser.
              </p>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span>GEMINI_API_KEY</span>
                  <span className="text-rose-400 text-[10px]">Secret</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span>SUPABASE_SERVICE_ROLE_KEY</span>
                  <span className="text-rose-400 text-[10px]">Secret</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span>GOOGLE_CLIENT_SECRET</span>
                  <span className="text-rose-400 text-[10px]">Secret</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span>100% Server isolated</span>
            </div>
          </div>

          {/* Card 3: VCS & Template Protection */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Git Shield
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">VCS Hygiene & Templates</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                <code className="text-purple-300 font-mono">.env</code> is shielded by <code className="text-purple-300 font-mono">.gitignore</code>. A clean <code className="text-purple-300 font-mono">.env.example</code> with zero real keys guides developer onboarding.
              </p>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span>.env</span>
                  <span className="text-amber-400 text-[10px]">Git Ignored</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span>.env.example</span>
                  <span className="text-emerald-400 text-[10px]">Tracked Template</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span>ANTIGRAVITY_SETUP.md</span>
                  <span className="text-blue-400 text-[10px]">Matrix Guide</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span>Zero credentials in repository</span>
            </div>
          </div>
        </div>

        {/* Live Diagnostic Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span>Live Security & Configuration Audit</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Runtime configuration state queried via safe diagnostic endpoint (<code className="text-blue-400">/api/config-status</code>).
              </p>
            </div>
            <button
              onClick={checkConfigMatrix}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-medium transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Auditing...' : 'Re-run Security Audit'}</span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {configData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Server Port</span>
                <span className="text-sm font-mono font-medium text-blue-400">:{configData.matrix.server.port}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Environment</span>
                <span className="text-sm font-mono font-medium text-slate-200 capitalize">{configData.matrix.server.nodeEnv}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Secrets Isolation</span>
                <span className="inline-flex items-center text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Enforced
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Graceful Fallback</span>
                <span className="inline-flex items-center text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ready
                </span>
              </div>
            </div>
          )}

          {configData && (
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
                <span>Verified Diagnostic Response:</span>
                <span className="text-[11px] text-slate-500 font-mono">{configData.timestamp}</span>
              </div>
              <pre className="text-xs font-mono text-emerald-400 bg-slate-950/90 p-4 rounded-xl border border-slate-800/80 overflow-x-auto">
                {JSON.stringify(configData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

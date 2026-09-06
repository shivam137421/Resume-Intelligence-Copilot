import React, { useState, useEffect } from 'react';
import { Sparkles, Server, Laptop, Activity, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface HealthStatus {
  status: string;
  time?: string;
}

interface ApiStatus {
  status: string;
  product?: string;
  checkpoint?: string;
  timestamp?: string;
}

export function App() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [apiData, setApiData] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnectivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, statusRes] = await Promise.all([
        fetch('/health'),
        fetch('/api/status')
      ]);

      if (!healthRes.ok || !statusRes.ok) {
        throw new Error('Server returned an error status');
      }

      const health = await healthRes.json();
      const status = await statusRes.json();

      setHealthData(health);
      setApiData(status);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-950 text-slate-100 font-sans select-none">
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
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-blue-500/20">
              Resume Intelligence Copilot
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${healthData?.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>Server: {healthData?.status === 'ok' ? 'Online (:3001)' : 'Connecting...'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner">
          <Server className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Checkpoint 02 — Development Environment & Server Orchestration
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Concurrent runner active for Vite frontend (<code className="text-blue-400">:5173</code>) and Express Node.js backend (<code className="text-indigo-400">:3001</code>) with live hot-reloading and proxy routing.
          </p>
        </div>

        {/* Status Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left">
          {/* Client Runner Status */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vite Client</span>
                </div>
                <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Active (:5173)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hot Module Replacement (HMR) active. Client UI fast reloads on file modification.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
              <span>Runner: <span className="text-slate-400">vite</span></span>
              <span>Proxy: <span className="text-slate-400">/api, /health</span></span>
            </div>
          </div>

          {/* Express Server Status */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Express API</span>
                </div>
                {healthData?.status === 'ok' ? (
                  <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Healthy (:3001)
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <AlertCircle className="w-3 h-3 mr-1" /> Awaiting Server
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Managed via <code className="text-slate-300">tsx watch</code> with live server reloads and CORS middleware.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
              <span>Endpoint: <span className="text-slate-400">GET /health</span></span>
              <span>Status: <span className="text-slate-400">{healthData?.status || 'connecting'}</span></span>
            </div>
          </div>
        </div>

        {/* API Response Verification Preview */}
        {apiData && (
          <div className="w-full max-w-2xl bg-slate-900/40 rounded-xl border border-slate-800 p-4 text-left">
            <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
              <span>Verified Endpoint Response (<code className="text-blue-400">/api/status</code>):</span>
              <span className="text-[11px] text-slate-500">{apiData.timestamp}</span>
            </div>
            <pre className="text-xs font-mono text-emerald-400 bg-slate-950/80 p-3 rounded-lg border border-slate-800/60 overflow-x-auto">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="w-full max-w-2xl bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-300 text-xs flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={checkConnectivity}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-medium transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Testing Connectivity...' : 'Re-test Server Health'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;

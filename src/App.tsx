import React from 'react';
import { Sparkles, Layers, FileText } from 'lucide-react';

export function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 font-sans select-none">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg">
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
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-2xl mx-auto">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Checkpoint 01 — Foundation & Project Architecture
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Resume Intelligence Copilot base foundation initialized. Ready for progressive checkpoint execution.
        </p>
      </main>
    </div>
  );
}

export default App;

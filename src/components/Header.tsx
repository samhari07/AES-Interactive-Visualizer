import React from 'react';
import { ShieldCheck, BookOpen, Sparkles, RefreshCw, Cpu, Layers } from 'lucide-react';

interface HeaderProps {
  currentRound: number;
  totalRounds: number;
  activeView: 'step-sandbox' | 'round-tour' | 'sbox-table' | 'avalanche';
  setActiveView: (view: 'step-sandbox' | 'round-tour' | 'sbox-table' | 'avalanche') => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRound,
  totalRounds,
  activeView,
  setActiveView,
  onReset
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AES Visual Standard
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-cyan-950/90 text-cyan-400 border border-cyan-500/30 rounded-full">
                CS201 Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive Rijndael 128-bit Cipher Architecture & Transformations
            </p>
          </div>
        </div>

        {/* View Switcher / Educational Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            id="tab-sandbox"
            onClick={() => setActiveView('step-sandbox')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeView === 'step-sandbox'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Steps</span>
          </button>

          <button
            id="tab-sbox"
            onClick={() => setActiveView('sbox-table')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeView === 'sbox-table'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>S-Box Matrix</span>
          </button>

          <button
            id="tab-avalanche"
            onClick={() => setActiveView('avalanche')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeView === 'avalanche'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Avalanche Lab</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Round</span>
            <span className="font-bold text-cyan-400">{currentRound}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{totalRounds}</span>
          </div>

          <button
            id="btn-reset-global"
            onClick={onReset}
            title="Reset to initial 16-character input"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

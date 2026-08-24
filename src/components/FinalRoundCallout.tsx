import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  XCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  Repeat, 
  HelpCircle,
  Zap
} from 'lucide-react';

export const FinalRoundCallout: React.FC = () => {
  const [selectedRoundType, setSelectedRoundType] = useState<'standard' | 'final'>('final');

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      
      {/* Decorative Amber Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-400 border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              Core Exam Concept
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              The Final Round Difference: Why Skip MixColumns?
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            In AES-128, Rounds 1 through 9 execute 4 transformations, while Round 10 executes only 3.
          </p>
        </div>

        {/* Round Pipeline Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setSelectedRoundType('standard')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedRoundType === 'standard'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Rounds 1–9 (Standard)</span>
          </button>
          <button
            onClick={() => setSelectedRoundType('final')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedRoundType === 'final'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Round 10 (Final Round)</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Comparison Diagram */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          {selectedRoundType === 'standard' ? 'Standard Round (4 Transformations):' : 'Final Round 10 (3 Transformations — MixColumns Omitted):'}
        </span>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          
          {/* Step 1: SubBytes */}
          <div className="w-full sm:flex-1 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-center">
            <span className="text-[10px] text-emerald-400 block font-semibold">1. SubBytes</span>
            <span className="text-white text-xs font-bold">Non-linear S-Box</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 sm:rotate-0 shrink-0" />

          {/* Step 2: ShiftRows */}
          <div className="w-full sm:flex-1 p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-center">
            <span className="text-[10px] text-amber-400 block font-semibold">2. ShiftRows</span>
            <span className="text-white text-xs font-bold">Row Permutation</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 sm:rotate-0 shrink-0" />

          {/* Step 3: MixColumns (Active vs Omitted) */}
          <div className={`w-full sm:flex-1 p-2.5 rounded-lg text-center transition-all ${
            selectedRoundType === 'standard'
              ? 'bg-cyan-950/60 border border-cyan-500/40'
              : 'bg-red-950/40 border border-red-500/40 opacity-70 relative'
          }`}>
            <span className={`text-[10px] block font-semibold ${
              selectedRoundType === 'standard' ? 'text-cyan-400' : 'text-red-400 line-through'
            }`}>
              3. MixColumns
            </span>
            <span className={`text-xs font-bold ${
              selectedRoundType === 'standard' ? 'text-white' : 'text-red-300'
            }`}>
              {selectedRoundType === 'standard' ? 'GF(2⁸) Matrix Mul' : '❌ SKIPPED'}
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 rotate-90 sm:rotate-0 shrink-0" />

          {/* Step 4: AddRoundKey */}
          <div className="w-full sm:flex-1 p-2.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-center">
            <span className="text-[10px] text-purple-400 block font-semibold">4. AddRoundKey</span>
            <span className="text-white text-xs font-bold">XOR with Key K₁₀</span>
          </div>

        </div>
      </div>

      {/* Three Detailed CS 2nd-Year Reasons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        {/* Reason 1 */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Repeat className="w-4 h-4 text-amber-400 shrink-0" />
            <h4>1. Decryption Symmetry</h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Decryption reverses the cipher. If Round 10 had <code>MixColumns</code>, decryption would require an awkward extra <code>InvMixColumns</code> right at the start before the first round key XOR. Skipping it makes decryption a clean, mirror-like inverse cipher.
          </p>
        </div>

        {/* Reason 2 */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <h4>2. Hardware Efficiency</h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            By making the structure symmetrical between encryption and decryption, hardware chips (like smartcards and crypto accelerators) can reuse the exact same ALU data paths and state registers, saving valuable silicon area.
          </p>
        </div>

        {/* Reason 3 */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <h4>3. No Loss in Security</h4>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Because <code>MixColumns</code> is purely linear in GF(2⁸), executing it right before an <code>AddRoundKey</code> without any following non-linear S-Box provides zero extra cryptographic security. An attacker could trivially reverse it algebraically.
          </p>
        </div>

      </div>
    </div>
  );
};

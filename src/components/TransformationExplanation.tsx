import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TransformationType, 
  SubBytesDetail, 
  ShiftRowsDetail, 
  MixColumnsDetail, 
  AddRoundKeyDetail 
} from '../types/aes';
import { TRANSFORMATION_METADATA, toHex, toBin, toPrintableChar } from '../utils/aesEngine';
import { 
  Shuffle, 
  MoveHorizontal, 
  Blend, 
  KeyRound, 
  Lightbulb, 
  Binary, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';

interface TransformationExplanationProps {
  currentStep: TransformationType;
  stepDetails?: any;
  currentRound: number;
}

export const TransformationExplanation: React.FC<TransformationExplanationProps> = ({
  currentStep,
  stepDetails,
  currentRound
}) => {
  const [activeTab, setActiveTab] = useState<'analogy' | 'mechanics' | 'math'>('analogy');
  const meta = TRANSFORMATION_METADATA[currentStep];

  const getStepIcon = () => {
    switch (currentStep) {
      case 'SUB_BYTES': return <Shuffle className="w-5 h-5 text-emerald-400" />;
      case 'SHIFT_ROWS': return <MoveHorizontal className="w-5 h-5 text-amber-400" />;
      case 'MIX_COLUMNS': return <Blend className="w-5 h-5 text-cyan-400" />;
      case 'ADD_ROUND_KEY': return <KeyRound className="w-5 h-5 text-purple-400" />;
      default: return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Title & Analogy Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.color.border} ${meta.color.badgeBg}`}>
            {getStepIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                {meta.title}
              </h3>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${meta.color.badgeBg} ${meta.color.badgeText} ${meta.color.border}`}>
                Round {currentRound}
              </span>
            </div>
            <p className="text-xs text-slate-400">{meta.tagline}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('analogy')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'analogy'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Friendly Analogy</span>
          </button>

          <button
            onClick={() => setActiveTab('mechanics')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'mechanics'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>How It Works</span>
          </button>

          <button
            onClick={() => setActiveTab('math')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'math'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-purple-400" />
            <span>Math & Cryptanalysis</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      <AnimatePresence mode="wait">
        
        {/* Tab 1: Real-World Analogy (Simple & Friendly for Students) */}
        {activeTab === 'analogy' && (
          <motion.div
            key="tab-analogy"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3"
          >
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <span>Real-World Analogy:</span>
                  <span className="text-white">"{meta.analogy.title}"</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {meta.analogy.description}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-400 font-medium">Shannon Principle:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">
                    {currentStep === 'SUB_BYTES' ? 'CONFUSION' : currentStep === 'SHIFT_ROWS' || currentStep === 'MIX_COLUMNS' ? 'DIFFUSION' : 'KEY ENCRYPTION'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{meta.purposeInAES}</span>
                </div>
              </div>
            </div>

            {/* Visual Micro-Demonstration based on Current Step */}
            {currentStep === 'SUB_BYTES' && (
              <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3 text-xs space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">
                  S-Box Lookup Flow Sample:
                </span>
                <div className="flex items-center gap-2 font-mono flex-wrap">
                  <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200">
                    Input Byte: <strong className="text-cyan-400">0x53 ('S')</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300">
                    Lookup S-Box[Row <strong className="text-emerald-400">5</strong>, Col <strong className="text-emerald-400">3</strong>]
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="px-2 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-300 font-bold">
                    Output Byte: 0xED
                  </span>
                </div>
              </div>
            )}

            {currentStep === 'SHIFT_ROWS' && (
              <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3 text-xs space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">
                  Cyclic Left Shift Offsets:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Row 0</span>
                    <span className="text-amber-300 font-bold">Shift 0 positions</span>
                    <span className="text-[10px] text-slate-500 block">(No change)</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Row 1</span>
                    <span className="text-amber-300 font-bold">Shift left by 1</span>
                    <span className="text-[10px] text-slate-500 block">[b0,b1,b2,b3] → [b1,b2,b3,b0]</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Row 2</span>
                    <span className="text-amber-300 font-bold">Shift left by 2</span>
                    <span className="text-[10px] text-slate-500 block">[b0,b1,b2,b3] → [b2,b3,b0,b1]</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px]">Row 3</span>
                    <span className="text-amber-300 font-bold">Shift left by 3</span>
                    <span className="text-[10px] text-slate-500 block">[b0,b1,b2,b3] → [b3,b0,b1,b2]</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'MIX_COLUMNS' && (
              <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3 text-xs space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">
                  Galois Field Mixing Matrix (MDS):
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-[11px] font-mono">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-cyan-500/30 text-cyan-300 text-center">
                    [ 02  03  01  01 ]<br />
                    [ 01  02  03  01 ]<br />
                    [ 01  01  02  03 ]<br />
                    [ 03  01  01  02 ]
                  </div>
                  <span className="text-slate-400 font-sans leading-relaxed text-xs">
                    Each column of 4 bytes is multiplied with this Maximum Distance Separable (MDS) matrix in GF(2⁸). Modifying even 1 bit in an input byte reshapes all 4 output bytes in that column!
                  </span>
                </div>
              </div>
            )}

            {currentStep === 'ADD_ROUND_KEY' && (
              <div className="bg-slate-950/60 border border-purple-500/20 rounded-xl p-3 text-xs space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px]">
                  Bitwise XOR Property (Self-Inverse):
                </span>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-purple-500/30 font-mono text-purple-300 flex flex-wrap items-center justify-between gap-2">
                  <span>State Byte (0x41) ⊕ RoundKey (0x54) = Cipher Byte (0x15)</span>
                  <span className="text-slate-400 text-[10px]">Encryption: C = P ⊕ K | Decryption: P = C ⊕ K</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 2: Mechanical Breakdown */}
        {activeTab === 'mechanics' && (
          <motion.div
            key="tab-mechanics"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3 text-xs"
          >
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Step Execution Mechanics in AES-128
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {meta.purposeInAES}
              </p>
              <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                <span className="text-cyan-400 font-semibold block">Hardware & Software Implementation Note:</span>
                <span className="text-slate-400">
                  In modern CPUs (x86 AES-NI and ARMv8 Cryptography Extensions), these steps are fused into single-cycle hardware instructions (`AESENC` and `AESENCLAST`), executing complete rounds in nanoseconds.
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Mathematical Formula */}
        {activeTab === 'math' && (
          <motion.div
            key="tab-math"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3 text-xs"
          >
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                <Binary className="w-4 h-4 text-purple-400" />
                Algebraic Specification
              </h4>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
                {meta.mathematicalExplanation}
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                AES operates over the Galois Field <strong>GF(2⁸)</strong> modulo the irreducible polynomial:
                <br />
                <code className="text-amber-300 font-mono">m(x) = x⁸ + x⁴ + x³ + x + 1 (0x11B)</code>
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

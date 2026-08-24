import React from 'react';
import { 
  Shuffle, 
  MoveHorizontal, 
  Blend, 
  KeyRound, 
  RotateCcw, 
  Play, 
  Pause, 
  FastForward, 
  SkipForward,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { TransformationType } from '../types/aes';

interface TransformationControlsProps {
  onExecuteTransformation: (type: TransformationType) => void;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  currentRound: number;
  totalRounds: number;
  nextRecommendedStep: TransformationType;
  lastExecutedStep: TransformationType;
}

export const TransformationControls: React.FC<TransformationControlsProps> = ({
  onExecuteTransformation,
  onReset,
  onUndo,
  canUndo,
  isAutoPlaying,
  onToggleAutoPlay,
  currentRound,
  totalRounds,
  nextRecommendedStep,
  lastExecutedStep
}) => {
  const isFinalRound = currentRound === totalRounds;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header with Step Guidance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Interactive AES Round Transformations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any transformation button to apply it to the State Matrix, or follow the standard AES pipeline.
          </p>
        </div>

        {/* Playback & Undo controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-undo-step"
            onClick={onUndo}
            disabled={!canUndo || isAutoPlaying}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Undo previous transformation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            id="btn-auto-play"
            onClick={onToggleAutoPlay}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              isAutoPlaying
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Auto-Tour</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto-Step Round</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Core Transformation Step Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* 1. SubBytes Button */}
        <button
          id="btn-step-subbytes"
          onClick={() => onExecuteTransformation('SUB_BYTES')}
          disabled={isAutoPlaying}
          className={`group relative p-3.5 rounded-xl border text-left transition-all active:scale-98 flex flex-col justify-between ${
            nextRecommendedStep === 'SUB_BYTES'
              ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/30'
              : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-semibold">
              Step 1
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Shuffle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
              SubBytes
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
              Non-linear byte substitution using the 16×16 Rijndael S-Box.
            </p>
          </div>
          {nextRecommendedStep === 'SUB_BYTES' && (
            <span className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Next Recommended
            </span>
          )}
        </button>

        {/* 2. ShiftRows Button */}
        <button
          id="btn-step-shiftrows"
          onClick={() => onExecuteTransformation('SHIFT_ROWS')}
          disabled={isAutoPlaying}
          className={`group relative p-3.5 rounded-xl border text-left transition-all active:scale-98 flex flex-col justify-between ${
            nextRecommendedStep === 'SHIFT_ROWS'
              ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/30'
              : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30 font-semibold">
              Step 2
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <MoveHorizontal className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
              ShiftRows
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
              Cyclic left permutation of rows 1, 2, and 3 by their row offsets.
            </p>
          </div>
          {nextRecommendedStep === 'SHIFT_ROWS' && (
            <span className="mt-2 text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Next Recommended
            </span>
          )}
        </button>

        {/* 3. MixColumns Button (With Final Round Skipped Notice) */}
        <button
          id="btn-step-mixcolumns"
          onClick={() => onExecuteTransformation('MIX_COLUMNS')}
          disabled={isAutoPlaying || isFinalRound}
          className={`group relative p-3.5 rounded-xl border text-left transition-all active:scale-98 flex flex-col justify-between ${
            isFinalRound
              ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
              : nextRecommendedStep === 'MIX_COLUMNS'
                ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/15 ring-2 ring-cyan-500/30'
                : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 font-semibold">
              Step 3
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Blend className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                MixColumns
              </h4>
              {isFinalRound && (
                <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded font-bold border border-red-500/40">
                  SKIPPED in R10
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
              GF(2⁸) column vector matrix multiplication for massive diffusion.
            </p>
          </div>
          {isFinalRound ? (
            <span className="mt-2 text-[10px] text-amber-400 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Omitted in Round 10
            </span>
          ) : nextRecommendedStep === 'MIX_COLUMNS' ? (
            <span className="mt-2 text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Next Recommended
            </span>
          ) : null}
        </button>

        {/* 4. AddRoundKey Button */}
        <button
          id="btn-step-addroundkey"
          onClick={() => onExecuteTransformation('ADD_ROUND_KEY')}
          disabled={isAutoPlaying}
          className={`group relative p-3.5 rounded-xl border text-left transition-all active:scale-98 flex flex-col justify-between ${
            nextRecommendedStep === 'ADD_ROUND_KEY'
              ? 'bg-gradient-to-br from-purple-950/80 to-slate-900 border-purple-500/80 shadow-lg shadow-purple-500/15 ring-2 ring-purple-500/30'
              : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-500/30 font-semibold">
              Step 4
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
              AddRoundKey
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
              Bitwise XOR of the state with derived round key (K₀–K₁₀).
            </p>
          </div>
          {nextRecommendedStep === 'ADD_ROUND_KEY' && (
            <span className="mt-2 text-[10px] text-purple-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              Next Recommended
            </span>
          )}
        </button>

      </div>
    </div>
  );
};

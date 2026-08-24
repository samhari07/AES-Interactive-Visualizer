import React, { useState, useMemo } from 'react';
import { 
  textToMatrix, 
  keyExpansion, 
  applySubBytes, 
  applyShiftRows, 
  applyMixColumns, 
  applyAddRoundKey,
  toHex,
  toBin
} from '../utils/aesEngine';
import { Matrix4x4 } from '../types/aes';
import { Sparkles, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';

interface AvalancheEffectLabProps {
  initialText: string;
  cipherKey: string;
}

export const AvalancheEffectLab: React.FC<AvalancheEffectLabProps> = ({
  initialText,
  cipherKey
}) => {
  const [textA, setTextA] = useState<string>(initialText.padEnd(16, ' ').slice(0, 16));
  const [textB, setTextB] = useState<string>(
    // Flip 1 character in textB to demonstrate Avalanche
    initialText.length >= 16 
      ? initialText.slice(0, 15) + (initialText[15] === '!' ? '?' : '!') 
      : 'AES ENCRYPTION ?'
  );

  const [selectedRound, setSelectedRound] = useState<number>(10);

  // Run full AES-128 encryption on both messages and collect states at each round
  const { statesA, statesB, roundKeys } = useMemo(() => {
    const keyMatrix = textToMatrix(cipherKey);
    const keys = keyExpansion(keyMatrix);

    const runAesRounds = (txt: string) => {
      let state = textToMatrix(txt);
      const history: Matrix4x4[] = [];

      // Round 0 (Pre-round transformation)
      state = applyAddRoundKey(state, keys[0], 0).newState;
      history.push(state);

      // Rounds 1 to 9
      for (let r = 1; r <= 9; r++) {
        state = applySubBytes(state).newState;
        state = applyShiftRows(state).newState;
        state = applyMixColumns(state).newState;
        state = applyAddRoundKey(state, keys[r], r).newState;
        history.push(state);
      }

      // Round 10 (Final Round: No MixColumns!)
      state = applySubBytes(state).newState;
      state = applyShiftRows(state).newState;
      state = applyAddRoundKey(state, keys[10], 10).newState;
      history.push(state);

      return history;
    };

    return {
      statesA: runAesRounds(textA),
      statesB: runAesRounds(textB),
      roundKeys: keys
    };
  }, [textA, textB, cipherKey]);

  // Current matrix for selected round
  const matrixA = statesA[selectedRound];
  const matrixB = statesB[selectedRound];

  // Calculate Hamming Distance (number of flipped bits) between matrixA and matrixB
  const { bitDifferences, totalBits, percentFlipped } = useMemo(() => {
    let diff = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const xor = (matrixA[r][c] ^ matrixB[r][c]) & 0xff;
        // Count set bits in xor
        let temp = xor;
        while (temp > 0) {
          diff += temp & 1;
          temp >>= 1;
        }
      }
    }
    const total = 128; // 16 bytes * 8 bits
    const pct = ((diff / total) * 100).toFixed(1);
    return { bitDifferences: diff, totalBits: total, percentFlipped: pct };
  }, [matrixA, matrixB]);

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-wide">
              The Avalanche Effect Experiment
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe how altering just <strong>1 bit</strong> in the input creates a strict ~50% random bit flip across the 128-bit ciphertext block.
          </p>
        </div>

        {/* Metric Badge */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-950 border border-purple-500/40 rounded-xl font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Bits Flipped:</span>
            <span className="text-purple-300 font-bold text-sm">{bitDifferences} / 128 bits</span>
          </div>
          <div className="pl-3 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 block">Diffusion %:</span>
            <span className={`font-bold text-sm ${Number(percentFlipped) >= 45 && Number(percentFlipped) <= 55 ? 'text-emerald-400' : 'text-cyan-300'}`}>
              {percentFlipped}%
            </span>
          </div>
        </div>
      </div>

      {/* Two Input Strings Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Message A (16 Chars):</span>
            <span className="font-mono text-[11px] text-cyan-400">"{textA}"</span>
          </label>
          <input
            type="text"
            maxLength={16}
            value={textA}
            onChange={(e) => setTextA(e.target.value.padEnd(16, ' ').slice(0, 16))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Message B (1-char variation):</span>
            <span className="font-mono text-[11px] text-purple-400">"{textB}"</span>
          </label>
          <input
            type="text"
            maxLength={16}
            value={textB}
            onChange={(e) => setTextB(e.target.value.padEnd(16, ' ').slice(0, 16))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Round Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Inspect Diffusion at Round:</span>
          <span className="text-cyan-300 font-mono font-bold">
            {selectedRound === 0 ? 'Pre-Round 0 (Initial AddRoundKey)' : selectedRound === 10 ? 'Round 10 (Final Output)' : `Round ${selectedRound}`}
          </span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rnd) => (
            <button
              key={rnd}
              onClick={() => setSelectedRound(rnd)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedRound === rnd
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              R{rnd}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side 4x4 State Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* State A */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>State Matrix A (Round {selectedRound})</span>
            <span className="text-[10px] font-mono text-cyan-400 font-normal">Message A</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
            {matrixA.map((row, r) =>
              row.map((val, c) => (
                <div 
                  key={`${r}-${c}`}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center text-cyan-300"
                >
                  {toHex(val)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* State B with Diff Highlight */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>State Matrix B (Round {selectedRound})</span>
            <span className="text-[10px] font-mono text-purple-400 font-normal">Highlighted Diffs</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
            {matrixB.map((row, r) =>
              row.map((val, c) => {
                const isDifferent = val !== matrixA[r][c];
                return (
                  <div 
                    key={`${r}-${c}`}
                    className={`p-1.5 rounded text-center transition-colors ${
                      isDifferent 
                        ? 'bg-purple-950 text-purple-200 border border-purple-500/60 font-bold' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                    title={isDifferent ? `A: 0x${toHex(matrixA[r][c])} vs B: 0x${toHex(val)}` : 'Identical'}
                  >
                    {toHex(val)}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Educational Takeaway */}
      <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
        <span className="font-semibold text-purple-300 block">
          Key Takeaway for 2nd-Year Cryptography:
        </span>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Notice how in <strong>Round 0</strong>, only 1 byte differs. After <strong>Round 1</strong> and <strong>Round 2</strong> (thanks to <code>MixColumns</code> and <code>ShiftRows</code>), the difference rapidly diffuses to every single byte in the matrix. By Round 10, the output appears completely uncorrelated, with exactly ~50% bit flip randomness!
        </p>
      </div>

    </div>
  );
};

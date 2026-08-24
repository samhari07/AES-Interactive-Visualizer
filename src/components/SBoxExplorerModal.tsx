import React, { useState } from 'react';
import { SBOX, toHex, toBin, toPrintableChar } from '../utils/aesEngine';
import { BookOpen, Search, ArrowRight, Binary, Info } from 'lucide-react';

export const SBoxExplorerModal: React.FC = () => {
  const [selectedHex, setSelectedHex] = useState<number>(0x53); // Default sample 'S'
  const [searchQuery, setSearchQuery] = useState<string>('');

  const row = (selectedHex >> 4) & 0x0f;
  const col = selectedHex & 0x0f;
  const substitutedValue = SBOX[selectedHex];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-wide">
              Rijndael 16×16 Substitution Box (S-Box)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hover or click any cell in the 256-byte table to observe non-linear byte mapping.
          </p>
        </div>

        {/* Selected Byte Live Display */}
        <div className="flex items-center gap-3 p-2 bg-slate-950 border border-emerald-500/40 rounded-xl font-mono text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Input:</span>
            <span className="text-cyan-300 font-bold">0x{toHex(selectedHex)} ('{toPrintableChar(selectedHex)}')</span>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">S-Box Output:</span>
            <span className="text-emerald-300 font-bold">0x{toHex(substitutedValue)} ('{toPrintableChar(substitutedValue)}')</span>
          </div>
        </div>
      </div>

      {/* 16x16 Interactive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse font-mono text-[11px]">
          <thead>
            <tr>
              <th className="p-1.5 text-slate-500 bg-slate-950/80 border border-slate-800 rounded-tl-lg">
                Hex
              </th>
              {[...Array(16)].map((_, c) => (
                <th 
                  key={c} 
                  className={`p-1.5 border border-slate-800 transition-colors ${
                    c === col ? 'bg-emerald-950/80 text-emerald-300 font-bold' : 'text-slate-400 bg-slate-950/50'
                  }`}
                >
                  .{toHex(c).slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(16)].map((_, r) => (
              <tr key={r}>
                {/* Row Header */}
                <th className={`p-1.5 border border-slate-800 transition-colors ${
                  r === row ? 'bg-emerald-950/80 text-emerald-300 font-bold' : 'text-slate-400 bg-slate-950/50'
                }`}>
                  {toHex(r).slice(1)}.
                </th>

                {/* 16 columns for this row */}
                {[...Array(16)].map((_, c) => {
                  const byteVal = (r << 4) | c;
                  const sboxVal = SBOX[byteVal];
                  const isSelected = r === row && c === col;
                  const isRowActive = r === row;
                  const isColActive = c === col;

                  return (
                    <td
                      key={c}
                      onClick={() => setSelectedHex(byteVal)}
                      onMouseEnter={() => setSelectedHex(byteVal)}
                      className={`p-1 border border-slate-800/80 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold scale-110 shadow-lg shadow-emerald-500/30 z-10'
                          : isRowActive || isColActive
                            ? 'bg-emerald-950/30 text-emerald-200'
                            : 'text-slate-300 hover:bg-slate-800'
                      }`}
                      title={`Input: 0x${toHex(byteVal)} -> Output: 0x${toHex(sboxVal)}`}
                    >
                      {toHex(sboxVal)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* S-Box Mathematical Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Mathematical Invertibility:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            The S-Box is a bijection (1-to-1 mapping). Every input byte uniquely maps to a single output byte. Decryption uses the Inverse S-Box (InvSBox) where <code>InvSBox[SBox[x]] = x</code>.
          </p>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <span className="text-cyan-400 font-sans font-semibold flex items-center gap-1.5">
            <Binary className="w-3.5 h-3.5" />
            Multiplicative Inverse in GF(2⁸):
          </span>
          <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
            Each byte is inverted in <code className="text-amber-300">GF(2⁸)</code> then transformed via an affine mapping. Note that <code className="text-emerald-300">SBox[0x00] = 0x63</code> to prevent a zero fixed-point!
          </p>
        </div>
      </div>

    </div>
  );
};

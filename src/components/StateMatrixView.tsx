import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Matrix4x4, TransformationType } from '../types/aes';
import { toHex, toBin, toPrintableChar, SBOX } from '../utils/aesEngine';
import { Info, HelpCircle, ArrowDown, Sparkles, Hash, Binary } from 'lucide-react';

interface StateMatrixViewProps {
  matrix: Matrix4x4;
  previousMatrix?: Matrix4x4 | null;
  title?: string;
  subtitle?: string;
  activeTransformation: TransformationType;
  highlightRows?: number[];
  highlightCols?: number[];
  isFinalRound?: boolean;
}

export const StateMatrixView: React.FC<StateMatrixViewProps> = ({
  matrix,
  previousMatrix,
  title = 'Current State Matrix',
  subtitle = '4×4 Byte Grid (128 bits total)',
  activeTransformation,
  highlightRows = [],
  highlightCols = [],
  isFinalRound = false
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showOrderTooltip, setShowOrderTooltip] = useState(false);

  // Selected cell byte metrics
  const selectedByte = selectedCell ? matrix[selectedCell.row][selectedCell.col] : null;
  const sboxRow = selectedByte !== null ? (selectedByte >> 4) & 0x0f : 0;
  const sboxCol = selectedByte !== null ? selectedByte & 0x0f : 0;
  const sboxMappedVal = selectedByte !== null ? SBOX[selectedByte] : 0;

  // Determine if a cell has changed compared to previous matrix
  const hasCellChanged = (r: number, c: number) => {
    if (!previousMatrix) return false;
    return previousMatrix[r][c] !== matrix[r][c];
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Grid Glow Background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Column-Major Ordering Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              {title}
            </h2>
            {isFinalRound && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500/40 rounded-md">
                Final Round (No MixColumns)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Column-Major CS Concept Pill */}
        <div className="relative">
          <button
            onClick={() => setShowOrderTooltip(!showOrderTooltip)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 text-cyan-300 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Column-Major Order</span>
            <HelpCircle className="w-3 h-3 text-slate-400" />
          </button>

          {showOrderTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-950 border border-cyan-500/40 rounded-xl shadow-2xl text-xs z-30 text-slate-300 space-y-2">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                Why Column-Major?
              </p>
              <p>
                In the AES specification, 16 input bytes are filled vertically down columns:
                <strong className="text-cyan-300 block font-mono mt-1">
                  Col 0 = Bytes 0..3<br />
                  Col 1 = Bytes 4..7<br />
                  Col 2 = Bytes 8..11<br />
                  Col 3 = Bytes 12..15
                </strong>
              </p>
              <button 
                onClick={() => setShowOrderTooltip(false)}
                className="text-[11px] text-cyan-400 hover:underline pt-1 block"
              >
                Close notice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4x4 State Grid Visualizer */}
      <div className="my-2">
        {/* Column Headers */}
        <div className="grid grid-cols-4 gap-2.5 mb-2 px-6">
          {[0, 1, 2, 3].map((colIdx) => {
            const isColHighlighted = highlightCols.includes(colIdx);
            return (
              <div 
                key={colIdx} 
                className={`text-center text-[11px] font-mono font-semibold py-1 rounded-md transition-colors ${
                  isColHighlighted 
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50' 
                    : 'text-slate-500 bg-slate-950/40'
                }`}
              >
                Col {colIdx} <span className="text-[10px] text-slate-600">({colIdx * 4}–{colIdx * 4 + 3})</span>
              </div>
            );
          })}
        </div>

        {/* 4 Rows with Row Label */}
        <div className="space-y-2.5">
          {matrix.map((row, rIdx) => {
            const isRowHighlighted = highlightRows.includes(rIdx);
            return (
              <div key={rIdx} className="flex items-center gap-2">
                {/* Row Header Label */}
                <div 
                  className={`w-6 text-center text-[11px] font-mono font-semibold py-2 rounded-md shrink-0 transition-colors ${
                    isRowHighlighted 
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50' 
                      : 'text-slate-500 bg-slate-950/40'
                  }`}
                  title={`Row ${rIdx} (Shift offset: ${rIdx} bytes)`}
                >
                  R{rIdx}
                </div>

                {/* 4 Byte Cells in this row */}
                <div className="grid grid-cols-4 gap-2.5 flex-1">
                  {row.map((byteVal, cIdx) => {
                    const byteIndex = cIdx * 4 + rIdx; // column-major
                    const hexStr = toHex(byteVal);
                    const asciiChar = toPrintableChar(byteVal);
                    const changed = hasCellChanged(rIdx, cIdx);
                    const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;

                    return (
                      <motion.button
                        key={`${rIdx}-${cIdx}`}
                        id={`cell-${rIdx}-${cIdx}`}
                        onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                        layout
                        initial={{ scale: 0.95 }}
                        animate={{ 
                          scale: changed ? [1, 1.08, 1] : 1,
                          backgroundColor: changed 
                            ? 'rgba(6, 182, 212, 0.15)' 
                            : isSelected 
                              ? 'rgba(59, 130, 246, 0.25)' 
                              : 'rgba(15, 23, 42, 0.75)'
                        }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className={`group relative p-2.5 rounded-xl border flex flex-col items-center justify-between min-h-[76px] sm:min-h-[82px] cursor-pointer transition-all ${
                          isSelected
                            ? 'border-cyan-400 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/40'
                            : changed
                              ? 'border-cyan-500 shadow-md shadow-cyan-500/20'
                              : 'border-slate-800/90 hover:border-slate-600 hover:bg-slate-800/60'
                        }`}
                      >
                        {/* Top Indicator: Byte Index in column-major */}
                        <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>#{byteIndex}</span>
                          {changed && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm" title="Value modified in this step" />
                          )}
                        </div>

                        {/* Middle: Prominent Hex Value */}
                        <div className="my-0.5">
                          <span className={`text-base sm:text-lg font-mono font-bold tracking-wider ${
                            changed 
                              ? 'text-cyan-300' 
                              : isSelected 
                                ? 'text-white' 
                                : 'text-slate-200 group-hover:text-white'
                          }`}>
                            0x{hexStr}
                          </span>
                        </div>

                        {/* Bottom: ASCII Character Badge */}
                        <div className="w-full flex items-center justify-center">
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            asciiChar === '·'
                              ? 'bg-slate-900/60 text-slate-500 border-slate-800'
                              : 'bg-slate-800/80 text-emerald-400 border-slate-700/60'
                          }`}>
                            '{asciiChar}'
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Byte Inspector Panel on selection */}
      <AnimatePresence>
        {selectedCell && selectedByte !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-3.5 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-2 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Byte Inspector: State[{selectedCell.row}, {selectedCell.col}]</span>
                <span className="text-slate-400 font-mono font-normal">
                  (Byte index: #{selectedCell.col * 4 + selectedCell.row})
                </span>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded text-[11px]"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Hex Value</span>
                <span className="text-sm font-bold text-cyan-300">0x{toHex(selectedByte)}</span>
              </div>

              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ASCII Char</span>
                <span className="text-sm font-bold text-emerald-400">'{toPrintableChar(selectedByte)}'</span>
              </div>

              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Decimal (0-255)</span>
                <span className="text-sm font-bold text-amber-300">{selectedByte}</span>
              </div>

              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">8-Bit Binary</span>
                <span className="text-xs font-bold text-purple-300">{toBin(selectedByte)}</span>
              </div>
            </div>

            {/* S-Box Lookup coordinates info */}
            <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                S-Box Lookup Coordinate: <strong className="text-emerald-400 font-mono">Row {toHex(sboxRow)}</strong>, <strong className="text-emerald-400 font-mono">Col {toHex(sboxCol)}</strong>
              </span>
              <span className="text-slate-300 font-mono">
                SubBytes(0x{toHex(selectedByte)}) = <strong className="text-cyan-400">0x{toHex(sboxMappedVal)}</strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

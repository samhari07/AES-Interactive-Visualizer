import React, { useState } from 'react';
import { Type, Key, Sparkles, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { EDUCATIONAL_PRESETS, toHex } from '../utils/aesEngine';

interface InputSectionProps {
  inputText: string;
  setInputText: (val: string) => void;
  cipherKey: string;
  setCipherKey: (val: string) => void;
  onApplyPreset: (preset: typeof EDUCATIONAL_PRESETS[0]) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  setInputText,
  cipherKey,
  setCipherKey,
  onApplyPreset
}) => {
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Normalize string to 16 characters (or show current length)
  const charLength = inputText.length;
  const isExact16 = charLength === 16;
  const effectiveBytes = inputText.padEnd(16, ' ').slice(0, 16);

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl shadow-black/20">
      <div className="flex flex-col lg:flex-row gap-5 items-start justify-between">
        
        {/* Left Column: 16-Character Message Input */}
        <div className="w-full lg:flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="message-input" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>16-Byte Plaintext Message</span>
            </label>

            {/* Length Badge */}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium border flex items-center gap-1 ${
                isExact16 
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
                  : charLength > 16 
                    ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                    : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40'
              }`}>
                {charLength}/16 chars
                {charLength < 16 && <span className="text-[10px] text-slate-400">(padded with spaces)</span>}
              </span>
            </div>
          </div>

          <div className="relative">
            <input
              id="message-input"
              type="text"
              maxLength={16}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter exactly 16 characters..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-base tracking-wider placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner"
            />
          </div>

          {/* Quick Preset Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" /> Class Presets:
            </span>
            {EDUCATIONAL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                id={`preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onApplyPreset(preset)}
                className="text-xs px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg transition-all active:scale-95"
                title={preset.description}
              >
                "{preset.text}"
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Hex Stream & Key Settings Toggle */}
        <div className="w-full lg:w-96 space-y-3 bg-slate-950/60 border border-slate-800/70 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Plaintext Hex Stream (16 Bytes):</span>
            <span className="font-mono text-[11px] text-cyan-400">128 bits</span>
          </div>

          {/* Hex Stream Display */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-300 flex flex-wrap gap-1.5 overflow-x-auto">
            {effectiveBytes.split('').map((char: string, idx: number) => {
              const code = char.charCodeAt(0) & 0xff;
              return (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/50 hover:bg-cyan-950 hover:border-cyan-500/50 transition-colors cursor-default"
                  title={`Byte ${idx}: '${char}' (Dec: ${code})`}
                >
                  {toHex(code)}
                </span>
              );
            })}
          </div>

          {/* Expandable 128-Bit Cipher Key Section */}
          <div>
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>Cipher Key: <strong className="text-purple-300 font-mono">"{cipherKey.slice(0, 16)}"</strong></span>
              </span>
              {showKeyConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showKeyConfig && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-2">
                <label className="text-[11px] text-slate-400 block">
                  Custom 16-Character AES-128 Key (used for Key Schedule & AddRoundKey):
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={cipherKey}
                  onChange={(e) => setCipherKey(e.target.value)}
                  placeholder="16-character cipher key..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-purple-500/30 rounded-lg text-purple-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { StateMatrixView } from './components/StateMatrixView';
import { TransformationControls } from './components/TransformationControls';
import { TransformationExplanation } from './components/TransformationExplanation';
import { FinalRoundCallout } from './components/FinalRoundCallout';
import { SBoxExplorerModal } from './components/SBoxExplorerModal';
import { AvalancheEffectLab } from './components/AvalancheEffectModal';
import { 
  Matrix4x4, 
  TransformationType, 
  StepRecord 
} from './types/aes';
import { 
  textToMatrix, 
  keyExpansion, 
  applySubBytes, 
  applyShiftRows, 
  applyMixColumns, 
  applyAddRoundKey, 
  cloneMatrix, 
  EDUCATIONAL_PRESETS,
  TRANSFORMATION_METADATA
} from './utils/aesEngine';
import { Layers, ShieldCheck, Cpu, ArrowRight, Zap, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  // 16-character input text & key
  const [inputText, setInputText] = useState<string>('AES ENCRYPTION !');
  const [cipherKey, setCipherKey] = useState<string>('Thats my Kung Fu');

  // Navigation & View state
  const [activeView, setActiveView] = useState<'step-sandbox' | 'round-tour' | 'sbox-table' | 'avalanche'>('step-sandbox');

  // Encryption execution state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const totalRounds = 10;
  const [activeTransformation, setActiveTransformation] = useState<TransformationType>('INITIAL');
  const [lastExecutedStep, setLastExecutedStep] = useState<TransformationType>('INITIAL');
  const [stepDetails, setStepDetails] = useState<any>(null);

  // Active matrices
  const [currentMatrix, setCurrentMatrix] = useState<Matrix4x4>(() => textToMatrix('AES ENCRYPTION !'));
  const [previousMatrix, setPreviousMatrix] = useState<Matrix4x4 | null>(null);

  // History stack for Undo
  const [history, setHistory] = useState<{
    matrix: Matrix4x4;
    round: number;
    step: TransformationType;
    details: any;
  }[]>([]);

  // Highlight rows / columns for animation feedback
  const [highlightRows, setHighlightRows] = useState<number[]>([]);
  const [highlightCols, setHighlightCols] = useState<number[]>([]);

  // Auto-play state
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-calculate 11 Round Keys from Cipher Key
  const roundKeys = useMemo(() => {
    const keyMatrix = textToMatrix(cipherKey);
    return keyExpansion(keyMatrix);
  }, [cipherKey]);

  // When input text changes, reload initial matrix
  useEffect(() => {
    const newMat = textToMatrix(inputText);
    setCurrentMatrix(newMat);
    setPreviousMatrix(null);
    setHistory([]);
    setCurrentRound(1);
    setActiveTransformation('INITIAL');
    setLastExecutedStep('INITIAL');
    setStepDetails(null);
  }, [inputText]);

  // Reset to initial matrix state
  const handleReset = () => {
    const initialMat = textToMatrix(inputText);
    setCurrentMatrix(initialMat);
    setPreviousMatrix(null);
    setHistory([]);
    setCurrentRound(1);
    setActiveTransformation('INITIAL');
    setLastExecutedStep('INITIAL');
    setStepDetails(null);
    setIsAutoPlaying(false);
  };

  // Determine next recommended step in standard AES pipeline
  const nextRecommendedStep = useMemo<TransformationType>(() => {
    if (lastExecutedStep === 'INITIAL' || lastExecutedStep === 'ADD_ROUND_KEY') {
      return 'SUB_BYTES';
    }
    if (lastExecutedStep === 'SUB_BYTES') {
      return 'SHIFT_ROWS';
    }
    if (lastExecutedStep === 'SHIFT_ROWS') {
      // In Round 10, MixColumns is skipped!
      return currentRound === totalRounds ? 'ADD_ROUND_KEY' : 'MIX_COLUMNS';
    }
    if (lastExecutedStep === 'MIX_COLUMNS') {
      return 'ADD_ROUND_KEY';
    }
    return 'SUB_BYTES';
  }, [lastExecutedStep, currentRound, totalRounds]);

  // Execute a Transformation
  const executeTransformation = (type: TransformationType) => {
    setPreviousMatrix(cloneMatrix(currentMatrix));

    // Save snapshot for undo
    setHistory(prev => [
      ...prev,
      {
        matrix: cloneMatrix(currentMatrix),
        round: currentRound,
        step: lastExecutedStep,
        details: stepDetails
      }
    ]);

    let resultMatrix = cloneMatrix(currentMatrix);
    let details: any = null;

    if (type === 'SUB_BYTES') {
      const res = applySubBytes(currentMatrix);
      resultMatrix = res.newState;
      details = res.detail;
      setHighlightRows([]);
      setHighlightCols([]);
    } else if (type === 'SHIFT_ROWS') {
      const res = applyShiftRows(currentMatrix);
      resultMatrix = res.newState;
      details = res.detail;
      setHighlightRows([1, 2, 3]); // highlight shifting rows
      setHighlightCols([]);
      setTimeout(() => setHighlightRows([]), 1200);
    } else if (type === 'MIX_COLUMNS') {
      // If user calls MixColumns in Round 10, explain or allow with notice
      const res = applyMixColumns(currentMatrix);
      resultMatrix = res.newState;
      details = res.detail;
      setHighlightCols([0, 1, 2, 3]); // highlight blended columns
      setHighlightRows([]);
      setTimeout(() => setHighlightCols([]), 1200);
    } else if (type === 'ADD_ROUND_KEY') {
      const roundKeyToUse = roundKeys[Math.min(currentRound, 10)] || roundKeys[0];
      const res = applyAddRoundKey(currentMatrix, roundKeyToUse, currentRound);
      resultMatrix = res.newState;
      details = res.detail;
      setHighlightRows([]);
      setHighlightCols([]);

      // Advance round if full round completed
      if (currentRound < totalRounds) {
        setCurrentRound(prev => prev + 1);
      }
    }

    setCurrentMatrix(resultMatrix);
    setActiveTransformation(type);
    setLastExecutedStep(type);
    setStepDetails(details);
  };

  // Undo transformation
  const handleUndo = () => {
    if (history.length === 0) return;
    const lastSnapshot = history[history.length - 1];
    setPreviousMatrix(null);
    setCurrentMatrix(lastSnapshot.matrix);
    setCurrentRound(lastSnapshot.round);
    setLastExecutedStep(lastSnapshot.step);
    setActiveTransformation(lastSnapshot.step);
    setStepDetails(lastSnapshot.details);
    setHistory(prev => prev.slice(0, prev.length - 1));
  };

  // Auto-play stepper
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      executeTransformation(nextRecommendedStep);
    }, 1600);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, nextRecommendedStep, currentMatrix, currentRound]);

  // Handle Preset application
  const handleApplyPreset = (preset: typeof EDUCATIONAL_PRESETS[0]) => {
    setInputText(preset.text);
    setCipherKey(preset.key);
  };

  const isFinalRound = currentRound === totalRounds;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Application Header */}
      <Header
        currentRound={currentRound}
        totalRounds={totalRounds}
        activeView={activeView}
        setActiveView={setActiveView}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top 16-Character Input Section */}
        <InputSection
          inputText={inputText}
          setInputText={setInputText}
          cipherKey={cipherKey}
          setCipherKey={setCipherKey}
          onApplyPreset={handleApplyPreset}
        />

        {/* View 1: Main Interactive Steps & Sandbox */}
        {activeView === 'step-sandbox' && (
          <div className="space-y-6">
            
            {/* Split View: Left = 4x4 State Matrix | Right = Step Controls & Real-Time Analogy */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: 4x4 State Matrix View (5 columns on desktop) */}
              <div className="lg:col-span-5 flex flex-col">
                <StateMatrixView
                  matrix={currentMatrix}
                  previousMatrix={previousMatrix}
                  title={`Round ${currentRound} State Matrix`}
                  subtitle={
                    activeTransformation === 'INITIAL'
                      ? 'Loaded from 16 ASCII input characters'
                      : `After applying ${TRANSFORMATION_METADATA[activeTransformation]?.shortName || activeTransformation}`
                  }
                  activeTransformation={activeTransformation}
                  highlightRows={highlightRows}
                  highlightCols={highlightCols}
                  isFinalRound={isFinalRound}
                />
              </div>

              {/* Right: Interactive 4-Step Buttons & Explanation Cards (7 columns on desktop) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 4 Interactive Step Action Buttons */}
                <TransformationControls
                  onExecuteTransformation={executeTransformation}
                  onReset={handleReset}
                  onUndo={handleUndo}
                  canUndo={history.length > 0}
                  isAutoPlaying={isAutoPlaying}
                  onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  nextRecommendedStep={nextRecommendedStep}
                  lastExecutedStep={lastExecutedStep}
                />

                {/* Friendly Real-World Analogy & Mechanism Breakdown */}
                <TransformationExplanation
                  currentStep={activeTransformation}
                  stepDetails={stepDetails}
                  currentRound={currentRound}
                />

              </div>

            </div>

            {/* Prominent Final Round Difference Callout Section */}
            <FinalRoundCallout />

          </div>
        )}

        {/* View 2: Full Rijndael 16x16 S-Box Table */}
        {activeView === 'sbox-table' && (
          <div className="space-y-6">
            <SBoxExplorerModal />
          </div>
        )}

        {/* View 3: Avalanche Effect Lab */}
        {activeView === 'avalanche' && (
          <div className="space-y-6">
            <AvalancheEffectLab
              initialText={inputText}
              cipherKey={cipherKey}
            />
          </div>
        )}

      </main>

      {/* Footer with Educational References */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NIST FIPS PUB 197 — Advanced Encryption Standard (AES) Educational Tool</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Rijndael Algorithm</span>
            <span>•</span>
            <span>Galois Field GF(2⁸)</span>
            <span>•</span>
            <span>Column-Major Matrix</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

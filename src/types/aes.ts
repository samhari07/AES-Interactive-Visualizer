/**
 * AES (Advanced Encryption Standard / Rijndael) Type Definitions
 */

export type Matrix4x4 = number[][]; // 4 rows x 4 columns, values 0-255

export type TransformationType = 
  | 'INITIAL'
  | 'SUB_BYTES'
  | 'SHIFT_ROWS'
  | 'MIX_COLUMNS'
  | 'ADD_ROUND_KEY';

export interface ByteInfo {
  row: number;
  col: number;
  index: number; // 0-15 in column-major order
  char: string;
  hex: string;
  dec: number;
  bin: string;
}

export interface TransformationDetail {
  title: string;
  name: TransformationType;
  shortName: string;
  tagline: string;
  analogy: {
    title: string;
    description: string;
    iconName: string;
  };
  mathematicalExplanation: string;
  purposeInAES: string;
  color: {
    primary: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    glow: string;
  };
}

export interface StepRecord {
  id: string;
  type: TransformationType;
  title: string;
  roundNumber: number;
  totalRounds: number;
  beforeMatrix: Matrix4x4;
  afterMatrix: Matrix4x4;
  description: string;
  analogy: {
    title: string;
    description: string;
    iconName: string;
  };
  details: any;
  timestamp: number;
}

export interface MixColumnsDetail {
  column: number;
  inputVector: number[];
  outputVector: number[];
  formulas: string[];
}

export interface AddRoundKeyDetail {
  round: number;
  roundKey: Matrix4x4;
  xorSteps: {
    row: number;
    col: number;
    stateByte: number;
    keyByte: number;
    resultByte: number;
  }[];
}

export interface ShiftRowsDetail {
  shifts: {
    row: number;
    shiftAmount: number;
    originalRow: number[];
    shiftedRow: number[];
  }[];
}

export interface SubBytesDetail {
  substitutions: {
    row: number;
    col: number;
    inputByte: number;
    outputByte: number;
    sboxRow: number;
    sboxCol: number;
  }[];
}

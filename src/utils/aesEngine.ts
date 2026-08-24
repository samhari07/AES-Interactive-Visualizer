/**
 * AES Cryptographic Engine & Educational Metadata
 * Standards-compliant implementation of AES-128 / Rijndael
 */

import { 
  Matrix4x4, 
  SubBytesDetail, 
  ShiftRowsDetail, 
  MixColumnsDetail, 
  AddRoundKeyDetail,
  TransformationDetail,
  TransformationType 
} from '../types/aes';

// Official Rijndael 16x16 Substitution Box (S-Box)
export const SBOX: readonly number[] = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5e, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

// AES Round Constant (Rcon) Table
export const RCON: readonly number[] = [
  0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
];

/**
 * GF(2^8) Galois Field Multiplication by 2 (xtime)
 * Under irreducible polynomial x^8 + x^4 + x^3 + x + 1 (0x11B / 0x1B)
 */
export function xtime(b: number): number {
  return ((b << 1) ^ (((b >> 7) & 1) * 0x11b)) & 0xff;
}

/**
 * Multiply in GF(2^8)
 */
export function gfMultiply(a: number, b: number): number {
  let res = 0;
  let tempA = a;
  let tempB = b;
  for (let i = 0; i < 8; i++) {
    if ((tempB & 1) !== 0) {
      res ^= tempA;
    }
    const hiBitSet = (tempA & 0x80) !== 0;
    tempA = (tempA << 1) & 0xff;
    if (hiBitSet) {
      tempA ^= 0x1b;
    }
    tempB >>= 1;
  }
  return res;
}

/**
 * Convert string (padded/truncated to 16 bytes) to 4x4 State Matrix in Column-Major Order
 * In AES: State[r, c] = input[4*c + r]
 */
export function textToMatrix(text: string): Matrix4x4 {
  const bytes: number[] = [];
  for (let i = 0; i < 16; i++) {
    if (i < text.length) {
      bytes.push(text.charCodeAt(i) & 0xff);
    } else {
      bytes.push(0x20); // space padding
    }
  }

  // Create 4x4 column-major matrix
  const matrix: Matrix4x4 = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      matrix[row][col] = bytes[col * 4 + row];
    }
  }

  return matrix;
}

/**
 * Convert 16 hex characters / bytes array into 4x4 Matrix
 */
export function bytesToMatrix(bytes: number[]): Matrix4x4 {
  const matrix: Matrix4x4 = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      const idx = col * 4 + row;
      matrix[row][col] = (bytes[idx] ?? 0) & 0xff;
    }
  }

  return matrix;
}

/**
 * Extract 16 bytes flat array in Column-Major order from Matrix
 */
export function matrixToBytes(matrix: Matrix4x4): number[] {
  const bytes: number[] = [];
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      bytes.push(matrix[row][col]);
    }
  }
  return bytes;
}

/**
 * Deep clone 4x4 matrix
 */
export function cloneMatrix(matrix: Matrix4x4): Matrix4x4 {
  return matrix.map(row => [...row]);
}

/**
 * Format number to 2-digit Hex (e.g. 0x0A -> "0A")
 */
export function toHex(val: number): string {
  return (val & 0xff).toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Format number to 8-digit Binary (e.g. "01000001")
 */
export function toBin(val: number): string {
  return (val & 0xff).toString(2).padStart(8, '0');
}

/**
 * Printable ASCII character or '.'
 */
export function toPrintableChar(val: number): string {
  if (val >= 32 && val <= 126) {
    return String.fromCharCode(val);
  }
  return '·'; // Dot for non-printable byte
}

/**
 * SubBytes Transformation (Non-linear byte substitution using Rijndael S-Box)
 */
export function applySubBytes(state: Matrix4x4): { newState: Matrix4x4; detail: SubBytesDetail } {
  const newState = cloneMatrix(state);
  const substitutions: SubBytesDetail['substitutions'] = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const inByte = state[r][c];
      const sboxRow = (inByte >> 4) & 0x0f;
      const sboxCol = inByte & 0x0f;
      const outByte = SBOX[inByte];

      newState[r][c] = outByte;
      substitutions.push({
        row: r,
        col: c,
        inputByte: inByte,
        outputByte: outByte,
        sboxRow,
        sboxCol
      });
    }
  }

  return { newState, detail: { substitutions } };
}

/**
 * ShiftRows Transformation (Cyclic left shift of rows by row index: row 0:0, row 1:1, row 2:2, row 3:3)
 */
export function applyShiftRows(state: Matrix4x4): { newState: Matrix4x4; detail: ShiftRowsDetail } {
  const newState = cloneMatrix(state);
  const shifts: ShiftRowsDetail['shifts'] = [];

  for (let r = 0; r < 4; r++) {
    const originalRow = [...state[r]];
    const shiftedRow = new Array(4);
    for (let c = 0; c < 4; c++) {
      shiftedRow[c] = state[r][(c + r) % 4];
    }
    newState[r] = shiftedRow;
    shifts.push({
      row: r,
      shiftAmount: r,
      originalRow,
      shiftedRow
    });
  }

  return { newState, detail: { shifts } };
}

/**
 * MixColumns Transformation (Matrix multiplication in Galois Field GF(2^8))
 * [s'0,c]   [02 03 01 01] [s0,c]
 * [s'1,c] = [01 02 03 01] [s1,c]
 * [s'2,c]   [01 01 02 03] [s2,c]
 * [s'3,c]   [03 01 01 02] [s3,c]
 */
export function applyMixColumns(state: Matrix4x4): { newState: Matrix4x4; detail: MixColumnsDetail[] } {
  const newState = cloneMatrix(state);
  const detail: MixColumnsDetail[] = [];

  for (let c = 0; c < 4; c++) {
    const s0 = state[0][c];
    const s1 = state[1][c];
    const s2 = state[2][c];
    const s3 = state[3][c];

    const r0 = gfMultiply(2, s0) ^ gfMultiply(3, s1) ^ s2 ^ s3;
    const r1 = s0 ^ gfMultiply(2, s1) ^ gfMultiply(3, s2) ^ s3;
    const r2 = s0 ^ s1 ^ gfMultiply(2, s2) ^ gfMultiply(3, s3);
    const r3 = gfMultiply(3, s0) ^ s1 ^ s2 ^ gfMultiply(2, s3);

    newState[0][c] = r0;
    newState[1][c] = r1;
    newState[2][c] = r2;
    newState[3][c] = r3;

    detail.push({
      column: c,
      inputVector: [s0, s1, s2, s3],
      outputVector: [r0, r1, r2, r3],
      formulas: [
        `({02} • ${toHex(s0)}) ⊕ ({03} • ${toHex(s1)}) ⊕ ${toHex(s2)} ⊕ ${toHex(s3)} = ${toHex(r0)}`,
        `${toHex(s0)} ⊕ ({02} • ${toHex(s1)}) ⊕ ({03} • ${toHex(s2)}) ⊕ ${toHex(s3)} = ${toHex(r1)}`,
        `${toHex(s0)} ⊕ ${toHex(s1)} ⊕ ({02} • ${toHex(s2)}) ⊕ ({03} • ${toHex(s3)}) = ${toHex(r2)}`,
        `({03} • ${toHex(s0)}) ⊕ ${toHex(s1)} ⊕ ${toHex(s2)} ⊕ ({02} • ${toHex(s3)}) = ${toHex(r3)}`
      ]
    });
  }

  return { newState, detail };
}

/**
 * AddRoundKey Transformation (Bitwise XOR between State Matrix and Round Key)
 */
export function applyAddRoundKey(
  state: Matrix4x4, 
  roundKey: Matrix4x4, 
  roundNum: number = 0
): { newState: Matrix4x4; detail: AddRoundKeyDetail } {
  const newState = cloneMatrix(state);
  const xorSteps: AddRoundKeyDetail['xorSteps'] = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const stateByte = state[r][c];
      const keyByte = roundKey[r][c];
      const resultByte = stateByte ^ keyByte;

      newState[r][c] = resultByte;
      xorSteps.push({
        row: r,
        col: c,
        stateByte,
        keyByte,
        resultByte
      });
    }
  }

  return { 
    newState, 
    detail: { 
      round: roundNum, 
      roundKey: cloneMatrix(roundKey), 
      xorSteps 
    } 
  };
}

/**
 * AES-128 Key Expansion: generates 11 Round Keys (W[0..43]) from 128-bit master key
 */
export function keyExpansion(cipherKey: Matrix4x4): Matrix4x4[] {
  const w: number[][] = []; // 44 4-byte words

  // First 4 words are the cipher key columns
  for (let i = 0; i < 4; i++) {
    w[i] = [
      cipherKey[0][i],
      cipherKey[1][i],
      cipherKey[2][i],
      cipherKey[3][i]
    ];
  }

  for (let i = 4; i < 44; i++) {
    let temp = [...w[i - 1]];

    if (i % 4 === 0) {
      // RotWord: cyclic left shift of 4-byte word
      const rot = [temp[1], temp[2], temp[3], temp[0]];
      // SubWord: SBox on each byte
      const sub = rot.map(b => SBOX[b]);
      // XOR with Rcon[i/4] on the first byte
      const rconVal = RCON[i / 4];
      temp = [sub[0] ^ rconVal, sub[1], sub[2], sub[3]];
    }

    w[i] = [
      w[i - 4][0] ^ temp[0],
      w[i - 4][1] ^ temp[1],
      w[i - 4][2] ^ temp[2],
      w[i - 4][3] ^ temp[3]
    ];
  }

  // Group 44 words into 11 4x4 Round Keys
  const roundKeys: Matrix4x4[] = [];
  for (let round = 0; round <= 10; round++) {
    const keyMatrix: Matrix4x4 = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    for (let col = 0; col < 4; col++) {
      const word = w[round * 4 + col];
      for (let row = 0; row < 4; row++) {
        keyMatrix[row][col] = word[row];
      }
    }
    roundKeys.push(keyMatrix);
  }

  return roundKeys;
}

/**
 * Educational Descriptions & Real-World Analogies for CS Students
 */
export const TRANSFORMATION_METADATA: Record<TransformationType, TransformationDetail> = {
  INITIAL: {
    title: 'Initial State Setup',
    name: 'INITIAL',
    shortName: 'Input Load',
    tagline: '16 ASCII bytes loaded into a 4×4 State Matrix in Column-Major order',
    analogy: {
      title: 'The Blueprint Ledger',
      description: 'Think of this as laying out a 16-character secret telegram into a 4×4 grid of storage boxes. In AES, bytes fill Column 0 first, then Column 1, 2, and 3.',
      iconName: 'LayoutGrid'
    },
    mathematicalExplanation: 'Each cell contains 8 bits (1 byte) represented in hexadecimal (0x00 to 0xFF). Byte[row, col] = plaintext[col * 4 + row].',
    purposeInAES: 'Provides the structured 128-bit block architecture required for symmetric block cipher operations.',
    color: {
      primary: 'slate',
      badgeBg: 'bg-slate-800/80',
      badgeText: 'text-slate-300',
      border: 'border-slate-700',
      glow: 'shadow-slate-500/20'
    }
  },
  SUB_BYTES: {
    title: 'SubBytes (Byte Substitution)',
    name: 'SUB_BYTES',
    shortName: 'SubBytes',
    tagline: 'Non-linear byte substitution using Rijndael S-Box',
    analogy: {
      title: 'The Secret Decoder Book (Confusion)',
      description: 'Imagine every soldier carrying an uncrackable lookup dictionary. Whenever you see a letter (e.g. "A"), you look up its exact row & column in the S-Box table and replace it with a precalculated scrambled code.',
      iconName: 'Shuffle'
    },
    mathematicalExplanation: 'Maps each byte to its multiplicative inverse in GF(2^8), followed by an affine transformation over GF(2). Highly non-linear to prevent differential & linear cryptanalysis.',
    purposeInAES: 'Introduces CONFUSION (Claude Shannon principle) — making the relationship between the key and ciphertext as mathematically complex as possible.',
    color: {
      primary: 'emerald',
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'shadow-emerald-500/20'
    }
  },
  SHIFT_ROWS: {
    title: 'ShiftRows (Row Permutation)',
    name: 'SHIFT_ROWS',
    shortName: 'ShiftRows',
    tagline: 'Cyclic left shift of each row by its row index offset',
    analogy: {
      title: 'The Sliding Tile Puzzle (Diffusion)',
      description: 'Think of 4 rows of conveyor belts. Row 0 stays put. Row 1 slides left by 1 spot, Row 2 slides left by 2 spots, and Row 3 slides left by 3 spots. Bytes that used to be together in the same column get scattered across completely different columns!',
      iconName: 'MoveHorizontal'
    },
    mathematicalExplanation: 'Row r is cyclically rotated left by r bytes: State[r, c] ← State[r, (c + r) mod 4]. Preserves all individual byte values while breaking vertical column alignment.',
    purposeInAES: 'Begins DIFFUSION — spreading local column byte information horizontally across the entire 128-bit state matrix.',
    color: {
      primary: 'amber',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-amber-500/20'
    }
  },
  MIX_COLUMNS: {
    title: 'MixColumns (Column Vector Mixing)',
    name: 'MIX_COLUMNS',
    shortName: 'MixColumns',
    tagline: 'Matrix multiplication in Galois Field GF(2^8) over each column',
    analogy: {
      title: 'The High-Speed Kitchen Blender (Intense Diffusion)',
      description: 'Imagine placing the 4 ingredients in each vertical column into a high-powered blender. The 4 bytes are mathematically blended together so that every single resulting output byte depends on all 4 original input bytes in that column.',
      iconName: 'Blend'
    },
    mathematicalExplanation: 'Treats each column as a 4-term polynomial over GF(2^8) and multiplies it modulo (x^4 + 1) with fixed MDS matrix c(x) = {03}x^3 + {01}x^2 + {01}x + {02}.',
    purposeInAES: 'Completes DIFFUSION — guarantees that modifying a single input bit spreads to all 16 bytes within just 2 rounds (Maximum Distance Separable property).',
    color: {
      primary: 'cyan',
      badgeBg: 'bg-cyan-950/80',
      badgeText: 'text-cyan-400',
      border: 'border-cyan-500/40',
      glow: 'shadow-cyan-500/20'
    }
  },
  ADD_ROUND_KEY: {
    title: 'AddRoundKey (Key Superposition)',
    name: 'ADD_ROUND_KEY',
    shortName: 'AddRoundKey',
    tagline: 'Bitwise XOR between State Matrix and derived Round Key',
    analogy: {
      title: 'The Secret Combination Padlock (Key Binding)',
      description: 'Imagine overlaying an invisible grid of secret key numbers onto our scrambled data grid and performing a binary light-switch flip (XOR). Because XOR is its own inverse (A ⊕ B ⊕ B = A), only someone with the exact key can reverse it!',
      iconName: 'KeyRound'
    },
    mathematicalExplanation: 'State[r, c] ← State[r, c] ⊕ RoundKey[r, c]. Simple, hardware-efficient bitwise operation that injects entropy from the Key Schedule.',
    purposeInAES: 'Binds the entire cryptographic transformation to the SECRET CIPHER KEY. Without this step, AES could be reversed by anyone who knows the standard algorithm.',
    color: {
      primary: 'purple',
      badgeBg: 'bg-purple-950/80',
      badgeText: 'text-purple-400',
      border: 'border-purple-500/40',
      glow: 'shadow-purple-500/20'
    }
  }
};

/**
 * Pre-configured presets for classroom demonstrations
 */
export const EDUCATIONAL_PRESETS = [
  {
    name: 'AES Standard Intro',
    text: 'AES ENCRYPTION !',
    key: 'Thats my Kung Fu',
    description: 'Classic textbook sample with clear readable letters and symbols.'
  },
  {
    name: 'Single Bit Flip (Avalanche)',
    text: 'AES ENCRYPTION ?',
    key: 'Thats my Kung Fu',
    description: 'Change just 1 character (from ! to ?) to observe how Avalanche effect scrambles the whole block.'
  },
  {
    name: 'Two One Nine Two',
    text: 'Two One Nine Two',
    key: 'SecretKey128Bit!',
    description: 'Rijndael standard NIST test vector text.'
  },
  {
    name: 'CS201 Class Demo',
    text: 'Hello CS Class!!',
    key: 'Cryptography2026',
    description: 'Standard 16-byte computer science classroom greeting.'
  }
];

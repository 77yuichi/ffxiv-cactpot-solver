import { PayoutMap } from './types';

// Standard FFXIV Mini Cactpot Payouts
export const DEFAULT_PAYOUTS: PayoutMap = {
  6: 10000,
  7: 36,
  8: 720,
  9: 360,
  10: 80,
  11: 252,
  12: 108,
  13: 72,
  14: 54,
  15: 180,
  16: 72,
  17: 180,
  18: 119,
  19: 36,
  20: 306,
  21: 1080,
  22: 144,
  23: 1800,
  24: 3600
};

// Definitions of which cells belong to which line
// Grid indices:
// 0 1 2
// 3 4 5
// 6 7 8
export const LINES = [
  [0, 1, 2], // Row 0
  [3, 4, 5], // Row 1
  [6, 7, 8], // Row 2
  [0, 3, 6], // Col 0
  [1, 4, 7], // Col 1
  [2, 5, 8], // Col 2
  [0, 4, 8], // Diag Main
  [2, 4, 6]  // Diag Anti
];

export type GridState = number[]; // Array of 9 numbers (0-9), 0 means empty

export interface PayoutMap {
  [sum: number]: number;
}

export interface LineResult {
  lineId: number; // 0-7
  sumProbabilities: Record<number, number>; // sum -> probability (0-1)
  expectedValue: number;
  maxPossible: number;
}

export interface SolverResult {
  lineResults: LineResult[];
  bestLineId: number;
  bestScratchCellId: number | null; // Suggestion for next scratch
  possibleSums: Set<number>; // All sums that are mathematically possible with current board
}

// Line Indices:
// Horizontal: 0, 1, 2
// Vertical: 3, 4, 5
// Diagonal: 6 (TL-BR), 7 (TR-BL)
export enum LineType {
  ROW_0 = 0,
  ROW_1 = 1,
  ROW_2 = 2,
  COL_0 = 3,
  COL_1 = 4,
  COL_2 = 5,
  DIAG_MAIN = 6,
  DIAG_ANTI = 7,
}

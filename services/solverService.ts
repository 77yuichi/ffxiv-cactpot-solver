import { GridState, PayoutMap, SolverResult, LineResult } from '../types';
import { LINES } from '../constants';

/**
 * Generates all permutations of an array.
 * Reverted to standard recursion as it is reliable for N=9.
 */
const getPermutations = (arr: number[]): number[][] => {
  if (arr.length === 0) return [[]];
  const firstElem = arr[0];
  const rest = arr.slice(1);
  const permsWithoutFirst = getPermutations(rest);
  const allPermutations: number[][] = [];

  permsWithoutFirst.forEach((perm) => {
    for (let i = 0; i <= perm.length; i++) {
      const start = perm.slice(0, i);
      const end = perm.slice(i);
      allPermutations.push([...start, firstElem, ...end]);
    }
  });
  return allPermutations;
};

/**
 * Solves the board state to find Expected Values for lines and suggestions for the next scratch.
 */
export const solveCactpot = (grid: GridState, payouts: PayoutMap): SolverResult => {
  // 1. Identify used and available numbers
  const usedNumbers = new Set(grid.filter((n) => n !== 0));
  const availableNumbers: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!usedNumbers.has(i)) {
      availableNumbers.push(i);
    }
  }

  // 2. Identify empty cell indices
  const emptyIndices: number[] = [];
  grid.forEach((val, idx) => {
    if (val === 0) emptyIndices.push(idx);
  });

  // 3. Generate all possible board completions
  const perms = getPermutations(availableNumbers);
  
  // Array of fully filled grids (flat arrays of 9)
  const possibleBoards: number[][] = perms.map((perm) => {
    const newBoard = [...grid];
    emptyIndices.forEach((cellIndex, i) => {
      newBoard[cellIndex] = perm[i];
    });
    return newBoard;
  });

  const totalPossibilities = possibleBoards.length;
  const possibleSums = new Set<number>();

  // 4. Calculate stats for each Line
  const lineResults: LineResult[] = LINES.map((lineIndices, lineId) => {
    let totalValue = 0;
    let maxVal = 0;
    // Map of sum -> count of occurrences
    const sumCounts: Record<number, number> = {}; 
    const payoutCounts: Record<number, number> = {};
    
    // Map of payout -> Set of stringified needed numbers (to deduplicate)
    const payoutScenarios: Record<number, Set<string>> = {};

    possibleBoards.forEach((board) => {
      const sum = board[lineIndices[0]] + board[lineIndices[1]] + board[lineIndices[2]];
      const payout = payouts[sum] || 0;
      
      totalValue += payout;
      if (payout > maxVal) maxVal = payout;
      
      sumCounts[sum] = (sumCounts[sum] || 0) + 1;
      payoutCounts[payout] = (payoutCounts[payout] || 0) + 1;
      possibleSums.add(sum);

      // Determine missing numbers for this specific outcome
      // Filter the line indices to find which ones are empty in the current STATE (grid)
      const missingValues = lineIndices
        .filter(idx => grid[idx] === 0) // Only look at cells that are currently 0
        .map(idx => board[idx])         // Get the value from the hypothetical board
        .sort((a, b) => a - b);         // Sort to ensure [2,3] is same as [3,2]
      
      const scenarioKey = missingValues.join(',');
      
      if (!payoutScenarios[payout]) {
        payoutScenarios[payout] = new Set();
      }
      payoutScenarios[payout].add(scenarioKey);
    });

    // Convert counts to probabilities
    const sumProbabilities: Record<number, number> = {};
    for (const s in sumCounts) {
      sumProbabilities[s] = sumCounts[s] / totalPossibilities;
    }

    const payoutProbabilities: Record<number, number> = {};
    for (const p in payoutCounts) {
      payoutProbabilities[p] = payoutCounts[p] / totalPossibilities;
    }

    // Convert scenarios sets back to number arrays
    const winningScenarios: Record<number, number[][]> = {};
    for (const p in payoutScenarios) {
      winningScenarios[p] = Array.from(payoutScenarios[p]).map(str => 
        str === '' ? [] : str.split(',').map(Number)
      );
    }

    return {
      lineId,
      sumProbabilities,
      payoutProbabilities,
      winningScenarios,
      expectedValue: totalValue / totalPossibilities,
      maxPossible: maxVal
    };
  });

  // 5. Determine Best Line (highest Expected Value)
  const bestLineId = lineResults.reduce((bestId, current, idx) => {
    if (current.expectedValue > lineResults[bestId].expectedValue) return idx;
    return bestId;
  }, 0);

  // 6. Determine Best Scratch Recommendation
  let bestScratchCellId: number | null = null;
  
  if (emptyIndices.length > 0) {
    let bestCellScore = -1;

    // Simple heuristic: Sum of EVs of all lines passing through this cell
    emptyIndices.forEach((cellIdx) => {
      let cellScore = 0;
      
      LINES.forEach((lineIndices, lineId) => {
        if (lineIndices.includes(cellIdx)) {
           cellScore += lineResults[lineId].expectedValue;
        }
      });

      if (cellScore > bestCellScore) {
        bestCellScore = cellScore;
        bestScratchCellId = cellIdx;
      }
    });
  }

  return {
    lineResults,
    bestLineId,
    bestScratchCellId,
    possibleSums
  };
};
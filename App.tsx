import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_PAYOUTS, LINES } from './constants';
import { GridState, SolverResult, LineType } from './types';
import { solveCactpot } from './services/solverService';
import { NumberInput } from './components/NumberInput';
import { PayoutEditor } from './components/PayoutEditor';
import { ProbabilityPanel } from './components/ProbabilityPanel';

const App: React.FC = () => {
  const [grid, setGrid] = useState<GridState>(Array(9).fill(0));
  const [solution, setSolution] = useState<SolverResult | null>(null);

  const usedNumbers = useMemo(() => {
    return new Set(grid.filter(n => n !== 0));
  }, [grid]);

  // Game Phase Logic
  const revealedCount = usedNumbers.size;
  const isStartPhase = revealedCount === 0;
  const isInputLocked = revealedCount >= 4;
  const isScoutingPhase = revealedCount > 0 && revealedCount < 4;
  const isSelectionPhase = revealedCount >= 4;

  useEffect(() => {
    // Standard solve logic - runs on every grid change
    const result = solveCactpot(grid, DEFAULT_PAYOUTS);
    setSolution(result);
  }, [grid]);

  const handleCellChange = (index: number, value: number) => {
    const isAddingNew = grid[index] === 0 && value !== 0;
    if (isAddingNew && isInputLocked) return; 

    const newGrid = [...grid];
    newGrid[index] = value;
    setGrid(newGrid);
  };

  const handleReset = () => {
    setGrid(Array(9).fill(0));
  };

  const getLineEV = (lineId: number): number | undefined => {
    if (isStartPhase) return undefined;
    return solution?.lineResults.find(l => l.lineId === lineId)?.expectedValue;
  };

  const renderLineIndicator = (lineId: number, rotationClass: string) => {
      // Don't show EV/Highlight on start phase
      if (isStartPhase) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 transition-all duration-300 opacity-30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/5 flex items-center justify-center backdrop-blur-sm bg-transparent">
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-500 ${rotationClass}`} fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z" transform="rotate(180 12 12)" />
                    </svg>
                </div>
            </div>
        );
      }

      const ev = getLineEV(lineId);
      const isBest = isSelectionPhase && solution?.bestLineId === lineId;
      
      const arrowColor = isBest ? "text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]" : "text-gray-600";
      const bgStyle = isBest 
        ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] scale-110 z-10" 
        : "bg-transparent border-white/5 hover:border-white/10";
      
      return (
          <div className="flex flex-col items-center justify-center gap-2 transition-all duration-300 group">
             <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${bgStyle}`}>
                <svg 
                    className={`w-5 h-5 sm:w-6 sm:h-6 transform transition-colors duration-300 ${rotationClass} ${arrowColor}`} 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z" transform="rotate(180 12 12)" />
                </svg>
             </div>
             
             {ev !== undefined && (
                 <div className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold border transition-all duration-300 ${isBest ? "bg-amber-900/40 border-amber-500/30 text-amber-300" : "bg-transparent border-transparent text-gray-600 opacity-0 group-hover:opacity-100"}`}>
                     {Math.round(ev).toLocaleString()}
                 </div>
             )}
          </div>
      )
  }

  const getPhaseLabel = () => {
      if (isStartPhase) return 'start';
      if (isScoutingPhase) return 'scouting';
      return 'selection';
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans flex flex-col bg-grid-pattern relative overflow-x-hidden">
      {/* Background Overlay for Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)] pointer-events-none"></div>

      <nav className="border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
               <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 tracking-wider font-mono drop-shadow-sm">
                 仙人微彩計算器
               </h1>
               <span className="text-[10px] sm:text-xs text-amber-500/60 px-2 py-0.5 border border-amber-500/20 rounded-full bg-amber-500/5">
                 Made for 吉伊小八烏薩奇 @ 利維坦公會
               </span>
            </div>
            {/* Reset Button Moved to Main Body */}
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 py-8 sm:py-12 flex-grow relative z-10 w-full">
        {/* Responsive Grid Layout: Left Sidebar | Center Game | Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_auto_300px] gap-8 items-start justify-center">
          
          {/* LEFT PANEL: Probability Analysis */}
          <div className="w-full lg:sticky lg:top-24 order-2 lg:order-1">
             <ProbabilityPanel solution={solution} phase={getPhaseLabel()} />
          </div>

          {/* CENTER PANEL: Game Board */}
          <div className="flex-shrink-0 flex flex-col items-center order-1 lg:order-2">
            <div className="bg-[#0a0a0a] p-6 sm:p-12 rounded-3xl border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.7)] relative bg-opacity-80 backdrop-blur-xl inline-block">
                {/* Subtle Gold Glow behind board */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="grid grid-cols-[auto_auto_auto_auto_auto] gap-4 sm:gap-6 items-center justify-items-center relative z-10">
                    {/* Indicators */}
                    <div className="pb-2">{renderLineIndicator(LineType.DIAG_MAIN, "rotate-[135deg]")}</div>
                    <div className="pb-2">{renderLineIndicator(LineType.COL_0, "rotate-180")}</div>
                    <div className="pb-2">{renderLineIndicator(LineType.COL_1, "rotate-180")}</div>
                    <div className="pb-2">{renderLineIndicator(LineType.COL_2, "rotate-180")}</div>
                    <div className="pb-2">{renderLineIndicator(LineType.DIAG_ANTI, "-rotate-[135deg]")}</div>

                    <div className="pr-2">{renderLineIndicator(LineType.ROW_0, "rotate-90")}</div>
                    <NumberInput value={grid[0]} onChange={(v) => handleCellChange(0, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 0} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(0)} isDisabled={isInputLocked && grid[0] === 0} />
                    <NumberInput value={grid[1]} onChange={(v) => handleCellChange(1, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 1} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(1)} isDisabled={isInputLocked && grid[1] === 0} />
                    <NumberInput value={grid[2]} onChange={(v) => handleCellChange(2, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 2} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(2)} isDisabled={isInputLocked && grid[2] === 0} />
                    <div></div>

                    <div className="pr-2">{renderLineIndicator(LineType.ROW_1, "rotate-90")}</div>
                    <NumberInput value={grid[3]} onChange={(v) => handleCellChange(3, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 3} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(3)} isDisabled={isInputLocked && grid[3] === 0} />
                    <NumberInput value={grid[4]} onChange={(v) => handleCellChange(4, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 4} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(4)} isDisabled={isInputLocked && grid[4] === 0} />
                    <NumberInput value={grid[5]} onChange={(v) => handleCellChange(5, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 5} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(5)} isDisabled={isInputLocked && grid[5] === 0} />
                    <div></div>

                    <div className="pr-2">{renderLineIndicator(LineType.ROW_2, "rotate-90")}</div>
                    <NumberInput value={grid[6]} onChange={(v) => handleCellChange(6, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 6} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(6)} isDisabled={isInputLocked && grid[6] === 0} />
                    <NumberInput value={grid[7]} onChange={(v) => handleCellChange(7, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 7} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(7)} isDisabled={isInputLocked && grid[7] === 0} />
                    <NumberInput value={grid[8]} onChange={(v) => handleCellChange(8, v)} disabledNumbers={usedNumbers} isRecommended={isScoutingPhase && solution?.bestScratchCellId === 8} highlight={isSelectionPhase && solution && LINES[solution.bestLineId].includes(8)} isDisabled={isInputLocked && grid[8] === 0} />
                    <div></div>
                </div>
                
                {/* Status Footer inside Game Board */}
                <div className="mt-8 flex items-center justify-between text-xs font-mono border-t border-white/5 pt-4">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isScoutingPhase ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_cyan]' : 'bg-gray-700'}`}></span>
                            <span className={isScoutingPhase ? 'text-cyan-400 font-bold' : 'text-gray-600'}>偵查階段</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelectionPhase ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_orange]' : 'bg-gray-700'}`}></span>
                            <span className={isSelectionPhase ? 'text-amber-400 font-bold' : 'text-gray-600'}>決策階段</span>
                        </div>
                    </div>
                    <div className="text-gray-500 font-bold">
                        已翻開: <span className="text-gray-300">{revealedCount}/4</span>
                    </div>
                </div>
            </div>

            {/* Reset Button (Moved Here) */}
            <div className="mt-6 w-full max-w-[300px]">
                <button 
                    onClick={handleReset}
                    className="w-full py-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/20 hover:border-red-500/40 font-bold tracking-widest transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] flex items-center justify-center gap-2 group active:scale-95"
                >
                    <svg className="w-4 h-4 text-red-500/70 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    回復原狀
                </button>
            </div>
          </div>

          {/* RIGHT PANEL: Payouts & Logic */}
          <div className="w-full lg:sticky lg:top-24 flex flex-col gap-6 order-3">
             <PayoutEditor payouts={DEFAULT_PAYOUTS} possibleSums={solution?.possibleSums} />
             
             {/* Tech Guide */}
             <div className="space-y-4 p-6 rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl"></div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                    <span className="w-1 h-3 bg-amber-500 rounded-sm"></span>
                    系統邏輯
                </h4>
                
                <div className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-lg bg-[#15151a] border border-white/5 flex items-center justify-center text-cyan-400 font-bold text-xs flex-shrink-0 shadow-inner group-hover:border-cyan-500/30 transition-colors">EV</div>
                   <div>
                      <div className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">期望值 (Expected Value)</div>
                      <div className="text-xs text-gray-500 leading-relaxed mt-1">計算所有可能排列的平均收益。優先考慮長期的統計利潤，而非短期的運氣。</div>
                   </div>
                </div>

                <div className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-lg bg-[#15151a] border border-white/5 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0 shadow-inner group-hover:border-amber-500/30 transition-colors">Y</div>
                   <div>
                      <div className="text-sm font-bold text-gray-200 group-hover:text-amber-400 transition-colors">Y型佈局 (Y-Pattern)</div>
                      <div className="text-xs text-gray-500 leading-relaxed mt-1">中心 + 角落的策略能最大化資訊獲取量，便於儘早識別潛在的 1-2-3 或 7-8-9 強力連線。</div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>
      
      <footer className="py-8 border-t border-white/5 bg-[#050505] text-center relative z-10">
         <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">
            © SQUARE ENIX CO., LTD. All Rights Reserved.
         </p>
      </footer>
    </div>
  );
};

export default App;
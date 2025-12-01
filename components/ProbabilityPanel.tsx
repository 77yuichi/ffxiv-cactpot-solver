import React from 'react';
import { SolverResult } from '../types';

interface ProbabilityPanelProps {
  solution: SolverResult | null;
  phase: 'start' | 'scouting' | 'selection';
}

export const ProbabilityPanel: React.FC<ProbabilityPanelProps> = ({ solution, phase }) => {
  if (phase === 'start' || !solution) {
      return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm h-full flex items-center justify-center p-8 text-center min-h-[300px]">
            <div className="text-gray-500 text-xs tracking-widest leading-relaxed">
                <div className="mb-4 text-4xl opacity-20 font-serif text-amber-500">?</div>
                <p className="mb-2 text-gray-400 font-bold">等待初始數據</p>
                請先輸入遊戲盤面上的<br/>第一個數字
            </div>
        </div>
      );
  }

  const bestLine = solution.lineResults[solution.bestLineId];
  const probs = bestLine.payoutProbabilities;
  const scenarios = bestLine.winningScenarios;
  
  // Sort payouts by Value Descending to highlight big wins.
  const sortedPayouts = Object.keys(probs)
    .map(Number)
    .sort((a, b) => b - a);

  // Take top relevant ones
  const displayPayouts = sortedPayouts.filter(p => probs[p] > 0).slice(0, 5);

  const bestLineLabelMap = [
    "橫排一 (Row 1)", "橫排二 (Row 2)", "橫排三 (Row 3)",
    "直排一 (Col 1)", "直排二 (Col 2)", "直排三 (Col 3)",
    "左上右下 (TL-BR)", "右上左下 (TR-BL)"
  ];

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm h-full flex flex-col">
       <div className="bg-[#0f0f0f] px-5 py-4 border-b border-white/10 flex justify-between items-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        
        <div className="flex items-center gap-2 z-10">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]"></div>
           <h3 className="text-gray-200 font-bold text-sm tracking-wider uppercase">路徑分析</h3>
        </div>
        <span className="text-[9px] text-cyan-500/60 font-mono font-bold tracking-widest border border-cyan-500/20 px-1.5 py-0.5 rounded">
            TACTICAL
        </span>
      </div>

      <div className="p-6 flex flex-col gap-6 flex-grow">
        
        {/* Total EV Section */}
        <div className="text-center relative group">
            <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-full group-hover:bg-cyan-500/10 transition-all"></div>
            <div className="relative">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">目前最佳路徑</div>
                <div className="text-cyan-400 font-bold text-sm mb-2">{bestLineLabelMap[solution.bestLineId]}</div>
                <div className="text-4xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    {Math.round(bestLine.expectedValue).toLocaleString()}
                </div>
                <div className="text-xs text-amber-500 font-bold mt-1">
                    平均期望值 (EV)
                </div>
            </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Probability & Needs Breakdown */}
        <div className="flex-grow flex flex-col gap-4">
             <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex justify-between">
                <span>獎勵 (需求)</span>
                <span>機率</span>
             </div>
             
             {displayPayouts.map(payout => {
                 const prob = probs[payout];
                 const percentage = (prob * 100).toFixed(1);
                 const neededCombs = scenarios[payout] || [];
                 
                 // Display distinct needed numbers. E.g. [[2,3]] -> "2, 3". [[1,9], [2,8]] -> "1,9 / 2,8"
                 // Join inner arrays with & or + to indicate BOTH are needed
                 const neededText = neededCombs.length > 0
                    ? neededCombs.map(comb => comb.join('&')).join(' / ')
                    : ''; 

                 let colorClass = "text-gray-300";
                 let barColor = "bg-gray-700";
                 let badgeClass = "bg-gray-200 text-black border-white"; // High contrast default
                 
                 if (payout >= 10000) { 
                     colorClass = "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"; 
                     barColor = "bg-amber-500";
                     // High Contrast Gold Badge
                     badgeClass = "bg-amber-400 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
                 }
                 else if (payout >= 1000) { 
                     colorClass = "text-cyan-300"; 
                     barColor = "bg-cyan-500";
                     badgeClass = "bg-cyan-100 text-cyan-900 border-cyan-200";
                 }

                 return (
                    <div key={payout} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-center flex-wrap gap-y-1">
                            
                            {/* Left: Amount & Badge */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`font-mono text-lg font-bold tracking-tight ${colorClass}`}>
                                    {payout.toLocaleString()}
                                </span>
                                {neededText && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-gray-500 tracking-wider">缺號</span>
                                        <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${badgeClass} tracking-tight leading-none`}>
                                            {neededText}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Right: Probability */}
                            <span className="text-gray-400 text-xs font-mono font-bold ml-auto">{percentage}%</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className={`h-full rounded-full ${barColor} shadow-[0_0_8px_currentColor] transition-all duration-500`} 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                 )
             })}
             
             {displayPayouts.length === 0 && (
                 <div className="text-center text-xs text-gray-600 py-4 italic">
                     無法計算機率
                 </div>
             )}
        </div>

        {/* Footer Phase Indicator */}
        <div className={`mt-auto text-center text-xs font-bold py-3 rounded border ${phase === 'selection' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
            {phase === 'selection' ? '決策階段：請選擇金色箭頭' : '偵查階段：請優先獲取情報'}
        </div>

      </div>
    </div>
  );
};
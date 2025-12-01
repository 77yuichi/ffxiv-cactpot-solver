import React from 'react';
import { PayoutMap } from '../types';

interface PayoutEditorProps {
  payouts: PayoutMap;
  possibleSums?: Set<number>;
}

export const PayoutEditor: React.FC<PayoutEditorProps> = ({ payouts, possibleSums }) => {
  const sums = Object.keys(payouts).map(Number).sort((a, b) => a - b);
  const rowsPerCol = Math.ceil(sums.length / 3);
  const col1 = sums.slice(0, rowsPerCol);
  const col2 = sums.slice(rowsPerCol, rowsPerCol * 2);
  const col3 = sums.slice(rowsPerCol * 2);

  const renderRow = (sum: number) => {
    const isImpossible = possibleSums && !possibleSums.has(sum);
    const payout = payouts[sum];
    
    return (
      <div 
        key={sum} 
        className={`flex items-center justify-between py-2 px-3 border-b border-white/5 last:border-0 transition-opacity duration-300 ${isImpossible ? 'opacity-20 grayscale' : 'hover:bg-amber-500/5'}`}
      >
        <span className={`font-mono text-xs font-bold ${isImpossible ? 'text-gray-600' : 'text-amber-500'}`}>
          {sum}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-bold text-sm tracking-wide ${isImpossible ? 'text-gray-600' : 'text-gray-200'}`}>
            {payout.toLocaleString()}
          </span>
          <span className="text-[9px] text-gray-600 font-bold tracking-widest">MGP</span>
        </div>
      </div>
    );
  };

  const renderColumn = (items: number[]) => (
    <div className="flex flex-col border-r border-white/5 last:border-0">
        <div className="flex justify-between px-3 py-2 bg-white/5 text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5 font-mono">
            <span>總和</span><span>獎勵</span>
        </div>
        {items.map(renderRow)}
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="bg-[#0f0f0f] px-5 py-3 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_orange]"></div>
           <h3 className="text-gray-200 font-bold text-sm tracking-wider uppercase">獎勵一覽</h3>
        </div>
        <span className="text-[9px] text-gray-600 font-mono">FIXED RATES</span>
      </div>
      <div className="grid grid-cols-3">
        {renderColumn(col1)}
        {renderColumn(col2)}
        {renderColumn(col3)}
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  disabledNumbers: Set<number>;
  isRecommended: boolean | null; 
  highlight: boolean | null;     
  isDisabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  value, 
  onChange, 
  disabledNumbers, 
  isRecommended,
  highlight,
  isDisabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (num: number) => {
    onChange(num);
    setIsOpen(false);
  };

  const isRevealed = value !== 0;
  
  // Base Container
  let containerClass = `relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-out shadow-lg select-none `;

  // Styles - Black Gold Tech
  
  // Unscratched: 3D Gradient Gold Orb with texture
  const unscratchedStyle = "bg-[radial-gradient(circle_at_30%_30%,#fbbf24_0%,#d97706_40%,#78350f_90%)] border-2 border-amber-900/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_5px_15px_rgba(0,0,0,0.5)]";
  
  // Revealed: Silver/White glow
  const revealedStyle = "bg-[#f4f4f5] border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] text-gray-900";
  
  // Disabled (Locked): Faded Dark
  const disabledStyle = "bg-[#18181b] border border-white/10 opacity-30 cursor-not-allowed grayscale";

  // Recommendation (Cyan Pulse)
  if (isRecommended && !isRevealed && !isDisabled) {
      containerClass += " ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.6)] z-10 scale-105 animate-pulse";
  }

  // Best Line (Gold Glow)
  if (highlight) {
      containerClass += " ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] z-10 scale-105";
  }

  // Hover effect for interactive cells
  if (!isDisabled && !isRevealed && !isRecommended) {
      containerClass += " hover:scale-105 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer";
  }

  if (isRevealed) {
    containerClass += ` ${revealedStyle}`;
  } else if (isDisabled) {
    containerClass += ` ${disabledStyle}`;
  } else {
    containerClass += ` ${unscratchedStyle}`;
  }

  // Dynamic Z-Index: If open, must be very high to float above other cells
  const wrapperZIndex = isOpen ? 'z-[100]' : (highlight || isRecommended ? 'z-20' : 'z-0');

  return (
    <div ref={containerRef} className={`relative ${wrapperZIndex}`}>
      <div 
        className={containerClass}
        onClick={() => {
          if (!isDisabled) setIsOpen(!isOpen);
        }}
      >
        {/* Number Display */}
        {isRevealed && (
          <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tighter text-gray-900 drop-shadow-sm">
            {value}
          </span>
        )}
        
        {/* Question Mark for unscratched */}
        {!isRevealed && !isDisabled && (
           <span className="text-amber-950/60 text-3xl font-bold font-serif drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">?</span>
        )}
      </div>

      {/* Modern Circular Numpad Popover */}
      {isOpen && !isDisabled && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-12 z-[200]">
           <div className="bg-[#1a1b26] backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-4 animate-in fade-in zoom-in duration-200 flex flex-col items-center gap-3 w-[200px]">
            
            {/* Number Grid */}
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const isOptionDisabled = disabledNumbers.has(num) && value !== num;
                return (
                    <button
                    key={num}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isOptionDisabled) handleSelect(num);
                    }}
                    disabled={isOptionDisabled}
                    className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-mono text-lg font-bold transition-all duration-200
                        ${isOptionDisabled 
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                        : 'bg-white/10 text-amber-400 hover:bg-amber-500 hover:text-black hover:scale-110 shadow-[0_0_10px_rgba(0,0,0,0.5)] active:scale-90 ring-1 ring-white/10'
                        }
                    `}
                    >
                    {num}
                    </button>
                );
                })}
            </div>

            {/* Clear Button */}
            <button
               onClick={(e) => { e.stopPropagation(); handleSelect(0); }}
               className="w-full py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold tracking-widest border border-red-500/20 transition-all uppercase hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              清除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
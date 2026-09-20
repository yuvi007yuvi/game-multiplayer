import React, { useState } from 'react';
import { TRUMP_SUIT } from '@shared/constants.js';

export function BiddingSlider({
  myHand = [],
  onSubmitBid,
  minBid = 1,
  maxBid = 8
}) {
  const [selectedBid, setSelectedBid] = useState(3);

  const spadesCount = myHand.filter(c => c.suit === TRUMP_SUIT).length;
  const highCardsCount = myHand.filter(c => c.value >= 12).length;

  const bidOptions = [];
  for (let i = minBid; i <= maxBid; i++) {
    bidOptions.push(i);
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-5 py-1.5 sm:py-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-3 shrink-0 bg-slate-900/95 border-2 border-amber-500/80 rounded-xl sm:rounded-2xl shadow-2xl z-30 my-0.5 animate-fade-in ring-1 sm:ring-2 ring-amber-400/30">
      {/* Top/Left: Hand Stats & Hint */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black flex items-center justify-center text-xs sm:text-sm shadow shrink-0">
            ♠
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-wider">Declare Call</span>
            <span className="text-[9px] sm:text-[10px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded">
              YOUR TURN
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-300">
          <span>♠ <strong className="text-amber-400 font-bold">{spadesCount}</strong> Spades</span>
          <span className="text-slate-600">•</span>
          <span><strong className="text-emerald-400 font-bold">{highCardsCount}</strong> Honors</span>
        </div>
      </div>

      {/* Bottom/Right Controls: Stepper, Direct Tap Numbers, and Confirm */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
        {/* Stepper & Number Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={() => setSelectedBid(prev => Math.max(minBid, prev - 1))}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-amber-400 font-black text-sm sm:text-base border border-slate-700 flex items-center justify-center transition-all shadow-sm select-none shrink-0"
            title="Decrease Call"
          >
            -
          </button>

          {/* Quick Tap Numbers 1 to 8 */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {bidOptions.map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedBid(n)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all flex items-center justify-center ${
                  selectedBid === n
                    ? 'text-black bg-amber-400 font-black scale-110 shadow-sm'
                    : 'text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Increment Button */}
          <button
            type="button"
            onClick={() => setSelectedBid(prev => Math.min(maxBid, prev + 1))}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-amber-400 font-black text-sm sm:text-base border border-slate-700 flex items-center justify-center transition-all shadow-sm select-none shrink-0"
            title="Increase Call"
          >
            +
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={() => onSubmitBid && onSubmitBid(selectedBid)}
          className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>Call: {selectedBid}</span>
          <span className="text-sm leading-none">♠</span>
        </button>
      </div>
    </div>
  );
}

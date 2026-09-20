import React, { useState } from 'react';
import { TRUMP_SUIT } from '@shared/constants.js';

export function BiddingModal({
  isOpen = false,
  myHand = [],
  onSubmitBid,
  minBid = 1,
  maxBid = 8
}) {
  const [selectedBid, setSelectedBid] = useState(3);

  if (!isOpen) return null;

  const spadesCount = myHand.filter(c => c.suit === TRUMP_SUIT).length;
  const highCardsCount = myHand.filter(c => c.value >= 12).length;

  const bidOptions = [];
  for (let i = minBid; i <= maxBid; i++) {
    bidOptions.push(i);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-8 sm:pt-12 md:pt-14 p-3 bg-black/30 animate-fade-in select-none pointer-events-none">
      <div className="relative w-full max-w-xs sm:max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/60 p-4 sm:p-5 shadow-2xl text-center pointer-events-auto modal-enter">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl text-amber-400">♠</span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-wide">
            Declare Your Call (Bid)
          </h2>
          <span className="text-xl text-amber-400">♠</span>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          How many tricks (out of 13) do you aim to win this round?
        </p>

        {/* Hand hint */}
        <div className="flex justify-center gap-4 bg-slate-800/60 rounded-lg py-2 px-3 mb-4 text-xs border border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">♠ Spades:</span>
            <span className="font-mono font-bold text-slate-200">{spadesCount}</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">High Cards:</span>
            <span className="font-mono font-bold text-slate-200">{highCardsCount}</span>
          </div>
        </div>

        {/* Bid selector grid */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {bidOptions.map((bid) => {
            const isSelected = selectedBid === bid;
            return (
              <button
                key={bid}
                type="button"
                onClick={() => setSelectedBid(bid)}
                className={`py-3 rounded-xl font-bold font-mono text-lg transition-all ${
                  isSelected
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-glow-gold scale-105 border-2 border-yellow-200'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {bid}
              </button>
            );
          })}
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={() => onSubmitBid(selectedBid)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-base uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
        >
          Confirm Call: {selectedBid} Tricks
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { X, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

export function RulesModal({ isOpen = false, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 text-amber-400">
          <BookOpen size={24} />
          <h2 className="text-xl font-bold text-slate-100">How to Play Call Break</h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <section className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <h3 className="text-sm font-bold text-amber-400 mb-1">1. Deck & Trump Suit</h3>
            <p>
              Standard 52-card deck dealt equally (13 cards to each of the 4 players).
              <strong className="text-slate-100"> Spades (♠) are always the permanent Trump suit.</strong>
            </p>
          </section>

          <section className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <h3 className="text-sm font-bold text-amber-400 mb-1">2. Bidding (Calling)</h3>
            <p>
              Before tricks begin, each player calls (bids) between 1 and 8 tricks based on the strength of their hand.
            </p>
          </section>

          <section className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <h3 className="text-sm font-bold text-amber-400 mb-1">3. Trick Rules & Mandatory Trumping</h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li>
                <strong className="text-slate-100">Must Follow Suit:</strong> You must play a card of the suit that was led if you have one.
              </li>
              <li>
                <strong className="text-slate-100">Must Trump if Void:</strong> If you have no cards of the led suit, you <span className="text-amber-400 font-semibold">must</span> play a Spade (trump) if you have one.
              </li>
              <li>
                <strong className="text-slate-100">Must Overtrump:</strong> If another player has already trumped with a Spade, you must play a higher Spade if you have one.
              </li>
              <li>
                <strong className="text-slate-100">Discard:</strong> If you are void of the led suit AND have no Spades, you may discard any card.
              </li>
            </ul>
          </section>

          <section className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <h3 className="text-sm font-bold text-amber-400 mb-1">4. Scoring Formula</h3>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-start gap-1.5 text-emerald-400">
                <CheckCircle size={14} className="mt-0.5 shrink-0" />
                <span>Won &ge; Bid: Score = Bid + (Won - Bid) &times; 0.1</span>
              </div>
              <p className="text-slate-400 pl-5 font-sans text-[11px]">
                Example: You bid 3 and won 4 tricks &rarr; Score is <strong className="text-slate-200">+3.1</strong>
              </p>
              <div className="flex items-start gap-1.5 text-red-400 mt-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>Won &lt; Bid: Score = -Bid</span>
              </div>
              <p className="text-slate-400 pl-5 font-sans text-[11px]">
                Example: You bid 4 and won 3 tricks &rarr; Score is <strong className="text-slate-200">-4.0</strong>
              </p>
            </div>
          </section>

          <section className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-200">
            <strong>Virtual Currency Notice:</strong> All coins used in Call Break Arena are strictly non-redeemable virtual entertainment points. There are zero deposits, withdrawals, or real cash prizes.
          </section>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 transition-colors"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
}

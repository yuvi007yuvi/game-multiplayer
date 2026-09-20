import React from 'react';
import { X, Sparkles } from 'lucide-react';

const POPULAR_EMOJIS = ['👏', '🔥', '👑', '♠️', '😅', '😂', '🎯', '❤️', '😱', '💪', '👍', '🤫'];

const QUICK_PHRASES = [
  'Well played!',
  'Good game!',
  'Nice trick!',
  'Oops!',
  'Spades coming!',
  "Let's go!"
];

export function EmotePicker({ isOpen, onClose, onSelectEmote }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm select-none animate-fade-in">
      <div className="w-full max-w-xs sm:max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-4 shadow-2xl modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Table Reactions</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Emojis Grid */}
        <div className="grid grid-cols-6 gap-1.5 mb-3">
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelectEmote({ emote: emoji });
                onClose();
              }}
              className="h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-90 text-xl flex items-center justify-center transition-all border border-slate-700/50 shadow-sm"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Quick Phrases */}
        <div className="border-t border-slate-800 pt-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Quick Phrases
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PHRASES.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => {
                  onSelectEmote({ phrase });
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-400/20 hover:text-amber-300 hover:border-amber-400/40 text-slate-300 text-xs font-medium border border-slate-700/70 transition-all active:scale-95"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { AVATARS, getRandomCoolName } from '../../services/storage.js';
import { soundEngine } from '../../services/soundEngine.js';
import { haptics } from '../../services/haptics.js';
import { Dices, Sparkles, Coins, ArrowRight, ShieldCheck } from 'lucide-react';

export function OnboardingModal({ isOpen = false, onComplete }) {
  const [name, setName] = useState(() => getRandomCoolName());
  const [selectedAvatar, setSelectedAvatar] = useState('🐅');

  if (!isOpen) return null;

  const handleRandomize = () => {
    soundEngine.playClick();
    haptics.vibrate(10);
    setName(getRandomCoolName());
  };

  const handleSelectAvatar = (icon) => {
    soundEngine.playClick();
    haptics.vibrate(10);
    setSelectedAvatar(icon);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = name.trim() || 'Player_1';
    soundEngine.playTrickWin();
    haptics.vibrateCardPlay();
    if (onComplete) {
      onComplete({ name: finalName, avatar: selectedAvatar });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 p-5 sm:p-8 shadow-2xl overflow-hidden modal-enter">
        {/* Subtle decorative gold glow in background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-amber-400" />
            <span>Welcome to Call Break Arena</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Create Your Player Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose your arena call sign and avatar to take your seat at the tables.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Username & Randomizer */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                1. Your Call Sign (Username)
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                title="Generate Random Gamer Tag"
              >
                <Dices size={14} />
                <span>Randomize</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-slate-100 font-bold text-base outline-none transition-all"
                autoFocus
              />
              <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono">
                {name.length}/16
              </span>
            </div>
          </div>

          {/* Section 2: Avatar Selection */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2.5">
              2. Choose Your Avatar
            </label>

            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.icon;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSelectAvatar(av.icon)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 ${
                      isSelected
                        ? 'bg-amber-500/20 border-2 border-amber-400 shadow-glow-gold scale-105'
                        : 'bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{av.icon}</span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                      {av.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Starting Chips Gift Box */}
          <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <Coins size={20} />
              </div>
              <div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide block">
                  Starter Bankroll Included
                </span>
                <span className="text-[11px] text-slate-400">
                  +1,000 free virtual chips credited to your wallet
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs font-mono">
              +1,000
            </span>
          </div>

          {/* Enter Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 active:scale-[0.98] text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>Enter the Arena</span>
            <ArrowRight size={18} />
          </button>

          {/* Disclaimer */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck size={12} className="text-emerald-400/80" />
            <span>Virtual coins only • No real money gambling • Free to play</span>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import { Volume2, VolumeX, HelpCircle, Coins, Plus, User } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine.js';

export function Navbar({
  userProfile,
  onOpenRules,
  onOpenProfile,
  onClaimBonus,
  soundEnabled,
  onToggleSound,
  connected
}) {
  const coins = userProfile?.coins ?? 1000;
  const lastClaim = userProfile?.lastBonusClaim ? new Date(userProfile.lastBonusClaim).getTime() : 0;
  const isBonusAvailable = !lastClaim || (Date.now() - lastClaim >= 24 * 60 * 60 * 1000);

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black font-serif text-base sm:text-lg font-black shadow-glow-gold">
          ♠
        </div>
        <div>
          <h1 className="text-xs sm:text-base font-extrabold tracking-wide text-slate-100 uppercase leading-none">
            Call Break <span className="text-amber-400">Arena</span>
          </h1>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-tight block">
            4-Player Multiplayer
          </span>
        </div>
      </div>

      {/* Right Controls: Coins, Audio, Rules, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Virtual Coin Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 px-2.5 py-1 rounded-full shadow-inner">
          <Coins size={14} className="text-amber-400" />
          <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-mono">
            {coins.toLocaleString()}
          </span>
          {coins < 500 && isBonusAvailable && (
            <button
              type="button"
              onClick={onClaimBonus}
              title="Claim Daily Reload Bonus (+500 Coins)"
              className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold flex items-center gap-0.5 transition-colors"
            >
              <Plus size={10} />
              <span>Free</span>
            </button>
          )}
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition-colors"
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-500" />}
        </button>

        {/* Rules Modal Button */}
        <button
          type="button"
          onClick={onOpenRules}
          className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition-colors"
          title="Game Rules & Scoring"
        >
          <HelpCircle size={16} />
        </button>

        {/* Profile Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 transition-colors"
        >
          <User size={15} />
          <span className="text-xs font-semibold max-w-[80px] truncate hidden sm:inline">
            {userProfile?.name || 'Guest'}
          </span>
        </button>
      </div>
    </header>
  );
}

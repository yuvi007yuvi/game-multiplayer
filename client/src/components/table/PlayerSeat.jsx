import React, { useState, useEffect } from 'react';
import { Bot, WifiOff } from 'lucide-react';

export function PlayerSeat({
  player,
  isCurrentTurn = false,
  position = 'south', // 'south', 'north', 'west', 'east'
  isMe = false,
  turnDeadline = null,
  turnTimeoutSeconds = 15,
  activeEmote = null
}) {
  const [timeLeftMs, setTimeLeftMs] = useState(turnTimeoutSeconds * 1000);

  // Turn timer countdown tick
  useEffect(() => {
    if (!isCurrentTurn || !turnDeadline) {
      setTimeLeftMs(turnTimeoutSeconds * 1000);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, turnDeadline - Date.now());
      setTimeLeftMs(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [isCurrentTurn, turnDeadline, turnTimeoutSeconds]);

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-500 text-[10px] sm:text-xs">
        <span>Empty</span>
      </div>
    );
  }

  const { name, isBot, botDifficulty, connected, cardCount, bid, tricksWon, isDealer, matchScore } = player;
  const isSideSeat = position === 'west' || position === 'east';

  // SVG Circular timer calculation
  const totalMs = turnTimeoutSeconds * 1000;
  const fraction = Math.min(1, Math.max(0, timeLeftMs / totalMs));
  const radius = 16;
  const circumference = 2 * Math.PI * radius; // ~100.53
  const strokeDashoffset = circumference * (1 - fraction);
  const secondsLeft = Math.ceil(timeLeftMs / 1000);

  // Dynamic progress ring color based on urgency
  let ringColor = 'stroke-emerald-400';
  if (secondsLeft <= 4) {
    ringColor = 'stroke-red-500 animate-pulse';
  } else if (secondsLeft <= 8) {
    ringColor = 'stroke-amber-400';
  }

  // Emote visibility check (active for 3.5s)
  const isEmoteVisible = Boolean(
    activeEmote &&
    activeEmote.timestamp &&
    Date.now() - activeEmote.timestamp < 3500
  );

  return (
    <div className="relative flex flex-col items-center select-none transition-all duration-300">
      {/* Floating Emote / Quick Chat Reaction Bubble */}
      {isEmoteVisible && (
        <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce flex items-center gap-1 bg-slate-950/95 border border-amber-400/90 text-slate-100 px-2.5 py-0.5 rounded-full shadow-glow-gold whitespace-nowrap">
          <span className="text-sm sm:text-base leading-none">{activeEmote.emote}</span>
          {activeEmote.phrase && (
            <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-300">{activeEmote.phrase}</span>
          )}
        </div>
      )}

      {/* Player Box: vertical mini-card on mobile for West/East, horizontal for North/South and on tablet/desktop */}
      <div
        className={`relative flex ${
          isSideSeat
            ? 'flex-col sm:flex-row items-center p-1 sm:px-3 sm:py-1.5 gap-0.5 sm:gap-2 w-13 sm:w-auto'
            : 'flex-row items-center px-2 py-0.5 sm:px-3 sm:py-1.5 gap-1.5 sm:gap-2'
        } rounded-xl border backdrop-blur-md shadow-md transition-all ${
          isCurrentTurn
            ? 'border-yellow-400 bg-yellow-500/20 shadow-glow-gold scale-105 ring-1 sm:ring-2 ring-yellow-400/50'
            : isMe
              ? 'border-amber-500/70 bg-slate-900/95 ring-1 ring-amber-400/40 shadow-glow-sm'
              : 'border-slate-700/80 bg-slate-900/90'
        }`}
      >
        {/* Dealer marker */}
        {isDealer && (
          <span
            className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-black font-extrabold text-[9px] sm:text-[10px] flex items-center justify-center shadow-md border border-amber-200 z-10"
            title="Dealer"
          >
            D
          </span>
        )}

        {/* Avatar circle with Circular Countdown Timer Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          {/* Animated Countdown Ring */}
          {isCurrentTurn && (
            <svg
              className="absolute -inset-1 w-9 h-9 sm:w-10 sm:h-10 -rotate-90 pointer-events-none z-10"
              viewBox="0 0 36 36"
            >
              {/* Background faint track */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="2.5"
              />
              {/* Active countdown fill */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                className={ringColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
              />
            </svg>
          )}

          <div
            className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-inner ${
              isCurrentTurn
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-black'
                : isMe
                  ? 'bg-gradient-to-tr from-amber-600/80 to-amber-400/80 text-black border border-amber-300'
                  : 'bg-slate-800 text-slate-200 border border-slate-600'
            }`}
          >
            {isBot ? <Bot size={isSideSeat ? 14 : 16} className="sm:w-[18px] sm:h-[18px]" /> : (isMe ? '👤' : '👥')}

            {/* Connection status */}
            {!connected && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-red-600 rounded-full p-0.5" title="Disconnected (Bot substitute active)">
                <WifiOff size={8} className="text-white" />
              </span>
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className={`flex flex-col min-w-0 ${isSideSeat ? 'items-center sm:items-start text-center sm:text-left' : ''}`}>
          <div className="flex items-center justify-center sm:justify-start gap-1">
            <span className={`text-[10px] sm:text-xs font-bold text-slate-100 truncate ${isSideSeat ? 'max-w-[46px] sm:max-w-[110px]' : 'max-w-[70px] sm:max-w-[110px]'}`}>
              {name}
            </span>
            {isMe && (
              <span className="text-[8px] sm:text-[9px] bg-amber-400 text-black font-extrabold px-1 rounded uppercase tracking-wider">
                YOU
              </span>
            )}
            {isBot && botDifficulty && (
              <span className="hidden sm:inline text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-1 rounded uppercase font-bold tracking-wider">
                {botDifficulty[0]}
              </span>
            )}
          </div>

          {/* Bid & Tricks Stats */}
          <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[11px] text-slate-300 leading-tight">
            {bid !== null && bid !== undefined ? (
              <span className="font-mono">
                <span className="text-slate-400 sm:hidden">B:</span>
                <span className="hidden sm:inline text-slate-400">Bid: </span>
                <span className="text-amber-400 font-bold">{bid}</span>
                <span className="text-slate-500 mx-0.5">|</span>
                <span className="text-slate-400 sm:hidden">W:</span>
                <span className="hidden sm:inline text-slate-400">Won: </span>
                <span className="text-emerald-400 font-bold">{tricksWon || 0}</span>
              </span>
            ) : (
              <span className="text-slate-400 italic text-[8px] sm:text-[10px]">Calling...</span>
            )}
          </div>
        </div>

        {/* Match points: compact pill for side seat on mobile, column on sm+ */}
        {isSideSeat ? (
          <>
            <span className="text-[8px] font-bold text-amber-400 font-mono sm:hidden">
              {matchScore > 0 ? `+${matchScore}` : matchScore}p
            </span>
            <div className="hidden sm:block ml-1 pl-2 border-l border-slate-700/80 text-right">
              <span className="text-[9px] text-slate-400 block leading-tight uppercase font-semibold">Pts</span>
              <span className="text-xs font-bold text-amber-400 font-mono leading-tight">
                {matchScore > 0 ? `+${matchScore}` : matchScore}
              </span>
            </div>
          </>
        ) : (
          <div className="ml-1 pl-1.5 sm:pl-2 border-l border-slate-700/80 text-right">
            <span className="text-[8px] sm:text-[9px] text-slate-400 block leading-tight uppercase font-semibold">Pts</span>
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 font-mono leading-tight">
              {matchScore > 0 ? `+${matchScore}` : matchScore}
            </span>
          </div>
        )}
      </div>

      {/* Opponent Card Count Badge */}
      {!isMe && cardCount !== undefined && (
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/90 border border-slate-700/70 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono text-slate-300 shadow-sm mt-0.5 sm:mt-1">
          <span className="text-amber-400 font-serif">🂠</span>
          <span className="font-bold">{cardCount}</span>
          <span className="hidden sm:inline text-[9px] text-slate-400">cards</span>
        </div>
      )}
    </div>
  );
}

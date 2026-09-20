import React from 'react';
import { Trophy, Coins, RotateCcw, Home } from 'lucide-react';

export function MatchResultModal({
  isOpen = false,
  rankings = [],
  seats = [],
  tableStake = 100,
  onRematch,
  onLeave
}) {
  if (!isOpen || !rankings || rankings.length === 0) return null;

  const totalPrizePool = tableStake * 4;
  const prize1 = Math.round(totalPrizePool * 0.6);
  const prize2 = Math.round(totalPrizePool * 0.4);

  const getPlayerName = (playerId) => {
    const seat = seats.find(s => s && s.id === playerId);
    return seat ? seat.name : playerId;
  };

  const winner = rankings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-yellow-400/50 p-6 shadow-2xl text-center modal-enter max-h-[92dvh] overflow-y-auto">
        {/* Trophy icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-glow-gold mb-3 animate-bounce">
          <Trophy size={36} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-wide">
          Match Completed!
        </h2>
        <p className="text-sm font-semibold text-amber-400 mt-1 mb-5">
          👑 Champion: {getPlayerName(winner.playerId)} ({winner.totalScore > 0 ? `+${winner.totalScore}` : winner.totalScore} pts)
        </p>

        {/* Final Standings List */}
        <div className="space-y-2 mb-6">
          {rankings.map((entry, idx) => {
            const rank = idx + 1;
            const isWinner = rank === 1;
            const isRunnerUp = rank === 2;
            let coinsPrize = 0;
            if (isWinner) coinsPrize = prize1;
            if (isRunnerUp) coinsPrize = prize2;

            return (
              <div
                key={entry.playerId}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isWinner
                    ? 'border-yellow-400 bg-yellow-500/15'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      isWinner
                        ? 'bg-amber-400 text-black'
                        : (isRunnerUp ? 'bg-slate-300 text-black' : 'bg-slate-800 text-slate-400')
                    }`}
                  >
                    #{rank}
                  </span>
                  <span className="font-semibold text-sm text-slate-200">
                    {getPlayerName(entry.playerId)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {coinsPrize > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      <Coins size={13} />
                      +{coinsPrize}
                    </span>
                  )}
                  <span className="font-mono font-bold text-sm text-slate-100">
                    {entry.totalScore > 0 ? `+${entry.totalScore}` : entry.totalScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Virtual economy notice */}
        <p className="text-[11px] text-slate-500 mb-5 italic">
          * Virtual coins only. No real money value.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onLeave}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          >
            <Home size={16} />
            <span>Lobby</span>
          </button>
          <button
            type="button"
            onClick={onRematch}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <RotateCcw size={16} />
            <span>Rematch</span>
          </button>
        </div>
      </div>
    </div>
  );
}

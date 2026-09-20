import React from 'react';
import { Award, ArrowRight } from 'lucide-react';

export function RoundResultModal({
  isOpen = false,
  roundNumber = 1,
  totalRounds = 5,
  seats = [],
  scores = {},
  matchScores = {},
  onNextRound
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-6 shadow-2xl modal-enter max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="inline-block p-2 rounded-full bg-amber-500/10 text-amber-400 mb-2 border border-amber-500/20">
            <Award size={28} />
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-wide font-sans">
            Round {roundNumber} Completed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Round {roundNumber} of {totalRounds} • Standings
          </p>
        </div>

        {/* Results table */}
        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/60 mb-6">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Player</th>
                <th className="py-2.5 px-2 text-center">Bid</th>
                <th className="py-2.5 px-2 text-center">Won</th>
                <th className="py-2.5 px-2 text-center">Points</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {seats.map((player) => {
                const playerData = scores[player.id] || { bid: player.bid, tricksWon: player.tricksWon, roundScore: player.roundScore };
                const isMade = playerData.tricksWon >= playerData.bid;
                const totalScore = matchScores[player.id] !== undefined ? matchScores[player.id] : player.matchScore;

                return (
                  <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200 truncate max-w-[110px]">
                      {player.name}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-300">
                      {playerData.bid}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-100">
                      {playerData.tricksWon}
                    </td>
                    <td className={`py-2.5 px-2 text-center font-bold ${isMade ? 'text-emerald-400' : 'text-red-400'}`}>
                      {playerData.roundScore > 0 ? `+${playerData.roundScore}` : playerData.roundScore}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                      {totalScore > 0 ? `+${totalScore}` : totalScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={onNextRound}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Start Round {Math.min(roundNumber + 1, totalRounds)}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

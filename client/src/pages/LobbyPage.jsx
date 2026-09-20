import React, { useState } from 'react';
import { Users, Copy, Check, Bot, Play, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import { BOT_DIFFICULTY } from '@shared/constants.js';

export function LobbyPage({
  lobby,
  myUserId,
  onFillBots,
  onKickBot,
  onToggleReady,
  onStartGame,
  onLeave
}) {
  const [copied, setCopied] = useState(false);
  const [selectedBotDiff, setSelectedBotDiff] = useState(BOT_DIFFICULTY.MEDIUM);

  if (!lobby) return null;

  const { code, seats, tableStake, totalRounds, hostId } = lobby;
  const isHost = hostId === myUserId;
  const mySeat = seats.find(s => s && s.id === myUserId);
  const isReady = mySeat ? mySeat.ready : false;

  const occupiedSeatsCount = seats.filter(Boolean).length;
  const allReady = seats.every(s => s && (s.isBot || s.ready));
  const canStart = occupiedSeatsCount === 4 && allReady;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 select-none animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Exit Table</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Stake:</span>
          <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            {tableStake} Coins
          </span>
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            {totalRounds} Rounds
          </span>
        </div>
      </div>

      {/* Room Code Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 p-5 shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
            Invite Code
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-100 font-mono tracking-widest mt-0.5">
            {code}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Share this 6-letter code with friends to join your table.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* 4 Seat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[0, 1, 2, 3].map((seatIdx) => {
          const seat = seats[seatIdx];
          const isMe = seat && seat.id === myUserId;

          if (!seat) {
            return (
              <div
                key={seatIdx}
                className="h-28 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center p-4 text-slate-500"
              >
                <Users size={24} className="opacity-40 mb-1" />
                <span className="text-xs font-medium">Seat {seatIdx + 1}: Waiting for player...</span>
              </div>
            );
          }

          return (
            <div
              key={seatIdx}
              className={`relative h-28 rounded-2xl border p-4 flex items-center justify-between shadow-md transition-all ${
                seat.ready
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner ${
                  seat.isBot ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                  {seat.isBot ? <Bot size={24} /> : (isMe ? '👤' : '👥')}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-100 truncate max-w-[130px]">
                      {seat.name}
                    </span>
                    {seat.isHost && (
                      <span className="text-[10px] bg-amber-400 text-black px-1.5 rounded font-black uppercase tracking-wider">
                        Host
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {seat.isBot ? (
                      <span className="text-xs text-indigo-400 font-medium">
                        Bot ({seat.botDifficulty})
                      </span>
                    ) : (
                      <span className={`text-xs font-medium flex items-center gap-1 ${seat.ready ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {seat.ready ? '✓ Ready' : '⏳ Not Ready'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Host kick bot button */}
              {isHost && seat.isBot && (
                <button
                  type="button"
                  onClick={() => onKickBot(seatIdx)}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Host Bot Controls */}
      {isHost && occupiedSeatsCount < 4 && (
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-indigo-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">Fill Missing Seats with Bots</span>
              <span className="text-[11px] text-slate-400">Choose bot tactical intelligence profile</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-700">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedBotDiff(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                    selectedBotDiff === diff
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onFillBots(selectedBotDiff)}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              Fill Bots
            </button>
          </div>
        </div>
      )}

      {/* Ready / Start Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isHost && (
          <button
            type="button"
            onClick={onToggleReady}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg ${
              isReady
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isReady ? 'Cancel Ready' : 'I am Ready'}
          </button>
        )}

        {isHost && (
          <button
            type="button"
            disabled={!canStart}
            onClick={onStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:hover:from-amber-500 text-slate-950 font-black text-base uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Play size={20} fill="currentColor" />
            <span>{canStart ? 'Deal & Start Game' : 'Waiting for 4 Ready Players'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

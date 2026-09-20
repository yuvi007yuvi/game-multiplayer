import React, { useState, useEffect } from 'react';
import { Play, PlusCircle, LogIn, Trophy, Sparkles, Coins, Users, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../services/soundEngine.js';

export function HomePage({
  userProfile,
  onQuickPlay,
  onCreateRoom,
  onJoinRoom,
  onClaimBonus
}) {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [createStake, setCreateStake] = useState(100);
  const [createRounds, setCreateRounds] = useState(5);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setLeaderboard(data.leaderboard || []);
      })
      .catch(() => {});
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      soundEngine.playClick();
      onJoinRoom(roomCodeInput.trim().toUpperCase());
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    soundEngine.playClick();
    onCreateRoom({
      isPrivate: true,
      tableStake: createStake,
      totalRounds: createRounds
    });
    setShowCreateModal(false);
  };

  const userCoins = userProfile?.coins ?? 1000;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 select-none animate-fade-in">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-felt-dark via-felt to-felt-dark border border-felt-border p-6 sm:p-8 shadow-table mb-8 text-center sm:text-left">
        {/* Subtle decorative cards in background */}
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none hidden sm:block">
          <span className="text-[180px] font-serif text-gold-metallic leading-none">♠</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
            <Sparkles size={14} />
            <span>Classic 4-Player Call Break</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Step Up to the <span className="text-amber-400">Arena</span>.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 mb-6">
            Spades are permanent trump. Declare your call, out-trick your opponents, and conquer the table against live players or tactical AI bots.
          </p>

          {/* Quick Play CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onQuickPlay();
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 transform active:scale-95 transition-all"
            >
              <Play size={18} fill="currentColor" />
              <span>Quick Play Now</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowCreateModal(true);
              }}
              className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-2 active:scale-95 transition-all"
            >
              <PlusCircle size={18} className="text-amber-400" />
              <span>Create Private Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Join Room & Daily Bonus & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Join Private Room Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-bold text-base mb-1">
              <LogIn size={18} className="text-amber-400" />
              <span>Join with Room Code</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Got an invite code from a friend? Enter it below to take a seat.
            </p>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                maxLength={8}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. A4K9B2"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 font-mono text-center text-sm font-bold tracking-widest uppercase outline-none"
              />
              <button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-extrabold text-sm transition-all"
              >
                Join
              </button>
            </form>
          </div>

          {/* Daily reload bonus promo */}
          <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-300 block">Daily Free Coins</span>
                <span className="text-[11px] text-slate-400">Claim 500 virtual coins</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClaimBonus}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase transition-colors"
            >
              Claim
            </button>
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-base">
              <Trophy size={18} className="text-amber-400" />
              <span>Top Players</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Virtual Rankings</span>
          </div>

          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6">
                Play games to climb the leaderboard!
              </div>
            ) : (
              leaderboard.slice(0, 4).map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      idx === 0 ? 'bg-amber-400 text-black' : (idx === 1 ? 'bg-slate-300 text-black' : 'bg-slate-800 text-slate-400')
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-200 truncate max-w-[120px]">
                      {player.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
                    <Coins size={12} className="text-amber-400" />
                    <span>{player.coins.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trust & Non-Gambling Compliance Notice */}
      <div className="rounded-2xl bg-slate-950/50 border border-slate-800/60 p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheck size={16} className="text-slate-400 shrink-0" />
        <span>
          <strong>Zero Real Money Gambling:</strong> Coins are purely for game progression and gameplay with zero cash value. No deposits or cash withdrawals.
        </span>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-1">Create Private Table</h3>
            <p className="text-xs text-slate-400 mb-5">Configure table stakes and rounds for your private match.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Table Stake Options */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Table Stake (Virtual Coins)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 250, 500].map((stake) => (
                    <button
                      key={stake}
                      type="button"
                      onClick={() => setCreateStake(stake)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                        createStake === stake
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-glow-gold'
                          : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {stake}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounds count */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Match Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { rounds: 1, label: '1 Round' },
                    { rounds: 3, label: '3 Rounds' },
                    { rounds: 5, label: '5 Rounds (Standard)' }
                  ].map(({ rounds, label }) => (
                    <button
                      key={rounds}
                      type="button"
                      onClick={() => setCreateRounds(rounds)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        createRounds === rounds
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-glow-gold'
                          : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-md"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

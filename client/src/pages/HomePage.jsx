import React, { useState, useEffect } from 'react';
import {
  Play,
  PlusCircle,
  LogIn,
  Trophy,
  Sparkles,
  Coins,
  ShieldCheck,
  Clock,
  Zap,
  Crown,
  Flame,
  ArrowRight,
  Medal,
  Users
} from 'lucide-react';
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

  // Daily bonus 24-hour cooldown calculation
  const lastClaim = userProfile?.lastBonusClaim ? new Date(userProfile.lastBonusClaim).getTime() : 0;
  const cooldownMs = 24 * 60 * 60 * 1000;
  const timeSinceClaim = Date.now() - lastClaim;
  const isBonusAvailable = !lastClaim || timeSinceClaim >= cooldownMs;

  const getRemainingTimeStr = () => {
    if (isBonusAvailable) return null;
    const remaining = cooldownMs - timeSinceClaim;
    const h = Math.floor(remaining / (1000 * 60 * 60));
    const m = Math.ceil((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

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

  const handleChampionshipPlay = () => {
    soundEngine.playClick();
    onCreateRoom({
      isPrivate: false,
      tableStake: 250,
      totalRounds: 5
    });
  };

  const userCoins = userProfile?.coins ?? 1000;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-5 select-none animate-fade-in space-y-6">
      {/* 1. Top Player Bar & Arena Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-300/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
            {userProfile?.avatar || '🐅'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-100 tracking-wide">
                {userProfile?.name || 'Player'}
              </span>
              <span className="px-2 py-0.2 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                Rank: Contender
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs font-bold text-amber-300">
              <Coins size={13} className="text-amber-400" />
              <span>{userCoins.toLocaleString()} Chips</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-slate-300">Arena Online:</span>
          <span>Instant 4-Player Tables</span>
        </div>
      </div>

      {/* 2. Hero Game Mode Selection (Section 1) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-amber-400" />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-200">
              Select Game Mode
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Spades are Trump</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode Card 1: Quick Blitz (Primary) */}
          <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-felt-dark via-felt to-felt-dark border-2 border-amber-400/60 p-5 shadow-table flex flex-col justify-between hover:border-amber-300 transition-all duration-200 hover:-translate-y-0.5">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
              Fast Play
            </div>

            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3.5">
                <Zap size={22} className="fill-current" />
              </div>
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                Quick Blitz
              </h3>
              <p className="text-xs text-slate-300 mt-1 mb-4 leading-relaxed">
                1 fast-paced round. Jump into an instant seat with live players and adaptive AI bots.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-amber-300 font-mono mb-3 bg-black/30 px-3 py-1.5 rounded-xl border border-amber-400/20">
                <span>Entry Stake:</span>
                <span className="font-bold">100 Chips</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onQuickPlay();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Play size={15} fill="currentColor" />
                <span>Play Blitz Now</span>
              </button>
            </div>
          </div>

          {/* Mode Card 2: Championship (5 Rounds) */}
          <div className="relative group overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-xl flex flex-col justify-between hover:border-amber-400/50 transition-all duration-200 hover:-translate-y-0.5">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase tracking-wider">
              Classic Match
            </div>

            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-3.5">
                <Crown size={22} />
              </div>
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                Championship
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                Standard 5-round competitive match. Track aggregate trick scores across rounds.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-purple-300 font-mono mb-3 bg-black/30 px-3 py-1.5 rounded-xl border border-purple-500/20">
                <span>Entry Stake:</span>
                <span className="font-bold">250 Chips</span>
              </div>
              <button
                type="button"
                onClick={handleChampionshipPlay}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 hover:border-amber-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Start Championship</span>
              </button>
            </div>
          </div>

          {/* Mode Card 3: Private Club */}
          <div className="relative group overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-xl flex flex-col justify-between hover:border-amber-400/50 transition-all duration-200 hover:-translate-y-0.5">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase tracking-wider">
              With Friends
            </div>

            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-3.5">
                <PlusCircle size={22} />
              </div>
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                Private Table
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                Host a private room with custom rounds (1 to 5) and custom chip stakes for your group.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-emerald-300 font-mono mb-3 bg-black/30 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <span>Stakes:</span>
                <span className="font-bold">Custom (50 - 500)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowCreateModal(true);
                }}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 hover:border-amber-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Host Custom Room</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section 2: Join Room & Daily Vault */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Join Private Room Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-black text-sm uppercase tracking-wider mb-1">
              <LogIn size={18} className="text-amber-400" />
              <span>Join with Room Code</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter a 6-character room code from a friend or host to take a seat.
            </p>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                maxLength={8}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="E.G. A4K9B2"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-slate-100 font-mono text-center text-base font-black tracking-widest uppercase outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                Join
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Don't have a code?</span>
            <button
              type="button"
              onClick={onQuickPlay}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <span>Instant Match</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Daily Bonus Vault Card */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/20 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-200 font-black text-sm uppercase tracking-wider">
                <Coins size={18} className="text-amber-400" />
                <span>Daily Rewards Vault</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-black uppercase">
                +500 Chips
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Reload your virtual coin balance every 24 hours to stay at the tables.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-300 uppercase block">
                  Daily Free Chips
                </span>
                <span className="text-[11px] text-slate-400">
                  {isBonusAvailable ? 'Ready to claim right now!' : `Next reward in ${getRemainingTimeStr()}`}
                </span>
              </div>

              {isBonusAvailable ? (
                <button
                  type="button"
                  onClick={onClaimBonus}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all animate-pulse"
                >
                  Claim +500
                </button>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-semibold border border-slate-800">
                  <Clock size={13} className="text-amber-400/80" />
                  <span>{getRemainingTimeStr()}</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Sparkles size={13} className="text-amber-400/70 shrink-0" />
            <span>Bonus resets automatically every 24 hours</span>
          </div>
        </div>
      </div>

      {/* 4. Section 3: Arena Leaderboard Podium */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-200 font-black text-base uppercase tracking-wider">
            <Trophy size={19} className="text-amber-400" />
            <span>Arena Hall of Fame</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Top Chip Holders</span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-8">
            Play games to climb the leaderboard!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {leaderboard.slice(0, 4).map((player, idx) => {
              const podiumColors = [
                'border-amber-400/70 bg-gradient-to-b from-amber-500/10 to-transparent',
                'border-slate-300/60 bg-gradient-to-b from-slate-300/10 to-transparent',
                'border-amber-600/50 bg-gradient-to-b from-amber-600/10 to-transparent',
                'border-slate-800 bg-slate-950/60'
              ];
              const crowns = ['🥇', '🥈', '🥉', '4th'];

              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-2xl border ${podiumColors[idx] || podiumColors[3]} flex flex-col justify-between relative`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg leading-none">{crowns[idx]}</span>
                    <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-100 truncate mb-1">
                    {player.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300">
                    <Coins size={12} className="text-amber-400" />
                    <span>{player.coins.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Section 4: Fair Play & Compliance Footer */}
      <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span><strong>100% Free Virtual Chips:</strong> Zero real money deposits or cashouts.</span>
        </div>
        <span className="hidden sm:inline text-slate-700">•</span>
        <span>Cryptographically verified Fisher-Yates shuffle engine.</span>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-6 shadow-2xl modal-enter">
            <h3 className="text-xl font-bold text-slate-100 mb-1">Create Private Table</h3>
            <p className="text-xs text-slate-400 mb-5">Configure table stakes and rounds for your private match.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Table Stake (Virtual Chips)
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

import React, { useState } from 'react';
import { X, User, Coins, History, Check } from 'lucide-react';
import { AVATARS } from '../../services/storage.js';

export function ProfileModal({
  isOpen = false,
  userProfile,
  onUpdateProfile,
  onClose
}) {
  const [name, setName] = useState(userProfile?.name || 'Player');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatar || '🐅');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'transactions'

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateProfile(name.trim(), selectedAvatar);
      onClose();
    }
  };

  const transactions = userProfile?.transactions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Player Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'transactions'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Coin Ledger ({transactions.length})
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Choose Avatar
              </label>
              <div className="flex gap-2 justify-center">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.icon)}
                    className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedAvatar === av.icon
                        ? 'bg-amber-400/20 border-2 border-amber-400 scale-110 shadow-glow-gold'
                        : 'bg-slate-800/80 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {av.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                maxLength={18}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 text-sm font-semibold outline-none"
              />
            </div>

            {/* Coin balance summary */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20">
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <Coins size={16} className="text-amber-400" />
                <span>Virtual Coin Wallet</span>
              </div>
              <span className="font-mono font-extrabold text-amber-300 text-sm">
                {(userProfile?.coins || 1000).toLocaleString()} Coins
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
            >
              Save Profile
            </button>
          </form>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No transaction history yet.</p>
            ) : (
              transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block text-[11px]">{tx.description}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? `+${tx.amount}` : tx.amount}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        Bal: {tx.balanceAfter}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

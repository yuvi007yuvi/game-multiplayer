import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const TIPS = [
  '♠ Spades are permanent trump cards in Call Break',
  'You MUST follow the led suit if you hold that suit in hand',
  'Void of the led suit? You are required to trump with a Spade',
  'Swipe cards upward or tap them directly to play onto the table',
  'Hit your exact bid to score points without penalties'
];

export function LoadingScreen({ onFinish, minDurationMs = 1200 }) {
  const [progress, setProgress] = useState(15);
  const [tipIndex, setTipIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Progress bar milestones
    const t1 = setTimeout(() => setProgress(45), 250);
    const t2 = setTimeout(() => setProgress(80), 650);
    const t3 = setTimeout(() => setProgress(100), minDurationMs - 200);

    // Tip cycler
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 2800);

    // Fade out and finish
    const exitTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);
    }, minDurationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(exitTimer);
      clearInterval(tipInterval);
    };
  }, [minDurationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#080c10] text-slate-100 select-none transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.09)_0%,_rgba(16,185,129,0.04)_40%,_transparent_70%)] pointer-events-none" />

      {/* Top spacer */}
      <div className="w-full flex justify-between items-center z-10 max-w-md opacity-60">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
          Arena Engine v1.0
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
          Official Rules
        </span>
      </div>

      {/* Center Hero Emblem */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10">
        {/* Glowing Rings behind Spade */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-32 h-32 rounded-full border border-amber-400/20 animate-ping opacity-30" />
          <div className="absolute w-28 h-28 rounded-full border border-amber-400/30 animate-spin opacity-40 [animation-duration:8s]" />
          
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-[2px] shadow-glow-gold">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-yellow-500 select-none font-serif leading-none filter drop-shadow">
                ♠
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-100 mb-1 flex items-center gap-1.5">
          Call Break <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">Arena</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
          4-Player Real-Time Multiplayer
        </p>

        {/* Progress Bar Container */}
        <div className="w-64 sm:w-72 mt-8">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>{progress < 100 ? 'Connecting to Arena...' : 'Ready to Deal'}</span>
            <span className="text-amber-400 font-mono">{progress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Pro Tip Box */}
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 flex items-center gap-2.5 backdrop-blur-md z-10">
        <Sparkles size={16} className="text-amber-400 shrink-0 animate-pulse" />
        <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
          {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
}

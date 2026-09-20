import React, { useState, useEffect, useRef } from 'react';
import { PlayingCard } from '../cards/PlayingCard.jsx';
import { soundEngine } from '../../services/soundEngine.js';

export function TrickCenter({
  currentTrick = [],
  lastTrick = null,
  seats = [],
  mySeatIndex = 0
}) {
  // Relative position to current player:
  // 0: South (Me), 1: West (Left), 2: North (Across), 3: East (Right)
  const getRelativePosition = (seatIndex) => {
    const diff = (seatIndex - mySeatIndex + 4) % 4;
    if (diff === 0) return 'bottom';
    if (diff === 1) return 'left';
    if (diff === 2) return 'top';
    return 'right';
  };

  // State to manage trick cards, winner reveal, stacking, and flying
  const [displayCards, setDisplayCards] = useState([]);
  // 'idle' | 'playing' | 'revealing' | 'stacking' | 'sweeping' | 'cleared'
  const [animPhase, setAnimPhase] = useState('idle');
  const [sweepDirection, setSweepDirection] = useState(null); // 'top' | 'bottom' | 'left' | 'right'
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Track the trick number that was already swept to prevent re-showing stale tricks
  const lastSweptTrickNumRef = useRef(null);
  const timeoutRefs = useRef([]);
  const prevTrickLenRef = useRef(0);

  // Trigger sound effect whenever ANY player plays a card
  useEffect(() => {
    if (currentTrick && currentTrick.length > prevTrickLenRef.current) {
      soundEngine.playCardPlay();
    }
    prevTrickLenRef.current = currentTrick ? currentTrick.length : 0;
  }, [currentTrick]);

  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];
  };

  useEffect(() => {
    // Case 1: Active trick in progress (1, 2, or 3 cards played)
    if (currentTrick && currentTrick.length > 0) {
      clearAllTimeouts();
      setDisplayCards(currentTrick);
      setAnimPhase('playing');
      setSweepDirection(null);
      setWinnerInfo(null);
      return;
    }

    // Case 2: Trick just finished (currentTrick is empty, lastTrick has 4 cards)
    if (lastTrick && lastTrick.trickCards && lastTrick.trickCards.length === 4) {
      // If already swept, do not repeat
      if (lastSweptTrickNumRef.current === lastTrick.trickNumber) {
        if (animPhase !== 'revealing' && animPhase !== 'stacking' && animPhase !== 'sweeping') {
          setDisplayCards([]);
          setAnimPhase('cleared');
          setWinnerInfo(null);
        }
        return;
      }

      // Mark this trick number as processed
      lastSweptTrickNumRef.current = lastTrick.trickNumber;
      clearAllTimeouts();

      const winPos = getRelativePosition(lastTrick.winningSeatIndex);
      const winnerPlayer = seats[lastTrick.winningSeatIndex];

      // Stage 1: Winner Celebration & Reveal (0ms - 550ms)
      // Cards stay in their 4 separated quadrants so everyone sees who played what
      setDisplayCards(lastTrick.trickCards);
      setAnimPhase('revealing');
      setWinnerInfo({
        name: winnerPlayer ? winnerPlayer.name : `Seat ${lastTrick.winningSeatIndex + 1}`,
        seatIndex: lastTrick.winningSeatIndex,
        playerId: lastTrick.winnerPlayerId,
        relativePos: winPos
      });
      setSweepDirection(winPos);

      // Stage 2: STACK THEM IN THE CENTER (550ms - 950ms)
      // All 4 cards gather/collapse into a neat stacked pile in the center
      const stackTimer = setTimeout(() => {
        setAnimPhase('stacking');
      }, 550);
      timeoutRefs.current.push(stackTimer);

      // Stage 3: SWEEP THE STACK TO WINNING PLAYER (950ms - 1450ms)
      // The gathered stack flies together as one to the winning player's seat
      const sweepTimer = setTimeout(() => {
        setAnimPhase('sweeping');
      }, 950);
      timeoutRefs.current.push(sweepTimer);

      // Stage 4: CLEAR TABLE CENTER (1450ms+)
      // Cards are collected, trick arena resets to clean empty state
      const clearTimer = setTimeout(() => {
        setDisplayCards([]);
        setAnimPhase('cleared');
        setWinnerInfo(null);
        setSweepDirection(null);
      }, 1450);
      timeoutRefs.current.push(clearTimer);

      return;
    }

    // Case 3: Initial or idle state
    if (animPhase !== 'revealing' && animPhase !== 'stacking' && animPhase !== 'sweeping') {
      setDisplayCards([]);
      setAnimPhase('idle');
      setWinnerInfo(null);
    }
  }, [currentTrick, lastTrick, mySeatIndex, seats]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  /**
   * Calculates the exact transform for each card depending on animation phase:
   * 1. 'playing' / 'revealing': 4 separated non-overlapping quadrants
   * 2. 'stacking': all cards converge into center stack with realistic card tilt
   * 3. 'sweeping': entire stack flies to the winning player's seat
   */
  const getCardTransformStyle = (relativePos, idx, isWinner) => {
    // Stage 3: Flying towards the winning player's seat side
    if (animPhase === 'sweeping') {
      const sweepVectors = {
        bottom: 'translate(-50%, calc(-50% + 180px)) scale(0.2) rotate(10deg)',
        top: 'translate(-50%, calc(-50% - 180px)) scale(0.2) rotate(-10deg)',
        left: 'translate(calc(-50% - 180px), -50%) scale(0.2) rotate(-12deg)',
        right: 'translate(calc(-50% + 180px), -50%) scale(0.2) rotate(12deg)'
      };
      return {
        transform: sweepVectors[sweepDirection] || sweepVectors.bottom,
        opacity: 0,
        transition: 'transform 0.5s cubic-bezier(0.35, 0, 0.25, 1), opacity 0.42s ease-in',
        zIndex: isWinner ? 40 : idx + 20
      };
    }

    // Stage 2: STACKING cards into the center on top of each other
    if (animPhase === 'stacking') {
      const cardTilts = [-4, 3, -2, 5];
      const tilt = cardTilts[idx % cardTilts.length];
      const xNudge = (idx - 1.5) * 2;
      const yNudge = (idx % 2 === 0 ? -1 : 1) * 1.5;

      return {
        transform: `translate(calc(-50% + ${xNudge}px), calc(-50% + ${yNudge}px)) scale(0.95) rotate(${tilt}deg)`,
        opacity: 1,
        transition: 'transform 0.38s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease-out',
        zIndex: isWinner ? 35 : idx + 15
      };
    }

    // Stage 1 & Normal Play: Separated 4-quadrant layout with responsive CSS variable clearance
    const quadrantTransforms = {
      top: 'translate(-50%, calc(-50% - var(--trick-y, 28px))) scale(1) rotate(0deg)',
      bottom: 'translate(-50%, calc(-50% + var(--trick-y, 28px))) scale(1) rotate(0deg)',
      left: 'translate(calc(-50% - var(--trick-x, 44px)), -50%) scale(1) rotate(0deg)',
      right: 'translate(calc(-50% + var(--trick-x, 44px)), -50%) scale(1) rotate(0deg)'
    };

    return {
      transform: quadrantTransforms[relativePos] || quadrantTransforms.bottom,
      opacity: 1,
      transition: 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.1), opacity 0.2s ease-out',
      zIndex: isWinner ? 30 : idx + 10
    };
  };

  return (
    <div className="relative w-40 h-32 sm:w-60 sm:h-46 md:w-72 md:h-52 rounded-full sm:rounded-[42px] border-2 border-emerald-600/50 bg-radial from-felt-light/60 via-felt-dark/90 to-felt-dark flex items-center justify-center shadow-[inset_0_0_28px_rgba(0,0,0,0.75)] select-none [--trick-x:44px] [--trick-y:28px] sm:[--trick-x:68px] sm:[--trick-y:44px]">
      {/* Center Trump Watermark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-25 pointer-events-none select-none">
        <span className="text-2xl sm:text-5xl text-gold-metallic font-serif">♠</span>
        <span className="text-[8px] sm:text-[10px] tracking-widest uppercase font-black text-amber-300 mt-0.5">Trick Arena</span>
      </div>

      {/* Empty trick state */}
      {displayCards.length === 0 && (
        <div className="text-emerald-300/60 text-[11px] sm:text-sm text-center font-medium px-2 select-none animate-fade-in">
          Waiting for lead card...
        </div>
      )}

      {/* Winner Celebration Center Floating Pill */}
      {winnerInfo && (animPhase === 'revealing' || animPhase === 'stacking') && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-300">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-[9px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-glow-gold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 whitespace-nowrap animate-bounce">
            <span>👑</span>
            <span>{winnerInfo.name} Won!</span>
          </div>
        </div>
      )}

      {/* Played Cards: Centered anchoring with stacking & sweep transitions */}
      {displayCards.map((play, idx) => {
        const relativePos = getRelativePosition(play.seatIndex);
        const player = seats[play.seatIndex];
        const isWinner = winnerInfo && winnerInfo.seatIndex === play.seatIndex;
        const cardStyle = getCardTransformStyle(relativePos, idx, isWinner);

        const isTagVisible = animPhase === 'playing' || animPhase === 'revealing';
        const isTopCard = relativePos === 'top';
        const throwAnimClass = animPhase === 'playing' ? `throw-${relativePos}` : '';

        return (
          <div
            key={`${play.playerId}_${play.card?.id || idx}`}
            style={cardStyle}
            className="absolute left-1/2 top-1/2 flex flex-col items-center pointer-events-none will-change-transform"
          >
            {/* Top label if card is North */}
            {isTopCard && (
              <span className={`text-[7px] sm:text-[10px] font-bold text-slate-100 bg-slate-950/95 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full mb-0.5 sm:mb-1 border ${isWinner ? 'border-amber-400 text-amber-300' : 'border-slate-700/80'} shadow-md whitespace-nowrap transition-opacity duration-200 ${isTagVisible ? 'opacity-100' : 'opacity-0'}`}>
                {player ? player.name : `Seat ${play.seatIndex + 1}`}
                {isWinner && ' 👑'}
              </span>
            )}

            {/* Card element with directional throw on play and winner celebration */}
            <div className={`${throwAnimClass} ${isWinner && animPhase === 'revealing' ? 'winner-card-anim ring-2 ring-yellow-300 rounded-md sm:rounded-xl shadow-glow-gold' : ''}`}>
              <PlayingCard
                card={play.card}
                size="trick"
                isPlayable={false}
                isWinner={isWinner}
              />
            </div>

            {/* Bottom label if card is South, West, or East */}
            {!isTopCard && (
              <span className={`text-[7px] sm:text-[10px] font-bold text-slate-100 bg-slate-950/95 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full mt-0.5 sm:mt-1 border ${isWinner ? 'border-amber-400 text-amber-300' : 'border-slate-700/80'} shadow-md whitespace-nowrap transition-opacity duration-200 ${isTagVisible ? 'opacity-100' : 'opacity-0'}`}>
                {player ? player.name : `Seat ${play.seatIndex + 1}`}
                {isWinner && ' 👑'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

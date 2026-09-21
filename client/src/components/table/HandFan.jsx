import React, { useState, useEffect, useRef } from 'react';
import { PlayingCard } from '../cards/PlayingCard.jsx';
import { preloadHandCards } from '../../utils/cardPreloader.js';
import { haptics } from '../../services/haptics.js';

const PLAY_DRAG_THRESHOLD = -50; // px dragged upward to trigger play

export function HandFan({
  cards = [],
  legalMoves = [],
  isMyTurn = false,
  phase = '',
  onPlayCard
}) {
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [submittingCardId, setSubmittingCardId] = useState(null);
  const [dragState, setDragState] = useState(null);

  const canPlayCards = isMyTurn && phase === 'PLAYING';
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    pointerId: null,
    card: null,
    isPlayable: false,
    moved: false,
    hasNotched: false
  });

  // Preload only the SVG assets needed for the current hand into browser cache
  useEffect(() => {
    if (cards && cards.length > 0) {
      preloadHandCards(cards);
    }
  }, [cards]);

  // Reset locks and drag state when turn or hand changes
  useEffect(() => {
    setSubmittingCardId(null);
    setDragState(null);
  }, [cards, isMyTurn]);

  const handlePlay = (card) => {
    if (submittingCardId) return;
    setSubmittingCardId(card.id);
    if (onPlayCard) onPlayCard(card);
  };

  // --- Pointer Event Handlers for Unified Touch & Mouse Gestures ---
  const handlePointerDown = (e, card, isPlayable) => {
    if (!isPlayable || submittingCardId) return;

    // Only respond to primary mouse button or touch
    if (e.button !== undefined && e.button !== 0) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails on certain platforms
    }

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      card,
      isPlayable,
      moved: false,
      hasNotched: false
    };

    setHoveredCardId(card.id);
  };

  const handlePointerMove = (e, card) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== e.pointerId || current.card?.id !== card.id) return;

    const deltaX = (e.clientX - current.startX) * 0.75;
    // Clamping downward drag so card doesn't slide off screen
    const rawDeltaY = e.clientY - current.startY;
    const deltaY = rawDeltaY > 15 ? 15 : rawDeltaY;

    const distance = Math.hypot(e.clientX - current.startX, rawDeltaY);
    if (distance > 7) {
      current.moved = true;
    }

    if (current.moved) {
      const isPastThreshold = deltaY <= PLAY_DRAG_THRESHOLD;

      // Haptic notch feedback when crossing play threshold for the first time
      if (isPastThreshold && !current.hasNotched) {
        current.hasNotched = true;
        haptics.vibrate(12);
      } else if (!isPastThreshold && current.hasNotched) {
        current.hasNotched = false;
      }

      setDragState({
        cardId: card.id,
        x: deltaX,
        y: deltaY,
        isPastThreshold
      });
    }
  };

  const handlePointerUp = (e, card, isPlayable) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== e.pointerId) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Safe fallback
    }

    const moved = current.moved;
    const isPastThreshold = dragState?.isPastThreshold;

    dragRef.current = {
      startX: 0,
      startY: 0,
      pointerId: null,
      card: null,
      isPlayable: false,
      moved: false,
      hasNotched: false
    };

    setDragState(null);

    if (isPlayable && isPastThreshold) {
      // Played via upward swipe/drag!
      handlePlay(card);
    } else if (isPlayable && !moved) {
      // Played via instant tap/click!
      handlePlay(card);
    }
  };

  const handlePointerCancel = (e) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Safe fallback
    }
    dragRef.current = {
      startX: 0,
      startY: 0,
      pointerId: null,
      card: null,
      isPlayable: false,
      moved: false,
      hasNotched: false
    };
    setDragState(null);
  };

  // Dynamic responsive spacing based on card count
  // Keeps all 13 cards cleanly visible on 360px-390px mobile screens without clipping!
  const getOverlapClass = (count) => {
    if (count <= 4) return 'space-x-1 sm:space-x-2 md:space-x-3 landscape:space-x-2';
    if (count <= 7) return '-space-x-3 sm:-space-x-4 md:-space-x-5 landscape:-space-x-1';
    if (count <= 10) return '-space-x-5 sm:-space-x-6 md:-space-x-8 landscape:-space-x-3';
    return '-space-x-6 sm:-space-x-7 md:-space-x-9 landscape:-space-x-5'; // 11-13 cards
  };

  const overlapClass = getOverlapClass(cards.length);

  return (
    <div className="relative w-full flex flex-col items-center select-none pt-0.5 pb-0.5 sm:pb-1 landscape:pt-0 landscape:pb-0">
      {/* Floating Swipe Play Drop Zone Indicator */}
      {dragState && (
        <div
          className={`absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-150 z-50 pointer-events-none drop-target-anim ${
            dragState.isPastThreshold
              ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-glow-gold scale-105 ring-2 ring-yellow-200'
              : 'bg-slate-900/95 text-amber-300 border border-amber-400/50 backdrop-blur-md'
          }`}
        >
          <span className="text-sm leading-none">▲</span>
          <span>{dragState.isPastThreshold ? 'Release to Play!' : 'Swipe up to play'}</span>
        </div>
      )}

      {/* Hand status header — hidden in landscape to save vertical space */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 z-10 landscape:hidden">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
          Your Cards ({cards.length})
        </span>
        {canPlayCards && !dragState && (
          <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-black px-2 sm:px-3 py-0.2 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md animate-bounce">
            Tap or swipe up to play
          </span>
        )}
      </div>

      {/* Cards container: clean horizontal fan with hover elevation and drag physics */}
      <div className="relative flex justify-center items-end max-w-full px-1 sm:px-6 overflow-x-auto pt-1 landscape:pt-0 sm:pt-4 pb-0.5 sm:pb-1 scrollbar-none">
        <div className={`flex items-end ${overlapClass} px-2 sm:px-8 py-1 sm:py-2`}>
          {cards.map((card, idx) => {
            const isLegal = legalMoves.includes(card.id);
            const isPlayable = canPlayCards && isLegal && !submittingCardId;
            const isDimmed = canPlayCards && (!isLegal || Boolean(submittingCardId));
            const isHovered = hoveredCardId === card.id;
            const isDragging = dragState?.cardId === card.id;

            // Subtle, gentle fan curve angle
            const total = cards.length;
            const normalizedIndex = idx - (total - 1) / 2;
            const rotationDeg = total > 1 ? normalizedIndex * 1.4 : 0;
            const offsetY = Math.abs(normalizedIndex) * 1.2;

            // Dynamic style during drag vs fan rest position
            const cardTransform = isDragging
              ? `translate3d(${dragState.x}px, ${dragState.y}px, 0) scale(${dragState.isPastThreshold ? 1.15 : 1.08}) rotate(${rotationDeg + dragState.x * 0.08}deg)`
              : isHovered
              ? `translateY(-14px) scale(1.08)`
              : `rotate(${rotationDeg}deg) translateY(${offsetY}px)`;

            const cardZIndex = isDragging ? 100 : isHovered ? 50 : idx + 10;
            const dragClass = isDragging ? 'card-drag-active' : 'card-spring-back transition-all duration-150';
            const cursorClass = isPlayable
              ? isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : 'cursor-default';

            return (
              <div
                key={card.id}
                data-card-id={card.id}
                onMouseEnter={() => !dragState && setHoveredCardId(card.id)}
                onMouseLeave={() => !dragState && setHoveredCardId(null)}
                onPointerDown={(e) => handlePointerDown(e, card, isPlayable)}
                onPointerMove={(e) => handlePointerMove(e, card)}
                onPointerUp={(e) => handlePointerUp(e, card, isPlayable)}
                onPointerCancel={handlePointerCancel}
                style={{
                  transform: cardTransform,
                  transformOrigin: 'bottom center',
                  zIndex: cardZIndex,
                  animationDelay: `${idx * 30}ms`
                }}
                className={`deal-in select-none ${dragClass} ${cursorClass}`}
              >
                <PlayingCard
                  card={card}
                  isPlayable={isPlayable}
                  isDimmed={isDimmed}
                  isSelected={(isHovered || isDragging) && isPlayable}
                  size="md"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

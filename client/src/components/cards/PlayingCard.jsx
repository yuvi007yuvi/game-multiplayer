import React from 'react';
import { TRUMP_SUIT, SUIT_NAMES } from '@shared/constants.js';

/**
 * Maps internal card representations to local CC0 SVG asset paths.
 * Hotlinking / external CDNs are prevented; all SVGs resolve locally from /cards/*.
 *
 * @param {Object|string|null} card - Card object ({ id, suit, rank }) or string ID ('S_A')
 * @param {boolean} isFaceDown - Whether to render the card back
 * @returns {string} Path to the SVG file
 */
export function getCardSvgPath(card, isFaceDown = false) {
  if (isFaceDown || !card) {
    return '/cards/back.svg';
  }

  // If card is already a path or string ID like 'S_A'
  if (typeof card === 'string') {
    if (card.startsWith('/cards/') || card.endsWith('.svg')) {
      return card;
    }
    return `/cards/${card}.svg`;
  }

  // Parse suit and rank from card object properties or id
  const suit = card.suit || (card.id && card.id.split('_')[0]);
  const rank = card.rank || (card.id && card.id.split('_')[1]);

  if (suit && rank) {
    return `/cards/${suit}_${rank}.svg`;
  }

  if (card.id) {
    return `/cards/${card.id}.svg`;
  }

  return '/cards/back.svg';
}

/**
 * Generates an accessible alt text description for screen readers
 */
export function getCardAltText(card, isFaceDown = false) {
  if (isFaceDown || !card) return 'Face down playing card';
  const suit = card.suit || (typeof card === 'string' && card.split('_')[0]) || (card.id && card.id.split('_')[0]);
  const rank = card.rank || (typeof card === 'string' && card.split('_')[1]) || (card.id && card.id.split('_')[1]);
  const suitName = SUIT_NAMES[suit] || suit || '';
  return `${rank} of ${suitName}`;
}

const SIZE_CLASSES = {
  sm: 'w-8 sm:w-10 aspect-[5/7] rounded-md',
  md: 'w-[42px] xs:w-[48px] sm:w-[68px] md:w-[78px] aspect-[5/7] rounded-md sm:rounded-xl',
  lg: 'w-16 sm:w-22 md:w-28 aspect-[5/7] rounded-xl',
  trick: 'w-[32px] sm:w-[44px] md:w-[52px] aspect-[5/7] rounded-md sm:rounded-lg'
};

/**
 * Reusable PlayingCard component powered by the CC0 Public Domain Deck.
 * Preserves high-DPI vector quality, enforces the standard 5:7 poker aspect ratio,
 * and handles hover, selection, and play animations via CSS.
 */
export function PlayingCard({
  card,
  isFaceDown = false,
  isPlayable = false,
  isSelected = false,
  isDimmed = false,
  isWinner = false,
  showTrumpBadge = true,
  onClick,
  size = 'md', // 'sm', 'md', 'lg', 'trick'
  className = ''
}) {
  const svgPath = getCardSvgPath(card, isFaceDown);
  const altText = getCardAltText(card, isFaceDown);

  const suit = card?.suit || (typeof card === 'string' && card.split('_')[0]) || (card?.id && card.id.split('_')[0]);
  const isTrump = suit === TRUMP_SUIT;

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const cursorClass = isPlayable ? 'cursor-pointer' : (isDimmed ? 'cursor-not-allowed' : 'cursor-default');
  const hoverClass = isPlayable ? 'hover:shadow-card-hover hover:scale-[1.03] active:scale-95' : '';
  const legalRingClass = isPlayable ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 playable-aura' : '';
  const winnerClass = isWinner ? 'winner-card-anim ring-2 ring-yellow-300 z-30' : '';
  const selectedClass = isSelected ? 'ring-2 ring-amber-400 shadow-glow-gold z-40' : '';
  const opacityClass = isDimmed ? 'opacity-35 grayscale-[25%] pointer-events-none' : 'opacity-100';

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`relative select-none aspect-[5/7] bg-white border border-slate-300/80 shadow-card card-transition overflow-hidden flex items-center justify-center ${sizeClass} ${cursorClass} ${hoverClass} ${legalRingClass} ${winnerClass} ${selectedClass} ${opacityClass} ${className}`}
      data-card-id={card?.id || (typeof card === 'string' ? card : 'back')}
    >
      {/* High-DPI Vector SVG Card Graphic */}
      <img
        src={svgPath}
        alt={altText}
        className="w-full h-full object-contain pointer-events-none select-none rounded-[inherit]"
        draggable={false}
        loading="eager"
      />

      {/* Spades TRUMP Ribbon: Highlighted when in player's hand */}
      {isTrump && !isFaceDown && showTrumpBadge && size !== 'trick' && size !== 'sm' && (
        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 px-1 py-0.2 sm:py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[6px] sm:text-[8px] font-black uppercase tracking-wider shadow-sm z-10 pointer-events-none select-none">
          TRUMP
        </div>
      )}
    </div>
  );
}

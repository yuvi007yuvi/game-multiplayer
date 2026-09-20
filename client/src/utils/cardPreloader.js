import { getCardSvgPath } from '../components/cards/PlayingCard.jsx';

// In-memory set tracking preloaded URLs to avoid duplicate Image instantiations
const preloadedUrls = new Set();

/**
 * Preload only the SVG assets required for the active hand into browser memory.
 * Hotlinks and external CDNs are prohibited; all assets resolve from local /cards/*.
 *
 * @param {Array<Object|string>} cards - Array of card objects or card IDs for current hand
 */
export function preloadHandCards(cards = []) {
  if (typeof window === 'undefined' || !Array.isArray(cards)) return;

  // Always preload card back once
  const backPath = '/cards/back.svg';
  if (!preloadedUrls.has(backPath)) {
    const img = new Image();
    img.src = backPath;
    preloadedUrls.add(backPath);
  }

  // Preload each card present in the active hand
  for (const card of cards) {
    if (!card) continue;
    const path = getCardSvgPath(card);
    if (path && !preloadedUrls.has(path)) {
      const img = new Image();
      img.src = path;
      preloadedUrls.add(path);
    }
  }
}

/**
 * Checks whether a specific card's SVG has been preloaded
 * @param {Object|string} card
 * @returns {boolean}
 */
export function isCardPreloaded(card) {
  const path = getCardSvgPath(card);
  return preloadedUrls.has(path);
}

import crypto from 'node:crypto';
import { SUITS, RANKS, RANK_VALUES } from '../../../../shared/constants.js';

/**
 * Creates a standard 52-card deck
 * @returns {Array<{id: string, suit: string, rank: string, value: number}>}
 */
export function createDeck() {
  const deck = [];
  const suitKeys = Object.values(SUITS);

  for (const suit of suitKeys) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        value: RANK_VALUES[rank]
      });
    }
  }

  return deck;
}

/**
 * Shuffles a deck using Fisher-Yates with crypto.randomInt
 * @param {Array} deck 
 * @returns {Array} Shuffled copy of deck
 */
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sorts cards in standard Call Break order:
 * Spades (Trump) first, then Hearts, Clubs, Diamonds.
 * Within each suit, highest rank first (A -> 2).
 * @param {Array} hand 
 * @returns {Array} Sorted hand
 */
export function sortHand(hand) {
  const suitOrder = { S: 0, H: 1, C: 2, D: 3 };
  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return b.value - a.value; // Descending value (Ace first)
  });
}

/**
 * Deals cards to 4 players
 * @param {Array} deck 
 * @param {number} numPlayers 
 * @param {number} cardsPerPlayer 
 * @returns {Array<Array>} 4 hands, each sorted
 */
export function dealCards(deck, numPlayers = 4, cardsPerPlayer = 13) {
  if (deck.length !== numPlayers * cardsPerPlayer) {
    throw new Error(`Deck must have exactly ${numPlayers * cardsPerPlayer} cards to deal.`);
  }

  const hands = Array.from({ length: numPlayers }, () => []);
  // Deal one card at a time in round-robin fashion
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let p = 0; p < numPlayers; p++) {
      hands[p].push(deck[i * numPlayers + p]);
    }
  }

  return hands.map(hand => sortHand(hand));
}

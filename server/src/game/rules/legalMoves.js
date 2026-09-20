import { TRUMP_SUIT } from '../../../../shared/constants.js';
import { DEFAULT_RULES } from './ruleConfig.js';

/**
 * Computes all legal cards a player can play given their hand and current trick state.
 * @param {Array<{id: string, suit: string, rank: string, value: number}>} hand 
 * @param {Array<{playerId: string, card: {suit: string, rank: string, value: number}}>} currentTrick 
 * @param {Object} [rules=DEFAULT_RULES]
 * @returns {Array<{id: string, suit: string, rank: string, value: number}>} Array of legal cards
 */
export function getLegalMoves(hand, currentTrick = [], rules = DEFAULT_RULES) {
  if (!hand || hand.length === 0) return [];

  // Trick is empty: leader may play any card in hand
  if (!currentTrick || currentTrick.length === 0) {
    return [...hand];
  }

  const leadCard = currentTrick[0].card;
  const leadSuit = leadCard.suit;

  // 1. Check for cards of the lead suit
  const matchingLeadSuit = hand.filter(card => card.suit === leadSuit);
  if (matchingLeadSuit.length > 0) {
    return matchingLeadSuit;
  }

  // 2. Void in lead suit: Check for trumps (Spades)
  const trumpCards = hand.filter(card => card.suit === TRUMP_SUIT);
  if (trumpCards.length > 0 && rules.mustTrumpIfVoid) {
    // Check if trumps were already played in this trick
    const trumpsInTrick = currentTrick.filter(play => play.card.suit === TRUMP_SUIT);
    if (trumpsInTrick.length > 0 && rules.mustOvertrumpIfPossible) {
      const highestTrumpInTrick = Math.max(...trumpsInTrick.map(play => play.card.value));
      const higherTrumps = trumpCards.filter(card => card.value > highestTrumpInTrick);

      // If player has a higher trump, they MUST beat the trick's highest trump
      if (higherTrumps.length > 0) {
        return higherTrumps;
      }
    }
    // If no trump played yet, or player cannot overtrump, any trump is legal
    return trumpCards;
  }

  // 3. Void in lead suit and no trumps (or void trump rule): Player can discard ANY card
  return [...hand];
}

/**
 * Checks if a specific card is legal to play
 * @param {Array} hand 
 * @param {Object} card 
 * @param {Array} currentTrick 
 * @param {Object} [rules=DEFAULT_RULES]
 * @returns {boolean}
 */
export function isLegalMove(hand, card, currentTrick = [], rules = DEFAULT_RULES) {
  if (!card) return false;
  const cardInHand = hand.some(c => c.id === card.id);
  if (!cardInHand) return false;

  const legalMoves = getLegalMoves(hand, currentTrick, rules);
  return legalMoves.some(c => c.id === card.id);
}

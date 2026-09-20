import { TRUMP_SUIT, SUITS, BOT_DIFFICULTY } from '../../../shared/constants.js';
import { getLegalMoves } from '../game/rules/legalMoves.js';
import { resolveTrickWinner } from '../game/rules/trickWinner.js';

export class BotEngine {
  /**
   * Generates a bid for a bot based on its difficulty and private hand.
   * Bots NEVER inspect other players' hidden hands.
   * @param {Object} params
   * @param {Array<Object>} params.hand - The bot's 13 cards
   * @param {string} [params.difficulty=BOT_DIFFICULTY.MEDIUM]
   * @returns {number} Bid between 1 and 8
   */
  static calculateBid({ hand, difficulty = BOT_DIFFICULTY.MEDIUM }) {
    if (!hand || hand.length === 0) return 1;

    const spades = hand.filter(c => c.suit === TRUMP_SUIT);
    const hearts = hand.filter(c => c.suit === SUITS.HEARTS);
    const diamonds = hand.filter(c => c.suit === SUITS.DIAMONDS);
    const clubs = hand.filter(c => c.suit === SUITS.CLUBS);

    let estimatedTricks = 0;

    // Evaluate Spades (Trump)
    for (const card of spades) {
      if (card.rank === 'A') estimatedTricks += 1.0;
      else if (card.rank === 'K') estimatedTricks += 0.85;
      else if (card.rank === 'Q') estimatedTricks += 0.65;
      else if (card.rank === 'J') estimatedTricks += 0.45;
      else if (card.value >= 8) estimatedTricks += 0.25;
    }
    // Long spades bonus (5+ spades means ruffing power)
    if (spades.length >= 5) {
      estimatedTricks += (spades.length - 4) * 0.5;
    }

    // Evaluate side suits
    const sideSuits = [hearts, diamonds, clubs];
    for (const suitCards of sideSuits) {
      const hasAce = suitCards.some(c => c.rank === 'A');
      const hasKing = suitCards.some(c => c.rank === 'K');
      const hasQueen = suitCards.some(c => c.rank === 'Q');

      if (hasAce) estimatedTricks += 0.95;
      if (hasKing && suitCards.length >= 2) estimatedTricks += 0.65;
      if (hasQueen && suitCards.length >= 3) estimatedTricks += 0.35;

      // Short suit ruffing bonus (if bot has trumps to spare)
      if (suitCards.length === 0 && spades.length >= 3) estimatedTricks += 0.7;
      else if (suitCards.length === 1 && spades.length >= 4) estimatedTricks += 0.4;
    }

    let finalBid = Math.round(estimatedTricks);

    if (difficulty === BOT_DIFFICULTY.EASY) {
      // Easy: slight random variation
      const variance = Math.random() > 0.5 ? 0 : (Math.random() > 0.5 ? 1 : -1);
      finalBid = Math.round(estimatedTricks) + variance;
    } else if (difficulty === BOT_DIFFICULTY.HARD) {
      // Hard: slight conservatism to protect against failed bids
      finalBid = Math.max(1, Math.floor(estimatedTricks + 0.15));
    }

    // Clamp between 1 and 8 (standard Call Break rules)
    return Math.max(1, Math.min(8, finalBid));
  }

  /**
   * Selects a card to play from legal moves based on game state and bot difficulty.
   * Must ALWAYS return a card from getLegalMoves.
   * @param {Object} params
   * @param {Array<Object>} params.hand - Bot's hand
   * @param {Array<Object>} params.currentTrick - Cards currently in trick
   * @param {number} params.bid - Bot's bid
   * @param {number} params.tricksWon - Tricks won by bot so far
   * @param {string} [params.difficulty=BOT_DIFFICULTY.MEDIUM]
   * @param {Array<Object>} [params.playedCardsHistory=[]] - All previously played cards in the round
   * @param {Object} [params.rules]
   * @returns {Object} Selected legal Card
   */
  static selectCard({
    hand,
    currentTrick = [],
    bid = 1,
    tricksWon = 0,
    difficulty = BOT_DIFFICULTY.MEDIUM,
    playedCardsHistory = [],
    rules
  }) {
    const legalMoves = getLegalMoves(hand, currentTrick, rules);
    if (!legalMoves || legalMoves.length === 0) {
      throw new Error('Bot has no legal moves available');
    }

    // Only 1 legal move: must play it
    if (legalMoves.length === 1) {
      return legalMoves[0];
    }

    // EASY PROFILE: Basic legal play with simple weighting
    if (difficulty === BOT_DIFFICULTY.EASY) {
      return this._selectCardEasy(legalMoves, currentTrick);
    }

    // HARD PROFILE
    if (difficulty === BOT_DIFFICULTY.HARD) {
      return this._selectCardHard({
        legalMoves,
        hand,
        currentTrick,
        bid,
        tricksWon,
        playedCardsHistory
      });
    }

    // MEDIUM PROFILE (default)
    return this._selectCardMedium({
      legalMoves,
      hand,
      currentTrick,
      bid,
      tricksWon
    });
  }

  /**
   * Easy Profile logic
   */
  static _selectCardEasy(legalMoves, currentTrick) {
    // If leading, pick any random card
    if (currentTrick.length === 0) {
      const idx = Math.floor(Math.random() * legalMoves.length);
      return legalMoves[idx];
    }
    // If following, prefer lowest legal card 60% of the time, highest 40%
    const sortedAsc = [...legalMoves].sort((a, b) => a.value - b.value);
    return Math.random() < 0.6 ? sortedAsc[0] : sortedAsc[sortedAsc.length - 1];
  }

  /**
   * Medium Profile logic:
   * - Understands target bid vs tricks won
   * - When wanting to win trick: plays lowest card that wins
   * - When unable to win or protecting bid: dumps lowest card
   */
  static _selectCardMedium({ legalMoves, currentTrick, bid, tricksWon }) {
    const needsTricks = tricksWon < bid;

    // 1. Bot is LEADING trick
    if (currentTrick.length === 0) {
      if (needsTricks) {
        // Try leading side-suit Aces or Kings
        const sideAces = legalMoves.filter(c => c.rank === 'A' && c.suit !== TRUMP_SUIT);
        if (sideAces.length > 0) return sideAces[0];

        const sideKings = legalMoves.filter(c => c.rank === 'K' && c.suit !== TRUMP_SUIT);
        if (sideKings.length > 0) return sideKings[0];

        // Or lead highest non-trump
        const nonTrumps = legalMoves.filter(c => c.suit !== TRUMP_SUIT);
        if (nonTrumps.length > 0) {
          nonTrumps.sort((a, b) => b.value - a.value);
          return nonTrumps[0];
        }
      } else {
        // Already satisfied bid: lead lowest card
        const sorted = [...legalMoves].sort((a, b) => a.value - b.value);
        return sorted[0];
      }
      return legalMoves[0];
    }

    // 2. Bot is FOLLOWING trick
    const currentWinner = resolveTrickWinner(currentTrick);
    const winningCards = [];
    const nonWinningCards = [];

    for (const card of legalMoves) {
      const simulatedTrick = [...currentTrick, { playerId: 'sim_bot', seatIndex: 99, card }];
      const simWinner = resolveTrickWinner(simulatedTrick);
      if (simWinner.winningCard.id === card.id) {
        winningCards.push(card);
      } else {
        nonWinningCards.push(card);
      }
    }

    if (needsTricks && winningCards.length > 0) {
      // Pick the LOWEST winning card to economize high cards!
      winningCards.sort((a, b) => a.value - b.value);
      return winningCards[0];
    }

    // Unable to win trick or don't need trick: discard LOWEST non-winning card
    if (nonWinningCards.length > 0) {
      nonWinningCards.sort((a, b) => a.value - b.value);
      return nonWinningCards[0];
    }

    // If forced to win trick (e.g. all legal moves are higher trumps): play lowest
    legalMoves.sort((a, b) => a.value - b.value);
    return legalMoves[0];
  }

  /**
   * Hard Profile logic:
   * - Tracks played cards history to know which cards are master ("boss")
   * - Conserves high trumps
   * - Avoids unnecessary over-tricks if risky
   */
  static _selectCardHard({ legalMoves, hand, currentTrick, bid, tricksWon, playedCardsHistory }) {
    const needsTricks = tricksWon < bid;

    // Helper: is this card the highest remaining of its suit?
    const isBossCard = (card) => {
      const playedOfSuit = playedCardsHistory.filter(c => c.suit === card.suit);
      const higherPlayed = playedOfSuit.filter(c => c.value > card.value).length;
      const higherRanksTotal = 14 - card.value; // How many higher cards exist in standard deck
      return higherPlayed === higherRanksTotal;
    };

    // LEADING
    if (currentTrick.length === 0) {
      if (needsTricks) {
        // 1. Lead guaranteed boss cards in side suits
        const bossCards = legalMoves.filter(c => c.suit !== TRUMP_SUIT && isBossCard(c));
        if (bossCards.length > 0) return bossCards[0];

        // 2. Lead high card of long suit
        const nonTrumps = legalMoves.filter(c => c.suit !== TRUMP_SUIT);
        if (nonTrumps.length > 0) {
          nonTrumps.sort((a, b) => b.value - a.value);
          return nonTrumps[0];
        }
      } else {
        // Duck: lead lowest non-trump
        const nonTrumps = legalMoves.filter(c => c.suit !== TRUMP_SUIT);
        if (nonTrumps.length > 0) {
          nonTrumps.sort((a, b) => a.value - b.value);
          return nonTrumps[0];
        }
      }
      // Otherwise lowest card
      const sorted = [...legalMoves].sort((a, b) => a.value - b.value);
      return sorted[0];
    }

    // FOLLOWING
    const winningCards = [];
    const nonWinningCards = [];

    for (const card of legalMoves) {
      const simulatedTrick = [...currentTrick, { playerId: 'sim_bot', seatIndex: 99, card }];
      const simWinner = resolveTrickWinner(simulatedTrick);
      if (simWinner.winningCard.id === card.id) {
        winningCards.push(card);
      } else {
        nonWinningCards.push(card);
      }
    }

    if (needsTricks && winningCards.length > 0) {
      // Prioritize winning with lowest card
      winningCards.sort((a, b) => a.value - b.value);
      return winningCards[0];
    }

    // Cannot win or ducking: throw lowest useless card
    if (nonWinningCards.length > 0) {
      nonWinningCards.sort((a, b) => a.value - b.value);
      return nonWinningCards[0];
    }

    legalMoves.sort((a, b) => a.value - b.value);
    return legalMoves[0];
  }
}

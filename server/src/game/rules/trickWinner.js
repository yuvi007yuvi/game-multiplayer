import { TRUMP_SUIT } from '../../../../shared/constants.js';

/**
 * Resolves the winner of a completed trick (or current winning card mid-trick).
 * @param {Array<{playerId: string, seatIndex: number, card: {id: string, suit: string, rank: string, value: number}}>} currentTrick 
 * @returns {{winningPlay: Object, winningPlayerId: string, winningSeatIndex: number, winningCard: Object}|null}
 */
export function resolveTrickWinner(currentTrick) {
  if (!currentTrick || currentTrick.length === 0) {
    return null;
  }

  const leadCard = currentTrick[0].card;
  const leadSuit = leadCard.suit;

  // Filter trumps (Spades)
  const trumpPlays = currentTrick.filter(play => play.card.suit === TRUMP_SUIT);

  if (trumpPlays.length > 0) {
    // Highest spade wins
    let winningPlay = trumpPlays[0];
    for (let i = 1; i < trumpPlays.length; i++) {
      if (trumpPlays[i].card.value > winningPlay.card.value) {
        winningPlay = trumpPlays[i];
      }
    }
    return {
      winningPlay,
      winningPlayerId: winningPlay.playerId,
      winningSeatIndex: winningPlay.seatIndex,
      winningCard: winningPlay.card
    };
  }

  // No trumps: Highest card of the lead suit wins
  const leadSuitPlays = currentTrick.filter(play => play.card.suit === leadSuit);
  let winningPlay = leadSuitPlays[0];
  for (let i = 1; i < leadSuitPlays.length; i++) {
    if (leadSuitPlays[i].card.value > winningPlay.card.value) {
      winningPlay = leadSuitPlays[i];
    }
  }

  return {
    winningPlay,
    winningPlayerId: winningPlay.playerId,
    winningSeatIndex: winningPlay.seatIndex,
    winningCard: winningPlay.card
  };
}

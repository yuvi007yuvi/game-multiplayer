/**
 * Configurable rule flags for Call Break variations
 */
export const DEFAULT_RULES = {
  // Players must play a card of the led suit if they possess one
  mustFollowSuit: true,

  // If a player cannot follow suit, they must play a Spade (trump) if they have one
  mustTrumpIfVoid: true,

  // If a trump has already been played in the trick, player must play a higher trump if possible
  mustOvertrumpIfPossible: true,

  // If player cannot follow suit and has no trumps, they can play any card
  canDiscardAnyIfVoidOfSuitAndTrump: true,

  // Standard Call Break minimum bid (1) and maximum bid (8)
  minBid: 1,
  maxBid: 8
};

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createDeck, shuffleDeck, dealCards, sortHand } from '../src/game/deck/deck.js';
import { SUITS, RANKS } from '../../shared/constants.js';

describe('Deck and Dealing Invariants', () => {
  test('createDeck generates exactly 52 unique cards', () => {
    const deck = createDeck();
    assert.strictEqual(deck.length, 52);

    const cardIds = new Set(deck.map(c => c.id));
    assert.strictEqual(cardIds.size, 52);

    for (const suit of Object.values(SUITS)) {
      const suitCards = deck.filter(c => c.suit === suit);
      assert.strictEqual(suitCards.length, 13, `Expected 13 cards for suit ${suit}`);
    }

    for (const rank of RANKS) {
      const rankCards = deck.filter(c => c.rank === rank);
      assert.strictEqual(rankCards.length, 4, `Expected 4 cards for rank ${rank}`);
    }
  });

  test('shuffleDeck preserves all cards without duplicates or losses', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);

    assert.strictEqual(shuffled.length, 52);
    const originalIds = new Set(deck.map(c => c.id));
    const shuffledIds = new Set(shuffled.map(c => c.id));

    assert.strictEqual(shuffledIds.size, 52);
    for (const id of originalIds) {
      assert.ok(shuffledIds.has(id));
    }

    // Two consecutive shuffles should not be identical (astronomically low probability)
    const shuffled2 = shuffleDeck(deck);
    const sameOrder = shuffled.every((card, idx) => card.id === shuffled2[idx].id);
    assert.strictEqual(sameOrder, false, 'Shuffle must produce pseudo-random permutation');
  });

  test('dealCards distributes exactly 13 cards to 4 players', () => {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, 4, 13);

    assert.strictEqual(hands.length, 4);
    const seenCardIds = new Set();

    for (let i = 0; i < hands.length; i++) {
      const hand = hands[i];
      assert.strictEqual(hand.length, 13, `Player ${i} should have 13 cards`);

      for (const card of hand) {
        assert.ok(!seenCardIds.has(card.id), `Duplicate card ${card.id} found in hands`);
        seenCardIds.add(card.id);
      }
    }

    assert.strictEqual(seenCardIds.size, 52);
  });

  test('sortHand places Spades first and sorts descending by value within suits', () => {
    const unsortedHand = [
      { id: 'H_2', suit: 'H', rank: '2', value: 2 },
      { id: 'S_10', suit: 'S', rank: '10', value: 10 },
      { id: 'S_A', suit: 'S', rank: 'A', value: 14 },
      { id: 'D_K', suit: 'D', rank: 'K', value: 13 },
      { id: 'C_5', suit: 'C', rank: '5', value: 5 }
    ];

    const sorted = sortHand(unsortedHand);
    assert.strictEqual(sorted[0].id, 'S_A');
    assert.strictEqual(sorted[1].id, 'S_10');
    assert.strictEqual(sorted[2].id, 'H_2');
    assert.strictEqual(sorted[3].id, 'C_5');
    assert.strictEqual(sorted[4].id, 'D_K');
  });
});

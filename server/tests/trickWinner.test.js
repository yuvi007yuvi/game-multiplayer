import { test, describe } from 'node:test';
import assert from 'node:assert';
import { resolveTrickWinner } from '../src/game/rules/trickWinner.js';

describe('Call Break Trick Resolution', () => {
  test('Highest card of the lead suit wins when no trumps are played', () => {
    const trick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'H_10', suit: 'H', rank: '10', value: 10 } },
      { playerId: 'p2', seatIndex: 1, card: { id: 'H_A', suit: 'H', rank: 'A', value: 14 } },
      { playerId: 'p3', seatIndex: 2, card: { id: 'H_4', suit: 'H', rank: '4', value: 4 } },
      { playerId: 'p4', seatIndex: 3, card: { id: 'H_K', suit: 'H', rank: 'K', value: 13 } }
    ];

    const result = resolveTrickWinner(trick);
    assert.strictEqual(result.winningPlayerId, 'p2');
    assert.strictEqual(result.winningCard.id, 'H_A');
  });

  test('Non-lead, non-trump discard cannot win even if higher rank', () => {
    const trick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'D_5', suit: 'D', rank: '5', value: 5 } },
      { playerId: 'p2', seatIndex: 1, card: { id: 'D_9', suit: 'D', rank: '9', value: 9 } },
      { playerId: 'p3', seatIndex: 2, card: { id: 'C_A', suit: 'C', rank: 'A', value: 14 } }, // Club discard
      { playerId: 'p4', seatIndex: 3, card: { id: 'H_K', suit: 'H', rank: 'K', value: 13 } }  // Heart discard
    ];

    const result = resolveTrickWinner(trick);
    assert.strictEqual(result.winningPlayerId, 'p2');
    assert.strictEqual(result.winningCard.id, 'D_9');
  });

  test('Trump card beats higher cards of the lead suit', () => {
    const trick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'H_A', suit: 'H', rank: 'A', value: 14 } },
      { playerId: 'p2', seatIndex: 1, card: { id: 'H_K', suit: 'H', rank: 'K', value: 13 } },
      { playerId: 'p3', seatIndex: 2, card: { id: 'S_2', suit: 'S', rank: '2', value: 2 } }, // Trump cut!
      { playerId: 'p4', seatIndex: 3, card: { id: 'H_Q', suit: 'H', rank: 'Q', value: 12 } }
    ];

    const result = resolveTrickWinner(trick);
    assert.strictEqual(result.winningPlayerId, 'p3');
    assert.strictEqual(result.winningCard.id, 'S_2');
  });

  test('Highest trump wins when multiple players play trumps', () => {
    const trick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'C_J', suit: 'C', rank: 'J', value: 11 } },
      { playerId: 'p2', seatIndex: 1, card: { id: 'S_4', suit: 'S', rank: '4', value: 4 } },
      { playerId: 'p3', seatIndex: 2, card: { id: 'S_10', suit: 'S', rank: '10', value: 10 } },
      { playerId: 'p4', seatIndex: 3, card: { id: 'S_7', suit: 'S', rank: '7', value: 7 } }
    ];

    const result = resolveTrickWinner(trick);
    assert.strictEqual(result.winningPlayerId, 'p3');
    assert.strictEqual(result.winningCard.id, 'S_10');
  });
});

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getLegalMoves, isLegalMove } from '../src/game/rules/legalMoves.js';

describe('Call Break Legal Move Rules', () => {
  const sampleHand = [
    { id: 'S_K', suit: 'S', rank: 'K', value: 13 },
    { id: 'S_5', suit: 'S', rank: '5', value: 5 },
    { id: 'H_A', suit: 'H', rank: 'A', value: 14 },
    { id: 'H_10', suit: 'H', rank: '10', value: 10 },
    { id: 'D_8', suit: 'D', rank: '8', value: 8 }
  ];

  test('Leader can play any card from hand', () => {
    const legal = getLegalMoves(sampleHand, []);
    assert.strictEqual(legal.length, sampleHand.length);
    for (const card of sampleHand) {
      assert.ok(isLegalMove(sampleHand, card, []));
    }
  });

  test('Player MUST follow suit if holding cards of the lead suit', () => {
    const currentTrick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'H_7', suit: 'H', rank: '7', value: 7 } }
    ];

    const legal = getLegalMoves(sampleHand, currentTrick);
    assert.strictEqual(legal.length, 2);
    assert.deepStrictEqual(legal.map(c => c.id).sort(), ['H_10', 'H_A'].sort());

    // Illegal to play spade or diamond when holding hearts
    assert.strictEqual(isLegalMove(sampleHand, { id: 'S_K' }, currentTrick), false);
    assert.strictEqual(isLegalMove(sampleHand, { id: 'D_8' }, currentTrick), false);
    // Legal to play either heart
    assert.strictEqual(isLegalMove(sampleHand, { id: 'H_A' }, currentTrick), true);
    assert.strictEqual(isLegalMove(sampleHand, { id: 'H_10' }, currentTrick), true);
  });

  test('Player MUST trump with Spade if void of lead suit', () => {
    const currentTrick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'C_9', suit: 'C', rank: '9', value: 9 } }
    ];
    // sampleHand has NO clubs, but has S_K and S_5
    const legal = getLegalMoves(sampleHand, currentTrick);
    assert.strictEqual(legal.length, 2);
    assert.deepStrictEqual(legal.map(c => c.id).sort(), ['S_5', 'S_K'].sort());

    // Cannot discard hearts or diamonds when spades are available
    assert.strictEqual(isLegalMove(sampleHand, { id: 'H_A' }, currentTrick), false);
    assert.strictEqual(isLegalMove(sampleHand, { id: 'S_5' }, currentTrick), true);
  });

  test('Player MUST overtrump if holding higher spade when trump was already played', () => {
    // S_10 was played by player 2 as a trump cut
    const currentTrick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'C_9', suit: 'C', rank: '9', value: 9 } },
      { playerId: 'p2', seatIndex: 1, card: { id: 'S_10', suit: 'S', rank: '10', value: 10 } }
    ];
    // sampleHand has S_K (13) and S_5 (5). Since S_K > S_10, player MUST play S_K
    const legal = getLegalMoves(sampleHand, currentTrick);
    assert.strictEqual(legal.length, 1);
    assert.strictEqual(legal[0].id, 'S_K');

    assert.strictEqual(isLegalMove(sampleHand, { id: 'S_5' }, currentTrick), false);
    assert.strictEqual(isLegalMove(sampleHand, { id: 'S_K' }, currentTrick), true);
  });

  test('Player can play any spade if unable to overtrump', () => {
    const handWithLowSpades = [
      { id: 'S_4', suit: 'S', rank: '4', value: 4 },
      { id: 'S_2', suit: 'S', rank: '2', value: 2 },
      { id: 'D_A', suit: 'D', rank: 'A', value: 14 }
    ];
    // S_10 is highest trump played
    const currentTrick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'C_9', suit: 'C', rank: '9', value: 9 } },
      { playerId: 'p2', seatIndex: 1, card: { id: 'S_10', suit: 'S', rank: '10', value: 10 } }
    ];

    const legal = getLegalMoves(handWithLowSpades, currentTrick);
    assert.strictEqual(legal.length, 2);
    assert.deepStrictEqual(legal.map(c => c.id).sort(), ['S_2', 'S_4'].sort());
  });

  test('Player can discard ANY card if void of lead suit AND void of trumps', () => {
    const handWithNoTrumpNoClubs = [
      { id: 'H_2', suit: 'H', rank: '2', value: 2 },
      { id: 'D_5', suit: 'D', rank: '5', value: 5 },
      { id: 'D_J', suit: 'D', rank: 'J', value: 11 }
    ];
    const currentTrick = [
      { playerId: 'p1', seatIndex: 0, card: { id: 'C_K', suit: 'C', rank: 'K', value: 13 } }
    ];

    const legal = getLegalMoves(handWithNoTrumpNoClubs, currentTrick);
    assert.strictEqual(legal.length, 3);
    for (const card of handWithNoTrumpNoClubs) {
      assert.ok(isLegalMove(handWithNoTrumpNoClubs, card, currentTrick));
    }
  });
});

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  calculatePlayerRoundScore,
  calculateRoundScores,
  calculateMatchRankings
} from '../src/game/scoring/scoringEngine.js';

describe('Call Break Scoring Engine', () => {
  test('Exact bid matched gives exact bid score', () => {
    assert.strictEqual(calculatePlayerRoundScore(3, 3), 3.0);
    assert.strictEqual(calculatePlayerRoundScore(1, 1), 1.0);
    assert.strictEqual(calculatePlayerRoundScore(6, 6), 6.0);
  });

  test('Exceeding bid awards 0.1 per extra trick won', () => {
    assert.strictEqual(calculatePlayerRoundScore(3, 4), 3.1);
    assert.strictEqual(calculatePlayerRoundScore(3, 6), 3.3);
    assert.strictEqual(calculatePlayerRoundScore(1, 4), 1.3);
  });

  test('Failing bid awards negative bid', () => {
    assert.strictEqual(calculatePlayerRoundScore(4, 3), -4.0);
    assert.strictEqual(calculatePlayerRoundScore(5, 0), -5.0);
    assert.strictEqual(calculatePlayerRoundScore(2, 1), -2.0);
  });

  test('Round scores calculated accurately for all 4 players', () => {
    const roundData = [
      { playerId: 'p1', bid: 3, tricksWon: 4 }, // 3.1
      { playerId: 'p2', bid: 4, tricksWon: 4 }, // 4.0
      { playerId: 'p3', bid: 2, tricksWon: 1 }, // -2.0
      { playerId: 'p4', bid: 4, tricksWon: 4 }  // 4.0
    ];

    const results = calculateRoundScores(roundData);
    assert.strictEqual(results['p1'].roundScore, 3.1);
    assert.strictEqual(results['p2'].roundScore, 4.0);
    assert.strictEqual(results['p3'].roundScore, -2.0);
    assert.strictEqual(results['p4'].roundScore, 4.0);
  });

  test('Match rankings aggregate across rounds and sort descending', () => {
    const playerIds = ['p1', 'p2', 'p3', 'p4'];
    const roundHistory = [
      {
        p1: { roundScore: 3.1 },
        p2: { roundScore: 4.0 },
        p3: { roundScore: -2.0 },
        p4: { roundScore: 2.0 }
      },
      {
        p1: { roundScore: 2.0 },
        p2: { roundScore: -3.0 },
        p3: { roundScore: 3.2 },
        p4: { roundScore: 3.0 }
      }
    ];

    // Totals:
    // p1: 3.1 + 2.0 = 5.1
    // p2: 4.0 - 3.0 = 1.0
    // p3: -2.0 + 3.2 = 1.2
    // p4: 2.0 + 3.0 = 5.0

    const rankings = calculateMatchRankings(playerIds, roundHistory);
    assert.strictEqual(rankings[0].playerId, 'p1');
    assert.strictEqual(rankings[0].totalScore, 5.1);
    assert.strictEqual(rankings[0].rank, 1);

    assert.strictEqual(rankings[1].playerId, 'p4');
    assert.strictEqual(rankings[1].totalScore, 5.0);
    assert.strictEqual(rankings[1].rank, 2);

    assert.strictEqual(rankings[2].playerId, 'p3');
    assert.strictEqual(rankings[2].totalScore, 1.2);
    assert.strictEqual(rankings[2].rank, 3);

    assert.strictEqual(rankings[3].playerId, 'p2');
    assert.strictEqual(rankings[3].totalScore, 1.0);
    assert.strictEqual(rankings[3].rank, 4);
  });
});

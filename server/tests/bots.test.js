import { test, describe } from 'node:test';
import assert from 'node:assert';
import { BotEngine } from '../src/bots/botEngine.js';
import { CallBreakGame } from '../src/game/engine/gameEngine.js';
import { createDeck, shuffleDeck, dealCards } from '../src/game/deck/deck.js';
import { BOT_DIFFICULTY, GAME_PHASES } from '../../shared/constants.js';
import { isLegalMove } from '../src/game/rules/legalMoves.js';

describe('Bot Intelligence Engine & Game Simulation', () => {
  test('Bot bidding outputs valid bids between 1 and 8 across all difficulty profiles', () => {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, 4, 13);

    for (const hand of hands) {
      for (const difficulty of Object.values(BOT_DIFFICULTY)) {
        const bid = BotEngine.calculateBid({ hand, difficulty });
        assert.ok(bid >= 1 && bid <= 8, `Bid ${bid} out of bounds for ${difficulty}`);
      }
    }
  });

  test('Bot card selection always returns a strictly legal card from hand', () => {
    const deck = shuffleDeck(createDeck());
    const [hand] = dealCards(deck, 4, 13);

    const trick1 = [];
    const move1 = BotEngine.selectCard({
      hand,
      currentTrick: trick1,
      bid: 3,
      tricksWon: 0,
      difficulty: BOT_DIFFICULTY.HARD
    });
    assert.ok(isLegalMove(hand, move1, trick1));

    const trick2 = [{ playerId: 'p0', seatIndex: 0, card: { id: 'H_A', suit: 'H', rank: 'A', value: 14 } }];
    const move2 = BotEngine.selectCard({
      hand,
      currentTrick: trick2,
      bid: 3,
      tricksWon: 0,
      difficulty: BOT_DIFFICULTY.MEDIUM
    });
    assert.ok(isLegalMove(hand, move2, trick2));
  });

  test('End-to-end multi-round 4-bot match runs to completion without deadlock or rule violations', () => {
    const players = [
      { id: 'bot_0', name: 'Bot Alice', isBot: true, botDifficulty: BOT_DIFFICULTY.EASY },
      { id: 'bot_1', name: 'Bot Bob', isBot: true, botDifficulty: BOT_DIFFICULTY.MEDIUM },
      { id: 'bot_2', name: 'Bot Charlie', isBot: true, botDifficulty: BOT_DIFFICULTY.HARD },
      { id: 'bot_3', name: 'Bot Dave', isBot: true, botDifficulty: BOT_DIFFICULTY.MEDIUM }
    ];

    const game = new CallBreakGame({
      id: 'test_game_1',
      players,
      totalRounds: 2 // 2 full rounds = 26 tricks = 104 card plays
    });

    for (let round = 1; round <= 2; round++) {
      game.startRound();
      assert.strictEqual(game.phase, GAME_PHASES.BIDDING);

      // 1. Submit all 4 bids
      for (let i = 0; i < 4; i++) {
        const activePlayer = game.players[game.currentTurn];
        const hand = game.hands[activePlayer.id];
        const bid = BotEngine.calculateBid({ hand, difficulty: activePlayer.botDifficulty });
        game.submitBid(activePlayer.id, bid);
      }

      assert.strictEqual(game.phase, GAME_PHASES.PLAYING);

      // 2. Play all 13 tricks
      for (let trick = 1; trick <= 13; trick++) {
        for (let cardIdx = 0; cardIdx < 4; cardIdx++) {
          const activePlayer = game.players[game.currentTurn];
          const hand = game.hands[activePlayer.id];
          const chosenCard = BotEngine.selectCard({
            hand,
            currentTrick: game.currentTrick,
            bid: game.bids[activePlayer.id],
            tricksWon: game.tricksWon[activePlayer.id],
            difficulty: activePlayer.botDifficulty
          });

          const playResult = game.playCard(activePlayer.id, chosenCard);
          assert.ok(playResult);
        }
      }

      if (round < 2) {
        assert.strictEqual(game.phase, GAME_PHASES.ROUND_END);
      } else {
        assert.strictEqual(game.phase, GAME_PHASES.MATCH_END);
        assert.ok(game.rankings);
        assert.strictEqual(game.rankings.length, 4);
      }
    }
  });
});

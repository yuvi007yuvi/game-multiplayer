import { GAME_PHASES, GAME_RULES, TRUMP_SUIT } from '../../../../shared/constants.js';
import { createDeck, shuffleDeck, dealCards } from '../deck/deck.js';
import { getLegalMoves, isLegalMove } from '../rules/legalMoves.js';
import { resolveTrickWinner } from '../rules/trickWinner.js';
import { calculateRoundScores, calculateMatchRankings } from '../scoring/scoringEngine.js';
import { DEFAULT_RULES } from '../rules/ruleConfig.js';

export class CallBreakGame {
  /**
   * @param {Object} options
   * @param {string} options.id - Game / Room ID
   * @param {Array<Object>} options.players - Array of 4 player objects
   * @param {number} [options.totalRounds=5]
   * @param {Object} [options.rules=DEFAULT_RULES]
   */
  constructor({ id, players, totalRounds = GAME_RULES.DEFAULT_ROUNDS_PER_MATCH, rules = DEFAULT_RULES }) {
    if (!players || players.length !== 4) {
      throw new Error('Call Break requires exactly 4 players.');
    }

    this.id = id;
    this.players = players.map((p, index) => ({
      ...p,
      seatIndex: index
    }));
    this.totalRounds = totalRounds;
    this.rules = rules;

    this.round = 0;
    this.dealerSeat = 0;
    this.currentTurn = 0;
    this.phase = GAME_PHASES.LOBBY;

    this.hands = {}; // playerId -> Card[]
    this.bids = {};  // playerId -> number
    this.tricksWon = {}; // playerId -> number
    this.roundScores = {}; // playerId -> number
    this.matchScores = {}; // playerId -> number

    for (const player of this.players) {
      this.matchScores[player.id] = 0;
    }

    this.trickNumber = 0;
    this.currentTrick = []; // Array of { playerId, seatIndex, card }
    this.lastTrick = null;
    this.roundHistory = [];
    this.rankings = null;
    this.turnDeadline = null;
  }

  /**
   * Resets the turn countdown deadline
   */
  resetTurnTimer() {
    const timeoutSec = this.rules.TURN_TIMEOUT_SECONDS || 15;
    this.turnDeadline = Date.now() + timeoutSec * 1000;
  }

  /**
   * Starts or restarts a round
   */
  startRound() {
    this.round += 1;
    this.phase = GAME_PHASES.DEALING;
    this.trickNumber = 1;
    this.currentTrick = [];
    this.lastTrick = null;

    // Deal cards
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, 4, 13);

    this.hands = {};
    this.bids = {};
    this.tricksWon = {};
    this.roundScores = {};

    for (let i = 0; i < 4; i++) {
      const player = this.players[i];
      this.hands[player.id] = hands[i];
      this.bids[player.id] = null;
      this.tricksWon[player.id] = 0;
      this.roundScores[player.id] = 0;
    }

    // First bidder is the player immediately to the left of the dealer: (dealerSeat + 1) % 4
    this.currentTurn = (this.dealerSeat + 1) % 4;
    this.phase = GAME_PHASES.BIDDING;
    this.resetTurnTimer();

    return this.getState();
  }

  /**
   * Submits a bid for a player
   * @param {string} playerId 
   * @param {number} bid 
   */
  submitBid(playerId, bid) {
    if (this.phase !== GAME_PHASES.BIDDING) {
      throw new Error(`Cannot bid during phase ${this.phase}`);
    }

    const currentSeatPlayer = this.players[this.currentTurn];
    if (currentSeatPlayer.id !== playerId) {
      throw new Error(`Not player ${playerId}'s turn to bid. Expected ${currentSeatPlayer.id}`);
    }

    const parsedBid = parseInt(bid, 10);
    if (isNaN(parsedBid) || parsedBid < this.rules.minBid || parsedBid > this.rules.maxBid) {
      throw new Error(`Bid must be between ${this.rules.minBid} and ${this.rules.maxBid}`);
    }

    this.bids[playerId] = parsedBid;

    // Check if all players have bid
    const allBidsSubmitted = this.players.every(p => this.bids[p.id] !== null);
    if (allBidsSubmitted) {
      // Transition to PLAYING phase
      this.phase = GAME_PHASES.PLAYING;
      // First trick leader is the player to the left of dealer
      this.currentTurn = (this.dealerSeat + 1) % 4;
    } else {
      // Move to next player's turn to bid
      this.currentTurn = (this.currentTurn + 1) % 4;
    }

    this.resetTurnTimer();

    return this.getState();
  }

  /**
   * Plays a card from a player's hand to the current trick
   * @param {string} playerId 
   * @param {Object} card 
   */
  playCard(playerId, card) {
    if (this.phase !== GAME_PHASES.PLAYING) {
      throw new Error(`Cannot play card during phase ${this.phase}`);
    }

    const currentSeatPlayer = this.players[this.currentTurn];
    if (currentSeatPlayer.id !== playerId) {
      throw new Error(`Not player ${playerId}'s turn to play card`);
    }

    const hand = this.hands[playerId];
    if (!isLegalMove(hand, card, this.currentTrick, this.rules)) {
      throw new Error(`Illegal card play: ${card.id} violates Call Break rules`);
    }

    // Remove card from hand
    this.hands[playerId] = hand.filter(c => c.id !== card.id);

    // Add play to current trick
    const play = {
      playerId,
      seatIndex: this.currentTurn,
      card
    };
    this.currentTrick.push(play);

    let trickResolved = null;
    let roundEnded = false;
    let matchEnded = false;

    // Check if trick completed (4 cards played)
    if (this.currentTrick.length === 4) {
      const winner = resolveTrickWinner(this.currentTrick);
      this.tricksWon[winner.winningPlayerId] += 1;

      trickResolved = {
        trickNumber: this.trickNumber,
        trickCards: [...this.currentTrick],
        winnerPlayerId: winner.winningPlayerId,
        winningSeatIndex: winner.winningSeatIndex,
        winningCard: winner.winningCard
      };

      this.lastTrick = trickResolved;

      if (this.trickNumber < GAME_RULES.TOTAL_TRICKS) {
        // Prepare next trick
        this.trickNumber += 1;
        this.currentTrick = [];
        // Trick winner leads next trick
        this.currentTurn = winner.winningSeatIndex;
        this.resetTurnTimer();
      } else {
        // Round completed (all 13 tricks played)
        roundEnded = true;
        this.turnDeadline = null;
        this.endRound();
        if (this.round >= this.totalRounds) {
          matchEnded = true;
          this.endMatch();
        }
      }
    } else {
      // Pass turn to next player clockwise
      this.currentTurn = (this.currentTurn + 1) % 4;
      this.resetTurnTimer();
    }

    return {
      state: this.getState(),
      trickResolved,
      roundEnded,
      matchEnded
    };
  }

  /**
   * Finalizes round scoring and updates match totals
   */
  endRound() {
    this.phase = GAME_PHASES.ROUND_END;
    const playerRoundData = this.players.map(p => ({
      playerId: p.id,
      bid: this.bids[p.id],
      tricksWon: this.tricksWon[p.id]
    }));

    const roundScoresMap = calculateRoundScores(playerRoundData);
    this.roundScores = roundScoresMap;

    // Update match totals
    for (const p of this.players) {
      const score = roundScoresMap[p.id].roundScore;
      this.matchScores[p.id] = Math.round((this.matchScores[p.id] + score) * 10) / 10;
    }

    this.roundHistory.push({
      roundNumber: this.round,
      scores: roundScoresMap
    });

    // Advance dealer seat for next round
    this.dealerSeat = (this.dealerSeat + 1) % 4;
  }

  /**
   * Finalizes match and produces rankings
   */
  endMatch() {
    this.phase = GAME_PHASES.MATCH_END;
    const playerIds = this.players.map(p => p.id);
    const history = this.roundHistory.map(r => r.scores);
    this.rankings = calculateMatchRankings(playerIds, history);
  }

  /**
   * Safe view of the game state for a specific player (or observer)
   * Prevents revealing opponent cards!
   * @param {string} playerId 
   * @returns {Object} Player-sanitized state
   */
  getPlayerView(playerId) {
    const seats = this.players.map((p, idx) => ({
      id: p.id,
      name: p.name,
      seatIndex: idx,
      isBot: Boolean(p.isBot),
      botDifficulty: p.botDifficulty || null,
      connected: p.connected !== false,
      cardCount: this.hands[p.id] ? this.hands[p.id].length : 0,
      bid: this.bids[p.id],
      tricksWon: this.tricksWon[p.id] || 0,
      roundScore: this.roundScores[p.id] ? this.roundScores[p.id].roundScore : 0,
      matchScore: this.matchScores[p.id] || 0,
      isDealer: idx === this.dealerSeat,
      isCurrentTurn: idx === this.currentTurn
    }));

    const playerHand = this.hands[playerId] || [];
    const legalMoves = (this.phase === GAME_PHASES.PLAYING && this.players[this.currentTurn]?.id === playerId)
      ? getLegalMoves(playerHand, this.currentTrick, this.rules)
      : [];

    return {
      gameId: this.id,
      phase: this.phase,
      round: this.round,
      totalRounds: this.totalRounds,
      dealerSeat: this.dealerSeat,
      currentTurn: this.currentTurn,
      trickNumber: this.trickNumber,
      currentTrick: this.currentTrick,
      lastTrick: this.lastTrick,
      trumpSuit: TRUMP_SUIT,
      seats,
      myHand: playerHand,
      myLegalMoves: legalMoves.map(c => c.id),
      mySeatIndex: this.players.findIndex(p => p.id === playerId),
      roundHistory: this.roundHistory,
      rankings: this.rankings,
      turnDeadline: this.turnDeadline,
      turnTimeoutSeconds: this.rules.TURN_TIMEOUT_SECONDS || 15
    };
  }

  /**
   * Internal authoritative state (for bots, testing, and debugging)
   */
  getState() {
    return {
      gameId: this.id,
      phase: this.phase,
      round: this.round,
      totalRounds: this.totalRounds,
      dealerSeat: this.dealerSeat,
      currentTurn: this.currentTurn,
      trickNumber: this.trickNumber,
      currentTrick: this.currentTrick,
      lastTrick: this.lastTrick,
      hands: this.hands,
      bids: this.bids,
      tricksWon: this.tricksWon,
      roundScores: this.roundScores,
      matchScores: this.matchScores,
      roundHistory: this.roundHistory,
      rankings: this.rankings,
      turnDeadline: this.turnDeadline,
      turnTimeoutSeconds: this.rules.TURN_TIMEOUT_SECONDS || 15
    };
  }
}

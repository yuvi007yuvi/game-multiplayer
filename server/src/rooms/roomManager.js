import crypto from 'node:crypto';
import { CallBreakGame } from '../game/engine/gameEngine.js';
import { BotEngine } from '../bots/botEngine.js';
import { BOT_NAMES, BOT_DIFFICULTY, GAME_PHASES, ECONOMY, GAME_RULES } from '../../../shared/constants.js';
import { coinService } from '../services/coinService.js';

export class Room {
  constructor({ code, hostId, hostName, isPrivate = true, tableStake = ECONOMY.DEFAULT_TABLE_STAKE, totalRounds = 5 }) {
    this.code = code;
    this.hostId = hostId;
    this.isPrivate = isPrivate;
    this.tableStake = tableStake;
    this.totalRounds = totalRounds;
    this.status = 'LOBBY'; // 'LOBBY', 'PLAYING', 'FINISHED'
    this.createdAt = Date.now();

    // 4 seats (0: South/Host, 1: West, 2: North, 3: East)
    this.seats = [null, null, null, null];
    this.game = null;
    this.disconnectGraceTimers = new Map(); // userId -> timer
  }

  getPlayers() {
    return this.seats.filter(Boolean);
  }

  isFull() {
    return this.seats.every(s => s !== null);
  }

  addPlayer({ id, name, socketId }) {
    // Check if player is already in this room (reconnection)
    const existingIndex = this.seats.findIndex(s => s && s.id === id);
    if (existingIndex !== -1) {
      this.seats[existingIndex].socketId = socketId;
      this.seats[existingIndex].connected = true;
      if (this.disconnectGraceTimers.has(id)) {
        clearTimeout(this.disconnectGraceTimers.get(id));
        this.disconnectGraceTimers.delete(id);
      }
      return { seatIndex: existingIndex, reconnected: true };
    }

    if (this.status !== 'LOBBY') {
      throw new Error('Game already in progress.');
    }

    const emptyIndex = this.seats.findIndex(s => s === null);
    if (emptyIndex === -1) {
      throw new Error('Room is full.');
    }

    const isHost = emptyIndex === 0 && this.seats[0] === null;
    this.seats[emptyIndex] = {
      id,
      name: name || `Player ${emptyIndex + 1}`,
      socketId,
      isHost,
      isBot: false,
      botDifficulty: null,
      ready: isHost, // Host is ready by default
      connected: true
    };

    return { seatIndex: emptyIndex, reconnected: false };
  }

  removePlayer(userId) {
    const seatIndex = this.seats.findIndex(s => s && s.id === userId);
    if (seatIndex === -1) return false;

    if (this.status === 'LOBBY') {
      this.seats[seatIndex] = null;
      // If host left, assign next human as host
      if (this.hostId === userId) {
        const nextHuman = this.seats.find(s => s && !s.isBot);
        if (nextHuman) {
          this.hostId = nextHuman.id;
          nextHuman.isHost = true;
        }
      }
      return true;
    }

    // If game in progress, mark disconnected and enable bot takeover
    this.seats[seatIndex].connected = false;
    return true;
  }

  fillBots(difficulty = BOT_DIFFICULTY.MEDIUM) {
    if (this.status !== 'LOBBY') return;

    let botNameIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (this.seats[i] === null) {
        const botName = BOT_NAMES[botNameIndex % BOT_NAMES.length];
        botNameIndex++;
        this.seats[i] = {
          id: `bot_${crypto.randomUUID().slice(0, 8)}`,
          name: botName,
          socketId: null,
          isHost: false,
          isBot: true,
          botDifficulty: difficulty,
          ready: true,
          connected: true
        };
      }
    }
  }

  kickBot(seatIndex) {
    if (this.status !== 'LOBBY') return false;
    if (this.seats[seatIndex] && this.seats[seatIndex].isBot) {
      this.seats[seatIndex] = null;
      return true;
    }
    return false;
  }

  toggleReady(userId) {
    const seat = this.seats.find(s => s && s.id === userId);
    if (seat && !seat.isBot) {
      seat.ready = !seat.ready;
      return seat.ready;
    }
    return false;
  }

  canStart() {
    if (this.status !== 'LOBBY') return false;
    if (!this.isFull()) return false;
    // All human players must be ready
    return this.seats.every(s => s.isBot || s.ready);
  }

  startGame() {
    if (!this.canStart()) {
      throw new Error('All 4 seats must be occupied and players must be ready.');
    }

    // Deduct entry stakes for human players
    for (const seat of this.seats) {
      if (!seat.isBot) {
        const deduction = coinService.deductStake(seat.id, this.tableStake, this.code);
        if (!deduction.success) {
          throw new Error(`${seat.name} has insufficient coins (${deduction.balance} < ${this.tableStake}).`);
        }
      }
    }

    this.status = 'PLAYING';
    this.game = new CallBreakGame({
      id: this.code,
      players: this.seats.map(s => ({ ...s })),
      totalRounds: this.totalRounds
    });

    this.game.startRound();
    return this.game;
  }

  getLobbyView() {
    return {
      code: this.code,
      hostId: this.hostId,
      isPrivate: this.isPrivate,
      tableStake: this.tableStake,
      totalRounds: this.totalRounds,
      status: this.status,
      seats: this.seats.map((seat, index) => {
        if (!seat) return null;
        return {
          seatIndex: index,
          id: seat.id,
          name: seat.name,
          isHost: seat.id === this.hostId,
          isBot: seat.isBot,
          botDifficulty: seat.botDifficulty,
          ready: seat.ready,
          connected: seat.connected
        };
      })
    };
  }
}

export class RoomManager {
  constructor() {
    this.rooms = new Map(); // code -> Room
    this.playerRoomMap = new Map(); // socketId / userId -> code
  }

  generateRoomCode() {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom({ hostId, hostName, isPrivate = true, tableStake = ECONOMY.DEFAULT_TABLE_STAKE, totalRounds = 5 }) {
    const code = this.generateRoomCode();
    const room = new Room({ code, hostId, hostName, isPrivate, tableStake, totalRounds });
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase());
  }

  findQuickPlayRoom() {
    // Find public room with available seats in LOBBY status
    for (const room of this.rooms.values()) {
      if (!room.isPrivate && room.status === 'LOBBY' && !room.isFull()) {
        return room;
      }
    }
    return null;
  }

  removeRoom(code) {
    this.rooms.delete(code.toUpperCase());
  }
}

export const roomManager = new RoomManager();

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ClientIO } from 'socket.io-client';
import { setupSocketHandlers } from '../src/socket/socketHandler.js';
import { SOCKET_EVENTS } from '../../shared/constants.js';

describe('Socket.IO End-to-End Multiplayer Flow', () => {
  let server, io, port, serverUrl;
  let client1, client2;

  before(async () => {
    const app = express();
    server = http.createServer(app);
    io = new Server(server);
    setupSocketHandlers(io);

    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        serverUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (client1) client1.disconnect();
    if (client2) client2.disconnect();
    if (io) io.close();
    if (server) {
      await new Promise((res) => server.close(res));
    }
  });

  test('Two clients connect, create room, fill bots, start game, and receive private hands', async () => {
    client1 = ClientIO(serverUrl, { reconnection: false, forceNew: true });
    client2 = ClientIO(serverUrl, { reconnection: false, forceNew: true });

    const u1Id = `u1_${Date.now()}`;
    const u2Id = `u2_${Date.now()}`;

    await new Promise((resolve) => {
      let connectedCount = 0;
      const onConnect = () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      };
      client1.on('connect', onConnect);
      client2.on('connect', onConnect);
    });

    // 1. Client 1 initializes user profile
    const user1 = await new Promise((resolve) => {
      client1.emit('user:init', { userId: u1Id, name: 'Alice' }, (res) => resolve(res.user));
    });
    assert.strictEqual(user1.coins, 1000);

    // 2. Client 1 creates room
    const createRes = await new Promise((resolve) => {
      client1.emit(SOCKET_EVENTS.ROOM_CREATE, {
        userId: u1Id,
        name: 'Alice',
        isPrivate: true,
        tableStake: 100,
        totalRounds: 1
      }, resolve);
    });
    assert.ok(createRes.success);
    const roomCode = createRes.room.code;

    // 3. Client 2 joins room
    const joinRes = await new Promise((resolve) => {
      client2.emit(SOCKET_EVENTS.ROOM_JOIN, {
        roomCode,
        userId: u2Id,
        name: 'Bob'
      }, resolve);
    });
    assert.ok(joinRes.success);

    // 4. Fill remaining seats with bots
    const fillRes = await new Promise((resolve) => {
      client1.emit(SOCKET_EVENTS.ROOM_FILL_BOTS, { difficulty: 'easy' }, resolve);
    });
    assert.ok(fillRes.success);
    assert.strictEqual(fillRes.room.seats.length, 4);

    // 5. Client 2 sets ready
    await new Promise((resolve) => {
      client2.emit(SOCKET_EVENTS.ROOM_READY, {}, resolve);
    });

    // 6. Start game and verify both clients receive their own private hands
    const gameStatePromise1 = new Promise((resolve) => {
      client1.on(SOCKET_EVENTS.GAME_STATE, (state) => resolve(state));
    });
    const gameStatePromise2 = new Promise((resolve) => {
      client2.on(SOCKET_EVENTS.GAME_STATE, (state) => resolve(state));
    });

    const startRes = await new Promise((resolve) => {
      client1.emit(SOCKET_EVENTS.ROOM_START, {}, resolve);
    });
    assert.ok(startRes.success);

    const state1 = await gameStatePromise1;
    const state2 = await gameStatePromise2;

    assert.strictEqual(state1.myHand.length, 13);
    assert.strictEqual(state2.myHand.length, 13);

    // Verify privacy: state1 only contains client1's hand
    const cardIds1 = new Set(state1.myHand.map(c => c.id));
    const cardIds2 = new Set(state2.myHand.map(c => c.id));

    // The two hands must have 0 overlapping cards!
    for (const id of cardIds1) {
      assert.strictEqual(cardIds2.has(id), false, `Card ${id} leaked between players!`);
    }

    // Opponent seat should only show cardCount
    const seat0InState2 = state2.seats.find(s => s.id === u1Id);
    assert.strictEqual(seat0InState2.cardCount, 13);
    assert.strictEqual(seat0InState2.hand, undefined, 'Hidden hand was leaked to opponent!');
  });

  test('Out-of-turn card play or bid returns failure and does not disrupt game state', async () => {
    // Client 2 attempts to play a card when it is bidding phase or not their turn
    const playRes = await new Promise((resolve) => {
      client2.emit(SOCKET_EVENTS.PLAYER_PLAY_CARD, { card: { id: 'S_A', suit: 'S', rank: 'A', value: 14 } }, resolve);
    });
    assert.strictEqual(playRes.success, false);
    assert.ok(playRes.error.includes('turn') || playRes.error.includes('phase'));

    // Client 2 attempts to bid when it may not be their turn
    const currentTurnRes = await new Promise((resolve) => {
      client2.emit(SOCKET_EVENTS.PLAYER_BID, { bid: 3 }, resolve);
    });
    // Should fail cleanly if not client2's turn
    if (!currentTurnRes.success) {
      assert.ok(currentTurnRes.error.includes('turn') || currentTurnRes.error.includes('phase'));
    }
  });
});

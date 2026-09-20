import { roomManager } from '../rooms/roomManager.js';
import { coinService } from '../services/coinService.js';
import { BotEngine } from '../bots/botEngine.js';
import { SOCKET_EVENTS, GAME_PHASES } from '../../../shared/constants.js';

const BOT_STEP_DELAY = process.env.BOT_DELAY !== undefined ? parseInt(process.env.BOT_DELAY, 10) : 800;

export function setupSocketHandlers(io) {
  // Helper to send individual sanitized state to each player in room
  function broadcastGameState(room) {
    if (!room || !room.game) return;

    for (const seat of room.seats) {
      if (seat && !seat.isBot && seat.socketId) {
        const playerView = room.game.getPlayerView(seat.id);
        io.to(seat.socketId).emit(SOCKET_EVENTS.GAME_STATE, playerView);
      }
    }
  }

  // Helper to broadcast room lobby updates
  function broadcastLobbyState(room) {
    if (!room) return;
    io.to(room.code).emit(SOCKET_EVENTS.ROOM_UPDATE, room.getLobbyView());
  }

  // Turn timeout map: roomCode -> Timer
  const turnTimeoutMap = new Map();

  function clearRoomTurnTimeout(roomCode) {
    if (turnTimeoutMap.has(roomCode)) {
      clearTimeout(turnTimeoutMap.get(roomCode));
      turnTimeoutMap.delete(roomCode);
    }
  }

  // Automates bot turns and schedules 15s turn timeout for human players
  function scheduleTurnAction(room) {
    if (!room || !room.game) return;
    const game = room.game;

    if (game.phase !== GAME_PHASES.BIDDING && game.phase !== GAME_PHASES.PLAYING) {
      clearRoomTurnTimeout(room.code);
      return;
    }

    clearRoomTurnTimeout(room.code);

    const currentSeatIndex = game.currentTurn;
    const activeSeat = room.seats[currentSeatIndex];
    if (!activeSeat) return;

    const isBotOrDisconnected = activeSeat.isBot || !activeSeat.connected;
    const delay = isBotOrDisconnected ? BOT_STEP_DELAY : ((game.rules.TURN_TIMEOUT_SECONDS || 15) * 1000);

    const timer = setTimeout(() => {
      turnTimeoutMap.delete(room.code);
      // Re-verify room & game state after timeout
      if (!room || !room.game || room.game.currentTurn !== currentSeatIndex) return;

      if (game.phase === GAME_PHASES.BIDDING) {
        const hand = game.hands[activeSeat.id];
        const bid = BotEngine.calculateBid({
          hand,
          difficulty: activeSeat.botDifficulty || 'medium'
        });
        try {
          game.submitBid(activeSeat.id, bid);
          broadcastGameState(room);
          scheduleTurnAction(room);
        } catch (err) {
          console.error('Error in auto/bot bid:', err);
        }
      } else if (game.phase === GAME_PHASES.PLAYING) {
        const hand = game.hands[activeSeat.id];
        const card = BotEngine.selectCard({
          hand,
          currentTrick: game.currentTrick,
          bid: game.bids[activeSeat.id],
          tricksWon: game.tricksWon[activeSeat.id],
          difficulty: activeSeat.botDifficulty || 'medium',
          rules: game.rules
        });

        try {
          const result = game.playCard(activeSeat.id, card);
          broadcastGameState(room);

          if (result.trickResolved) {
            io.to(room.code).emit(SOCKET_EVENTS.TRICK_COMPLETE, result.trickResolved);

            // Bot reaction emote on trick win
            const winner = room.seats[result.trickResolved.winningSeatIndex];
            if (winner && winner.isBot && Math.random() < 0.45) {
              const emotes = ['👑', '👏', '♠️', '🔥', '🎯'];
              const phrases = ['Nice trick!', 'Let\'s go!', 'Good hand!'];
              const emote = emotes[Math.floor(Math.random() * emotes.length)];
              const phrase = phrases[Math.floor(Math.random() * phrases.length)];
              setTimeout(() => {
                io.to(room.code).emit(SOCKET_EVENTS.PLAYER_EMOTE, {
                  seatIndex: winner.seatIndex,
                  userId: winner.id,
                  name: winner.name,
                  emote,
                  phrase,
                  timestamp: Date.now()
                });
              }, 400);
            }

            // Wait a brief pause before next trick so players see trick resolution
            const trickTimer = setTimeout(() => {
              if (result.matchEnded) {
                // Award virtual coin pool to top winners
                handleMatchEndEconomy(room);
                io.to(room.code).emit(SOCKET_EVENTS.MATCH_COMPLETE, {
                  rankings: game.rankings,
                  roundHistory: game.roundHistory
                });
              } else if (result.roundEnded) {
                io.to(room.code).emit(SOCKET_EVENTS.ROUND_COMPLETE, {
                  roundNumber: game.round - 1,
                  scores: game.roundScores,
                  matchScores: game.matchScores
                });
              } else {
                broadcastGameState(room);
                scheduleTurnAction(room);
              }
            }, 1200);
            if (trickTimer.unref) trickTimer.unref();
          } else {
            scheduleTurnAction(room);
          }
        } catch (err) {
          console.error('Error in auto/bot card play:', err);
        }
      }
    }, delay);

    if (timer.unref) timer.unref();
    turnTimeoutMap.set(room.code, timer);
  }

  function handleMatchEndEconomy(room) {
    if (!room || !room.game || !room.game.rankings) return;
    const rankings = room.game.rankings;
    const totalPrizePool = room.tableStake * 4;

    // Rank 1 gets 60%, Rank 2 gets 40% (Virtual Coins)
    const prize1 = Math.round(totalPrizePool * 0.6);
    const prize2 = Math.round(totalPrizePool * 0.4);

    const winner1 = rankings[0];
    const winner2 = rankings[1];

    if (winner1) {
      coinService.awardReward(winner1.playerId, prize1, room.code, 1);
    }
    if (winner2) {
      coinService.awardReward(winner2.playerId, prize2, room.code, 2);
    }
  }

  io.on('connection', (socket) => {
    let currentRoomCode = null;
    let currentUserId = null;

    // 1. Initial Handshake & User registration
    socket.on('user:init', ({ userId, name }, callback) => {
      currentUserId = userId;
      const user = coinService.getUser(userId, name);
      if (typeof callback === 'function') {
        callback({ success: true, user });
      }
    });

    // 2. Claim daily / bankrupt bonus
    socket.on('user:claimBonus', ({ userId }, callback) => {
      const result = coinService.claimBonus(userId || currentUserId);
      if (typeof callback === 'function') {
        callback(result);
      }
    });

    // 3. Create Room
    socket.on(SOCKET_EVENTS.ROOM_CREATE, ({ userId, name, isPrivate, tableStake, totalRounds }, callback) => {
      try {
        currentUserId = userId;
        const room = roomManager.createRoom({
          hostId: userId,
          hostName: name,
          isPrivate: isPrivate !== false,
          tableStake: tableStake || 100,
          totalRounds: totalRounds || 5
        });

        room.addPlayer({ id: userId, name, socketId: socket.id });
        currentRoomCode = room.code;
        socket.join(room.code);

        if (typeof callback === 'function') {
          callback({ success: true, room: room.getLobbyView() });
        }
        broadcastLobbyState(room);
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 4. Join Room
    socket.on(SOCKET_EVENTS.ROOM_JOIN, ({ roomCode, userId, name }, callback) => {
      try {
        currentUserId = userId;
        const room = roomManager.getRoom(roomCode);
        if (!room) {
          return callback && callback({ success: false, error: 'Room not found.' });
        }

        const joinResult = room.addPlayer({ id: userId, name, socketId: socket.id });
        currentRoomCode = room.code;
        socket.join(room.code);

        if (typeof callback === 'function') {
          callback({ success: true, room: room.getLobbyView(), reconnected: joinResult.reconnected });
        }

        broadcastLobbyState(room);

        // If reconnecting to an ongoing game, send fresh game state
        if (room.status === 'PLAYING' && room.game) {
          const playerView = room.game.getPlayerView(userId);
          socket.emit(SOCKET_EVENTS.GAME_STATE, playerView);
          triggerBotActionIfNeeded(room);
        }
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 5. Quick Play Matchmaking
    socket.on('room:quickPlay', ({ userId, name }, callback) => {
      try {
        currentUserId = userId;
        let room = roomManager.findQuickPlayRoom();

        if (!room) {
          // Create 1-round fast public room
          room = roomManager.createRoom({
            hostId: userId,
            hostName: name,
            isPrivate: false,
            tableStake: 100,
            totalRounds: 1
          });
        }

        room.addPlayer({ id: userId, name, socketId: socket.id });
        currentRoomCode = room.code;
        socket.join(room.code);

        // Auto-fill bots to launch quick game instantly
        room.fillBots('medium');

        if (typeof callback === 'function') {
          callback({ success: true, room: room.getLobbyView() });
        }
        broadcastLobbyState(room);
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 6. Fill Bots in Lobby
    socket.on(SOCKET_EVENTS.ROOM_FILL_BOTS, ({ difficulty }, callback) => {
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return callback && callback({ success: false, error: 'Room not found.' });

      room.fillBots(difficulty || 'medium');
      broadcastLobbyState(room);
      if (typeof callback === 'function') callback({ success: true, room: room.getLobbyView() });
    });

    // 7. Kick Bot
    socket.on(SOCKET_EVENTS.ROOM_KICK_BOT, ({ seatIndex }, callback) => {
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;
      room.kickBot(seatIndex);
      broadcastLobbyState(room);
      if (typeof callback === 'function') callback({ success: true });
    });

    // 8. Toggle Ready
    socket.on(SOCKET_EVENTS.ROOM_READY, (_, callback) => {
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;
      const isReady = room.toggleReady(currentUserId);
      broadcastLobbyState(room);
      if (typeof callback === 'function') callback({ success: true, ready: isReady });
    });

    // 9. Start Game
    socket.on(SOCKET_EVENTS.ROOM_START, (_, callback) => {
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return callback && callback({ success: false, error: 'Room not found.' });

      try {
        room.startGame();
        broadcastLobbyState(room);
        broadcastGameState(room);
        if (typeof callback === 'function') callback({ success: true });
        scheduleTurnAction(room);
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 10. Player Bid
    socket.on(SOCKET_EVENTS.PLAYER_BID, ({ bid }, callback) => {
      const room = roomManager.getRoom(currentRoomCode);
      if (!room || !room.game) return;

      if (room.game.phase !== GAME_PHASES.BIDDING) {
        if (typeof callback === 'function') callback({ success: false, error: 'Not in bidding phase' });
        return;
      }

      const activeSeat = room.seats[room.game.currentTurn];
      if (!activeSeat || activeSeat.id !== currentUserId) {
        if (typeof callback === 'function') callback({ success: false, error: 'Not your turn to bid' });
        return;
      }

      try {
        room.game.submitBid(currentUserId, bid);
        clearRoomTurnTimeout(currentRoomCode);
        broadcastGameState(room);
        if (typeof callback === 'function') callback({ success: true });
        scheduleTurnAction(room);
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 11. Player Play Card
    socket.on(SOCKET_EVENTS.PLAYER_PLAY_CARD, ({ card }, callback) => {
      const room = roomManager.getRoom(currentRoomCode);
      if (!room || !room.game) return;

      if (room.game.phase !== GAME_PHASES.PLAYING) {
        if (typeof callback === 'function') callback({ success: false, error: 'Not in playing phase' });
        return;
      }

      const activeSeat = room.seats[room.game.currentTurn];
      if (!activeSeat || activeSeat.id !== currentUserId) {
        if (typeof callback === 'function') callback({ success: false, error: 'Not your turn to play card' });
        return;
      }

      try {
        const result = room.game.playCard(currentUserId, card);
        clearRoomTurnTimeout(currentRoomCode);
        broadcastGameState(room);
        if (typeof callback === 'function') callback({ success: true });

        if (result.trickResolved) {
          io.to(room.code).emit(SOCKET_EVENTS.TRICK_COMPLETE, result.trickResolved);

          setTimeout(() => {
            if (result.matchEnded) {
              handleMatchEndEconomy(room);
              io.to(room.code).emit(SOCKET_EVENTS.MATCH_COMPLETE, {
                rankings: room.game.rankings,
                roundHistory: room.game.roundHistory
              });
            } else if (result.roundEnded) {
              io.to(room.code).emit(SOCKET_EVENTS.ROUND_COMPLETE, {
                roundNumber: room.game.round - 1,
                scores: room.game.roundScores,
                matchScores: room.game.matchScores
              });
            } else {
              broadcastGameState(room);
              scheduleTurnAction(room);
            }
          }, 1200);
        } else {
          scheduleTurnAction(room);
        }
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 12. Player Emote / Quick Reaction
    socket.on(SOCKET_EVENTS.PLAYER_EMOTE, ({ emote, phrase }, callback) => {
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;
      const seat = room.seats.find(s => s && s.id === currentUserId);
      if (!seat) return;

      io.to(room.code).emit(SOCKET_EVENTS.PLAYER_EMOTE, {
        seatIndex: seat.seatIndex,
        userId: currentUserId,
        name: seat.name,
        emote: emote || '👏',
        phrase: phrase || null,
        timestamp: Date.now()
      });

      if (typeof callback === 'function') callback({ success: true });
    });

    // 13. Next Round / Rematch
    socket.on(SOCKET_EVENTS.GAME_REMATCH, (_, callback) => {
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      try {
        if (room.game && room.game.phase === GAME_PHASES.ROUND_END) {
          // Advance to next round within the current match
          room.game.startRound();
          broadcastGameState(room);
          scheduleTurnAction(room);
          if (typeof callback === 'function') callback({ success: true });
        } else if (!room.game || room.game.phase === GAME_PHASES.MATCH_END) {
          // Start a brand-new match with the same seats/bots
          // Mark all seats ready so canStart() passes
          room.seats.forEach(s => { if (s) s.ready = true; });

          // Auto-top-up any human player below tableStake
          for (const seat of room.seats) {
            if (seat && !seat.isBot) {
              const user = coinService.getUser(seat.id);
              if (user && user.coins < room.tableStake) {
                coinService.claimBonus(seat.id);
              }
            }
          }

          room.status = 'LOBBY'; // startGame() requires LOBBY status to deduct stakes
          room.startGame();      // Deducts stakes, creates new CallBreakGame, starts Round 1
          broadcastGameState(room);
          scheduleTurnAction(room);
          if (typeof callback === 'function') callback({ success: true });
        }
      } catch (err) {
        // Graceful fallback – return all players to the lobby
        room.status = 'LOBBY';
        room.game = null;
        broadcastLobbyState(room);
        io.to(room.code).emit(SOCKET_EVENTS.GAME_STATE, null);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // 13b. Room Leave (voluntary)
    socket.on(SOCKET_EVENTS.ROOM_LEAVE, (_, callback) => {
      if (!currentRoomCode) {
        if (typeof callback === 'function') callback({ success: true });
        return;
      }
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        room.removePlayer(currentUserId);
        socket.leave(currentRoomCode);
        broadcastLobbyState(room);
        if (room.status === 'PLAYING') {
          broadcastGameState(room);
          scheduleTurnAction(room);
        }
      }
      currentRoomCode = null;
      if (typeof callback === 'function') callback({ success: true });
    });

    // 13. Disconnect
    socket.on('disconnect', () => {
      if (!currentRoomCode || !currentUserId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      room.removePlayer(currentUserId);
      broadcastLobbyState(room);

      if (room.status === 'PLAYING') {
        broadcastGameState(room);
        // If it's this disconnected player's turn, bot takes over automatically
        scheduleTurnAction(room);
      }
    });
  });
}

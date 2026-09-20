import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '@shared/constants.js';
import { getStoredUser, saveUserPreferences } from '../services/storage.js';
import { soundEngine } from '../services/soundEngine.js';
import { haptics } from '../services/haptics.js';

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [lobbyState, setLobbyState] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [lastTrickResult, setLastTrickResult] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [activeEmotes, setActiveEmotes] = useState({});
  const [errorNotification, setErrorNotification] = useState(null);

  const socketRef = useRef(null);

  const clearError = useCallback(() => setErrorNotification(null), []);

  useEffect(() => {
    const user = getStoredUser();
    soundEngine.toggle(user.soundEnabled);

    const serverUrl = import.meta.env.VITE_SERVER_URL || undefined;
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Initialize or fetch user from server
      socket.emit('user:init', { userId: user.userId, name: user.name }, (res) => {
        if (res?.success) {
          setUserProfile(res.user);
        }
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on(SOCKET_EVENTS.ROOM_UPDATE, (lobby) => {
      setLobbyState(lobby);
    });

    socket.on(SOCKET_EVENTS.GAME_STATE, (state) => {
      setGameState(state);
      // Play alert and haptics if it's currently my turn
      if (state.phase === 'PLAYING' && state.currentTurn === state.mySeatIndex) {
        soundEngine.playTurnAlert();
        haptics.vibrateYourTurn();
      } else if (state.phase === 'BIDDING' && state.currentTurn === state.mySeatIndex && state.myHand && !state.seats[state.mySeatIndex]?.bid) {
        soundEngine.playTurnAlert();
        haptics.vibrateYourTurn();
      }
    });

    socket.on(SOCKET_EVENTS.TRICK_COMPLETE, (trickResult) => {
      soundEngine.playTrickWin();
      haptics.vibrateTrickWin();
      setLastTrickResult(trickResult);
    });

    socket.on(SOCKET_EVENTS.PLAYER_EMOTE, (data) => {
      soundEngine.playClick();
      setActiveEmotes(prev => ({
        ...prev,
        [data.seatIndex]: data
      }));
    });

    socket.on(SOCKET_EVENTS.ROUND_COMPLETE, (result) => {
      soundEngine.playVictory();
      setRoundResult(result);
    });

    socket.on(SOCKET_EVENTS.MATCH_COMPLETE, (result) => {
      soundEngine.playVictory();
      setMatchResult(result);
      // Re-fetch updated coins
      socket.emit('user:init', { userId: user.userId, name: user.name }, (res) => {
        if (res?.success) setUserProfile(res.user);
      });
    });

    socket.on(SOCKET_EVENTS.ERROR, (err) => {
      haptics.vibrateError();
      setErrorNotification(err.message || 'An error occurred');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((options, callback) => {
    if (!socketRef.current) return;
    const user = getStoredUser();
    socketRef.current.emit(SOCKET_EVENTS.ROOM_CREATE, {
      userId: user.userId,
      name: user.name,
      ...options
    }, (res) => {
      if (!res.success) {
        setErrorNotification(res.error);
      }
      if (callback) callback(res);
    });
  }, []);

  const joinRoom = useCallback((roomCode, callback) => {
    if (!socketRef.current) return;
    const user = getStoredUser();
    socketRef.current.emit(SOCKET_EVENTS.ROOM_JOIN, {
      roomCode,
      userId: user.userId,
      name: user.name
    }, (res) => {
      if (!res.success) {
        setErrorNotification(res.error);
      }
      if (callback) callback(res);
    });
  }, []);

  const quickPlay = useCallback((callback) => {
    if (!socketRef.current) return;
    const user = getStoredUser();
    socketRef.current.emit('room:quickPlay', {
      userId: user.userId,
      name: user.name
    }, (res) => {
      if (!res.success) setErrorNotification(res.error);
      if (callback) callback(res);
    });
  }, []);

  const fillBots = useCallback((difficulty = 'medium') => {
    socketRef.current?.emit(SOCKET_EVENTS.ROOM_FILL_BOTS, { difficulty });
  }, []);

  const kickBot = useCallback((seatIndex) => {
    socketRef.current?.emit(SOCKET_EVENTS.ROOM_KICK_BOT, { seatIndex });
  }, []);

  const toggleReady = useCallback(() => {
    soundEngine.playClick();
    socketRef.current?.emit(SOCKET_EVENTS.ROOM_READY);
  }, []);

  const startGame = useCallback(() => {
    soundEngine.playCardFlip();
    socketRef.current?.emit(SOCKET_EVENTS.ROOM_START, {}, (res) => {
      if (res && !res.success) setErrorNotification(res.error);
    });
  }, []);

  const submitBid = useCallback((bid) => {
    soundEngine.playClick();
    socketRef.current?.emit(SOCKET_EVENTS.PLAYER_BID, { bid }, (res) => {
      if (res && !res.success) setErrorNotification(res.error);
    });
  }, []);

  const playCard = useCallback((card) => {
    soundEngine.playCardPlay();
    socketRef.current?.emit(SOCKET_EVENTS.PLAYER_PLAY_CARD, { card }, (res) => {
      if (res && !res.success) setErrorNotification(res.error);
    });
  }, []);

  const rematch = useCallback(() => {
    soundEngine.playClick();
    setRoundResult(null);
    setMatchResult(null);
    socketRef.current?.emit(SOCKET_EVENTS.GAME_REMATCH);
  }, []);

  const claimBonus = useCallback(() => {
    const user = getStoredUser();
    socketRef.current?.emit('user:claimBonus', { userId: user.userId }, (res) => {
      if (res?.success) {
        soundEngine.playTrickWin();
        setUserProfile(prev => ({
          ...prev,
          coins: res.balance,
          lastBonusClaim: res.lastBonusClaim
        }));
      } else if (res?.error) {
        soundEngine.playClick();
        setErrorNotification(res.error);
      }
    });
  }, []);

  const updateProfile = useCallback((name, avatar) => {
    saveUserPreferences({ name, avatar });
    setUserProfile(prev => ({ ...prev, name, avatar }));
  }, []);

  const sendEmote = useCallback(({ emote, phrase }) => {
    if (!socketRef.current) return;
    socketRef.current.emit(SOCKET_EVENTS.PLAYER_EMOTE, { emote, phrase });
  }, []);

  const leaveRoom = useCallback(() => {
    setLobbyState(null);
    setGameState(null);
    setLastTrickResult(null);
    setRoundResult(null);
    setMatchResult(null);
    setActiveEmotes({});
  }, []);

  return {
    connected,
    userProfile,
    lobbyState,
    gameState,
    lastTrickResult,
    roundResult,
    matchResult,
    activeEmotes,
    sendEmote,
    errorNotification,
    clearError,
    createRoom,
    joinRoom,
    quickPlay,
    fillBots,
    kickBot,
    toggleReady,
    startGame,
    submitBid,
    playCard,
    rematch,
    claimBonus,
    updateProfile,
    leaveRoom
  };
}

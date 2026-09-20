/**
 * Shared constants for Call Break Arena
 */

export const SUITS = {
  SPADES: 'S',
  HEARTS: 'H',
  DIAMONDS: 'D',
  CLUBS: 'C'
};

export const SUIT_SYMBOLS = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣'
};

export const SUIT_COLORS = {
  S: '#0f172a', // deep navy/black
  H: '#dc2626', // rich red
  D: '#dc2626', // rich red
  C: '#0f172a'  // deep navy/black
};

export const SUIT_NAMES = {
  S: 'Spades',
  H: 'Hearts',
  D: 'Diamonds',
  C: 'Clubs'
};

export const TRUMP_SUIT = SUITS.SPADES;

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const RANK_VALUES = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14
};

export const GAME_PHASES = {
  LOBBY: 'LOBBY',
  DEALING: 'DEALING',
  BIDDING: 'BIDDING',
  PLAYING: 'PLAYING',
  TRICK_RESOLVING: 'TRICK_RESOLVING',
  ROUND_END: 'ROUND_END',
  MATCH_END: 'MATCH_END'
};

export const BOT_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const BOT_NAMES = [
  'Aria Bot',
  'Kiran Bot',
  'Dev Bot',
  'Maya Bot',
  'Siddharth Bot',
  'Rohan Bot',
  'Zara Bot',
  'Vikram Bot'
];

export const ECONOMY = {
  STARTING_COINS: 1000,
  DEFAULT_TABLE_STAKE: 100,
  MIN_COINS_FOR_PLAY: 100,
  DAILY_BONUS_AMOUNT: 500,
  BANKRUPT_THRESHOLD: 100
};

export const GAME_RULES = {
  TOTAL_PLAYERS: 4,
  CARDS_PER_PLAYER: 13,
  TOTAL_TRICKS: 13,
  MIN_BID: 1,
  MAX_BID: 8,
  DEFAULT_ROUNDS_PER_MATCH: 5,
  QUICK_PLAY_ROUNDS: 1,
  TURN_TIMEOUT_SECONDS: 15
};

export const SOCKET_EVENTS = {
  // Room Lifecycle
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_UPDATE: 'room:update',
  ROOM_READY: 'room:ready',
  ROOM_FILL_BOTS: 'room:fillBots',
  ROOM_KICK_BOT: 'room:kickBot',
  ROOM_START: 'room:start',

  // Game Lifecycle
  GAME_STATE: 'game:state',
  GAME_DEAL: 'game:deal',
  PLAYER_BID: 'player:bid',
  PLAYER_PLAY_CARD: 'player:playCard',
  TRICK_UPDATE: 'trick:update',
  TRICK_COMPLETE: 'trick:complete',
  ROUND_COMPLETE: 'round:complete',
  MATCH_COMPLETE: 'match:complete',
  GAME_REMATCH: 'game:rematch',

  // Social & Reactions
  PLAYER_EMOTE: 'player:emote',

  // System & Errors
  ERROR: 'system:error',
  NOTIFICATION: 'system:notification'
};

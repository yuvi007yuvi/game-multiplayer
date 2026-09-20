/**
 * Local storage manager for guest player profile and preferences
 */

const STORAGE_KEYS = {
  USER_ID: 'cb_arena_userId',
  USER_NAME: 'cb_arena_userName',
  AVATAR: 'cb_arena_avatar',
  SOUND_ENABLED: 'cb_arena_sound',
  ONBOARDED: 'cb_arena_onboarded'
};

export const AVATARS = [
  { id: 'tiger', icon: '🐅', label: 'Tiger' },
  { id: 'lion', icon: '🦁', label: 'Lion' },
  { id: 'falcon', icon: '🦅', label: 'Falcon' },
  { id: 'wolf', icon: '🐺', label: 'Wolf' },
  { id: 'dragon', icon: '🐉', label: 'Dragon' },
  { id: 'fox', icon: '🦊', label: 'Fox' },
  { id: 'king', icon: '👑', label: 'Emperor' },
  { id: 'thunder', icon: '⚡', label: 'Thunder' }
];

export const COOL_NAMES = [
  'ShadowSpade',
  'AceViper',
  'NeonWolf',
  'CardShark',
  'RoyalFlush',
  'ThunderAce',
  'SilentHawk',
  'MysticFox',
  'BlazeSpade',
  'CyberKing',
  'SpadeMaster',
  'PhantomPlayer'
];

export function getRandomCoolName() {
  const base = COOL_NAMES[Math.floor(Math.random() * COOL_NAMES.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${base}_${num}`;
}

export function hasUserOnboarded() {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
}

export function markUserOnboarded() {
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
}

export function getStoredUser() {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }

  let name = localStorage.getItem(STORAGE_KEYS.USER_NAME);
  if (!name) {
    name = getRandomCoolName();
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  }

  let avatar = localStorage.getItem(STORAGE_KEYS.AVATAR);
  if (!avatar) {
    avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)].icon;
    localStorage.setItem(STORAGE_KEYS.AVATAR, avatar);
  }

  let soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
  soundEnabled = soundEnabled !== null ? soundEnabled === 'true' : true;

  return { userId, name, avatar, soundEnabled };
}

export function saveUserPreferences({ name, avatar, soundEnabled }) {
  if (name) localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  if (avatar) localStorage.setItem(STORAGE_KEYS.AVATAR, avatar);
  if (soundEnabled !== undefined) {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(soundEnabled));
  }
}

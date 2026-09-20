/**
 * Local storage manager for guest player profile and preferences
 */

const STORAGE_KEYS = {
  USER_ID: 'cb_arena_userId',
  USER_NAME: 'cb_arena_userName',
  AVATAR: 'cb_arena_avatar',
  SOUND_ENABLED: 'cb_arena_sound'
};

export const AVATARS = [
  { id: 'tiger', icon: '🐅', label: 'Tiger' },
  { id: 'lion', icon: '🦁', label: 'Lion' },
  { id: 'falcon', icon: '🦅', label: 'Falcon' },
  { id: 'wolf', icon: '🐺', label: 'Wolf' },
  { id: 'fox', icon: '🦊', label: 'Fox' },
  { id: 'dragon', icon: '🐉', label: 'Dragon' }
];

export function getStoredUser() {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }

  let name = localStorage.getItem(STORAGE_KEYS.USER_NAME);
  if (!name) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    name = `Player ${randomSuffix}`;
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

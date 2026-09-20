/**
 * Haptic feedback service for mobile devices.
 * Uses navigator.vibrate with safe feature detection and fallback.
 */

class HapticsService {
  constructor() {
    this.enabled = true;
  }

  toggle(enable) {
    this.enabled = enable !== undefined ? Boolean(enable) : !this.enabled;
    return this.enabled;
  }

  isSupported() {
    return (
      typeof window !== 'undefined' &&
      'navigator' in window &&
      typeof navigator.vibrate === 'function'
    );
  }

  vibrate(pattern) {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration permissions or platform restrictions
    }
  }

  /**
   * Crisp, subtle 15ms pulse when a card is played
   */
  vibrateCardPlay() {
    this.vibrate(15);
  }

  /**
   * Celebratory pattern when winning a trick
   */
  vibrateTrickWin() {
    this.vibrate([30, 50, 40]);
  }

  /**
   * Gentle double-pulse alerting the user it is their turn
   */
  vibrateYourTurn() {
    this.vibrate([25, 40, 25]);
  }

  /**
   * Urgent short pulse when turn countdown is under 3 seconds
   */
  vibrateWarning() {
    this.vibrate([15, 30, 15]);
  }

  /**
   * Buzz on invalid card or action attempt
   */
  vibrateError() {
    this.vibrate([50, 40, 50]);
  }
}

export const haptics = new HapticsService();

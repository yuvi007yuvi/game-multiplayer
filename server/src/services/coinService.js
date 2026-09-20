import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ECONOMY } from '../../../shared/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export class VirtualCoinService {
  constructor() {
    this.users = new Map();
    this.processedTransactions = new Set();
    this.initStorage();
  }

  initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf8');
        const data = JSON.parse(raw);
        for (const [id, user] of Object.entries(data.users || {})) {
          this.users.set(id, user);
        }
        for (const txId of data.processedTransactions || []) {
          this.processedTransactions.add(txId);
        }
      }
    } catch (err) {
      console.warn('Could not load existing user data; starting fresh in memory:', err.message);
    }
  }

  saveStorage() {
    try {
      const data = {
        users: Object.fromEntries(this.users.entries()),
        processedTransactions: Array.from(this.processedTransactions).slice(-500) // Keep last 500 tx ids
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('Could not persist user data to disk:', err.message);
    }
  }

  /**
   * Gets or initializes user profile and coin balance
   */
  getUser(userId, name = 'Guest') {
    if (!this.users.has(userId)) {
      const newUser = {
        id: userId,
        name,
        coins: ECONOMY.STARTING_COINS,
        createdAt: new Date().toISOString(),
        lastBonusClaim: null,
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalScore: 0
        },
        transactions: [
          {
            id: `tx_${crypto.randomUUID()}`,
            type: 'WELCOME_BONUS',
            amount: ECONOMY.STARTING_COINS,
            balanceAfter: ECONOMY.STARTING_COINS,
            timestamp: new Date().toISOString(),
            description: 'Welcome bonus (Virtual Coins only - no real money value)'
          }
        ]
      };
      this.users.set(userId, newUser);
      this.saveStorage();
    }
    return this.users.get(userId);
  }

  getBalance(userId) {
    const user = this.getUser(userId);
    return user.coins;
  }

  /**
   * Deducts table stake idempotently
   */
  deductStake(userId, amount, tableId) {
    const txKey = `stake:${tableId}:${userId}`;
    if (this.processedTransactions.has(txKey)) {
      return { success: true, balance: this.getBalance(userId), message: 'Already deducted' };
    }

    const user = this.getUser(userId);
    if (user.coins < amount) {
      return { success: false, balance: user.coins, error: 'Insufficient virtual coins' };
    }

    user.coins -= amount;
    this.processedTransactions.add(txKey);

    const tx = {
      id: `tx_${crypto.randomUUID()}`,
      type: 'TABLE_STAKE',
      amount: -amount,
      balanceAfter: user.coins,
      timestamp: new Date().toISOString(),
      description: `Table entry fee for ${tableId}`
    };
    user.transactions.unshift(tx);
    if (user.transactions.length > 50) user.transactions.pop();

    this.saveStorage();
    return { success: true, balance: user.coins, txId: tx.id };
  }

  /**
   * Awards match reward idempotently
   */
  awardReward(userId, amount, matchId, rank = 1) {
    const txKey = `reward:${matchId}:${userId}`;
    if (this.processedTransactions.has(txKey)) {
      return { success: true, balance: this.getBalance(userId), message: 'Already rewarded' };
    }

    const user = this.getUser(userId);
    user.coins += amount;
    user.stats.gamesPlayed += 1;
    if (rank === 1) user.stats.gamesWon += 1;

    this.processedTransactions.add(txKey);

    const tx = {
      id: `tx_${crypto.randomUUID()}`,
      type: 'MATCH_WINNINGS',
      amount,
      balanceAfter: user.coins,
      timestamp: new Date().toISOString(),
      description: `Rank #${rank} prize for match ${matchId}`
    };
    user.transactions.unshift(tx);
    if (user.transactions.length > 50) user.transactions.pop();

    this.saveStorage();
    return { success: true, balance: user.coins, txId: tx.id };
  }

  claimBonus(userId) {
    const user = this.getUser(userId);
    const cooldownMs = ECONOMY.DAILY_BONUS_COOLDOWN_MS || (24 * 60 * 60 * 1000);

    // Enforce 24-hour daily bonus cooldown
    if (user.lastBonusClaim) {
      const lastClaimTime = new Date(user.lastBonusClaim).getTime();
      const elapsed = Date.now() - lastClaimTime;
      if (elapsed < cooldownMs) {
        const remainingMs = cooldownMs - elapsed;
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMins = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        return {
          success: false,
          error: `Daily bonus already claimed! Next bonus available in ${remainingHours}h ${remainingMins}m.`,
          remainingMs,
          balance: user.coins,
          lastBonusClaim: user.lastBonusClaim
        };
      }
    }

    const bonusAmount = ECONOMY.DAILY_BONUS_AMOUNT;
    user.coins += bonusAmount;
    user.lastBonusClaim = new Date().toISOString();

    const tx = {
      id: `tx_${crypto.randomUUID()}`,
      type: 'DAILY_BONUS',
      amount: bonusAmount,
      balanceAfter: user.coins,
      timestamp: user.lastBonusClaim,
      description: 'Daily virtual coin reload bonus'
    };
    user.transactions.unshift(tx);
    if (user.transactions.length > 50) user.transactions.pop();

    this.saveStorage();
    return {
      success: true,
      balance: user.coins,
      amount: bonusAmount,
      lastBonusClaim: user.lastBonusClaim
    };
  }
}

export const coinService = new VirtualCoinService();

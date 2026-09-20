import { test, describe } from 'node:test';
import assert from 'node:assert';
import { VirtualCoinService } from '../src/services/coinService.js';
import { ECONOMY } from '../../shared/constants.js';

describe('Virtual Economy & Daily Bonus Cooldown', () => {
  test('New user starts with 1,000 coins and empty bonus claim', () => {
    const service = new VirtualCoinService();
    const testId = `test_${Date.now()}_1`;
    const user = service.getUser(testId, 'TestPlayer');

    assert.strictEqual(user.coins, 1000);
    assert.strictEqual(user.lastBonusClaim, null);
  });

  test('User can claim daily bonus once, increasing balance by 500', () => {
    const service = new VirtualCoinService();
    const testId = `test_${Date.now()}_2`;
    service.getUser(testId, 'TestPlayer');

    const result = service.claimBonus(testId);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.balance, 1500);
    assert.strictEqual(result.amount, ECONOMY.DAILY_BONUS_AMOUNT);
    assert.ok(result.lastBonusClaim);
  });

  test('Immediate repeated bonus claim is rejected with cooldown error and leaves balance untouched', () => {
    const service = new VirtualCoinService();
    const testId = `test_${Date.now()}_3`;
    service.getUser(testId, 'TestPlayer');

    // First claim: succeeds
    const firstResult = service.claimBonus(testId);
    assert.strictEqual(firstResult.success, true);
    assert.strictEqual(firstResult.balance, 1500);

    // Second claim immediately: must fail!
    const secondResult = service.claimBonus(testId);
    assert.strictEqual(secondResult.success, false);
    assert.ok(secondResult.error.includes('already claimed'));
    assert.ok(secondResult.remainingMs > 0);

    // Verify balance was NOT incremented
    const user = service.getUser(testId);
    assert.strictEqual(user.coins, 1500, 'Balance must remain 1500 and not allow duplicate claims');
  });
});

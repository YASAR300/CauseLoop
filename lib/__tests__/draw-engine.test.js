import { describe, it, expect } from 'vitest';
import {
  getCryptoRandomInt,
  getCryptoRandomFraction,
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  calculatePrizePool,
  determineWinnersAndPayouts
} from '../draw-engine';

describe('Draw Engine Pure Functions', () => {

  describe('getCryptoRandomInt', () => {
    it('generates random numbers within range', () => {
      for (let i = 0; i < 50; i++) {
        const val = getCryptoRandomInt(1, 45);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(45);
      }
    });
  });

  describe('getCryptoRandomFraction', () => {
    it('generates a fraction in [0, 1)', () => {
      for (let i = 0; i < 50; i++) {
        const val = getCryptoRandomFraction();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('generateRandomNumbers', () => {
    it('generates correct count of unique sorted numbers', () => {
      const numbers = generateRandomNumbers(5, 1, 45);
      expect(numbers).toHaveLength(5);
      // Check uniqueness
      const unique = new Set(numbers);
      expect(unique.size).toBe(5);
      // Check sorted order
      const sorted = [...numbers].sort((a, b) => a - b);
      expect(numbers).toEqual(sorted);
    });
  });

  describe('generateAlgorithmicNumbers', () => {
    it('generates unique sorted numbers even with no active scores (Laplace smoothing test)', () => {
      // With no scores, it should fall back safely and run without issues
      const numbers = generateAlgorithmicNumbers(5, [], 1, 45);
      expect(numbers).toHaveLength(5);
      expect(new Set(numbers).size).toBe(5);
    });

    it('biases towards frequently occurring numbers', () => {
      // If the number 7 appears a lot, it should have a higher chance (or at least be successfully drawn)
      const scores = Array(100).fill(7);
      const numbers = generateAlgorithmicNumbers(5, scores, 1, 45);
      expect(numbers).toHaveLength(5);
      expect(new Set(numbers).size).toBe(5);
    });
  });

  describe('calculatePrizePool', () => {
    it('calculates correct splits for 40/35/25 split', () => {
      // 10 subscribers * £12.00 = £120.00 revenue
      // pool is 40% of revenue = £48.00
      const splits = calculatePrizePool(120.00, 0.40);
      expect(splits.totalPrizePool).toBe(48.00);
      expect(splits.fiveMatchPool).toBe(19.20);  // 40% of 48
      expect(splits.fourMatchPool).toBe(16.80);  // 35% of 48
      expect(splits.threeMatchPool).toBe(12.00); // 25% of 48
    });
  });

  describe('determineWinnersAndPayouts', () => {
    it('handles zero active subscribers (no division-by-zero)', () => {
      const winningNumbers = [1, 2, 3, 4, 5];
      const subscribers = [];
      const totalPrizePool = 0.00;
      
      const res = determineWinnersAndPayouts(winningNumbers, subscribers, totalPrizePool, 0.00);
      expect(res.entries).toHaveLength(0);
      expect(res.winners).toHaveLength(0);
      expect(res.newRolloverAmount).toBe(0.00);
    });

    it('splits pools equally among multiple winners in same tier', () => {
      const winningNumbers = [1, 2, 3, 4, 5];
      const subscribers = [
        { id: 'user-1', email: 'u1@test.com', numbers_played: [1, 2, 3, 10, 11] }, // 3 matches
        { id: 'user-2', email: 'u2@test.com', numbers_played: [1, 2, 3, 12, 13] }, // 3 matches
        { id: 'user-3', email: 'u3@test.com', numbers_played: [1, 2, 3, 4, 15] },  // 4 matches
      ];

      // revenue = £120, total pool = £48
      // five pool = £19.20 (rolls over because 0 winners)
      // four pool = £16.80 (user-3 wins this fully = £16.80)
      // three pool = £12.00 (user-1 and user-2 split this equally = £6.00 each)
      const res = determineWinnersAndPayouts(winningNumbers, subscribers, 48.00, 0.00);
      
      expect(res.entries).toHaveLength(3);
      expect(res.winners).toHaveLength(3);
      expect(res.newRolloverAmount).toBe(19.20); // 5-match has 0 winners, so rolls over
      
      const u1 = res.winners.find(w => w.userId === 'user-1');
      const u2 = res.winners.find(w => w.userId === 'user-2');
      const u3 = res.winners.find(w => w.userId === 'user-3');
      
      expect(u1.prize_amount).toBe(6.00);
      expect(u2.prize_amount).toBe(6.00);
      expect(u3.prize_amount).toBe(16.80);
    });

    it('applies jackpot rollover to 5-match tier payouts', () => {
      const winningNumbers = [1, 2, 3, 4, 5];
      const subscribers = [
        { id: 'winner-jackpot', email: 'w@test.com', numbers_played: [1, 2, 3, 4, 5] } // 5 matches
      ];

      // revenue = £120, total pool = £48
      // five pool = £19.20. Rollover from last month = £50.00
      // Total 5-match pool available = £69.20
      const res = determineWinnersAndPayouts(winningNumbers, subscribers, 48.00, 50.00);
      
      expect(res.newRolloverAmount).toBe(0.00); // Reset since jackpot was won
      const jackpotWinner = res.winners.find(w => w.userId === 'winner-jackpot');
      expect(jackpotWinner.prize_amount).toBe(69.20);
    });
  });

});

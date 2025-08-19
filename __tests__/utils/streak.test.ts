/**
 * NOTE: This is a sample test file.
 * A testing framework like Vitest or Jest needs to be set up to run these tests.
 */
/*
import { calculateCurrentStreak } from '../../utils/streak';

// Helper to get a date string for N days ago
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

describe('calculateCurrentStreak', () => {
  it('should return 0 for an empty history', () => {
    expect(calculateCurrentStreak([])).toBe(0);
  });

  it('should return 1 for a single completion today', () => {
    const history = [{ date: daysAgo(0), completed: true }];
    expect(calculateCurrentStreak(history)).toBe(1);
  });

  it('should return 1 for a single completion yesterday', () => {
    const history = [{ date: daysAgo(1), completed: true }];
    expect(calculateCurrentStreak(history)).toBe(1);
  });

  it('should return 0 if the last completion was 2 days ago', () => {
    const history = [{ date: daysAgo(2), completed: true }];
    expect(calculateCurrentStreak(history)).toBe(0);
  });

  it('should calculate a continuous streak ending today', () => {
    const history = [
      { date: daysAgo(0), completed: true },
      { date: daysAgo(1), completed: true },
      { date: daysAgo(2), completed: true },
    ];
    expect(calculateCurrentStreak(history)).toBe(3);
  });
  
  it('should calculate a continuous streak ending yesterday', () => {
    const history = [
      { date: daysAgo(1), completed: true },
      { date: daysAgo(2), completed: true },
      { date: daysAgo(3), completed: true },
    ];
    expect(calculateCurrentStreak(history)).toBe(3);
  });

  it('should correctly handle a broken streak', () => {
    const history = [
      { date: daysAgo(0), completed: true },
      { date: daysAgo(1), completed: true },
      // Gap on day 2
      { date: daysAgo(3), completed: true },
      { date: daysAgo(4), completed: true },
    ];
    expect(calculateCurrentStreak(history)).toBe(2);
  });
  
  it('should ignore non-completed entries', () => {
    const history = [
      { date: daysAgo(0), completed: true },
      { date: daysAgo(1), completed: true },
      { date: daysAgo(2), completed: false }, // Not completed
      { date: daysAgo(3), completed: true },
    ];
    expect(calculateCurrentStreak(history)).toBe(2);
  });
});
*/
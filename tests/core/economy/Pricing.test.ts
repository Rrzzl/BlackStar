import { describe, it, expect } from 'vitest';
import { calcPrice } from '@core/economy/Pricing';

describe('Pricing', () => {
  it('returns low price at equilibrium (ratio = 1)', () => {
    expect(calcPrice(100, 1)).toBe(40);
  });

  it('caps multiplier at 2.0 when stockpile = 0', () => {
    expect(calcPrice(100, 0)).toBe(200);
  });

  it('floors multiplier at 0.4 when stockpile is glutted', () => {
    expect(calcPrice(100, 2)).toBe(40);
  });

  it('is monotonic — more stock means lower (or equal) price', () => {
    const scarce = calcPrice(100, 0.2);
    const normal = calcPrice(100, 1.0);
    const glut = calcPrice(100, 2.0);
    expect(scarce).toBeGreaterThan(normal);
    expect(normal).toBeGreaterThanOrEqual(glut);
  });
});

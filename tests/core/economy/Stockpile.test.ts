import { describe, it, expect } from 'vitest';
import { Stockpile } from '@core/economy/Stockpile';

describe('Stockpile', () => {
  it('starts at equilibrium quantity by default', () => {
    const s = new Stockpile('iron_ore', 100);
    expect(s.quantity).toBe(100);
    expect(s.ratio()).toBe(1);
  });

  it('produces to increase stock', () => {
    const s = new Stockpile('iron_ore', 100);
    s.produce(25);
    expect(s.quantity).toBe(125);
    expect(s.ratio()).toBeCloseTo(1.25);
  });

  it('consumes to decrease stock, floored at 0', () => {
    const s = new Stockpile('iron_ore', 100);
    s.consume(150);
    expect(s.quantity).toBe(0);
  });

  it('remove() returns actual amount removed when stock is short', () => {
    const s = new Stockpile('iron_ore', 100);
    const removed = s.remove(150);
    expect(removed).toBe(100);
    expect(s.quantity).toBe(0);
  });

  it('add() is bounded by a maximum of 5x equilibrium', () => {
    const s = new Stockpile('iron_ore', 100);
    s.add(10_000);
    expect(s.quantity).toBe(500);
  });
});

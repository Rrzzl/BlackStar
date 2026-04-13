import { describe, it, expect } from 'vitest';
import { Trader, TraderState, type StationLike } from '@core/economy/Trader';
import { Stockpile } from '@core/economy/Stockpile';

function makeStations(): { a: StationLike; b: StationLike } {
  return {
    a: { id: 'A', stockpiles: new Map([['grain', new Stockpile('grain', 100, 30)]]) },
    b: { id: 'B', stockpiles: new Map([['grain', new Stockpile('grain', 100, 170)]]) },
  };
}

describe('Trader', () => {
  it('starts in Idle state', () => {
    const t = new Trader('t1', 'hauler');
    expect(t.state).toBe(TraderState.Idle);
  });

  it('plans a route from glut to scarce station', () => {
    const { a, b } = makeStations();
    const t = new Trader('t1', 'hauler');
    t.plan([a, b], ['grain']);
    expect(t.currentRoute?.from).toBe('B');
    expect(t.currentRoute?.to).toBe('A');
    expect(t.currentRoute?.good).toBe('grain');
  });

  it('picks the good with the biggest delta when given several', () => {
    const a: StationLike = {
      id: 'A',
      stockpiles: new Map<string, Stockpile>([
        ['grain', new Stockpile('grain', 100, 100)],
        ['meds', new Stockpile('meds', 100, 10)],
      ]),
    };
    const b: StationLike = {
      id: 'B',
      stockpiles: new Map<string, Stockpile>([
        ['grain', new Stockpile('grain', 100, 100)],
        ['meds', new Stockpile('meds', 100, 190)],
      ]),
    };
    const t = new Trader('t1', 'hauler');
    t.plan([a, b], ['grain', 'meds']);
    expect(t.currentRoute?.good).toBe('meds');
  });
});

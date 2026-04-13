import { describe, it, expect } from 'vitest';
import { calcPowerBudget } from '@core/ship/PowerBudget';
import { Loadout } from '@core/ship/Loadout';
import type { HullDef } from '@core/ship/HullDef';
import type { ModuleDef } from '@core/ship/ModuleDef';

const shrike: HullDef = {
  id: 'shrike',
  name: 'Shrike',
  tier: 1,
  baseHp: 100,
  baseShield: 50,
  baseSpeed: 120,
  baseTurn: 2.5,
  basePower: 80,
  slots: { weapon: 2, internal: 2, utility: 1, core: 1 },
};
const laser: ModuleDef = {
  id: 'laser',
  name: 'Laser',
  slot: 'weapon',
  powerDraw: 15,
  description: '',
  stats: {},
};
const reactor: ModuleDef = {
  id: 'reactor',
  name: 'Reactor',
  slot: 'core',
  powerDraw: -40,
  description: '',
  stats: {},
};

describe('PowerBudget', () => {
  it('equals basePower with no modules installed', () => {
    const lo = new Loadout(shrike);
    const b = calcPowerBudget(lo);
    expect(b.available).toBe(80);
    expect(b.used).toBe(0);
    expect(b.remaining).toBe(80);
    expect(b.overbudget).toBe(false);
  });

  it('subtracts each module powerDraw', () => {
    const lo = new Loadout(shrike);
    lo.install(laser);
    lo.install(laser);
    const b = calcPowerBudget(lo);
    expect(b.used).toBe(30);
    expect(b.remaining).toBe(50);
  });

  it('reactor cores increase available power (negative draw)', () => {
    const lo = new Loadout(shrike);
    lo.install(reactor);
    const b = calcPowerBudget(lo);
    expect(b.available).toBe(120);
    expect(b.remaining).toBe(120);
  });

  it('flags overbudget when used > available', () => {
    const lo = new Loadout(shrike);
    lo.install({ ...laser, powerDraw: 100 });
    const b = calcPowerBudget(lo);
    expect(b.overbudget).toBe(true);
  });
});

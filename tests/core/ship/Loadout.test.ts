import { describe, it, expect } from 'vitest';
import { Loadout, LoadoutError } from '@core/ship/Loadout';
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
  stats: { damage: 8 },
};
const shield: ModuleDef = {
  id: 'shield',
  name: 'Shield',
  slot: 'internal',
  powerDraw: 20,
  description: '',
  stats: { shield: 30 },
};

describe('Loadout', () => {
  it('starts empty with every slot free', () => {
    const lo = new Loadout(shrike);
    expect(lo.slotsFree('weapon')).toBe(2);
    expect(lo.slotsFree('internal')).toBe(2);
    expect(lo.installed()).toHaveLength(0);
  });

  it('installs a module into a matching slot', () => {
    const lo = new Loadout(shrike);
    lo.install(laser);
    expect(lo.slotsFree('weapon')).toBe(1);
    expect(lo.installed()).toEqual([laser]);
  });

  it('rejects installing when the hull has zero of that slot type', () => {
    const noCoreHull: HullDef = { ...shrike, slots: { ...shrike.slots, core: 0 } };
    const lo = new Loadout(noCoreHull);
    const core: ModuleDef = { ...laser, slot: 'core' };
    expect(() => lo.install(core)).toThrow(LoadoutError);
  });

  it('rejects installing when the slot is full', () => {
    const lo = new Loadout(shrike);
    lo.install(laser);
    lo.install(laser);
    expect(() => lo.install(laser)).toThrow(LoadoutError);
  });

  it('uninstalls a specific module', () => {
    const lo = new Loadout(shrike);
    lo.install(laser);
    lo.install(shield);
    lo.uninstall(laser);
    expect(lo.slotsFree('weapon')).toBe(2);
    expect(lo.installed()).toEqual([shield]);
  });
});

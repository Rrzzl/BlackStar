import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveStore } from '@engine/Save';
import type { SaveSnapshot, Migration } from '@core/world/SaveSnapshot';

function makeSnap(): SaveSnapshot {
  return {
    version: 2,
    seed: 1,
    worldClock: 0,
    captain: {
      name: 'A',
      species: 'human',
      klass: 'gunslinger',
      paint: '#fff',
      createdAt: 0,
      deaths: 0,
    },
    ship: {
      hullId: 'shrike',
      moduleIds: [],
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      angle: 0,
      hp: 100,
      shield: 50,
      credits: 0,
      cargo: [],
    },
    sector: { id: 'grayline-reach', traders: [], stockpiles: [], playerBody: null },
    inventory: { items: [] },
    factions: {},
    quests: { active: [], completed: [] },
    outposts: {},
    scene: { type: 'SpaceScene' },
  };
}

describe('SaveStore', () => {
  let storage: Map<string, string>;
  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
      removeItem: (k: string) => {
        storage.delete(k);
      },
      clear: () => {
        storage.clear();
      },
    });
  });

  it('saves and loads a snapshot', () => {
    const store = new SaveStore('test-slot', []);
    const snap = makeSnap();
    store.save(snap);
    const loaded = store.load();
    expect(loaded).toEqual(snap);
  });

  it('returns null when no save exists', () => {
    const store = new SaveStore('empty', []);
    expect(store.load()).toBeNull();
  });

  it('applies migrations on load', () => {
    storage.set(
      'black-star:save:slotA',
      JSON.stringify({ ...makeSnap(), version: 0 }),
    );
    const migrations: Migration[] = [
      { from: 0, to: 1, apply: (raw) => ({ ...raw, version: 1 }) },
      { from: 1, to: 2, apply: (raw) => ({ ...raw, version: 2 }) },
    ];
    const store = new SaveStore('slotA', migrations);
    const loaded = store.load();
    expect(loaded?.version).toBe(2);
  });
});

import { describe, it, expect } from 'vitest';
import {
  CURRENT_SAVE_VERSION,
  migrate,
  type SaveSnapshot,
  type Migration,
} from '@core/world/SaveSnapshot';

function fixture(version: number): Record<string, unknown> {
  return {
    version,
    seed: 12345,
    worldClock: 0,
    captain: {
      name: 'Rook',
      species: 'human',
      klass: 'gunslinger',
      paint: '#b94a3a',
      createdAt: 0,
      deaths: 0,
    },
    ship: {
      hullId: 'shrike',
      moduleIds: ['pulse_laser_i', 'armor_plate_i'],
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      angle: 0,
      hp: 100,
      shield: 50,
      credits: 500,
      cargo: [],
    },
    sector: { id: 'grayline-reach', traders: [], stockpiles: [], playerBody: null, enemies: [] },
    inventory: { items: [] },
    factions: { free_worlds: { rep: 0 }, scrapfather: { rep: 0 } },
    quests: { active: [], completed: [] },
    outposts: {},
    scene: { type: 'SpaceScene' },
  };
}

describe('SaveSnapshot', () => {
  it('round-trips through JSON unchanged', () => {
    const snap = fixture(CURRENT_SAVE_VERSION) as unknown as SaveSnapshot;
    const rehydrated = JSON.parse(JSON.stringify(snap));
    expect(rehydrated).toEqual(snap);
  });

  it('migrates v0 → v1 by adding deaths field', () => {
    const v0 = fixture(CURRENT_SAVE_VERSION);
    v0.version = 0;
    delete (v0.captain as Record<string, unknown>).deaths;

    const migrations: Migration[] = [
      {
        from: 0,
        to: 1,
        apply: (raw) => {
          const captain = { ...(raw.captain as Record<string, unknown>), deaths: 0 };
          return { ...raw, captain, version: 1 };
        },
      },
      {
        from: 1,
        to: 2,
        apply: (raw) => {
          const sector = { ...(raw.sector as Record<string, unknown>), playerBody: null };
          return { ...raw, sector, version: 2 };
        },
      },
      {
        from: 2,
        to: 3,
        apply: (raw) => {
          const sector = { ...(raw.sector as Record<string, unknown>), enemies: [] };
          return { ...raw, sector, version: 3 };
        },
      },
      {
        from: 3,
        to: 4,
        apply: (raw) => ({ ...raw, version: 4 }),
      },
    ];

    const migrated = migrate(v0, migrations);
    expect(migrated.version).toBe(4);
    expect(migrated.captain.deaths).toBe(0);
  });

  it('throws if no migration path exists', () => {
    const v0 = fixture(CURRENT_SAVE_VERSION);
    v0.version = 0;
    expect(() => migrate(v0, [])).toThrow();
  });
});

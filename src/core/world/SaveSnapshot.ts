import type { CaptainState } from '@core/player/Captain';
import type { PlayerShipState } from '@core/player/PlayerShip';

export const CURRENT_SAVE_VERSION = 1;

export interface SaveSnapshot {
  version: number;
  seed: number;
  worldClock: number;
  captain: CaptainState;
  ship: PlayerShipState;
  sector: {
    id: string;
    traders: SerializedTrader[];
    stockpiles: SerializedStockpile[];
  };
  inventory: { items: Array<{ id: string; qty: number }> };
  factions: Record<string, { rep: number }>;
  quests: { active: string[]; completed: string[] };
  outposts: Record<
    string,
    { slots: Array<{ op: string; tier: number }>; credits: number }
  >;
  scene: { type: string; params?: Record<string, unknown> };
}

export interface SerializedTrader {
  id: string;
  archetype: string;
  position: { x: number; y: number };
  state: string;
  currentRoute: { from: string; to: string; good: string; quantity: number } | null;
  cargo: Array<{ goodId: string; qty: number }>;
}

export interface SerializedStockpile {
  stationId: string;
  goodId: string;
  quantity: number;
  equilibrium: number;
}

export interface Migration {
  from: number;
  to: number;
  apply(raw: Record<string, unknown>): Record<string, unknown>;
}

export function migrate(
  raw: Record<string, unknown>,
  migrations: readonly Migration[],
): SaveSnapshot {
  let current = raw;
  let version = (current.version as number | undefined) ?? 0;
  while (version < CURRENT_SAVE_VERSION) {
    const m = migrations.find((mm) => mm.from === version);
    if (!m) throw new Error(`No migration from save version ${version}`);
    current = m.apply(current);
    version = m.to;
  }
  return current as unknown as SaveSnapshot;
}

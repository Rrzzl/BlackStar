import { Stockpile } from "@core/economy/Stockpile";
import type { Station } from "@core/economy/Economy";

export interface SectorBody {
  id: string;
  name: string;
  kind: "planet" | "station" | "belt";
  faction: string | null;
  x: number;
  y: number;
  r: number;
}

interface RawStation {
  id: string;
  stockpiles: Array<{ goodId: string; equilibrium: number }>;
  production: Array<[string, number]>;
  consumption: Array<[string, number]>;
}

export interface RawRoute {
  from: string;
  to: string;
  count: number;
  goods: string[];
}

export interface SectorData {
  id: string;
  name: string;
  bounds: { w: number; h: number };
  bodies: SectorBody[];
  stations: RawStation[];
  traderCount: number;
  traderRoutes: RawRoute[];
}

export function buildStations(raw: readonly RawStation[]): Station[] {
  return raw.map((s) => ({
    id: s.id,
    stockpiles: new Map(
      s.stockpiles.map((sp) => [sp.goodId, new Stockpile(sp.goodId, sp.equilibrium)]),
    ),
    production: new Map(s.production),
    consumption: new Map(s.consumption),
  }));
}

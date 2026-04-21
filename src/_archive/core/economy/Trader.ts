// @ts-nocheck
/* eslint-disable */
import type { Stockpile } from './Stockpile';

export enum TraderState {
  Idle = 'idle',
  EnRouteToSource = 'enroute_src',
  Loading = 'loading',
  EnRouteToDest = 'enroute_dst',
  Unloading = 'unloading',
}

export type TraderArchetype =
  | 'hauler'
  | 'independent'
  | 'specialist'
  | 'opportunist'
  | 'smuggler';

export interface StationLike {
  readonly id: string;
  readonly stockpiles: ReadonlyMap<string, Stockpile>;
}

export interface TradeRoute {
  from: string;
  to: string;
  good: string;
  quantity: number;
  expectedProfit: number;
}

export class Trader {
  state: TraderState = TraderState.Idle;
  currentRoute: TradeRoute | null = null;
  cargo: Map<string, number> = new Map();

  constructor(
    readonly id: string,
    readonly archetype: TraderArchetype,
    readonly capacity: number = 50,
  ) {}

  plan(stations: readonly StationLike[], goodsOfInterest: readonly string[]): void {
    let best: TradeRoute | null = null;
    let bestScore = 0;
    for (const good of goodsOfInterest) {
      for (const src of stations) {
        for (const dst of stations) {
          if (src.id === dst.id) continue;
          const srcStock = src.stockpiles.get(good);
          const dstStock = dst.stockpiles.get(good);
          if (!srcStock || !dstStock) continue;
          const delta = srcStock.ratio() - dstStock.ratio();
          if (delta <= 0) continue;
          const qty = Math.min(this.capacity, Math.floor(srcStock.quantity * 0.25));
          if (qty <= 0) continue;
          const score = delta * qty;
          if (score > bestScore) {
            bestScore = score;
            best = {
              from: src.id,
              to: dst.id,
              good,
              quantity: qty,
              expectedProfit: score,
            };
          }
        }
      }
    }
    this.currentRoute = best;
  }
}
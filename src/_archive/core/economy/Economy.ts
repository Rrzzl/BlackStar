// @ts-nocheck
/* eslint-disable */
import type { GoodsRegistry } from './Goods';
import type { Stockpile } from './Stockpile';
import type { Trader } from './Trader';

export interface Station {
  id: string;
  stockpiles: Map<string, Stockpile>;
  production: Map<string, number>;
  consumption: Map<string, number>;
}

export class Economy {
  constructor(
    readonly goods: GoodsRegistry,
    readonly stations: Station[],
    readonly traders: Trader[],
  ) {}

  tick(dt: number): void {
    for (const st of this.stations) {
      for (const [goodId, rate] of st.production) {
        st.stockpiles.get(goodId)?.produce(rate * dt);
      }
      for (const [goodId, rate] of st.consumption) {
        st.stockpiles.get(goodId)?.consume(rate * dt);
      }
    }
  }

  replanIdleTraders(goodsOfInterest: readonly string[]): void {
    for (const t of this.traders) {
      if (t.currentRoute === null) t.plan(this.stations, goodsOfInterest);
    }
  }
}
// @ts-nocheck
/* eslint-disable */
export interface GoodDef {
  id: string;
  name: string;
  baseValue: number;
  mass: number;
}

export class GoodsRegistry {
  private readonly byId = new Map<string, GoodDef>();

  constructor(defs: readonly GoodDef[]) {
    for (const def of defs) this.byId.set(def.id, def);
  }

  get(id: string): GoodDef {
    const def = this.byId.get(id);
    if (!def) throw new Error(`Unknown good: ${id}`);
    return def;
  }

  all(): readonly GoodDef[] {
    return [...this.byId.values()];
  }
}
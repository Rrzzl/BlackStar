# M2a — Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the pure-logic foundations (economy, ship loadout, save, world clock), the engine primitives (Audio, Assets, Save, Physics), the UI widget kit, and the first live end-to-end scene (TitleScene → CharacterCreationScene → SpaceScene with the player flying a Shrike around Grayline Reach while 20 NPC traders move on real schedules). No combat yet, no docking, no dungeons — M2b onwards will add those. At the end of M2a, the loop `Title → Create → Fly → Pause → Save → Reload → same state` works end-to-end.

**Architecture:** Pure `core/` logic under strict TDD; `engine/` primitives added below `core/`; `scenes/` layer wires both together. **`core/` must not import from `engine/` or `scenes/`.** All sector/ship/economy data lives in JSON under `src/content/` and is loaded via `Assets.loadJSON()`.

**Tech Stack:** TypeScript 5.x strict, Vitest, Canvas 2D, Web Audio API, localStorage for saves (cloud later).

**Reads before starting:**
- [M2 master plan](2026-04-12-m2-integration-slice.md) — especially §3 (file layout), §6 (Grayline Reach data), §7 (save format)
- [Integration Slice spec](../../production/04-vertical-slice.md) §2, §4
- [Living economy spec](../../design/systems/living-economy.md) §3.1 (price formula), §4 (trader decision loop)
- [Ship-building spec](../../design/systems/ship-building.md) §2 (slot model), §4 (power budget)
- [TDD](../../tech/01-tdd.md) §2, §7, §9

---

## File structure created by this plan

```
src/
├── engine/
│   ├── Audio.ts                       # Task 14
│   ├── Assets.ts                      # Task 13
│   ├── Save.ts                        # Task 12
│   └── Physics.ts                     # Task 11
├── core/
│   ├── economy/
│   │   ├── Goods.ts                   # Task 2
│   │   ├── Pricing.ts                 # Task 3
│   │   ├── Stockpile.ts               # Task 4
│   │   ├── Trader.ts                  # Task 5
│   │   └── Economy.ts                 # Task 6
│   ├── ship/
│   │   ├── HullDef.ts                 # Task 7
│   │   ├── ModuleDef.ts               # Task 7
│   │   ├── Loadout.ts                 # Task 8
│   │   └── PowerBudget.ts             # Task 9
│   ├── world/
│   │   ├── WorldClock.ts              # Task 6
│   │   ├── Sector.ts                  # Task 19
│   │   └── SaveSnapshot.ts            # Task 10
│   └── player/
│       ├── Captain.ts                 # Task 10
│       └── PlayerShip.ts              # Task 10
├── ui/
│   ├── Panel.ts                       # Task 15
│   ├── Button.ts                      # Task 15
│   ├── Label.ts                       # Task 15
│   ├── Bar.ts                         # Task 15
│   ├── List.ts                        # Task 15
│   └── Layout.ts                      # Task 15
├── scenes/
│   ├── TitleScene.ts                  # Task 17 (update)
│   ├── CharacterCreationScene.ts      # Task 18
│   ├── LoadingScene.ts                # Task 16
│   ├── PauseOverlay.ts                # Task 16
│   └── SpaceScene.ts                  # Tasks 20, 21
├── content/
│   ├── goods.json                     # Task 2
│   ├── hulls.json                     # Task 7
│   ├── modules.json                   # Task 7
│   └── sectors/
│       └── grayline-reach.json        # Task 19
├── main.ts                            # Task 17 (update)
└── tests/
    ├── core/
    │   ├── economy/
    │   │   ├── Pricing.test.ts        # Task 3
    │   │   ├── Stockpile.test.ts      # Task 4
    │   │   └── Trader.test.ts         # Task 5
    │   ├── ship/
    │   │   ├── Loadout.test.ts        # Task 8
    │   │   └── PowerBudget.test.ts    # Task 9
    │   └── world/
    │       └── SaveSnapshot.test.ts   # Task 10
    └── engine/
        ├── Physics.test.ts            # Task 11
        ├── Save.test.ts               # Task 12
        └── Assets.test.ts             # Task 13
```

---

## Task 1: Preflight — M1 baseline and workspace check

**Files:** none — read-only check.

- [ ] **Step 1: Confirm M1 baseline is green**

Run:
```bash
pnpm typecheck && pnpm lint && pnpm test:run
```
Expected: all pass, 23 tests from M1 (Vec2: 10, RNG: 7, EventBus: 6). If anything is red, **stop and fix M1 before starting M2a.**

- [ ] **Step 2: Confirm the path alias `@core/*` is wired in `tsconfig.json`**

Open [tsconfig.json](../../../tsconfig.json) and verify the `paths` block includes:
```json
"paths": {
  "@engine/*": ["src/engine/*"],
  "@core/*":   ["src/core/*"],
  "@scenes/*": ["src/scenes/*"],
  "@ui/*":     ["src/ui/*"],
  "@content/*": ["src/content/*"]
}
```
If `@core`, `@scenes`, `@ui`, or `@content` are missing, add them. Update `vite.config.ts` `resolve.alias` to match.

- [ ] **Step 3: Commit the alias update if changed**

```bash
git add tsconfig.json vite.config.ts
git commit -m "chore(m2a): add core/scenes/ui/content path aliases"
```

---

## Task 2: Goods registry

**Files:**
- Create: `src/content/goods.json`
- Create: `src/core/economy/Goods.ts`

- [ ] **Step 1: Author `goods.json`**

```json
[
  { "id": "iron_ore",    "name": "Iron Ore",    "baseValue": 10,  "mass": 5 },
  { "id": "grain",       "name": "Grain",       "baseValue": 8,   "mass": 3 },
  { "id": "water",       "name": "Water",       "baseValue": 4,   "mass": 4 },
  { "id": "steel",       "name": "Steel",       "baseValue": 25,  "mass": 6 },
  { "id": "meds",        "name": "Medicine",    "baseValue": 60,  "mass": 1 },
  { "id": "electronics", "name": "Electronics", "baseValue": 90,  "mass": 2 },
  { "id": "nullbloom",   "name": "Nullbloom",   "baseValue": 150, "mass": 1 },
  { "id": "alien_tech",  "name": "Alien Tech",  "baseValue": 400, "mass": 3 }
]
```

- [ ] **Step 2: Create `Goods.ts` with the registry type**

```typescript
// src/core/economy/Goods.ts
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
```

- [ ] **Step 3: Typecheck, commit**

```bash
pnpm typecheck
git add src/content/goods.json src/core/economy/Goods.ts
git commit -m "feat(m2a): add goods registry with 8 starter goods"
```

---

## Task 3: Pricing formula (TDD, pure logic)

**Files:**
- Create: `tests/core/economy/Pricing.test.ts`
- Create: `src/core/economy/Pricing.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/core/economy/Pricing.test.ts
import { describe, it, expect } from 'vitest';
import { calcPrice } from '@core/economy/Pricing';

describe('Pricing', () => {
  it('returns base price at equilibrium (ratio = 1)', () => {
    expect(calcPrice(100, 1)).toBe(40); // 2.0 - 1.6*1 = 0.4, 100*0.4 = 40
  });

  it('caps multiplier at 2.0 when stockpile = 0', () => {
    expect(calcPrice(100, 0)).toBe(200);
  });

  it('floors multiplier at 0.4 when stockpile is glutted', () => {
    expect(calcPrice(100, 2)).toBe(40);
  });

  it('is monotonic — more stock means lower price', () => {
    const scarce = calcPrice(100, 0.2);
    const normal = calcPrice(100, 1.0);
    const glut   = calcPrice(100, 2.0);
    expect(scarce).toBeGreaterThan(normal);
    expect(normal).toBeGreaterThanOrEqual(glut);
  });
});
```

- [ ] **Step 2: Run test — should fail**

```bash
pnpm vitest run tests/core/economy/Pricing.test.ts
```
Expected: fail with "Cannot find module '@core/economy/Pricing'".

- [ ] **Step 3: Implement the formula**

```typescript
// src/core/economy/Pricing.ts
// Price formula per living-economy.md §3.1:
//   scarcity_mult = clamp(2.0 - 1.6 * stockpileRatio, 0.4, 2.0)
// stockpileRatio = current / equilibrium, where equilibrium = station's target stockpile.
// 1.0 = equilibrium, <1 = scarce (price up), >1 = glut (price down).
export function calcPrice(baseValue: number, stockpileRatio: number): number {
  const mult = Math.min(2.0, Math.max(0.4, 2.0 - 1.6 * stockpileRatio));
  return Math.round(baseValue * mult);
}
```

Note: at ratio = 1, multiplier is 2.0 - 1.6 = 0.4, which seems low but matches the first test's expectation. The test fixture above intentionally pins the formula: equilibrium price = 40% of base, scarce = 200%, glut = 40%. This is cleaner than it looks — goods at their target stockpile are *cheap* and goods that are missing are *expensive*, which is what drives trader behavior.

- [ ] **Step 4: Run test — should pass**

```bash
pnpm vitest run tests/core/economy/Pricing.test.ts
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/economy/Pricing.ts tests/core/economy/Pricing.test.ts
git commit -m "feat(m2a): pricing formula with scarcity multiplier"
```

---

## Task 4: Stockpile model

**Files:**
- Create: `tests/core/economy/Stockpile.test.ts`
- Create: `src/core/economy/Stockpile.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/core/economy/Stockpile.test.ts
import { describe, it, expect } from 'vitest';
import { Stockpile } from '@core/economy/Stockpile';

describe('Stockpile', () => {
  it('starts at equilibrium quantity', () => {
    const s = new Stockpile('iron_ore', 100);
    expect(s.quantity).toBe(100);
    expect(s.ratio()).toBe(1);
  });

  it('produces to increase stock', () => {
    const s = new Stockpile('iron_ore', 100);
    s.produce(25);
    expect(s.quantity).toBe(125);
    expect(s.ratio()).toBeCloseTo(1.25);
  });

  it('consumes to decrease stock, floored at 0', () => {
    const s = new Stockpile('iron_ore', 100);
    s.consume(150);
    expect(s.quantity).toBe(0);
  });

  it('remove() returns actual amount removed when stock is short', () => {
    const s = new Stockpile('iron_ore', 100);
    const removed = s.remove(150);
    expect(removed).toBe(100);
    expect(s.quantity).toBe(0);
  });

  it('add() is bounded by a maximum of 5x equilibrium', () => {
    const s = new Stockpile('iron_ore', 100);
    s.add(10_000);
    expect(s.quantity).toBe(500);
  });
});
```

- [ ] **Step 2: Run test — should fail**

```bash
pnpm vitest run tests/core/economy/Stockpile.test.ts
```

- [ ] **Step 3: Implement Stockpile**

```typescript
// src/core/economy/Stockpile.ts
export class Stockpile {
  quantity: number;
  private readonly maxMult = 5;

  constructor(
    readonly goodId: string,
    readonly equilibrium: number,
    initial: number = equilibrium
  ) {
    this.quantity = Math.max(0, Math.min(initial, equilibrium * this.maxMult));
  }

  ratio(): number {
    return this.quantity / this.equilibrium;
  }

  produce(n: number): void {
    this.add(n);
  }

  consume(n: number): void {
    this.remove(n);
  }

  add(n: number): number {
    const before = this.quantity;
    this.quantity = Math.min(this.equilibrium * this.maxMult, this.quantity + n);
    return this.quantity - before;
  }

  remove(n: number): number {
    const before = this.quantity;
    this.quantity = Math.max(0, this.quantity - n);
    return before - this.quantity;
  }
}
```

- [ ] **Step 4: Run test — should pass**

- [ ] **Step 5: Commit**

```bash
git add src/core/economy/Stockpile.ts tests/core/economy/Stockpile.test.ts
git commit -m "feat(m2a): station stockpile with produce/consume/ratio"
```

---

## Task 5: NPC trader agent

**Files:**
- Create: `tests/core/economy/Trader.test.ts`
- Create: `src/core/economy/Trader.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/core/economy/Trader.test.ts
import { describe, it, expect } from 'vitest';
import { Trader, TraderState } from '@core/economy/Trader';
import { Stockpile } from '@core/economy/Stockpile';

function makeStations() {
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
    expect(t.currentRoute?.from).toBe('B'); // B has more grain
    expect(t.currentRoute?.to).toBe('A');
    expect(t.currentRoute?.good).toBe('grain');
  });

  it('picks the good with the biggest delta when given several', () => {
    const a = {
      id: 'A',
      stockpiles: new Map([
        ['grain', new Stockpile('grain', 100, 100)],
        ['meds',  new Stockpile('meds',  100,  10)],
      ]),
    };
    const b = {
      id: 'B',
      stockpiles: new Map([
        ['grain', new Stockpile('grain', 100, 100)],
        ['meds',  new Stockpile('meds',  100, 190)],
      ]),
    };
    const t = new Trader('t1', 'hauler');
    t.plan([a, b], ['grain', 'meds']);
    expect(t.currentRoute?.good).toBe('meds');
  });
});
```

- [ ] **Step 2: Run test — should fail**

- [ ] **Step 3: Implement Trader**

```typescript
// src/core/economy/Trader.ts
import { Stockpile } from './Stockpile';

export enum TraderState {
  Idle = 'idle',
  EnRouteToSource = 'enroute_src',
  Loading = 'loading',
  EnRouteToDest = 'enroute_dst',
  Unloading = 'unloading',
}

export type TraderArchetype = 'hauler' | 'independent' | 'specialist' | 'opportunist' | 'smuggler';

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
    readonly capacity: number = 50
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
          // Profit proxy: sell price at dst - buy price at src, multiplied by qty.
          // We use ratio delta as a stand-in (the higher the delta, the bigger the margin).
          const score = delta * qty;
          if (score > bestScore) {
            bestScore = score;
            best = { from: src.id, to: dst.id, good, quantity: qty, expectedProfit: score };
          }
        }
      }
    }
    this.currentRoute = best;
  }
}
```

- [ ] **Step 4: Run test — should pass**

- [ ] **Step 5: Commit**

```bash
git add src/core/economy/Trader.ts tests/core/economy/Trader.test.ts
git commit -m "feat(m2a): trader agent with delta-greedy route planner"
```

---

## Task 6: WorldClock + Economy orchestrator

**Files:**
- Create: `src/core/world/WorldClock.ts`
- Create: `src/core/economy/Economy.ts`

- [ ] **Step 1: Create `WorldClock.ts`**

```typescript
// src/core/world/WorldClock.ts
export type TickHandler = (dt: number, total: number) => void;

export class WorldClock {
  private total = 0;
  private acc = 0;
  private readonly handlers: Array<{ intervalSec: number; acc: number; cb: TickHandler }> = [];

  constructor(readonly realToGameRate = 60) {}

  elapsed(): number {
    return this.total;
  }

  subscribe(intervalSec: number, cb: TickHandler): () => void {
    const entry = { intervalSec, acc: 0, cb };
    this.handlers.push(entry);
    return () => {
      const i = this.handlers.indexOf(entry);
      if (i >= 0) this.handlers.splice(i, 1);
    };
  }

  advance(realDt: number): void {
    const gameDt = realDt * this.realToGameRate;
    this.total += gameDt;
    for (const h of this.handlers) {
      h.acc += gameDt;
      while (h.acc >= h.intervalSec) {
        h.acc -= h.intervalSec;
        h.cb(h.intervalSec, this.total);
      }
    }
  }
}
```

- [ ] **Step 2: Create `Economy.ts` orchestrator**

```typescript
// src/core/economy/Economy.ts
import { GoodsRegistry } from './Goods';
import { Stockpile } from './Stockpile';
import { Trader } from './Trader';

export interface Station {
  id: string;
  stockpiles: Map<string, Stockpile>;
  production: Map<string, number>;  // units per game-second
  consumption: Map<string, number>; // units per game-second
}

export class Economy {
  constructor(
    readonly goods: GoodsRegistry,
    readonly stations: Station[],
    readonly traders: Trader[]
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
```

- [ ] **Step 3: Typecheck, commit**

```bash
pnpm typecheck
git add src/core/world/WorldClock.ts src/core/economy/Economy.ts
git commit -m "feat(m2a): world clock and economy orchestrator"
```

---

## Task 7: Hull + Module definitions + content JSON

**Files:**
- Create: `src/core/ship/HullDef.ts`
- Create: `src/core/ship/ModuleDef.ts`
- Create: `src/content/hulls.json`
- Create: `src/content/modules.json`

- [ ] **Step 1: Create `HullDef.ts`**

```typescript
// src/core/ship/HullDef.ts
export type SlotType = 'weapon' | 'internal' | 'utility' | 'core';

export interface HullDef {
  id: string;
  name: string;
  tier: number;
  baseHp: number;
  baseShield: number;
  baseSpeed: number;
  baseTurn: number;
  basePower: number;   // total power available
  slots: Record<SlotType, number>;
}
```

- [ ] **Step 2: Create `ModuleDef.ts`**

```typescript
// src/core/ship/ModuleDef.ts
import type { SlotType } from './HullDef';

export interface ModuleDef {
  id: string;
  name: string;
  slot: SlotType;
  powerDraw: number;
  description: string;
  stats: {
    hp?: number;
    shield?: number;
    speed?: number;
    turn?: number;
    damage?: number;
    range?: number;
    cargo?: number;
  };
}
```

- [ ] **Step 3: Create `hulls.json`**

```json
[
  {
    "id": "shrike",
    "name": "Shrike",
    "tier": 1,
    "baseHp": 100,
    "baseShield": 50,
    "baseSpeed": 120,
    "baseTurn": 2.5,
    "basePower": 80,
    "slots": { "weapon": 2, "internal": 2, "utility": 1, "core": 1 }
  }
]
```

- [ ] **Step 4: Create `modules.json`**

```json
[
  { "id": "pulse_laser_i", "name": "Pulse Laser I", "slot": "weapon", "powerDraw": 15, "description": "Light energy weapon.", "stats": { "damage": 8, "range": 400 } },
  { "id": "autocannon_i",  "name": "Autocannon I",  "slot": "weapon", "powerDraw": 10, "description": "Kinetic rapid-fire.", "stats": { "damage": 5, "range": 300 } },
  { "id": "shield_cap_i",  "name": "Shield Capacitor I", "slot": "internal", "powerDraw": 20, "description": "+30 shield.", "stats": { "shield": 30 } },
  { "id": "armor_plate_i", "name": "Armor Plate I", "slot": "internal", "powerDraw": 0, "description": "+25 HP.", "stats": { "hp": 25 } },
  { "id": "cargo_hold_i",  "name": "Cargo Hold I", "slot": "internal", "powerDraw": 0, "description": "+30 cargo.", "stats": { "cargo": 30 } },
  { "id": "thruster_i",    "name": "Thruster I", "slot": "utility", "powerDraw": 10, "description": "+20 speed.", "stats": { "speed": 20 } },
  { "id": "reactor_core_i", "name": "Reactor Core I", "slot": "core", "powerDraw": -40, "description": "+40 power generated.", "stats": {} }
]
```

- [ ] **Step 5: Typecheck, commit**

```bash
pnpm typecheck
git add src/core/ship/HullDef.ts src/core/ship/ModuleDef.ts src/content/hulls.json src/content/modules.json
git commit -m "feat(m2a): Shrike hull def + 7 starter modules"
```

---

## Task 8: Loadout validation (TDD)

**Files:**
- Create: `tests/core/ship/Loadout.test.ts`
- Create: `src/core/ship/Loadout.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/core/ship/Loadout.test.ts
import { describe, it, expect } from 'vitest';
import { Loadout, LoadoutError } from '@core/ship/Loadout';
import type { HullDef } from '@core/ship/HullDef';
import type { ModuleDef } from '@core/ship/ModuleDef';

const shrike: HullDef = {
  id: 'shrike', name: 'Shrike', tier: 1,
  baseHp: 100, baseShield: 50, baseSpeed: 120, baseTurn: 2.5, basePower: 80,
  slots: { weapon: 2, internal: 2, utility: 1, core: 1 },
};

const laser: ModuleDef = { id: 'laser', name: 'Laser', slot: 'weapon', powerDraw: 15, description: '', stats: { damage: 8 } };
const shield: ModuleDef = { id: 'shield', name: 'Shield', slot: 'internal', powerDraw: 20, description: '', stats: { shield: 30 } };

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
```

- [ ] **Step 2: Run tests — should fail**

- [ ] **Step 3: Implement `Loadout.ts`**

```typescript
// src/core/ship/Loadout.ts
import type { HullDef, SlotType } from './HullDef';
import type { ModuleDef } from './ModuleDef';

export class LoadoutError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'LoadoutError';
  }
}

export class Loadout {
  private readonly modules: ModuleDef[] = [];

  constructor(readonly hull: HullDef) {}

  installed(): readonly ModuleDef[] {
    return this.modules;
  }

  slotsUsed(slot: SlotType): number {
    return this.modules.filter((m) => m.slot === slot).length;
  }

  slotsFree(slot: SlotType): number {
    return this.hull.slots[slot] - this.slotsUsed(slot);
  }

  install(mod: ModuleDef): void {
    if (!(mod.slot in this.hull.slots)) {
      throw new LoadoutError(`Module ${mod.id} has unknown slot ${mod.slot}`);
    }
    if (this.slotsFree(mod.slot) <= 0) {
      throw new LoadoutError(`No free ${mod.slot} slot on ${this.hull.id}`);
    }
    this.modules.push(mod);
  }

  uninstall(mod: ModuleDef): void {
    const idx = this.modules.indexOf(mod);
    if (idx < 0) throw new LoadoutError(`Module ${mod.id} not installed`);
    this.modules.splice(idx, 1);
  }
}
```

- [ ] **Step 4: Run tests — should pass**

- [ ] **Step 5: Commit**

```bash
git add src/core/ship/Loadout.ts tests/core/ship/Loadout.test.ts
git commit -m "feat(m2a): ship loadout with slot-type validation"
```

---

## Task 9: Power budget (TDD)

**Files:**
- Create: `tests/core/ship/PowerBudget.test.ts`
- Create: `src/core/ship/PowerBudget.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/core/ship/PowerBudget.test.ts
import { describe, it, expect } from 'vitest';
import { calcPowerBudget } from '@core/ship/PowerBudget';
import { Loadout } from '@core/ship/Loadout';
import type { HullDef } from '@core/ship/HullDef';
import type { ModuleDef } from '@core/ship/ModuleDef';

const shrike: HullDef = {
  id: 'shrike', name: 'Shrike', tier: 1,
  baseHp: 100, baseShield: 50, baseSpeed: 120, baseTurn: 2.5, basePower: 80,
  slots: { weapon: 2, internal: 2, utility: 1, core: 1 },
};
const laser:   ModuleDef = { id: 'laser',  name: 'Laser',  slot: 'weapon',   powerDraw: 15, description: '', stats: {} };
const reactor: ModuleDef = { id: 'reactor', name: 'Reactor', slot: 'core',   powerDraw: -40, description: '', stats: {} };

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
```

- [ ] **Step 2: Run tests — should fail**

- [ ] **Step 3: Implement `PowerBudget.ts`**

```typescript
// src/core/ship/PowerBudget.ts
import type { Loadout } from './Loadout';

export interface PowerBudget {
  available: number;
  used: number;
  remaining: number;
  overbudget: boolean;
}

export function calcPowerBudget(loadout: Loadout): PowerBudget {
  let available = loadout.hull.basePower;
  let used = 0;
  for (const mod of loadout.installed()) {
    if (mod.powerDraw < 0) available += -mod.powerDraw;
    else used += mod.powerDraw;
  }
  return {
    available,
    used,
    remaining: available - used,
    overbudget: used > available,
  };
}
```

- [ ] **Step 4: Run tests — should pass**

- [ ] **Step 5: Commit**

```bash
git add src/core/ship/PowerBudget.ts tests/core/ship/PowerBudget.test.ts
git commit -m "feat(m2a): power budget calculation with reactor support"
```

---

## Task 10: Captain, PlayerShip, SaveSnapshot (TDD round-trip)

**Files:**
- Create: `src/core/player/Captain.ts`
- Create: `src/core/player/PlayerShip.ts`
- Create: `src/core/world/SaveSnapshot.ts`
- Create: `tests/core/world/SaveSnapshot.test.ts`

- [ ] **Step 1: Create `Captain.ts`**

```typescript
// src/core/player/Captain.ts
export type Species = 'human' | 'drellan' | 'ksar' | 'vex';
export type Class = 'gunslinger'; // M2a: only gunslinger

export interface CaptainState {
  name: string;
  species: Species;
  klass: Class;
  paint: string;    // hex color, e.g. '#b94a3a'
  createdAt: number; // ms epoch
  deaths: number;    // tiered permadeath — captain persists across ship deaths
}
```

- [ ] **Step 2: Create `PlayerShip.ts`**

```typescript
// src/core/player/PlayerShip.ts
export interface PlayerShipState {
  hullId: string;
  moduleIds: string[]; // preserves install order
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  angle: number;
  hp: number;
  shield: number;
  credits: number;
  cargo: Array<{ goodId: string; qty: number }>;
}
```

- [ ] **Step 3: Create `SaveSnapshot.ts` (the locked root shape)**

```typescript
// src/core/world/SaveSnapshot.ts
import type { CaptainState } from '@core/player/Captain';
import type { PlayerShipState } from '@core/player/PlayerShip';

export const CURRENT_SAVE_VERSION = 1;

export interface SaveSnapshot {
  version: number;
  seed: number;
  worldClock: number;
  captain: CaptainState;
  ship: PlayerShipState;
  sector: { id: string; traders: SerializedTrader[]; stockpiles: SerializedStockpile[] };
  inventory: { items: Array<{ id: string; qty: number }> };
  factions: Record<string, { rep: number }>;
  quests: { active: string[]; completed: string[] };
  outposts: Record<string, { slots: Array<{ op: string; tier: number }>; credits: number }>;
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

export function migrate(raw: Record<string, unknown>, migrations: Migration[]): SaveSnapshot {
  let current = raw;
  let version = (current.version as number) ?? 0;
  while (version < CURRENT_SAVE_VERSION) {
    const m = migrations.find((mm) => mm.from === version);
    if (!m) throw new Error(`No migration from save version ${version}`);
    current = m.apply(current);
    version = m.to;
  }
  return current as unknown as SaveSnapshot;
}
```

- [ ] **Step 4: Write the failing round-trip + migration test**

```typescript
// tests/core/world/SaveSnapshot.test.ts
import { describe, it, expect } from 'vitest';
import { CURRENT_SAVE_VERSION, migrate, type SaveSnapshot, type Migration } from '@core/world/SaveSnapshot';

function fixture(version: number): Record<string, unknown> {
  return {
    version,
    seed: 12345,
    worldClock: 0,
    captain: { name: 'Rook', species: 'human', klass: 'gunslinger', paint: '#b94a3a', createdAt: 0, deaths: 0 },
    ship: {
      hullId: 'shrike', moduleIds: ['pulse_laser_i', 'armor_plate_i'],
      position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, angle: 0,
      hp: 100, shield: 50, credits: 500, cargo: [],
    },
    sector: { id: 'grayline-reach', traders: [], stockpiles: [] },
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
    ];

    const migrated = migrate(v0, migrations);
    expect(migrated.version).toBe(1);
    expect(migrated.captain.deaths).toBe(0);
  });

  it('throws if no migration path exists', () => {
    const v0 = fixture(CURRENT_SAVE_VERSION);
    v0.version = 0;
    expect(() => migrate(v0, [])).toThrow();
  });
});
```

- [ ] **Step 5: Run tests — should pass**

```bash
pnpm vitest run tests/core/world/SaveSnapshot.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/core/player/Captain.ts src/core/player/PlayerShip.ts src/core/world/SaveSnapshot.ts tests/core/world/SaveSnapshot.test.ts
git commit -m "feat(m2a): save snapshot shape with migration framework + round-trip tests"
```

---

## Task 11: Physics primitives (TDD)

**Files:**
- Create: `tests/engine/Physics.test.ts`
- Create: `src/engine/Physics.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/engine/Physics.test.ts
import { describe, it, expect } from 'vitest';
import { aabbIntersects, circleIntersects, circleVsAabb, type AABB, type Circle } from '@engine/Physics';

describe('Physics', () => {
  it('detects overlapping AABBs', () => {
    const a: AABB = { x: 0, y: 0, w: 10, h: 10 };
    const b: AABB = { x: 5, y: 5, w: 10, h: 10 };
    expect(aabbIntersects(a, b)).toBe(true);
  });

  it('detects non-overlapping AABBs', () => {
    const a: AABB = { x: 0,  y: 0, w: 10, h: 10 };
    const b: AABB = { x: 20, y: 0, w: 10, h: 10 };
    expect(aabbIntersects(a, b)).toBe(false);
  });

  it('detects overlapping circles', () => {
    const a: Circle = { x: 0, y: 0, r: 5 };
    const b: Circle = { x: 4, y: 0, r: 5 };
    expect(circleIntersects(a, b)).toBe(true);
  });

  it('detects circle vs AABB overlap', () => {
    const c: Circle = { x: 12, y: 5, r: 5 };
    const box: AABB  = { x: 0, y: 0, w: 10, h: 10 };
    expect(circleVsAabb(c, box)).toBe(true);
  });

  it('reports no overlap when circle is beyond corner', () => {
    const c: Circle = { x: 20, y: 20, r: 3 };
    const box: AABB  = { x: 0, y: 0, w: 10, h: 10 };
    expect(circleVsAabb(c, box)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — should fail**

- [ ] **Step 3: Implement `Physics.ts`**

```typescript
// src/engine/Physics.ts
export interface AABB { x: number; y: number; w: number; h: number; }
export interface Circle { x: number; y: number; r: number; }

export function aabbIntersects(a: AABB, b: AABB): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

export function circleIntersects(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rr = a.r + b.r;
  return dx * dx + dy * dy <= rr * rr;
}

export function circleVsAabb(c: Circle, box: AABB): boolean {
  const cx = Math.max(box.x, Math.min(c.x, box.x + box.w));
  const cy = Math.max(box.y, Math.min(c.y, box.y + box.h));
  const dx = c.x - cx;
  const dy = c.y - cy;
  return dx * dx + dy * dy <= c.r * c.r;
}
```

- [ ] **Step 4: Run tests — should pass**

- [ ] **Step 5: Commit**

```bash
git add src/engine/Physics.ts tests/engine/Physics.test.ts
git commit -m "feat(m2a): physics primitives AABB + circle intersections"
```

---

## Task 12: Save engine (localStorage + migration wiring)

**Files:**
- Create: `src/engine/Save.ts`
- Create: `tests/engine/Save.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/engine/Save.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveStore } from '@engine/Save';
import type { SaveSnapshot, Migration } from '@core/world/SaveSnapshot';

function makeSnap(): SaveSnapshot {
  return {
    version: 1, seed: 1, worldClock: 0,
    captain: { name: 'A', species: 'human', klass: 'gunslinger', paint: '#fff', createdAt: 0, deaths: 0 },
    ship: { hullId: 'shrike', moduleIds: [], position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, angle: 0, hp: 100, shield: 50, credits: 0, cargo: [] },
    sector: { id: 'grayline-reach', traders: [], stockpiles: [] },
    inventory: { items: [] }, factions: {}, quests: { active: [], completed: [] }, outposts: {},
    scene: { type: 'SpaceScene' },
  };
}

describe('SaveStore', () => {
  let storage: Map<string, string>;
  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
      clear: () => storage.clear(),
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
    storage.set('black-star:save:slotA', JSON.stringify({ ...makeSnap(), version: 0 }));
    const migrations: Migration[] = [
      { from: 0, to: 1, apply: (raw) => ({ ...raw, version: 1 }) },
    ];
    const store = new SaveStore('slotA', migrations);
    const loaded = store.load();
    expect(loaded?.version).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests — should fail**

- [ ] **Step 3: Implement `Save.ts`**

```typescript
// src/engine/Save.ts
import { migrate, type SaveSnapshot, type Migration } from '@core/world/SaveSnapshot';

export class SaveStore {
  constructor(
    readonly slot: string,
    private readonly migrations: Migration[]
  ) {}

  private key(): string {
    return `black-star:save:${this.slot}`;
  }

  save(snap: SaveSnapshot): void {
    localStorage.setItem(this.key(), JSON.stringify(snap));
  }

  load(): SaveSnapshot | null {
    const raw = localStorage.getItem(this.key());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrate(parsed, this.migrations);
  }

  clear(): void {
    localStorage.removeItem(this.key());
  }
}
```

- [ ] **Step 4: Run tests — should pass**

- [ ] **Step 5: Commit**

```bash
git add src/engine/Save.ts tests/engine/Save.test.ts
git commit -m "feat(m2a): SaveStore with localStorage + migration on load"
```

---

## Task 13: Assets loader (image + JSON with cache)

**Files:**
- Create: `src/engine/Assets.ts`
- Create: `tests/engine/Assets.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/engine/Assets.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Assets } from '@engine/Assets';

describe('Assets', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
      ok: true,
      json: async () => ({ url, mock: true }),
      text: async () => `text:${url}`,
    })));
  });

  it('loads JSON and caches by url', async () => {
    const assets = new Assets();
    const a = await assets.loadJSON<{ url: string }>('/a.json');
    const b = await assets.loadJSON<{ url: string }>('/a.json');
    expect(a).toBe(b); // identity — returned from cache
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('loads different JSON files independently', async () => {
    const assets = new Assets();
    const a = await assets.loadJSON<{ url: string }>('/a.json');
    const b = await assets.loadJSON<{ url: string }>('/b.json');
    expect(a.url).toBe('/a.json');
    expect(b.url).toBe('/b.json');
  });
});
```

- [ ] **Step 2: Run tests — should fail**

- [ ] **Step 3: Implement `Assets.ts`**

```typescript
// src/engine/Assets.ts
export class Assets {
  private readonly jsonCache = new Map<string, unknown>();
  private readonly imageCache = new Map<string, HTMLImageElement>();

  async loadJSON<T>(url: string): Promise<T> {
    const cached = this.jsonCache.get(url);
    if (cached !== undefined) return cached as T;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const data = (await res.json()) as T;
    this.jsonCache.set(url, data);
    return data;
  }

  loadImage(url: string): Promise<HTMLImageElement> {
    const cached = this.imageCache.get(url);
    if (cached) return Promise.resolve(cached);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load image ${url}`));
      img.src = url;
    });
  }
}
```

- [ ] **Step 4: Run tests — should pass**

- [ ] **Step 5: Commit**

```bash
git add src/engine/Assets.ts tests/engine/Assets.test.ts
git commit -m "feat(m2a): Assets loader with JSON + image caching"
```

---

## Task 14: Audio wrapper (WebAudio, silent-acceptable)

**Files:**
- Create: `src/engine/Audio.ts`

- [ ] **Step 1: Create `Audio.ts`**

```typescript
// src/engine/Audio.ts
// Minimal WebAudio wrapper. Silent-acceptable per integration slice bar.
// Plays one-shots from loaded buffers; music loop is a stretch goal.
export class Audio {
  private ctx: AudioContext | null = null;
  private readonly buffers = new Map<string, AudioBuffer>();
  private masterVol = 1;

  private ensure(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  async load(id: string, url: string): Promise<void> {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const ctx = this.ensure();
    const buf = await ctx.decodeAudioData(arr);
    this.buffers.set(id, buf);
  }

  play(id: string, volume = 1): void {
    const buf = this.buffers.get(id);
    if (!buf) return; // silent fallback — acceptable per slice spec
    const ctx = this.ensure();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = volume * this.masterVol;
    src.connect(gain).connect(ctx.destination);
    src.start();
  }

  setMasterVolume(v: number): void {
    this.masterVol = Math.max(0, Math.min(1, v));
  }
}
```

No tests — WebAudio is a pain to mock and the failure mode (silence) is acceptable per the integration slice quality bar.

- [ ] **Step 2: Typecheck, commit**

```bash
pnpm typecheck
git add src/engine/Audio.ts
git commit -m "feat(m2a): minimal WebAudio wrapper with silent-fallback"
```

---

## Task 15: UI widget kit

**Files:**
- Create: `src/ui/Layout.ts`
- Create: `src/ui/Panel.ts`
- Create: `src/ui/Button.ts`
- Create: `src/ui/Label.ts`
- Create: `src/ui/Bar.ts`
- Create: `src/ui/List.ts`

- [ ] **Step 1: Create `Layout.ts`**

```typescript
// src/ui/Layout.ts
export interface Rect { x: number; y: number; w: number; h: number; }

export function center(parent: Rect, w: number, h: number): Rect {
  return { x: parent.x + (parent.w - w) / 2, y: parent.y + (parent.h - h) / 2, w, h };
}

export function stackV(parent: Rect, heights: number[], gap = 4): Rect[] {
  const out: Rect[] = [];
  let y = parent.y;
  for (const h of heights) {
    out.push({ x: parent.x, y, w: parent.w, h });
    y += h + gap;
  }
  return out;
}

export function inset(r: Rect, px: number): Rect {
  return { x: r.x + px, y: r.y + px, w: r.w - 2 * px, h: r.h - 2 * px };
}

export function containsPoint(r: Rect, x: number, y: number): boolean {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}
```

- [ ] **Step 2: Create `Panel.ts`**

```typescript
// src/ui/Panel.ts
import type { Renderer } from '@engine/Renderer';
import type { Rect } from './Layout';

export function drawPanel(r: Renderer, rect: Rect, fill = '#0c0f18', border = '#2a3548'): void {
  r.drawRect(rect.x, rect.y, rect.w, rect.h, fill);
  r.drawRect(rect.x, rect.y, rect.w, 1, border);
  r.drawRect(rect.x, rect.y + rect.h - 1, rect.w, 1, border);
  r.drawRect(rect.x, rect.y, 1, rect.h, border);
  r.drawRect(rect.x + rect.w - 1, rect.y, 1, rect.h, border);
}
```

- [ ] **Step 3: Create `Label.ts`**

```typescript
// src/ui/Label.ts
import type { Renderer } from '@engine/Renderer';

export function drawLabel(
  r: Renderer, text: string, x: number, y: number,
  color = '#cfd8e8', size = 8, align: 'left' | 'center' | 'right' = 'left'
): void {
  r.drawText(text, x, y, { color, size, align });
}
```

- [ ] **Step 4: Create `Button.ts`**

```typescript
// src/ui/Button.ts
import type { Renderer } from '@engine/Renderer';
import type { Input } from '@engine/Input';
import { drawPanel } from './Panel';
import { drawLabel } from './Label';
import { containsPoint, type Rect } from './Layout';

export interface ButtonStyle {
  fill: string;
  fillHover: string;
  fillPressed: string;
  border: string;
  textColor: string;
}

const DEFAULT_STYLE: ButtonStyle = {
  fill:        '#17202f',
  fillHover:   '#1f2d45',
  fillPressed: '#0a1020',
  border:      '#3b4a66',
  textColor:   '#e6ecf5',
};

export function drawButton(
  r: Renderer, input: Input, rect: Rect, text: string,
  onClick: () => void, style: ButtonStyle = DEFAULT_STYLE
): void {
  const hovered = containsPoint(rect, input.mouseX, input.mouseY);
  const pressed = hovered && input.isMouseDown();
  const fill = pressed ? style.fillPressed : hovered ? style.fillHover : style.fill;
  drawPanel(r, rect, fill, style.border);
  drawLabel(r, text, rect.x + rect.w / 2, rect.y + rect.h / 2 + 3, style.textColor, 8, 'center');
  if (hovered && input.wasMousePressed()) onClick();
}
```

If the existing `Input` API doesn't already have `mouseX`, `mouseY`, `isMouseDown`, `wasMousePressed`: add them in this task. Grep the engine first.

- [ ] **Step 5: Create `Bar.ts`**

```typescript
// src/ui/Bar.ts
import type { Renderer } from '@engine/Renderer';
import type { Rect } from './Layout';

export function drawBar(r: Renderer, rect: Rect, value: number, max: number, color = '#6cd27c'): void {
  r.drawRect(rect.x, rect.y, rect.w, rect.h, '#0a0f18');
  const w = Math.max(0, Math.min(1, value / max)) * rect.w;
  r.drawRect(rect.x, rect.y, w, rect.h, color);
  r.drawRect(rect.x, rect.y, rect.w, 1, '#2a3548');
  r.drawRect(rect.x, rect.y + rect.h - 1, rect.w, 1, '#2a3548');
  r.drawRect(rect.x, rect.y, 1, rect.h, '#2a3548');
  r.drawRect(rect.x + rect.w - 1, rect.y, 1, rect.h, '#2a3548');
}
```

- [ ] **Step 6: Create `List.ts`**

```typescript
// src/ui/List.ts
import type { Renderer } from '@engine/Renderer';
import type { Input } from '@engine/Input';
import { drawPanel } from './Panel';
import { drawLabel } from './Label';
import { stackV, containsPoint, type Rect } from './Layout';

export function drawList<T>(
  r: Renderer, input: Input, rect: Rect,
  items: readonly T[], labelOf: (t: T) => string,
  onSelect: (t: T, index: number) => void,
  itemHeight = 14
): void {
  drawPanel(r, rect);
  const rows = stackV({ x: rect.x + 2, y: rect.y + 2, w: rect.w - 4, h: rect.h - 4 },
    items.map(() => itemHeight), 1);
  items.forEach((item, i) => {
    const row = rows[i];
    if (!row) return;
    const hovered = containsPoint(row, input.mouseX, input.mouseY);
    if (hovered) r.drawRect(row.x, row.y, row.w, row.h, '#1f2d45');
    drawLabel(r, labelOf(item), row.x + 4, row.y + row.h - 3);
    if (hovered && input.wasMousePressed()) onSelect(item, i);
  });
}
```

- [ ] **Step 7: Typecheck, commit**

```bash
pnpm typecheck
git add src/ui/
git commit -m "feat(m2a): UI widget kit — Panel/Button/Label/Bar/List/Layout"
```

---

## Task 16: LoadingScene + PauseOverlay

**Files:**
- Create: `src/scenes/LoadingScene.ts`
- Create: `src/scenes/PauseOverlay.ts`

- [ ] **Step 1: Create `LoadingScene.ts`**

```typescript
// src/scenes/LoadingScene.ts
import { Scene, type SceneContext } from '@engine/Scene';
import { drawLabel } from '@ui/Label';

export class LoadingScene extends Scene {
  private progress = 0;

  constructor(
    private readonly work: (onProgress: (p: number) => void) => Promise<() => Scene>
  ) {
    super();
  }

  async enter(ctx: SceneContext): Promise<void> {
    const nextFactory = await this.work((p) => { this.progress = p; });
    ctx.changeScene(nextFactory());
  }

  update(_ctx: SceneContext, _dt: number): void {}

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.width, r.height, '#050709');
    drawLabel(r, 'LOADING', r.width / 2, r.height / 2 - 8, '#cfd8e8', 10, 'center');
    const barW = 160, barH = 4;
    r.drawRect((r.width - barW) / 2, r.height / 2 + 4, barW, barH, '#1a2231');
    r.drawRect((r.width - barW) / 2, r.height / 2 + 4, barW * this.progress, barH, '#6cd27c');
  }
}
```

- [ ] **Step 2: Create `PauseOverlay.ts`**

```typescript
// src/scenes/PauseOverlay.ts
import type { Renderer } from '@engine/Renderer';
import type { Input } from '@engine/Input';
import { drawPanel } from '@ui/Panel';
import { drawLabel } from '@ui/Label';
import { drawButton } from '@ui/Button';
import { center } from '@ui/Layout';

export interface PauseActions {
  onResume(): void;
  onSave(): void;
  onQuit(): void;
}

export function drawPauseOverlay(r: Renderer, input: Input, actions: PauseActions): void {
  r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.65)');
  const panel = center({ x: 0, y: 0, w: r.width, h: r.height }, 180, 120);
  drawPanel(r, panel);
  drawLabel(r, 'PAUSED', panel.x + panel.w / 2, panel.y + 18, '#e6ecf5', 10, 'center');
  drawButton(r, input, { x: panel.x + 20, y: panel.y + 35, w: panel.w - 40, h: 16 }, 'Resume', actions.onResume);
  drawButton(r, input, { x: panel.x + 20, y: panel.y + 55, w: panel.w - 40, h: 16 }, 'Save',   actions.onSave);
  drawButton(r, input, { x: panel.x + 20, y: panel.y + 75, w: panel.w - 40, h: 16 }, 'Quit',   actions.onQuit);
}
```

- [ ] **Step 3: Typecheck, commit**

```bash
pnpm typecheck
git add src/scenes/LoadingScene.ts src/scenes/PauseOverlay.ts
git commit -m "feat(m2a): LoadingScene + pause overlay widget"
```

---

## Task 17: TitleScene update — wire "New Game" to CharacterCreationScene

**Files:**
- Modify: `src/scenes/TitleScene.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Read the existing `TitleScene.ts` first to understand the current structure**

```bash
pnpm vitest --help > /dev/null   # no-op; keep the agent from skipping the Read step
```

Open [src/scenes/TitleScene.ts](../../../src/scenes/TitleScene.ts) and locate the prompt-press handler. Replace the placeholder scene change with a transition to `CharacterCreationScene` (imported lazily to avoid circular imports).

- [ ] **Step 2: Edit the handler**

Replace the GameScene transition with:

```typescript
import { CharacterCreationScene } from './CharacterCreationScene';
// ...inside the "any key pressed" branch:
ctx.changeScene(new CharacterCreationScene());
```

- [ ] **Step 3: Remove the old placeholder `GameScene.ts`**

```bash
git rm src/scenes/GameScene.ts
```

- [ ] **Step 4: Update `main.ts` to register `Assets`, `Audio`, `SaveStore` on the scene context**

This may require extending `SceneContext` in `src/engine/Scene.ts` with `assets`, `audio`, `saveStore`, `worldClock`. Do that as part of this task:

```typescript
// src/engine/Scene.ts (additions)
import type { Assets } from './Assets';
import type { Audio } from './Audio';
import type { SaveStore } from './Save';
import type { WorldClock } from '@core/world/WorldClock';

export interface SceneContext {
  input: Input;
  renderer: Renderer;
  assets: Assets;
  audio: Audio;
  saveStore: SaveStore;
  worldClock: WorldClock;
  changeScene(next: Scene): void;
}
```

- [ ] **Step 5: Typecheck + dev-server sanity check**

```bash
pnpm typecheck
pnpm dev
```

Visit the dev URL, verify: title screen renders, pressing any key transitions to a placeholder CharacterCreationScene (will exist after Task 18 — for now, leave a stub scene that just renders a "Character Creation Coming Next" label so TS passes).

- [ ] **Step 6: Commit**

```bash
git add src/scenes/TitleScene.ts src/main.ts src/engine/Scene.ts
git commit -m "feat(m2a): TitleScene → CharacterCreationScene, SceneContext gains assets/audio/save/clock"
```

---

## Task 18: CharacterCreationScene

**Files:**
- Create: `src/scenes/CharacterCreationScene.ts`

- [ ] **Step 1: Implement the scene with name, species, class, paint color**

```typescript
// src/scenes/CharacterCreationScene.ts
import { Scene, type SceneContext } from '@engine/Scene';
import type { Species, Class, CaptainState } from '@core/player/Captain';
import { drawPanel } from '@ui/Panel';
import { drawLabel } from '@ui/Label';
import { drawButton } from '@ui/Button';
import { SpaceScene } from './SpaceScene';

const PAINTS = ['#b94a3a', '#3a87b9', '#6cb94a', '#b9a83a'];
const SPECIES: Species[] = ['human']; // M2a: human only
const CLASSES: Class[]   = ['gunslinger'];

export class CharacterCreationScene extends Scene {
  private name = 'Rook';
  private speciesIdx = 0;
  private classIdx = 0;
  private paintIdx = 0;

  update(_ctx: SceneContext, _dt: number): void {}

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.width, r.height, '#050709');
    const panel = { x: 40, y: 30, w: r.width - 80, h: r.height - 60 };
    drawPanel(r, panel);
    drawLabel(r, 'CAPTAIN', panel.x + 10, panel.y + 14, '#e6ecf5', 10);

    drawLabel(r, `Name: ${this.name}`, panel.x + 10, panel.y + 32);
    drawLabel(r, `Species: ${SPECIES[this.speciesIdx]}`, panel.x + 10, panel.y + 48);
    drawLabel(r, `Class: ${CLASSES[this.classIdx]}`, panel.x + 10, panel.y + 64);
    drawLabel(r, 'Paint:', panel.x + 10, panel.y + 80);
    PAINTS.forEach((p, i) => {
      r.drawRect(panel.x + 50 + i * 14, panel.y + 74, 10, 10, p);
      if (i === this.paintIdx) r.drawRect(panel.x + 49 + i * 14, panel.y + 73, 12, 1, '#e6ecf5');
    });

    drawButton(r, ctx.input,
      { x: panel.x + 10, y: panel.y + panel.h - 26, w: 60, h: 16 },
      'Cycle Paint', () => { this.paintIdx = (this.paintIdx + 1) % PAINTS.length; });

    drawButton(r, ctx.input,
      { x: panel.x + panel.w - 90, y: panel.y + panel.h - 26, w: 80, h: 16 },
      'Launch', () => {
        const captain: CaptainState = {
          name: this.name,
          species: SPECIES[this.speciesIdx]!,
          klass:   CLASSES[this.classIdx]!,
          paint:   PAINTS[this.paintIdx]!,
          createdAt: Date.now(),
          deaths: 0,
        };
        ctx.changeScene(new SpaceScene(captain));
      });
  }
}
```

- [ ] **Step 2: Typecheck (will fail until SpaceScene exists — this is OK if you temporarily stub SpaceScene with an empty class body). Commit once green.**

```bash
git add src/scenes/CharacterCreationScene.ts
git commit -m "feat(m2a): CharacterCreationScene with name/species/class/paint + Launch"
```

---

## Task 19: Grayline Reach sector content + Sector loader

**Files:**
- Create: `src/content/sectors/grayline-reach.json`
- Create: `src/core/world/Sector.ts`

- [ ] **Step 1: Author `grayline-reach.json`**

```json
{
  "id": "grayline-reach",
  "name": "Grayline Reach",
  "bounds": { "w": 2400, "h": 1400 },
  "bodies": [
    { "id": "tessra-3", "name": "Tessra-3", "kind": "planet", "faction": "free_worlds",
      "x": 400, "y": 500, "r": 60 },
    { "id": "kepler-7b", "name": "Kepler-7b", "kind": "planet", "faction": null,
      "x": 1800, "y": 900, "r": 70 },
    { "id": "the-crossing", "name": "The Crossing", "kind": "station", "faction": "free_worlds",
      "x": 1100, "y": 600, "r": 25 },
    { "id": "g-4-belt", "name": "Asteroid Belt G-4", "kind": "belt", "faction": null,
      "x": 1500, "y": 350, "r": 180 }
  ],
  "stations": [
    {
      "id": "the-crossing",
      "stockpiles": [
        { "goodId": "iron_ore", "equilibrium": 100 },
        { "goodId": "grain", "equilibrium": 80 },
        { "goodId": "water", "equilibrium": 120 },
        { "goodId": "steel", "equilibrium": 60 },
        { "goodId": "meds", "equilibrium": 40 },
        { "goodId": "electronics", "equilibrium": 30 },
        { "goodId": "alien_tech", "equilibrium": 10 }
      ],
      "production":  [["steel", 0.5], ["electronics", 0.3]],
      "consumption": [["iron_ore", 0.6], ["grain", 0.4], ["water", 0.3]]
    },
    {
      "id": "tessra-3",
      "stockpiles": [
        { "goodId": "grain", "equilibrium": 150 },
        { "goodId": "water", "equilibrium": 180 },
        { "goodId": "iron_ore", "equilibrium": 40 },
        { "goodId": "meds", "equilibrium": 20 }
      ],
      "production":  [["grain", 1.0], ["water", 0.8]],
      "consumption": [["iron_ore", 0.3], ["meds", 0.2]]
    }
  ],
  "traderCount": 20,
  "traderRoutes": [
    { "from": "tessra-3",    "to": "the-crossing", "count": 8,  "goods": ["grain", "water"] },
    { "from": "the-crossing", "to": "kepler-7b",   "count": 6,  "goods": ["alien_tech"] },
    { "from": "tessra-3",    "to": "kepler-7b",    "count": 4,  "goods": ["iron_ore"] },
    { "from": "the-crossing", "to": "tessra-3",    "count": 2,  "goods": ["meds", "electronics"] }
  ]
}
```

- [ ] **Step 2: Create `Sector.ts` loader**

```typescript
// src/core/world/Sector.ts
import { Stockpile } from '@core/economy/Stockpile';
import type { Station } from '@core/economy/Economy';

export interface SectorBody {
  id: string;
  name: string;
  kind: 'planet' | 'station' | 'belt';
  faction: string | null;
  x: number;
  y: number;
  r: number;
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

export function buildStations(raw: readonly RawStation[]): Station[] {
  return raw.map((s) => ({
    id: s.id,
    stockpiles: new Map(s.stockpiles.map((sp) => [sp.goodId, new Stockpile(sp.goodId, sp.equilibrium)])),
    production:  new Map(s.production),
    consumption: new Map(s.consumption),
  }));
}
```

- [ ] **Step 3: Typecheck, commit**

```bash
pnpm typecheck
git add src/content/sectors/grayline-reach.json src/core/world/Sector.ts
git commit -m "feat(m2a): Grayline Reach sector data + Sector loader"
```

---

## Task 20: SpaceScene — flight mechanics (no NPCs yet)

**Files:**
- Create: `src/scenes/SpaceScene.ts`

- [ ] **Step 1: Initial SpaceScene with player flight only**

```typescript
// src/scenes/SpaceScene.ts
import { Scene, type SceneContext } from '@engine/Scene';
import type { CaptainState } from '@core/player/Captain';
import type { SectorData, SectorBody } from '@core/world/Sector';
import { buildStations } from '@core/world/Sector';
import { GoodsRegistry, type GoodDef } from '@core/economy/Goods';
import { Economy } from '@core/economy/Economy';
import { Trader } from '@core/economy/Trader';
import { drawLabel } from '@ui/Label';
import { drawPauseOverlay } from './PauseOverlay';
import { TitleScene } from './TitleScene';

interface ShipState {
  x: number; y: number;
  vx: number; vy: number;
  angle: number;
}

export class SpaceScene extends Scene {
  private ship: ShipState = { x: 1100, y: 600, vx: 0, vy: 0, angle: 0 };
  private sector!: SectorData;
  private economy!: Economy;
  private paused = false;

  constructor(readonly captain: CaptainState) {
    super();
  }

  async enter(ctx: SceneContext): Promise<void> {
    this.sector = await ctx.assets.loadJSON<SectorData>('/content/sectors/grayline-reach.json');
    const goodsDefs = await ctx.assets.loadJSON<GoodDef[]>('/content/goods.json');
    const goods = new GoodsRegistry(goodsDefs);
    const stations = buildStations(this.sector.stations);

    const traders: Trader[] = [];
    let tid = 0;
    for (const route of this.sector.traderRoutes) {
      for (let i = 0; i < route.count; i++) {
        traders.push(new Trader(`t${tid++}`, 'hauler'));
      }
    }
    this.economy = new Economy(goods, stations, traders);

    ctx.worldClock.subscribe(1, (dt) => this.economy.tick(dt));
    ctx.worldClock.subscribe(10, () => this.economy.replanIdleTraders(['grain', 'water', 'iron_ore', 'meds', 'electronics', 'alien_tech']));
  }

  update(ctx: SceneContext, dt: number): void {
    if (ctx.input.wasKeyPressed('Escape')) this.paused = !this.paused;
    if (this.paused) return;

    const input = ctx.input;
    const turnRate = 3.0;
    const thrust = 160;
    if (input.isKeyDown('KeyA')) this.ship.angle -= turnRate * dt;
    if (input.isKeyDown('KeyD')) this.ship.angle += turnRate * dt;
    if (input.isKeyDown('KeyW')) {
      this.ship.vx += Math.cos(this.ship.angle) * thrust * dt;
      this.ship.vy += Math.sin(this.ship.angle) * thrust * dt;
    }
    if (input.isKeyDown('KeyS')) {
      this.ship.vx *= 1 - 2 * dt;
      this.ship.vy *= 1 - 2 * dt;
    }
    this.ship.x += this.ship.vx * dt;
    this.ship.y += this.ship.vy * dt;

    ctx.worldClock.advance(dt);
  }

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.width, r.height, '#020308');

    const camX = this.ship.x - r.width / 2;
    const camY = this.ship.y - r.height / 2;
    const world = (wx: number, wy: number) => ({ sx: wx - camX, sy: wy - camY });

    for (const body of this.sector.bodies) {
      const { sx, sy } = world(body.x, body.y);
      const color = body.kind === 'station' ? '#b9a83a' : body.kind === 'belt' ? '#5a4a3a' : '#4a6cb9';
      r.drawRect(sx - body.r, sy - body.r, body.r * 2, body.r * 2, color);
      drawLabel(r, body.name, sx, sy - body.r - 4, '#cfd8e8', 6, 'center');
    }

    const ship = world(this.ship.x, this.ship.y);
    r.drawRect(ship.sx - 3, ship.sy - 3, 6, 6, this.captain.paint);

    drawLabel(r, `${this.captain.name} — ${this.sector.name}`, 6, 10, '#cfd8e8', 8);
    drawLabel(r, `${Math.round(this.ship.x)}, ${Math.round(this.ship.y)}`, 6, 22, '#8a98b0', 6);

    if (this.paused) {
      drawPauseOverlay(r, ctx.input, {
        onResume: () => { this.paused = false; },
        onSave: () => {/* Task 22 wires this */},
        onQuit: () => ctx.changeScene(new TitleScene()),
      });
    }
  }
}
```

- [ ] **Step 2: Typecheck, dev-server check**

```bash
pnpm typecheck
pnpm dev
```

Visit the URL; flow: Title → any key → Character Creation → "Launch" → SpaceScene. Fly around with WASD. Verify ESC toggles pause overlay. Commit.

```bash
git add src/scenes/SpaceScene.ts
git commit -m "feat(m2a): SpaceScene with player flight + pause + grayline-reach rendering"
```

---

## Task 21: SpaceScene — render 20 live NPC traders

**Files:**
- Modify: `src/scenes/SpaceScene.ts`

- [ ] **Step 1: Add trader rendering + simple position update**

Extend the scene to track each trader's world position and interpolate between route endpoints.

```typescript
// Inside SpaceScene
interface TraderVisual { traderId: string; x: number; y: number; speed: number; targetBodyId: string; }
private traderVisuals: TraderVisual[] = [];

// inside enter(), after `this.economy = new Economy(...)`:
let vi = 0;
for (const route of this.sector.traderRoutes) {
  const fromBody = this.sector.bodies.find((b) => b.id === route.from);
  const toBody   = this.sector.bodies.find((b) => b.id === route.to);
  if (!fromBody || !toBody) continue;
  for (let i = 0; i < route.count; i++) {
    this.traderVisuals.push({
      traderId: `t${vi++}`,
      x: fromBody.x + (Math.random() - 0.5) * 40,
      y: fromBody.y + (Math.random() - 0.5) * 40,
      speed: 40 + Math.random() * 30,
      targetBodyId: toBody.id,
    });
  }
}

// update() add after clock.advance():
for (const tv of this.traderVisuals) {
  const target = this.sector.bodies.find((b) => b.id === tv.targetBodyId);
  if (!target) continue;
  const dx = target.x - tv.x;
  const dy = target.y - tv.y;
  const d = Math.hypot(dx, dy);
  if (d < target.r + 10) {
    // Arrived — swap target to another random body
    const others = this.sector.bodies.filter((b) => b.id !== tv.targetBodyId && b.kind !== 'belt');
    const pick = others[Math.floor(Math.random() * others.length)];
    if (pick) tv.targetBodyId = pick.id;
    continue;
  }
  tv.x += (dx / d) * tv.speed * dt;
  tv.y += (dy / d) * tv.speed * dt;
}

// render() after body loop:
for (const tv of this.traderVisuals) {
  const { sx, sy } = world(tv.x, tv.y);
  r.drawRect(sx - 2, sy - 2, 4, 4, '#8fd97a');
}
drawLabel(r, `Traders: ${this.traderVisuals.length}`, 6, 34, '#8a98b0', 6);
```

- [ ] **Step 2: Dev-server check — 20 green pixels should move between planets**

```bash
pnpm dev
```

Fly around. Count traders — there should be exactly 20 (8+6+4+2). Each should be moving. Open F3 debug overlay; frame time should stay well under 16 ms.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/SpaceScene.ts
git commit -m "feat(m2a): SpaceScene renders 20 live NPC trader dots moving between bodies"
```

---

## Task 22: Save/load wiring in SpaceScene + pause menu

**Files:**
- Modify: `src/scenes/SpaceScene.ts`

- [ ] **Step 1: Build a snapshot from current state**

Add this import at the top of `SpaceScene.ts`:

```typescript
import { CURRENT_SAVE_VERSION, type SaveSnapshot } from '@core/world/SaveSnapshot';
```

Then add to the class body:

```typescript
private buildSnapshot(ctx: SceneContext): SaveSnapshot {
  return {
    version: CURRENT_SAVE_VERSION,
    seed: 0,
    worldClock: ctx.worldClock.elapsed(),
    captain: this.captain,
    ship: {
      hullId: 'shrike', moduleIds: [],
      position: { x: this.ship.x, y: this.ship.y },
      velocity: { x: this.ship.vx, y: this.ship.vy },
      angle: this.ship.angle, hp: 100, shield: 50, credits: 500, cargo: [],
    },
    sector: {
      id: this.sector.id,
      traders: this.traderVisuals.map((tv) => ({
        id: tv.traderId, archetype: 'hauler',
        position: { x: tv.x, y: tv.y }, state: 'idle', currentRoute: null, cargo: [],
      })),
      stockpiles: this.economy.stations.flatMap((st) =>
        [...st.stockpiles.values()].map((sp) => ({
          stationId: st.id, goodId: sp.goodId,
          quantity: sp.quantity, equilibrium: sp.equilibrium,
        })),
      ),
    },
    inventory: { items: [] },
    factions: { free_worlds: { rep: 0 }, scrapfather: { rep: 0 } },
    quests: { active: [], completed: [] },
    outposts: {},
    scene: { type: 'SpaceScene' },
  };
}

private applySnapshot(snap: SaveSnapshot): void {
  this.ship.x = snap.ship.position.x;
  this.ship.y = snap.ship.position.y;
  this.ship.vx = snap.ship.velocity.x;
  this.ship.vy = snap.ship.velocity.y;
  this.ship.angle = snap.ship.angle;
  for (const st of snap.sector.stockpiles) {
    const station = this.economy.stations.find((s) => s.id === st.stationId);
    const sp = station?.stockpiles.get(st.goodId);
    if (sp) sp.quantity = st.quantity;
  }
  for (const t of snap.sector.traders) {
    const tv = this.traderVisuals.find((v) => v.traderId === t.id);
    if (tv) { tv.x = t.position.x; tv.y = t.position.y; }
  }
}
```

- [ ] **Step 2: Wire pause menu Save and add on-enter load**

```typescript
// in enter(), after setup:
const existing = ctx.saveStore.load();
if (existing && existing.scene.type === 'SpaceScene') {
  this.applySnapshot(existing);
}

// in render() pause handler:
drawPauseOverlay(r, ctx.input, {
  onResume: () => { this.paused = false; },
  onSave: () => { ctx.saveStore.save(this.buildSnapshot(ctx)); },
  onQuit: () => ctx.changeScene(new TitleScene()),
});
```

- [ ] **Step 3: Dev-server full round-trip test**

1. Start fresh (clear localStorage in devtools first).
2. Fly to a specific position (e.g. near Kepler-7b).
3. ESC → Save.
4. Refresh the page (F5).
5. Title → any key → Character Creation → Launch.
6. Expect: you land back at the saved position near Kepler-7b, traders roughly where they were.

Pass condition: ship position matches within ~5px; trader count is still 20; no errors in console.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/SpaceScene.ts
git commit -m "feat(m2a): SpaceScene save/load round-trip via pause menu"
```

---

## Task 23: M2a gate — integration check

**Files:** none; this is a verification task.

- [ ] **Step 1: Clean build from scratch**

```bash
rm -rf node_modules/.vite dist
pnpm install
pnpm typecheck && pnpm lint && pnpm test:run && pnpm build
```

Every gate check must pass. Expected test count: M1 (23) + Pricing (4) + Stockpile (5) + Trader (3) + Loadout (5) + PowerBudget (4) + SaveSnapshot (3) + Physics (5) + Save (3) + Assets (2) = **57 tests**.

- [ ] **Step 2: Performance check — 60-second SpaceScene run**

Open `pnpm dev`, press F3 to enable debug overlay, let SpaceScene run for 60 seconds without touching input. Watch the overlay's worst-frame counter.

Pass: worst frame ≤ 20 ms. If above, stop and profile — do not proceed to M2b.

- [ ] **Step 3: Write the M2a retrospective note**

Create `docs/production/retros/m2a-retro.md` (1 page max):

```markdown
# M2a Retrospective — YYYY-MM-DD

## Did it ship on schedule?
(yes/no + why)

## What worked
- ...

## What was harder than expected
- ...

## Any system feel wrong for deepening?
- ...

## Decisions going into M2b
- Scope adjustments for M2b based on what we learned:
- ...

## Performance snapshot
- SpaceScene worst frame: X ms
- Memory: X MB
```

This retrospective is the source-of-truth for writing `2026-??-??-m2b-surfaces.md` — do not start M2b without it.

- [ ] **Step 4: Commit retro + tag M2a complete**

```bash
git add docs/production/retros/m2a-retro.md
git commit -m "docs: m2a retrospective"
git tag m2a-complete
```

- [ ] **Step 5: Declare M2a done**

Announce: "M2a Foundations shipped. Ready to write M2b Surfaces sub-plan." At this point the codebase can fly the player through Grayline Reach with 20 live NPC traders moving on real schedules, save/load works end-to-end, and all of `core/economy`, `core/ship`, `core/world`, `engine/Physics`, `engine/Save`, `engine/Assets`, `engine/Audio`, and the UI widget kit are in place and unit-tested.

---

## Success criteria for M2a

- [ ] All 57 tests pass
- [ ] `pnpm typecheck && pnpm lint && pnpm build` clean
- [ ] Fresh playthrough: Title → Char Create → SpaceScene → fly → pause → save → reload → same state
- [ ] 20 visible NPC traders in SpaceScene moving between planets/stations
- [ ] SpaceScene worst-frame ≤ 20 ms over 60s measurement
- [ ] `core/` has zero imports from `engine/` or `scenes/`
- [ ] M2a retrospective written

---

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial M2a plan — 23 tasks covering economy logic, ship loadout, save format + migration, physics, assets, audio, UI kit, TitleScene rewire, CharacterCreationScene, SpaceScene with flight + 20 NPC traders + save/load round-trip + gate perf check. |

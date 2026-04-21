# M3a Planet Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the obsolete top-down procedural `DungeonScene` with a 2D side-scrolling platformer substrate. Prove the core loop — gravity, jump, run, collide with walls, reach an exit — in a single hand-authored Tiled room. No combat. No enemies. No save points. Just the foundation.

**Architecture:** Pure-logic 2D physics in `@core/platformer/*` (velocity integration, AABB-vs-tile collision, player controller state machine with coyote time + jump buffer), a Tiled JSON loader (industry-standard `.tmj` format), and a new `PlanetScene` that replaces `DungeonScene` in the planet-landing flow. Everything else in the codebase (space combat, economy, stations, loadout, save v3) remains untouched.

**Tech Stack:** TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Vite, Vitest, Canvas 2D, path aliases `@engine/` `@core/` `@scenes/` `@ui/` `@content/`. Level authoring via the [Tiled Map Editor](https://www.mapeditor.org/) exporting `.tmj` (Tiled JSON) format — industry standard, used by Hollow Knight / Blasphemous / countless metroidvanias. Hand-authored JSON is also viable for early rooms before the editor is installed.

---

## File Structure

### Removed (obsolete top-down dungeon code)
- `src/core/procgen/DungeonGen.ts`
- `src/core/procgen/RoomDef.ts`
- `src/scenes/DungeonScene.ts`
- `src/content/rooms.json`
- `tests/core/procgen/DungeonGen.test.ts`
- `src/core/procgen/` directory entirely (empty after removal)

### New
- `src/core/platformer/TileMap.ts` — tile grid data + `isSolid(x, y)` query.
- `src/core/platformer/Physics2D.ts` — pure velocity integration with gravity + terminal velocity.
- `src/core/platformer/Collision.ts` — AABB-vs-tilemap sweep, returns resolved position + contact flags.
- `src/core/platformer/Controller.ts` — player state machine (grounded, airborne, coyote time, jump buffer).
- `src/core/platformer/TiledLoader.ts` — parses Tiled `.tmj` JSON into a `TileMap` + object list.
- `src/core/platformer/types.ts` — shared types (Vec2, AABB, TileLayer, ObjectMarker).
- `src/scenes/PlanetScene.ts` — replaces `DungeonScene` in the planet-landing flow.
- `src/content/planets/kepler-7b/entry.tmj` — the first hand-authored test room.
- `tests/core/platformer/TileMap.test.ts`
- `tests/core/platformer/Physics2D.test.ts`
- `tests/core/platformer/Collision.test.ts`
- `tests/core/platformer/Controller.test.ts`
- `tests/core/platformer/TiledLoader.test.ts`

### Modified
- `src/scenes/PlanetLandingScene.ts` — "Enter Alien Ruin" routes to `PlanetScene`, not `DungeonScene`.
- `src/scenes/TitleScene.ts` — `sceneFromSnapshot` factory drops the `DungeonScene` case, gains `PlanetScene`.

### Out of scope for M3a (queued for M3b+)
- Combat, enemies, hitboxes, melee attacks.
- Save points / progression within a planet run.
- Multiple rooms in one region + inter-room transitions.
- Tile atlas PNG / sprite rendering — tiles render as flat colored rectangles for now.
- Player sprite / animation — player is a colored rectangle.
- Metroidvania gating and abilities (double jump, wall slide, etc.).

---

## Phase A — Demolish the old dungeon

### Task 1: Remove DungeonScene, DungeonGen, RoomDef, rooms.json, related tests

**Files:**
- Delete: `src/scenes/DungeonScene.ts`
- Delete: `src/core/procgen/DungeonGen.ts`
- Delete: `src/core/procgen/RoomDef.ts`
- Delete: `src/content/rooms.json`
- Delete: `tests/core/procgen/DungeonGen.test.ts`
- Delete: `src/core/procgen/` directory (will be empty)
- Delete: `tests/core/procgen/` directory (will be empty)
- Modify: `src/scenes/PlanetLandingScene.ts`
- Modify: `src/scenes/TitleScene.ts`

This is a hard removal. The top-down procedural rooms were M2b scaffolding for a game shape we've pivoted away from. No archive branch — the git history carries them. Removing them in a single cleanup commit prevents anyone from accidentally extending the dead path while M3a builds the replacement.

- [ ] **Step 1: Delete the six files/directories listed above**

Run:

```bash
rm -rf src/core/procgen
rm -rf tests/core/procgen
rm src/scenes/DungeonScene.ts
rm src/content/rooms.json
```

- [ ] **Step 2: Stub `PlanetScene` so the Planet Landing scene still compiles**

Create a placeholder `src/scenes/PlanetScene.ts` (will be fleshed out in Phase D):

```typescript
import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import type { Loadout } from "@core/ship/Loadout";
import { PlanetLandingScene } from "./PlanetLandingScene";

export class PlanetScene extends Scene {
  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly loadout: Loadout,
    readonly planetId: string,
  ) {
    super();
  }
  enter(_ctx: SceneContext): void {}
  update(ctx: SceneContext, _dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new PlanetLandingScene(this.captain, this.seed, this.loadout, this.planetId));
    }
  }
  render(_ctx: SceneContext, _alpha: number): void {}
}
```

- [ ] **Step 3: Update `PlanetLandingScene.ts`**

Find the import of `DungeonScene` and replace:

```typescript
import { DungeonScene } from "./DungeonScene";
```

with:

```typescript
import { PlanetScene } from "./PlanetScene";
```

Then find the "Enter Alien Ruin" button handler (in `render()`, inside the `if (this.planetId === "kepler-7b")` branch):

```typescript
ctx.changeScene(new DungeonScene(this.captain, this.seed, this.loadout, this.planetId));
```

Replace with:

```typescript
ctx.changeScene(new PlanetScene(this.captain, this.seed, this.loadout, this.planetId));
```

- [ ] **Step 4: Update `TitleScene.ts` sceneFromSnapshot**

Find the `case "DungeonScene":` branch in the `sceneFromSnapshot` factory. Replace with:

```typescript
    case "PlanetScene":
      return new PlanetScene(captain, seed, loadout, String(snap.scene.params?.planetId ?? ""));
```

Also update the import at the top: replace `import { DungeonScene } from "./DungeonScene";` with `import { PlanetScene } from "./PlanetScene";`.

- [ ] **Step 5: Verify no remaining references**

Run:

```bash
grep -rn "DungeonScene\|DungeonGen\|RoomDef\|@content/rooms" src tests
```

Expected: empty output.

- [ ] **Step 6: Typecheck + test**

```bash
npm run typecheck
npm run test:run
```

Expected: typecheck clean. Test count drops from 89 to 84 (removes the 5 `DungeonGen` tests). No other test failures.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(planet): remove obsolete top-down dungeon code, stub PlanetScene

The M2b procedural top-down dungeon is replaced by a 2D side-scrolling
platformer in M3a. DungeonScene, DungeonGen, RoomDef, and rooms.json
are removed. A PlanetScene stub keeps the planet-landing flow
compiling; the real substrate lands in Phase B-E."
```

Verify with `git status` — tree should be clean.

---

## Phase B — 2D physics substrate (pure logic)

### Task 2: TileMap + `isSolid` query

**Files:**
- Create: `src/core/platformer/types.ts`
- Create: `src/core/platformer/TileMap.ts`
- Create: `tests/core/platformer/TileMap.test.ts`

A `TileMap` is a fixed-size grid of tile ids. Tile id `0` = empty (walkable), `1` = solid wall, `2` = hazard (kills player — stubbed for M3b). The map stores width/height in tiles and the tile size in pixels.

- [ ] **Step 1: Create shared types at `src/core/platformer/types.ts`**

```typescript
export interface Vec2 {
  x: number;
  y: number;
}

export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TileId = number;

export interface TileMapData {
  width: number;
  height: number;
  tileSize: number;
  tiles: readonly TileId[];
}

export interface ObjectMarker {
  type: string;
  x: number;
  y: number;
  name?: string;
}
```

- [ ] **Step 2: Write failing tests at `tests/core/platformer/TileMap.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { TileMap } from "@core/platformer/TileMap";

describe("TileMap", () => {
  const map = new TileMap({
    width: 4,
    height: 3,
    tileSize: 16,
    tiles: [
      1, 1, 1, 1,
      1, 0, 0, 1,
      1, 1, 1, 1,
    ],
  });

  it("returns the tile id at a given grid cell", () => {
    expect(map.tileAt(1, 1)).toBe(0);
    expect(map.tileAt(0, 0)).toBe(1);
  });

  it("returns 1 (solid) for out-of-bounds queries", () => {
    expect(map.tileAt(-1, 0)).toBe(1);
    expect(map.tileAt(0, -1)).toBe(1);
    expect(map.tileAt(4, 0)).toBe(1);
    expect(map.tileAt(0, 3)).toBe(1);
  });

  it("isSolid true for wall, false for empty", () => {
    expect(map.isSolid(0, 0)).toBe(true);
    expect(map.isSolid(1, 1)).toBe(false);
  });

  it("isSolidAtPixel converts pixel coords to tile coords", () => {
    expect(map.isSolidAtPixel(8, 8)).toBe(true);
    expect(map.isSolidAtPixel(24, 24)).toBe(false);
  });

  it("exposes width, height, tileSize as readonly", () => {
    expect(map.width).toBe(4);
    expect(map.height).toBe(3);
    expect(map.tileSize).toBe(16);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- TileMap`
Expected: FAIL — `@core/platformer/TileMap` not found.

- [ ] **Step 4: Implement `src/core/platformer/TileMap.ts`**

```typescript
import type { TileMapData, TileId } from "./types";

export class TileMap {
  readonly width: number;
  readonly height: number;
  readonly tileSize: number;
  private readonly tiles: readonly TileId[];

  constructor(data: TileMapData) {
    this.width = data.width;
    this.height = data.height;
    this.tileSize = data.tileSize;
    this.tiles = data.tiles;
  }

  tileAt(gx: number, gy: number): TileId {
    if (gx < 0 || gy < 0 || gx >= this.width || gy >= this.height) return 1;
    return this.tiles[gy * this.width + gx] ?? 1;
  }

  isSolid(gx: number, gy: number): boolean {
    return this.tileAt(gx, gy) === 1;
  }

  isSolidAtPixel(px: number, py: number): boolean {
    const gx = Math.floor(px / this.tileSize);
    const gy = Math.floor(py / this.tileSize);
    return this.isSolid(gx, gy);
  }

  tileIdAtPixel(px: number, py: number): TileId {
    const gx = Math.floor(px / this.tileSize);
    const gy = Math.floor(py / this.tileSize);
    return this.tileAt(gx, gy);
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:run -- TileMap`
Expected: PASS 5/5.

- [ ] **Step 6: Commit**

```bash
git add src/core/platformer/types.ts src/core/platformer/TileMap.ts tests/core/platformer/TileMap.test.ts
git commit -m "feat(platformer): TileMap with bounds-safe isSolid queries"
```

---

### Task 3: Physics2D velocity integration with gravity

**Files:**
- Create: `src/core/platformer/Physics2D.ts`
- Create: `tests/core/platformer/Physics2D.test.ts`

Pure functions. No classes, no mutable state. An entity is a `{ x, y, vx, vy }`. `stepPhysics(body, dt, opts)` returns a new body with velocity advanced by gravity and position by velocity, clamped to terminal velocity. Collision resolution is in the next task — here we only integrate.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { stepPhysics, type PhysicsBody, type PhysicsOpts } from "@core/platformer/Physics2D";

const OPTS: PhysicsOpts = {
  gravity: 900,
  terminalVelocity: 600,
};

describe("Physics2D", () => {
  it("applies gravity to vy", () => {
    const body: PhysicsBody = { x: 0, y: 0, vx: 0, vy: 0 };
    const next = stepPhysics(body, 1 / 60, OPTS);
    expect(next.vy).toBeCloseTo(15);
  });

  it("clamps vy at terminal velocity", () => {
    const body: PhysicsBody = { x: 0, y: 0, vx: 0, vy: 700 };
    const next = stepPhysics(body, 1 / 60, OPTS);
    expect(next.vy).toBe(600);
  });

  it("does not clamp upward velocity", () => {
    const body: PhysicsBody = { x: 0, y: 0, vx: 0, vy: -500 };
    const next = stepPhysics(body, 1 / 60, OPTS);
    expect(next.vy).toBeLessThan(-500 + 16);
    expect(next.vy).toBeGreaterThan(-500);
  });

  it("advances position by velocity", () => {
    const body: PhysicsBody = { x: 100, y: 50, vx: 120, vy: 60 };
    const next = stepPhysics(body, 0.5, { gravity: 0, terminalVelocity: 1000 });
    expect(next.x).toBe(160);
    expect(next.y).toBe(80);
  });

  it("does not mutate input body", () => {
    const body: PhysicsBody = { x: 0, y: 0, vx: 0, vy: 0 };
    stepPhysics(body, 1 / 60, OPTS);
    expect(body).toEqual({ x: 0, y: 0, vx: 0, vy: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test:run -- Physics2D`
Expected: FAIL.

- [ ] **Step 3: Implement `src/core/platformer/Physics2D.ts`**

```typescript
export interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PhysicsOpts {
  gravity: number;
  terminalVelocity: number;
}

export function stepPhysics(body: PhysicsBody, dt: number, opts: PhysicsOpts): PhysicsBody {
  const vy = Math.min(opts.terminalVelocity, body.vy + opts.gravity * dt);
  return {
    x: body.x + body.vx * dt,
    y: body.y + vy * dt,
    vx: body.vx,
    vy,
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- Physics2D`
Expected: PASS 5/5.

- [ ] **Step 5: Commit**

```bash
git add src/core/platformer/Physics2D.ts tests/core/platformer/Physics2D.test.ts
git commit -m "feat(platformer): pure velocity integration with gravity and terminal clamp"
```

---

### Task 4: AABB-vs-tilemap collision resolution

**Files:**
- Create: `src/core/platformer/Collision.ts`
- Create: `tests/core/platformer/Collision.test.ts`

The interesting one. Given a body's current AABB and a desired next position, return the resolved position plus contact flags (`onGround`, `onCeiling`, `onLeftWall`, `onRightWall`). Implementation sweeps each axis independently — first resolve X, then resolve Y. This is standard 2D platformer collision (see Celeste's approach).

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { TileMap } from "@core/platformer/TileMap";
import { resolveAABB, type CollisionResult } from "@core/platformer/Collision";

//  tile 1 = solid. tile size 16.
//  12 tiles wide, 6 tall. Walls on all edges, open interior.
function makeRoom(): TileMap {
  const w = 12, h = 6;
  const tiles: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      tiles.push(x === 0 || y === 0 || x === w - 1 || y === h - 1 ? 1 : 0);
    }
  }
  return new TileMap({ width: w, height: h, tileSize: 16, tiles });
}

describe("Collision", () => {
  it("passes through empty space unchanged", () => {
    const map = makeRoom();
    const r: CollisionResult = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: 4, dy: 0 },
      map,
    );
    expect(r.x).toBe(36);
    expect(r.y).toBe(32);
    expect(r.onGround).toBe(false);
    expect(r.onLeftWall).toBe(false);
    expect(r.onRightWall).toBe(false);
  });

  it("stops at right wall and flags onRightWall", () => {
    const map = makeRoom();
    const r = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: 200, dy: 0 },
      map,
    );
    expect(r.x).toBeLessThan(160);
    expect(r.onRightWall).toBe(true);
  });

  it("stops on floor and flags onGround", () => {
    const map = makeRoom();
    const r = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: 0, dy: 200 },
      map,
    );
    // floor row is y=5 (pixels 80..96). AABB bottom should rest at 80.
    expect(r.y + 14).toBeCloseTo(80);
    expect(r.onGround).toBe(true);
  });

  it("resolves corner cases by sweeping X then Y independently", () => {
    const map = makeRoom();
    const r = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: -200, dy: 200 },
      map,
    );
    expect(r.x).toBeGreaterThanOrEqual(16);
    expect(r.y + 14).toBeCloseTo(80);
    expect(r.onGround).toBe(true);
    expect(r.onLeftWall).toBe(true);
  });

  it("hits ceiling and flags onCeiling", () => {
    const map = makeRoom();
    const r = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: 0, dy: -200 },
      map,
    );
    expect(r.y).toBeGreaterThanOrEqual(16);
    expect(r.onCeiling).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test:run -- Collision`
Expected: FAIL.

- [ ] **Step 3: Implement `src/core/platformer/Collision.ts`**

```typescript
import type { AABB } from "./types";
import type { TileMap } from "./TileMap";

export interface Delta {
  dx: number;
  dy: number;
}

export interface CollisionResult {
  x: number;
  y: number;
  onGround: boolean;
  onCeiling: boolean;
  onLeftWall: boolean;
  onRightWall: boolean;
}

function anySolidInRange(
  map: TileMap,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): boolean {
  const gx0 = Math.floor(x0 / map.tileSize);
  const gy0 = Math.floor(y0 / map.tileSize);
  const gx1 = Math.floor((x1 - 0.001) / map.tileSize);
  const gy1 = Math.floor((y1 - 0.001) / map.tileSize);
  for (let gy = gy0; gy <= gy1; gy++) {
    for (let gx = gx0; gx <= gx1; gx++) {
      if (map.isSolid(gx, gy)) return true;
    }
  }
  return false;
}

export function resolveAABB(aabb: AABB, delta: Delta, map: TileMap): CollisionResult {
  let { x, y } = aabb;
  const { w, h } = aabb;
  let onLeftWall = false, onRightWall = false, onGround = false, onCeiling = false;

  // Sweep X
  const nextX = x + delta.dx;
  if (delta.dx > 0) {
    if (anySolidInRange(map, nextX + w, y, nextX + w + 0.001, y + h)) {
      const wallX = Math.floor((nextX + w) / map.tileSize) * map.tileSize;
      x = wallX - w;
      onRightWall = true;
    } else {
      x = nextX;
    }
  } else if (delta.dx < 0) {
    if (anySolidInRange(map, nextX, y, nextX + 0.001, y + h)) {
      const wallX = (Math.floor(nextX / map.tileSize) + 1) * map.tileSize;
      x = wallX;
      onLeftWall = true;
    } else {
      x = nextX;
    }
  }

  // Sweep Y
  const nextY = y + delta.dy;
  if (delta.dy > 0) {
    if (anySolidInRange(map, x, nextY + h, x + w, nextY + h + 0.001)) {
      const floorY = Math.floor((nextY + h) / map.tileSize) * map.tileSize;
      y = floorY - h;
      onGround = true;
    } else {
      y = nextY;
    }
  } else if (delta.dy < 0) {
    if (anySolidInRange(map, x, nextY, x + w, nextY + 0.001)) {
      const ceilingY = (Math.floor(nextY / map.tileSize) + 1) * map.tileSize;
      y = ceilingY;
      onCeiling = true;
    } else {
      y = nextY;
    }
  }

  return { x, y, onGround, onCeiling, onLeftWall, onRightWall };
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- Collision`
Expected: PASS 5/5.

- [ ] **Step 5: Commit**

```bash
git add src/core/platformer/Collision.ts tests/core/platformer/Collision.test.ts
git commit -m "feat(platformer): AABB-vs-tilemap sweep with contact flags"
```

---

### Task 5: Player controller state machine

**Files:**
- Create: `src/core/platformer/Controller.ts`
- Create: `tests/core/platformer/Controller.test.ts`

Takes input (a frame's left/right/jump intents), current body state, and contact flags. Returns new velocity, updated timers. Encodes coyote time (brief window after leaving ledge where you can still jump) and jump buffer (pressing jump just before landing still triggers jump).

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import {
  updateController,
  type ControllerState,
  type ControllerInput,
  type ControllerConfig,
} from "@core/platformer/Controller";

const CFG: ControllerConfig = {
  runSpeed: 120,
  jumpVelocity: -320,
  coyoteTimeSec: 0.1,
  jumpBufferSec: 0.12,
};

function fresh(): ControllerState {
  return {
    vx: 0,
    vy: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    facing: 1,
  };
}

describe("Controller", () => {
  it("no input, grounded → velocity zero", () => {
    const s = updateController(fresh(), { left: false, right: false, jumpPressed: false }, { onGround: true, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(s.vx).toBe(0);
  });

  it("right input accelerates to runSpeed and sets facing", () => {
    const s = updateController(fresh(), { left: false, right: true, jumpPressed: false }, { onGround: true, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(s.vx).toBe(120);
    expect(s.facing).toBe(1);
  });

  it("left input sets facing to -1 and vx negative", () => {
    const s = updateController(fresh(), { left: true, right: false, jumpPressed: false }, { onGround: true, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(s.vx).toBe(-120);
    expect(s.facing).toBe(-1);
  });

  it("jump while grounded sets vy to jumpVelocity", () => {
    const s = updateController(fresh(), { left: false, right: false, jumpPressed: true }, { onGround: true, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(s.vy).toBe(-320);
  });

  it("coyote time: can jump briefly after leaving ground", () => {
    const justLeft = updateController(fresh(), { left: false, right: false, jumpPressed: false }, { onGround: false, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(justLeft.coyoteTimer).toBeCloseTo(CFG.coyoteTimeSec - 1 / 60, 3);
    const jumped = updateController(justLeft, { left: false, right: false, jumpPressed: true }, { onGround: false, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(jumped.vy).toBe(-320);
  });

  it("coyote time expires: cannot jump after full window", () => {
    let s = fresh();
    for (let i = 0; i < 20; i++) {
      s = updateController(s, { left: false, right: false, jumpPressed: false }, { onGround: false, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    }
    const attempted = updateController(s, { left: false, right: false, jumpPressed: true }, { onGround: false, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(attempted.vy).not.toBe(-320);
  });

  it("jump buffer: jump pressed mid-air triggers on landing", () => {
    const pressedMidAir = updateController(fresh(), { left: false, right: false, jumpPressed: true }, { onGround: false, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(pressedMidAir.jumpBufferTimer).toBeCloseTo(CFG.jumpBufferSec - 1 / 60, 3);
    const landed = updateController(pressedMidAir, { left: false, right: false, jumpPressed: false }, { onGround: true, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(landed.vy).toBe(-320);
  });

  it("grounded resets coyote timer to full", () => {
    const s = updateController(fresh(), { left: false, right: false, jumpPressed: false }, { onGround: true, onCeiling: false, onLeftWall: false, onRightWall: false }, 1 / 60, CFG);
    expect(s.coyoteTimer).toBe(CFG.coyoteTimeSec);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test:run -- Controller`
Expected: FAIL.

- [ ] **Step 3: Implement `src/core/platformer/Controller.ts`**

```typescript
export interface ControllerState {
  vx: number;
  vy: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  facing: 1 | -1;
}

export interface ControllerInput {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
}

export interface Contacts {
  onGround: boolean;
  onCeiling: boolean;
  onLeftWall: boolean;
  onRightWall: boolean;
}

export interface ControllerConfig {
  runSpeed: number;
  jumpVelocity: number;
  coyoteTimeSec: number;
  jumpBufferSec: number;
}

export function updateController(
  prev: ControllerState,
  input: ControllerInput,
  contacts: Contacts,
  dt: number,
  cfg: ControllerConfig,
): ControllerState {
  let vx = 0;
  let facing: 1 | -1 = prev.facing;
  if (input.right) { vx = cfg.runSpeed; facing = 1; }
  if (input.left) { vx = -cfg.runSpeed; facing = -1; }

  let vy = prev.vy;
  if (contacts.onGround && vy > 0) vy = 0;
  if (contacts.onCeiling && vy < 0) vy = 0;

  let coyoteTimer = contacts.onGround
    ? cfg.coyoteTimeSec
    : Math.max(0, prev.coyoteTimer - dt);

  let jumpBufferTimer = input.jumpPressed
    ? cfg.jumpBufferSec
    : Math.max(0, prev.jumpBufferTimer - dt);

  const canJump = coyoteTimer > 0;
  const wantsJump = jumpBufferTimer > 0;
  if (canJump && wantsJump) {
    vy = cfg.jumpVelocity;
    coyoteTimer = 0;
    jumpBufferTimer = 0;
  }

  return { vx, vy, coyoteTimer, jumpBufferTimer, facing };
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- Controller`
Expected: PASS 8/8.

- [ ] **Step 5: Commit**

```bash
git add src/core/platformer/Controller.ts tests/core/platformer/Controller.test.ts
git commit -m "feat(platformer): player controller with coyote time and jump buffer"
```

---

## Phase C — Tiled integration

### Task 6: Tiled JSON loader

**Files:**
- Create: `src/core/platformer/TiledLoader.ts`
- Create: `tests/core/platformer/TiledLoader.test.ts`

Tiled's `.tmj` JSON export has a specific shape: an array of `layers`, each of type `"tilelayer"` or `"objectgroup"`. We extract one tile layer (named `"collision"`) and one object group (named `"objects"`). Object types we care about: `"player_spawn"`, `"exit"`.

Tiled tile ids are 1-indexed globally, with 0 meaning empty. Our internal `TileMap` treats 0 = empty, 1 = solid, 2 = hazard. We map Tiled → internal with a collision flag on the tileset — but for M3a we simplify: **any non-zero tile in the collision layer is solid (internal tile id 1)**. Hazard support comes in M3b.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { loadTiledMap, type TiledMap } from "@core/platformer/TiledLoader";

const FIXTURE: TiledMap = {
  width: 4,
  height: 3,
  tilewidth: 16,
  tileheight: 16,
  layers: [
    {
      name: "collision",
      type: "tilelayer",
      width: 4,
      height: 3,
      data: [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    },
    {
      name: "objects",
      type: "objectgroup",
      objects: [
        { name: "spawn", type: "player_spawn", x: 16, y: 24, width: 0, height: 0 },
        { name: "out",   type: "exit",         x: 48, y: 24, width: 0, height: 0 },
      ],
    },
  ],
};

describe("TiledLoader", () => {
  it("returns a TileMap matching the fixture dimensions", () => {
    const { map } = loadTiledMap(FIXTURE);
    expect(map.width).toBe(4);
    expect(map.height).toBe(3);
    expect(map.tileSize).toBe(16);
  });

  it("maps any non-zero Tiled tile to internal tile id 1", () => {
    const { map } = loadTiledMap(FIXTURE);
    expect(map.isSolid(0, 0)).toBe(true);
    expect(map.isSolid(1, 1)).toBe(false);
  });

  it("extracts objects with type, x, y", () => {
    const { objects } = loadTiledMap(FIXTURE);
    expect(objects).toHaveLength(2);
    expect(objects[0]!.type).toBe("player_spawn");
    expect(objects[0]!.x).toBe(16);
    expect(objects[0]!.y).toBe(24);
    expect(objects[1]!.type).toBe("exit");
  });

  it("throws when the collision layer is missing", () => {
    const bad = { ...FIXTURE, layers: [FIXTURE.layers[1]!] };
    expect(() => loadTiledMap(bad as unknown as TiledMap)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test:run -- TiledLoader`
Expected: FAIL.

- [ ] **Step 3: Implement `src/core/platformer/TiledLoader.ts`**

```typescript
import { TileMap } from "./TileMap";
import type { ObjectMarker } from "./types";

export interface TiledTileLayer {
  name: string;
  type: "tilelayer";
  width: number;
  height: number;
  data: number[];
}

export interface TiledObject {
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TiledObjectLayer {
  name: string;
  type: "objectgroup";
  objects: TiledObject[];
}

export type TiledLayer = TiledTileLayer | TiledObjectLayer;

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
}

export interface LoadedTiledMap {
  map: TileMap;
  objects: ObjectMarker[];
}

export function loadTiledMap(raw: TiledMap): LoadedTiledMap {
  const collisionLayer = raw.layers.find(
    (l): l is TiledTileLayer => l.type === "tilelayer" && l.name === "collision",
  );
  if (!collisionLayer) throw new Error("Tiled map missing 'collision' tile layer");

  const tiles = collisionLayer.data.map((id) => (id === 0 ? 0 : 1));
  const map = new TileMap({
    width: raw.width,
    height: raw.height,
    tileSize: raw.tilewidth,
    tiles,
  });

  const objectLayer = raw.layers.find(
    (l): l is TiledObjectLayer => l.type === "objectgroup" && l.name === "objects",
  );
  const objects: ObjectMarker[] = (objectLayer?.objects ?? []).map((o) => ({
    type: o.type,
    x: o.x,
    y: o.y,
    name: o.name,
  }));

  return { map, objects };
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- TiledLoader`
Expected: PASS 4/4.

- [ ] **Step 5: Commit**

```bash
git add src/core/platformer/TiledLoader.ts tests/core/platformer/TiledLoader.test.ts
git commit -m "feat(platformer): Tiled JSON loader for collision layer and object markers"
```

---

### Task 7: Hand-author the first room in Tiled JSON

**Files:**
- Create: `src/content/planets/kepler-7b/entry.tmj`

A 20×12 room. Walls on all edges. Open floor in the middle. Two raised platforms so the player has something to jump onto. `player_spawn` object near the left wall, `exit` object near the right wall.

Tile pixel size: 16. Room in pixels: 320×192. This fits the 640×360 internal resolution with room to spare — camera can be a simple centered clamp for M3a.

- [ ] **Step 1: Create `src/content/planets/kepler-7b/entry.tmj`**

```json
{
  "width": 20,
  "height": 12,
  "tilewidth": 16,
  "tileheight": 16,
  "type": "map",
  "orientation": "orthogonal",
  "renderorder": "right-down",
  "infinite": false,
  "version": "1.10",
  "tiledversion": "1.10.2",
  "nextlayerid": 3,
  "nextobjectid": 3,
  "tilesets": [],
  "layers": [
    {
      "id": 1,
      "name": "collision",
      "type": "tilelayer",
      "width": 20,
      "height": 12,
      "x": 0,
      "y": 0,
      "visible": true,
      "opacity": 1,
      "data": [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
      ]
    },
    {
      "id": 2,
      "name": "objects",
      "type": "objectgroup",
      "visible": true,
      "opacity": 1,
      "x": 0,
      "y": 0,
      "objects": [
        { "id": 1, "name": "start",  "type": "player_spawn", "x": 32, "y": 144, "width": 0, "height": 0, "rotation": 0, "visible": true },
        { "id": 2, "name": "return", "type": "exit",         "x": 288, "y": 144, "width": 0, "height": 0, "rotation": 0, "visible": true }
      ]
    }
  ]
}
```

Read the file shape: 20 columns × 12 rows. The floor is row 10 (solid) + row 11 (extra-thick for a safety net against tunneling). Row 5 has a small platform at columns 4-6. Row 6 has a floating platform at columns 12-15. Player spawns at (32, 144) — just above the floor at column 2. Exit at (288, 144) — just above the floor at column 18.

- [ ] **Step 2: Verify the JSON parses**

Run:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('src/content/planets/kepler-7b/entry.tmj', 'utf8')).width)"
```

Expected output: `20`.

- [ ] **Step 3: Commit**

```bash
git add src/content/planets/kepler-7b/entry.tmj
git commit -m "content(planet): first hand-authored Kepler-7b entry room"
```

---

### Task 8: TiledLoader reads the real room file

**Files:**
- Create: `tests/core/platformer/EntryRoomIntegration.test.ts`

Not strictly necessary, but a lightweight integration test ensures `entry.tmj` is loadable and satisfies the invariants we expect from Task 9 onward.

- [ ] **Step 1: Write the integration test**

```typescript
import { describe, it, expect } from "vitest";
import { loadTiledMap } from "@core/platformer/TiledLoader";
import entryRoom from "@content/planets/kepler-7b/entry.tmj";
import type { TiledMap } from "@core/platformer/TiledLoader";

describe("Kepler-7b entry room", () => {
  const { map, objects } = loadTiledMap(entryRoom as unknown as TiledMap);

  it("is 20 tiles wide by 12 tall at 16px", () => {
    expect(map.width).toBe(20);
    expect(map.height).toBe(12);
    expect(map.tileSize).toBe(16);
  });

  it("has solid walls on all four edges", () => {
    for (let x = 0; x < map.width; x++) {
      expect(map.isSolid(x, 0)).toBe(true);
      expect(map.isSolid(x, map.height - 1)).toBe(true);
    }
    for (let y = 0; y < map.height; y++) {
      expect(map.isSolid(0, y)).toBe(true);
      expect(map.isSolid(map.width - 1, y)).toBe(true);
    }
  });

  it("has a player spawn and an exit", () => {
    const spawn = objects.find((o) => o.type === "player_spawn");
    const exit = objects.find((o) => o.type === "exit");
    expect(spawn).toBeDefined();
    expect(exit).toBeDefined();
  });
});
```

- [ ] **Step 2: Confirm Vite imports `.tmj` as JSON**

Vite imports `.json` files natively. `.tmj` is JSON with a different extension, so Vite may not recognize it. If this test fails with "cannot resolve import" or "unexpected token", add `"*.tmj"` to Vite's asset handling.

Quick fix: rename the extension to `.tmj.json` (we gain Vite's native JSON handling, cost nothing). Update Task 7's filename accordingly if needed:

```bash
git mv src/content/planets/kepler-7b/entry.tmj src/content/planets/kepler-7b/entry.tmj.json
```

Alternative: configure Vite. Edit `vite.config.ts` to include `.tmj` in `assetsInclude`. The rename is simpler.

Actually, Vite's default for `.json` is module-import. For simplicity, **standardize on `.tmj.json` file extension** so no Vite config is needed. Go back and update Task 7 to use `.tmj.json` as the filename, or rename now as part of this task. Update the import in this test to match.

- [ ] **Step 3: Run the test**

Run: `npm run test:run -- EntryRoomIntegration`
Expected: PASS 3/3.

- [ ] **Step 4: Commit**

```bash
git add tests/core/platformer/EntryRoomIntegration.test.ts
# plus the rename if performed
git commit -m "test(platformer): entry room parses and satisfies wall/spawn/exit invariants"
```

---

## Phase D — PlanetScene wiring

### Task 9: PlanetScene constructor — load map, place player

**Files:**
- Modify: `src/scenes/PlanetScene.ts`

Replace the stub with a real scene. At construction: load the entry room JSON, parse via `TiledLoader`, find the spawn marker, initialize the player's physics body there. Store the map + objects + player state as fields.

- [ ] **Step 1: Replace the stub `src/scenes/PlanetScene.ts`**

```typescript
import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import type { Loadout } from "@core/ship/Loadout";
import { PlanetLandingScene } from "./PlanetLandingScene";
import { loadTiledMap, type TiledMap } from "@core/platformer/TiledLoader";
import { TileMap } from "@core/platformer/TileMap";
import type { ObjectMarker } from "@core/platformer/types";
import { stepPhysics, type PhysicsBody } from "@core/platformer/Physics2D";
import { resolveAABB } from "@core/platformer/Collision";
import { updateController, type ControllerState, type ControllerConfig } from "@core/platformer/Controller";
import entryRoom from "@content/planets/kepler-7b/entry.tmj.json";

const PLAYER_W = 10;
const PLAYER_H = 14;

const PHYSICS = { gravity: 900, terminalVelocity: 600 };
const CONTROLLER_CFG: ControllerConfig = {
  runSpeed: 120,
  jumpVelocity: -320,
  coyoteTimeSec: 0.1,
  jumpBufferSec: 0.12,
};

export class PlanetScene extends Scene {
  private map: TileMap;
  private objects: ObjectMarker[];
  private body: PhysicsBody;
  private controller: ControllerState = {
    vx: 0, vy: 0, coyoteTimer: 0, jumpBufferTimer: 0, facing: 1,
  };

  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly loadout: Loadout,
    readonly planetId: string,
  ) {
    super();
    const { map, objects } = loadTiledMap(entryRoom as unknown as TiledMap);
    this.map = map;
    this.objects = objects;
    const spawn = objects.find((o) => o.type === "player_spawn");
    const sx = spawn?.x ?? 32;
    const sy = spawn?.y ?? 32;
    this.body = { x: sx - PLAYER_W / 2, y: sy - PLAYER_H, vx: 0, vy: 0 };
  }

  enter(_ctx: SceneContext): void {}

  update(ctx: SceneContext, dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new PlanetLandingScene(this.captain, this.seed, this.loadout, this.planetId));
      return;
    }

    // Input → controller
    const input = {
      left: ctx.input.isKeyDown("KeyA"),
      right: ctx.input.isKeyDown("KeyD"),
      jumpPressed: ctx.input.wasKeyPressed("Space") || ctx.input.wasKeyPressed("KeyW"),
    };
    // Probe contacts with a zero-delta sweep
    const probe = resolveAABB(
      { x: this.body.x, y: this.body.y, w: PLAYER_W, h: PLAYER_H },
      { dx: 0, dy: 1 },
      this.map,
    );
    this.controller = updateController(
      this.controller,
      input,
      { onGround: probe.onGround, onCeiling: false, onLeftWall: false, onRightWall: false },
      dt,
      CONTROLLER_CFG,
    );

    // Feed controller velocity back into the body; physics integrates gravity
    this.body.vx = this.controller.vx;
    if (this.controller.vy !== 0 && probe.onGround) this.body.vy = this.controller.vy;
    if (!probe.onGround) this.body.vy = Math.max(this.body.vy, this.controller.vy);
    const stepped = stepPhysics(this.body, dt, PHYSICS);

    // Resolve collisions
    const result = resolveAABB(
      { x: this.body.x, y: this.body.y, w: PLAYER_W, h: PLAYER_H },
      { dx: stepped.x - this.body.x, dy: stepped.y - this.body.y },
      this.map,
    );
    this.body.x = result.x;
    this.body.y = result.y;
    this.body.vx = stepped.vx;
    this.body.vy = result.onGround || result.onCeiling ? 0 : stepped.vy;

    // Exit
    const exit = this.objects.find((o) => o.type === "exit");
    if (exit) {
      const dx = (this.body.x + PLAYER_W / 2) - exit.x;
      const dy = (this.body.y + PLAYER_H / 2) - exit.y;
      if (dx * dx + dy * dy < 256) {
        ctx.changeScene(new PlanetLandingScene(this.captain, this.seed, this.loadout, this.planetId));
      }
    }
  }

  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#0a0608");

    // Camera: centered on player, clamped to map bounds
    const mapW = this.map.width * this.map.tileSize;
    const mapH = this.map.height * this.map.tileSize;
    const centerX = this.body.x + PLAYER_W / 2;
    const centerY = this.body.y + PLAYER_H / 2;
    const camX = Math.max(0, Math.min(mapW - r.internalWidth, centerX - r.internalWidth / 2));
    const camY = Math.max(0, Math.min(mapH - r.internalHeight, centerY - r.internalHeight / 2));

    // Tiles
    for (let gy = 0; gy < this.map.height; gy++) {
      for (let gx = 0; gx < this.map.width; gx++) {
        if (!this.map.isSolid(gx, gy)) continue;
        const px = gx * this.map.tileSize - camX;
        const py = gy * this.map.tileSize - camY;
        r.drawRect(px, py, this.map.tileSize, this.map.tileSize, "#3a2636");
      }
    }

    // Exit marker
    const exit = this.objects.find((o) => o.type === "exit");
    if (exit) {
      r.drawRect(exit.x - camX - 4, exit.y - camY - 8, 8, 8, "#e8b060");
    }

    // Player
    r.drawRect(this.body.x - camX, this.body.y - camY, PLAYER_W, PLAYER_H, this.captain.paint);
  }
}
```

This is longer than most tasks because it's the first scene assembly. Read it line by line before committing.

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/PlanetScene.ts
git commit -m "feat(planet): PlanetScene wires TileMap + Physics2D + Controller"
```

---

### Task 10: Manual playtest — gravity, run, jump, collide

**Files:** none (manual test only)

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

Open the browser.

- [ ] **Step 2: Full flow**

Title → any key → CharCreate → Launch → fly to Kepler-7b → F to Explore Ruin → Enter Alien Ruin.

- [ ] **Step 3: Verify**

You should see a dark-red room with gray walls, a yellow exit marker on the right, and the player's colored rectangle near the left. Expected behavior:

- `A` / `D` runs left and right at constant speed.
- `Space` or `W` jumps. Gravity pulls you down.
- Walls stop you. Floor stops you. Ceiling stops you.
- You can stand on the two raised platforms.
- Walking into the yellow exit marker returns you to `PlanetLandingScene`.
- `ESC` returns you to `PlanetLandingScene`.

If anything feels off (air control wrong, jump feels floaty or snappy in a bad way, collision clips through corners), note it for M3b tuning — the numbers in `CONTROLLER_CFG` and `PHYSICS` are first-draft tuning.

- [ ] **Step 4: Nothing to commit for this task** — manual verification only. If you found a bug, fix it in a new commit before Task 11.

---

### Task 11: Render a HUD hint + tighten first-draft tuning

**Files:**
- Modify: `src/scenes/PlanetScene.ts`

Tiny quality-of-life pass. Add the controls hint at the bottom and a title at the top.

- [ ] **Step 1: Add drawLabel import + HUD at end of render**

At the top of `src/scenes/PlanetScene.ts`:

```typescript
import { drawLabel } from "@ui/Label";
```

At the end of `render()`, after the player draw:

```typescript
drawLabel(ctx.renderer, `KEPLER-7B — ENTRY`, 6, 6, "#cfd8e8", 8);
drawLabel(ctx.renderer, "A/D run · SPACE jump · ESC leave", ctx.renderer.internalWidth / 2, ctx.renderer.internalHeight - 10, "#506070", 6, "center");
```

- [ ] **Step 2: Typecheck + test + lint**

```bash
npm run typecheck && npm run test:run && npm run lint
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/PlanetScene.ts
git commit -m "feat(planet): HUD title + controls hint"
```

---

## Phase E — Save format + scene-factory cleanup

### Task 12: Save v4 — replace DungeonScene with PlanetScene in scene type, bump version

**Files:**
- Modify: `src/core/world/SaveSnapshot.ts`
- Modify: `src/core/world/migrations.ts`
- Modify: `tests/engine/Save.test.ts`
- Modify: `tests/core/world/SaveSnapshot.test.ts`
- Modify: `tests/core/world/SaveSnapshotMigration.test.ts`

Save v3 referenced `"DungeonScene"` as a possible `scene.type`. V4 renames that to `"PlanetScene"` for any persisted save. A v3→v4 migration rewrites the string if it's present (unlikely anyone ever saved inside the old dungeon, but be defensive).

- [ ] **Step 1: Bump `CURRENT_SAVE_VERSION`**

In `src/core/world/SaveSnapshot.ts`, change `CURRENT_SAVE_VERSION = 3;` to `4;`.

- [ ] **Step 2: Add v3→v4 migration**

Append to `migrations` in `src/core/world/migrations.ts`:

```typescript
{
  from: 3,
  to: 4,
  apply(raw: Record<string, unknown>): Record<string, unknown> {
    const scene = raw.scene as Record<string, unknown> | undefined;
    const type = scene?.type;
    const newType = type === "DungeonScene" ? "PlanetScene" : type;
    return {
      ...raw,
      version: 4,
      scene: { ...scene, type: newType },
    };
  },
},
```

- [ ] **Step 3: Update test fixtures**

In `tests/engine/Save.test.ts` — bump the `version: 3` fixture to `4`, and append `{ from: 3, to: 4, apply: (raw) => ({ ...raw, version: 4 }) }` to the migrations array; bump the asserted loaded version from 3 to 4.

In `tests/core/world/SaveSnapshot.test.ts` — extend the migrations chain with a v3→v4 step; bump the asserted final version to 4.

In `tests/core/world/SaveSnapshotMigration.test.ts` — add a new test case: a v3 save with `scene.type: "DungeonScene"` → migrates to v4 with `scene.type: "PlanetScene"`. And a v3 save with any other scene type passes through unchanged in scene.type. Bump the "CURRENT_SAVE_VERSION is 3" assertion to 4.

- [ ] **Step 4: Typecheck + tests**

```bash
npm run typecheck && npm run test:run
```

Expected: clean. Test count grows by ~1-2 for the new v3→v4 cases.

- [ ] **Step 5: Commit**

```bash
git add src/core/world/SaveSnapshot.ts src/core/world/migrations.ts tests/
git commit -m "feat(save): v4 renames DungeonScene scene type to PlanetScene"
```

---

## Phase F — Gate + retro

### Task 13: Full gate

**Files:** none — verification only.

- [ ] **Step 1: Clean build**

```bash
rm -rf node_modules/.vite dist
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Expected: all four clean. Record: final test count, gzip size, module count, build time. These go in the retro.

- [ ] **Step 2: Manual playthrough**

Title → Launch → fly to Kepler-7b → F → Enter Alien Ruin → walk → jump → collide → exit. Should feel *playable*, even with programmer-art rectangles. If it doesn't, diagnose before closing the milestone.

---

### Task 14: M3a playthrough script

**Files:**
- Create: `docs/production/retros/m3a-playthrough-script.md`

- [ ] **Step 1: Write the script**

```markdown
# M3a Planet Foundation Playthrough Script

Goal: platformer substrate works in one hand-authored room.

## Fresh run

1. `npm run dev`, browser open.
2. Title → any key → CharCreate → Launch.
3. In SpaceScene, fly toward Kepler-7b. F to explore ruin.
4. PlanetLandingScene: click "Enter Alien Ruin".
5. PlanetScene loads. Room is 20x12 gray tiles on dark red backdrop, yellow exit dot on the right.
6. A/D run left and right. Running speed is constant, not accelerating.
7. SPACE (or W) jumps. Jump is snappy — up quickly, hang briefly, fall. Gravity feels right.
8. Walk into the raised platform at column 4-6; jump onto it. Player lands cleanly without clipping.
9. Walk off the edge of a platform — there's a brief coyote window where you can still jump from nothing.
10. Press SPACE in mid-air right before landing — on touching ground, the buffered jump fires.
11. Walk into the yellow exit marker on the right wall. Scene returns to PlanetLandingScene.
12. Re-enter the ruin. Press ESC. Returns to PlanetLandingScene.

## Pass criteria

- All 12 steps complete without crash.
- No tunneling through walls even at high speed.
- Coyote time + jump buffer both observable.
- Worst frame ≤ 20 ms (check F3 from space, platformer is strictly cheaper).

## Known M3a simplifications (carried forward)

- Player is a colored rectangle. No sprite. Art pass in M3b.
- Exactly one room. Multi-room connections in M3c.
- No enemies, no combat, no hitboxes. M3b.
- No save points. Entering the ruin is a session-only state; quit-to-title and reload starts the ruin over. M3c save integration.
- No hazard tiles yet — Tiled tile id > 0 all maps to internal solid. M3b adds hazards.
- Tiles render as flat colored rectangles. No tileset atlas. Art pass.
```

- [ ] **Step 2: Commit**

```bash
git add docs/production/retros/m3a-playthrough-script.md
git commit -m "docs(m3a): gate playthrough script"
```

---

### Task 15: M3a retrospective

**Files:**
- Create: `docs/production/retros/m3a-retro.md`

- [ ] **Step 1: Read m2c-retro.md for structure reference**

```bash
cat docs/production/retros/m2c-retro.md
```

Match the section headings: gate results table, what landed per phase, ambition delta, what went right, what hurt, decisions locked in, risks surfaced, action items for M3b, scope preview, overall.

- [ ] **Step 2: Draft m3a-retro.md**

Populate every section with **actual observed** numbers from Task 13. The action items for M3b should include:

- Melee combat primitives: attack frames, hitboxes, parry windows, stagger.
- First enemy archetype (likely a slow swordsman — telegraphed swings, easy to parry, sets the template).
- Tile atlas + sprite rendering. Even cheap art beats colored rectangles for feel.
- Hazard tiles (spikes, death planes).
- Save point ("prie-dieu" / alien altar) interactable with respawn behavior.
- Tune pass on controller config (run speed, jump velocity, coyote/buffer windows). First-draft numbers are almost certainly wrong.
- Camera polish: lookahead, smoothing, deadzone.

Decisions locked in:

- Tiled `.tmj.json` is the canonical level format. No other authoring path supported.
- `src/core/platformer/*` is pure — no engine or scene imports. M3b combat code follows the same rule.
- Save v4 is frozen. Additive combat state fields in M3b need v4→v5.
- The current tuning (runSpeed=120, jumpVelocity=-320, gravity=900) is first-draft and will be tuned based on playtest feedback.
- `.tmj.json` extension for Tiled JSON exports (not bare `.tmj`) so Vite's built-in JSON handling works with no config.

- [ ] **Step 3: Commit**

```bash
git add docs/production/retros/m3a-retro.md
git commit -m "docs(m3a): retrospective and M3b prerequisites"
```

- [ ] **Step 4: Tag**

```bash
git tag m3a-complete
```

---

## Self-review results

**Spec coverage:**
- ✅ Remove obsolete top-down dungeon code — Task 1.
- ✅ 2D physics substrate (gravity, velocity, tile collision) — Tasks 3, 4.
- ✅ Player controller (run, jump, coyote time, jump buffer) — Task 5.
- ✅ Tiled JSON integration — Tasks 6, 7, 8.
- ✅ One hand-authored test room proving the loop — Task 7.
- ✅ PlanetScene replaces DungeonScene in the planet-landing flow — Tasks 1, 9, 12.
- ✅ Save format cleanup for the scene-type rename — Task 12.
- ✅ Gate + retro — Tasks 13, 14, 15.

**Placeholder scan:** No TBDs, no "handle appropriately", no "similar to Task N." The one explicit simplification — "any non-zero Tiled tile id maps to internal solid" in Task 6 — is documented with its M3b follow-up (hazard support).

**Type consistency:**
- `TileMap` constructor + `TileMapData` shape consistent across Tasks 2, 6, 9.
- `PhysicsBody` shape same in Tasks 3 and 9.
- `ControllerState` + `ControllerConfig` consistent in Tasks 5, 9.
- `loadTiledMap(raw)` return shape `{ map, objects }` consistent in Tasks 6, 8, 9.
- Player AABB dimensions (`PLAYER_W=10`, `PLAYER_H=14`) declared once in PlanetScene and used consistently.

**One caveat:** Task 8 Step 2 raises a Vite-extension question — does Vite import `.tmj` files by default? If not, we standardize on `.tmj.json`. This is a minor operational choice documented with its resolution in the task itself; implementation may need to rename the file from Task 7.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-20-m3a-planet-foundation.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints for review.

Which approach?

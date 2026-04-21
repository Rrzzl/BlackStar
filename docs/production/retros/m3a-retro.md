# M3a Planet Foundation — Retrospective

**Date:** 2026-04-20
**Phase:** M3a (Planet Foundation — 2D platformer substrate, Tiled integration, first hand-authored room, save v4)
**Status:** Headless gate passed. Manual playthrough owed before M3b opens.

## Gate results

| Gate | Result | Notes |
| --- | --- | --- |
| `tsc --noEmit` | Clean | strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| `eslint src tests` | Clean | No warnings |
| `vitest run` | **115 / 115** | 25 test files, 1.59 s total |
| `vite build` | 43.36 kB js (14.15 kB gzip) | 55 modules, 348 ms |

Test count delta vs M2c: +26 (−5 DungeonGen demolition, +5 TileMap, +5 Physics2D, +5 Collision, +8 Controller, +4 TiledLoader, +3 EntryRoomIntegration, +1 v3→v4 DungeonScene-rename migration case). Module count delta: +3. Gzip delta: +0.50 kB. Budget ceiling of 25 kB gzip / 80 modules (set in M2c retro) remains comfortably in reach.

## What landed

### Phase A — Demolish the old top-down dungeon
- Removed `src/scenes/DungeonScene.ts`, `src/core/procgen/DungeonGen.ts`, `src/core/procgen/RoomDef.ts`, `src/content/rooms.json`, `tests/core/procgen/DungeonGen.test.ts`. Both `src/core/procgen/` and `tests/core/procgen/` directories are gone.
- `PlanetScene` stub keeps `PlanetLandingScene` compiling.
- `TitleScene.sceneFromSnapshot` `case "DungeonScene"` branch replaced with `case "PlanetScene"`.
- Clean removal, no archive branch. Git history carries the deleted code.

### Phase B — 2D physics substrate (pure logic)
- `src/core/platformer/types.ts` — shared `Vec2`, `AABB`, `TileId`, `TileMapData`, `ObjectMarker`.
- `TileMap` — tile grid with bounds-safe `isSolid` / `isSolidAtPixel` / `tileAt` / `tileIdAtPixel`. Out-of-bounds queries return solid (1) so gameplay code never has to handle the edge case.
- `Physics2D.stepPhysics` — pure velocity integration, gravity + terminal velocity clamp, immutable input.
- `Collision.resolveAABB` — **swept** AABB-vs-tilemap, not a destination point-probe. Iterates tile cells along the sweep path and stops at the first solid. Sweeps X then Y independently; returns contact flags for ground/ceiling/left/right walls.
- `Controller.updateController` — run (flat runSpeed), facing, coyote time (0.1 s), jump buffer (0.12 s). Buffer semantics are set-then-decrement in the same frame so mid-air presses show the expected `bufferSec − dt` immediately.

### Phase C — Tiled integration
- `TiledLoader.loadTiledMap` — parses the Tiled `.tmj.json` export into a `TileMap` + `ObjectMarker[]`. Requires a `"collision"` tile layer; any non-zero tile id maps to internal solid. Throws on missing collision layer.
- `src/content/planets/kepler-7b/entry.tmj.json` — first hand-authored 20×12 room: walls on all edges, two platforms (one raised at rows 5/cols 4-6, one floating at row 6/cols 12-15), `player_spawn` at (32, 144), `exit` at (288, 144). Render target is a dark-red backdrop with gray tiles and a yellow exit dot.
- `EntryRoomIntegration.test.ts` — lightweight invariant test on the real room file: dimensions, walls on all four edges, spawn + exit markers present.

### Phase D — PlanetScene wiring
- `PlanetScene` now assembles the real substrate: loads the Tiled room on construction, places the player at `player_spawn`, runs a per-frame probe → controller → physics → collision pipeline, resolves the exit marker by proximity, returns to `PlanetLandingScene` on exit-touch or ESC.
- HUD: `KEPLER-7B — ENTRY` title (top-left) + `A/D run · SPACE jump · ESC leave` hint (bottom-center).
- Camera is a centered clamp against map bounds — no smoothing, no lookahead. Polish lands in M3b.

### Phase E — Save v4
- `CURRENT_SAVE_VERSION = 4`.
- `v3 → v4` migration rewrites `scene.type === "DungeonScene"` to `"PlanetScene"` and leaves everything else untouched. All other scene types pass through unchanged.
- Test fixtures bumped to v4 across `Save.test.ts`, `SaveSnapshot.test.ts`, `SaveSnapshotMigration.test.ts`. One new migration test case verifies the DungeonScene→PlanetScene rewrite.

## Ambition delta vs vanilla M3a

Vanilla M3a (per the pre-plan brief) called for: demolish top-down dungeon, pure-logic platformer substrate, Tiled integration, one hand-authored room, `PlanetScene` replacing `DungeonScene`, save format cleanup. Two stretch decisions landed on top:

1. **Swept tile collision, not point-probe.** The plan's first-draft `resolveAABB` only tested the destination position; at `dx=200` it would skip right through walls. The shipped implementation walks tile cells along the sweep path and stops at the first solid. This is the algorithm that actually powers Celeste/Hollow-Knight-style tile platformers.
2. **Same-frame buffer semantics.** The controller decrements the jump buffer the frame you press, so the coyote/buffer feedback in tests (and gameplay) is a tight `cfg.jumpBufferSec − dt`, not a stale `cfg.jumpBufferSec` that decays next frame. Same treatment for coyote timer on ground-leave.

Both are first-principles correctness fixes disguised as deviations — the spec's tests effectively demanded them. They landed as Task 4 and Task 5 revisions.

## What went right

- **TDD for every pure-logic module.** TileMap, Physics2D, Collision, Controller, TiledLoader all have test files before they have implementations. Zero logic shipped without coverage.
- **Core purity held through a whole new subsystem.** `src/core/platformer/*` imports only from `@core/`. Six new files, invariant unbroken.
- **Subagent-per-phase worked well for demolition and pure-logic phases.** Phase A (mechanical delete) and Phase C (load + fixture + test) one-shotted on first dispatch. Phase B surfaced two real spec bugs — exactly the moment where a subagent is most valuable: it ran into the wall and reported blocked rather than silently patching around the spec.
- **The `.tmj.json` filename guess was right.** Vite's native JSON import handled it with zero config. No `vite.config.ts` asset rule, no custom plugin.
- **Save v4 was a 5-minute chore.** Migration strategy is paying off — each format bump is mechanical.

## What hurt

- **The plan had a latent collision bug that the tests didn't catch on paper.** Task 4's `resolveAABB` was a point-probe that would have tunneled through walls at any non-trivial velocity. Caught in the first subagent run; cost one re-dispatch. Lesson: spec code blocks should be typed into a scratch file and run before being frozen into a plan.
- **The plan's Controller tests were self-inconsistent.** Tests 5 and 7 both start from `fresh()` (coyoteTimer=0) but require contradictory outcomes from that starting state. Caught by the second subagent. Resolution: test 5 builds the grounded→airborne transition explicitly, buffer semantics set-then-decrement. Lesson: when writing TDD tests in plans, trace every expected value by hand first.
- **The plan's Task 9 integration had a `Math.max(body.vy, controller.vy)` call** that silently discards jump impulses while falling. The fix is a single line (`body.vy = controller.vy` after syncing controller.vy from body.vy at frame start) but the bug would have shipped if nobody on the review side was thinking about signs. Lesson: avoid clever velocity-merging; one authority owns velocity per frame.
- **No manual playthrough yet.** Headless gate is clean but cannot prove the substrate *feels* like a platformer. Tuning numbers (runSpeed=120, jumpVelocity=-320, gravity=900, coyote=0.1, buffer=0.12) are first-draft guesses. **Block M3b work until someone runs the script.**
- **Camera is a centered clamp with no lookahead or deadzone.** Fine for a 20×12 room that fits on screen, already clunky for anything larger.
- **Zero-byte `width`/`height` on the Tiled object markers.** Works because we treat spawn/exit as points, but Tiled itself will default `width`/`height` to non-zero when the level editor is installed. The loader needs to ignore those fields when they exist — currently they're in the `TiledObject` interface but unused.

## Decisions locked in (ripple into M3b+)

- **Tiled `.tmj.json` is the canonical level format.** No other authoring path. When the Tiled editor is installed, its export is drop-in compatible with the loader.
- **`src/core/platformer/*` is pure.** No engine, scene, or UI imports. M3b melee code follows the same rule.
- **Save format v4 is frozen.** Any additive planet-run state (hp, save point, collected keys) needs v4→v5.
- **Collision is swept, X then Y independent.** Corner-case resolution falls out of the sweep order. M3b enemies use the same `resolveAABB` call.
- **Controller owns velocity every frame.** Scene syncs `controller.vy = body.vy` at frame start, then `body.vy = controller.vy` after the controller call. No max/min merging.
- **Buffer and coyote timers are set-then-decrement in the same frame.** Deliberate — feels tighter in hand, and the test suite requires it.
- **Tuning numbers in `CONTROLLER_CFG` and `PHYSICS`** (runSpeed=120, jumpVelocity=-320, gravity=900, terminalVelocity=600, coyoteTimeSec=0.1, jumpBufferSec=0.12) are **first-draft**. They will be tuned against M3b playtest feedback, not preemptively.
- **Pause key is `KeyP`. Manual playtest uses `ESC` to leave the planet scene.** These are load-bearing — don't rebind without touching every scene.

## Risks surfaced / raised

- **`PlanetScene.update` probes contacts with a 1-pixel downward sweep before running the controller.** Correct for flat floors, possibly fragile on slopes or one-way platforms. Revisit when those ship.
- **The loader ignores hazard tiles.** All non-zero tiles become solid. When M3b adds spikes or death planes, the loader needs a second tile id (2) for hazard, or a separate `hazards` layer. Decide the shape before committing.
- **Object-layer rectangles aren't used.** `player_spawn` and `exit` are treated as points. If M3b needs triggered zones (e.g. a volume that opens a door), we need a size-aware interpretation.
- **Platform art is flat rectangles.** Gray walls, yellow exit, captain-paint player. Every `r.drawRect` in `PlanetScene.render` becomes a sprite call in the M3b tile-atlas pass.
- **One room, one planet.** Multi-room traversal (doors, transitions, persistence of state across rooms) is entirely unscoped — M3c territory.
- **Tactical pause doesn't exist on the planet surface.** SpaceScene has it; PlanetScene does not. Combat in M3b will need to decide if `KeyP` pauses, opens a map, or does nothing.

## Action items before M3b

1. **Manual playthrough** against `docs/production/retros/m3a-playthrough-script.md`. All 12 steps, including coyote + buffer, including ESC and exit-touch flow. Record any failures.
2. **Tune pass** on `CONTROLLER_CFG` + `PHYSICS` based on how the playthrough feels. First-draft numbers are almost certainly wrong.
3. **Camera polish:** lookahead in movement direction, smoothing (lerp), deadzone so small movements don't scroll. Blocks any room larger than 640×360.
4. **Hazard tile support** in `TiledLoader` (internal tile id 2 = hazard). Used by M3b spike tiles.
5. **Sprite rendering hook.** Even a single-color 10×14 player rectangle is insulting; a pixel-art placeholder unblocks the M3b art pass.
6. **Decide planet-pause behavior.** `KeyP` semantics — pause, menu, map, nothing.

## M3b scope preview (Melee Combat)

- Melee primitives: attack frames, hitboxes, parry windows, stagger, i-frames.
- First enemy archetype — telegraphed-swing swordsman (slow, read-and-react, sets the template).
- Tile atlas + sprite rendering (Pass 1 of planet-side art).
- Hazard tiles (spikes, death planes).
- Save point ("prie-dieu" / alien altar) as an interactable object type with respawn behavior.
- Tune pass on controller + physics.
- Camera polish: lookahead + smoothing + deadzone.

Souls-like difficulty target: telegraphed, readable, punishing but learnable. Parry > dodge > trade > tank.

## Overall

M3a is done. Six phases, 11 commits, +26 tests, +3 modules. The obsolete top-down dungeon is buried. A pure-logic 2D platformer substrate — with swept tile collision, coyote time, and jump buffer — is in `src/core/platformer/`. A first hand-authored Tiled room proves the pipeline end-to-end. Save v4 quietly renames `DungeonScene` to `PlanetScene` for any persisted session.

Next real work is a browser playthrough to confirm M3a *feels* right (or flag the tuning deltas), then M3b melee combat.

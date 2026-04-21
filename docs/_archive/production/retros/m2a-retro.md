# M2a Foundations — Retrospective

**Date:** 2026-04-12
**Phase:** M2a (Integration Slice — Foundations)
**Status:** Gate passed

## Gate results

| Gate | Result | Notes |
| --- | --- | --- |
| `tsc --noEmit` | Clean | strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes |
| `eslint src tests` | Clean | No warnings |
| `vitest run` | **57 / 57** | 12 test files, 923 ms total |
| `vite build` | 19.89 kB js (7.32 kB gzip) | 30 modules, 230 ms |

Expected test count from plan matched exactly: 23 (M1) + 4 Pricing + 5 Stockpile + 3 Trader + 5 Loadout + 4 PowerBudget + 3 SaveSnapshot + 5 Physics + 3 Save + 2 Assets = 57.

## What landed

- **Engine layer:** `Physics`, `Save` (slot-keyed localStorage + migration chain), `Assets` (JSON + image cache), `Audio` (WebAudio wrapper w/ silent fallback), `Renderer.mouseToInternal()`, `Scene`/`GameLoop` refactor to services object + async `enter`.
- **Core/economy:** `GoodsRegistry`, `Pricing.calcPrice`, `Stockpile`, `Trader` (delta-greedy planner), `Economy` orchestrator (`tick`, `replanIdleTraders`).
- **Core/ship:** `HullDef`, `ModuleDef`, `Loadout` with slot validation, `PowerBudget` (negative-draw reactors add to available pool).
- **Core/world:** `WorldClock` (interval subscriptions at game-time, 60× real dt), `SaveSnapshot` with `CURRENT_SAVE_VERSION=1` and `migrate()`, `Sector` data types + `buildStations()`.
- **Content:** 8 goods, 1 hull (shrike), 7 modules, 1 sector (grayline-reach) with 4 bodies / 2 stations / 4 routes / 20 traders.
- **UI widgets:** `Panel`, `Label`, `Button`, `Bar`, `List`, `Layout` helpers.
- **Scenes:** `LoadingScene`, `CharacterCreationScene`, `PauseOverlay` (render fn), `SpaceScene` integrating WASD flight, 20 trader visuals, economy tick, pause/save/load.

## Ambition delta against vanilla M2a

Five stretch targets from the master plan — all hit:

1. **20 NPC traders (not 10)** across 4 routes — forces the planner to be real, not a toy.
2. **Real v0→v1 save migration test** — `migrate()` exercised in `SaveSnapshot.test.ts`, not stubbed.
3. **Canonical sector data in JSON** — grayline-reach is the same file M2b/c/d will consume.
4. **Services-based `GameLoop`** — assets/audio/saveStore/worldClock all wired now, so M2b combat/AI can subscribe without plumbing work.
5. **Direct Vite JSON imports via `@content/*` alias** — no public/ mirror to maintain.

## What went right

- **Self-review caught two plan bugs before execution:** the Loadout core-slot test used a hull that already had a core slot (false negative), and the SpaceScene save task was missing imports. Fixing at plan time saved a mid-task pivot.
- **Pure `core/` invariant held.** Nothing in `core/` imports from `engine/` or `scenes/`. Verified incidentally by the 30-module build graph.
- **Fixed-timestep loop + WorldClock decoupling** means the economy ticks at exactly 1 Hz game-time regardless of frame rate. No drift risk.
- **Delta-greedy planner is dumb but deterministic** — scored by `delta * qty`, no RNG in route selection. Easy to test, easy to replace in M2c if we want a smarter agent.

## What hurt

- **M1 engine API surface was under-documented.** Had to live-inspect `Renderer`, `Input`, `Scene` before writing UI widgets. Discovered 6+ mismatches between plan assumptions and reality:
  - `Renderer.drawText` positional args, not options
  - `Renderer.internalWidth/Height`, not `width/height`
  - `Input.isMouseDown(button)` needs a button index
  - `Input.mouseX/mouseY` in canvas element coords, not internal 640×360
  - `Scene.enter` was sync-only
  - `SceneContext` lacked assets/audio/saveStore/worldClock
  - `GameLoop` took positional args instead of a services object
  - **Fix applied:** extended drawText with `align`, added `mouseToInternal()`, made `enter` `void | Promise<void>`, rewrote `SceneContext`, refactored `GameLoop` to take `GameServices`.
- **Not a git repo yet.** Plan had commit steps throughout; all silently skipped. We have zero checkpoints to rewind to. **Action:** `git init` + initial baseline commit before starting M2b.
- **No perf trace yet.** Plan called for a 60-second SpaceScene run with worst-frame ≤ 20 ms. Not executed because manual dev-server verification is still pending. **Action:** do a 60 s capture in the first M2b session before adding combat load.
- **Manual playthrough test still owed.** Title → any key → CharCreate → Launch → fly → pause → save → reload → same state. Typecheck + tests + build green is necessary but not sufficient.

## Decisions locked in (ripple into M2b+)

- **Save format shape is frozen at v1.** Any additive field in M2b/c/d needs a `migrate(v1 → v2)` step. No silent schema drift.
- **Trader visuals are separate from `Trader` logic.** `TraderVisual` is a render-only struct in SpaceScene; the authoritative `Trader` lives in `Economy`. M2c smarter AI plugs into `Trader`, not the visual.
- **Economy cadence:** 1 Hz tick, 10 Hz replan. If M2c wants smoother price curves, change the tick rate — don't add a second clock.
- **Captain species/class pool is stubbed to `human` / `gunslinger`.** M2b can expand without touching save migration because the fields are free-form strings.
- **No RNG seeding in M2a.** All `Math.random()` calls are in non-authoritative paths (trader visual jitter, retarget pick). M2b determinism work needs to audit and route through a seeded RNG before any combat lands.

## Risks surfaced / raised

- **Renderer hot path hasn't been profiled.** 20 trader dots + 4 bodies + 60 stars is trivial, but SpaceScene calls `sector.bodies.find(...)` per trader per frame — O(n·m). At M2b scale (enemies, projectiles, particles) this bites. **Mitigation:** cache target body reference on `TraderVisual` instead of id lookup.
- **`Math.random()` in trader retargeting** means no deterministic replay. Not a bug today, but the moment we want replays or networked lockstep it is. **Mitigation deferred to M2b determinism task.**
- **Save store is single-slot (`slot0`).** Multiple characters / ironman runs need a slot picker. Not M2a's job; flag for M2d UX pass.

## Action items before M2b

1. `git init` and commit the full M2a tree as baseline.
2. Manual playthrough: Title → CharCreate → Launch → fly → save → reload → verify state.
3. 60 s perf capture in SpaceScene; record worst frame + avg frame.
4. Seed RNG module (or pick one from engine/) and audit M2a callsites before combat.
5. Cache `targetBody` ref on `TraderVisual` to kill per-frame `.find()`.

## M2b scope handoff

Master plan §2 said write M2b just-in-time after M2a retros. The plan for M2b (Surfaces) should cover:

- **Combat loop primitives:** projectile pool, damage application, death/despawn, hit feedback.
- **Enemy AI (2 archetypes):** rusher (melee intercept) + shooter (kite + volley).
- **Weapon system:** 3 weapons (pulse laser I, autocannon I, one TBD) firing from installed Loadout slots with real power-budget gating.
- **Tactical pause stub:** pause overlay toggles a "planning mode" flag; full implementation is M2c, but the flag must exist so M2b combat can be paused without breaking fairness.
- **Determinism audit:** seeded RNG, no `Math.random()` in authoritative paths.
- **Perf budget:** worst frame ≤ 20 ms with 20 traders + 8 enemies + 40 projectiles on-screen.

## Overall

M2a is done. Scope was stretched five ways against vanilla and still landed in one sitting. Biggest cost was discovering the M1 API surface the hard way — pay it forward by keeping `docs/engine/api-surface.md` updated as M2b lands new engine hooks.

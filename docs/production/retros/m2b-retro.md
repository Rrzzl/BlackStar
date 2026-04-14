# M2b Surfaces — Retrospective

**Date:** 2026-04-14
**Phase:** M2b (Surfaces — station, loadout UI, planet landing, procedural dungeons, save slots)
**Status:** Gate passed (headless). Manual playthrough + perf capture owed against the next dev session.

## Gate results

| Gate | Result | Notes |
| --- | --- | --- |
| `tsc --noEmit` | Clean | strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| `eslint src tests` | Clean | No warnings |
| `vitest run` | **65 / 65** | 14 test files, 952 ms total |
| `vite build` | 33.48 kB js (11.27 kB gzip) | 44 modules, 309 ms |

Test count delta vs M2a: +8 (3 `SaveSnapshotMigration` + 5 `DungeonGen`). Net module count delta: +14 (44 − 30). Gzip delta: +3.95 kB. Acceptable envelope — combat/loot in M2c will add the next real bump.

## What landed

### Phase A — M2a debt
- Seeded RNG wired into `SpaceScene` (trader retargeting, visual jitter). `Math.random()` is gone from authoritative paths.
- `TraderVisual` now holds a direct `target: SectorBody` reference; no more per-frame `sector.bodies.find(...)`.
- `DebugOverlay` has a 120-sample ring buffer with `worst()` / `avg()` and a red-on-over-20ms readout.

### Phase B — Save format v2
- `CURRENT_SAVE_VERSION = 2`.
- `sector.playerBody: string | null` added to the snapshot shape so scene restore can map back to the body the player was docked at.
- `src/core/world/migrations.ts` shipped with a real v1→v2 step (injects `playerBody: null`).
- Three-test migration fixture (`SaveSnapshotMigration.test.ts`) validates version gate, v1→v2 upgrade, and v2 passthrough. Existing `Save.test.ts` + `SaveSnapshot.test.ts` fixtures were bumped to v2 with minimal churn.

### Phase C — Camera + interact
- `src/engine/Camera.ts`: lerp follow, max-combine shake, decay tick, `offsetX/Y` with jitter. `SpaceScene` owns one at follow=0.15 and snaps on save-restore.
- SpaceScene HUD shows the nearest-interactable prompt (`[F] Dock — <id>` / `[F] Land — <id>` / `[F] Explore Ruin — <id>`).
- `StationScene` / `PlanetLandingScene` stubs created to keep scene imports compiling.

### Phase D — StationScene
- Full panel layout: **Ship Loadout** (active) + **Shop (M2c)** + **Missions (M2c)** + **Depart**. Disabled buttons use a distinct dim style.
- F10 pause overlay with Resume / Save / Quit-to-Title.
- `buildSnapshot` writes `scene: { type: "StationScene", params: { stationId } }` + `sector.playerBody: stationId`.

### Phase E — ShipLoadoutScene
- Two-column panel (Installed | Available) with install/uninstall buttons per row.
- Live power budget readout (red on overbudget) and slot counts (W/I/U/C).
- `Loadout` threaded as a constructor arg across every scene transition: `CharacterCreationScene` → `SpaceScene` → `StationScene` → `ShipLoadoutScene` (and back). No more per-scene reconstruction.
- Save/load `buildSnapshot` still hardcodes `hullId: "shrike"` and `moduleIds: []` — **deferred to M2c** as part of save v3 work.

### Phase F — PlanetLandingScene
- Two planet variants: Kepler-7b offers **Enter Alien Ruin** → `DungeonScene`; Tessra-3 offers **Landing Zone Alpha** (disabled M2c placeholder).
- Both planets offer **Return to Orbit**. ESC returns to SpaceScene.
- `DungeonScene` stub created so `PlanetLandingScene` imports resolve.

### Phase G — DungeonGen (pure logic)
- `src/core/procgen/RoomDef.ts` with `tileAt()` bounds-safe accessor.
- `src/content/rooms.json`: 5 hand-authored Alien Ruin templates (entry_hall, pillar_chamber, long_corridor, junction, deep_chamber).
- `src/core/procgen/DungeonGen.ts`: seeded generator producing 5–8 rooms via chained spanning-tree connection. Invariants tested: determinism, seed-divergence, size bounds, connectivity, start-in-bounds (5 tests).
- **`RNG` relocated from `@engine/RNG` → `@core/RNG`.** Call sites updated in `SpaceScene`, `TitleScene`, `DungeonGen`, and the test file (renamed). `core/` purity invariant preserved — `grep -rn "@engine/RNG" src tests` returns zero.

### Phase H — DungeonScene
- Full room render (16 px tiles), WASD movement at 80 px/s with per-axis wall collision via `tileAt`, player-paint 10×10 dot.
- Door-tile transitions consume `PlacedRoom.doors` by index. Spawn-side fallback = first door of new room, one tile inward. Header shows `<RoomName> — Room N/M`.

### Phase I — Audio bed
- `Audio.play(id, volume, loop)` with silent fallback on missing buffer.
- `main.ts` preloads `ambient_space` + `click` against a non-existent `public/audio/` (404s swallowed via `.catch(() => {})`).
- `Button.ts` module-level `setButtonAudioHook` is fired on every click; `main.ts` wires it to `audio.play("click", 0.5)`.
- `SpaceScene.enter` starts the ambient loop (`audio.play("ambient_space", 0.2, true)`).

### Phase J — Save slots
- `SaveStore.SLOT_IDS = ["slot1", "slot2", "slot3"]`, static `loadFromSlot(id, migrations)` and `saveToSlot(id, snap)` helpers living alongside the existing instance API.
- `SaveSlotPickerOverlay` render function: semi-transparent backdrop + panel + up to 3 slot-row buttons (populated from `loadFromSlot`) + Cancel.
- `TitleScene` gains a "Continue" button (only visible after the intro fade) + a `sceneFromSnapshot` factory that reconstructs `SpaceScene` / `StationScene` / `PlanetLandingScene` / `DungeonScene` from `snap.scene.type` + `params`. `pickingSlot: boolean` gates key-to-new-game.
- `StationScene` pause overlay's Save button now opens the picker instead of writing directly; picked slot → `SaveStore.saveToSlot(id, this.buildSnapshot(ctx))`.

## Ambition delta vs vanilla M2b

Vanilla M2b per the master plan: StationScene + ShipLoadoutScene + PlanetLandingScene + DungeonGen (rooms-only) + round-trip save/load. Six stretch targets landed on top of that:

1. **Procedural seeded `DungeonGen` with determinism + connectivity tests** (not an M2c carryover).
2. **3 save slots with picker UI** (was originally M2d UX debt).
3. **Real v1→v2 migration with a fixture test** — the migration framework is now battle-tested, not stubbed.
4. **Camera primitive with smooth follow + shake hook** — drops straight into combat feedback in M2c.
5. **Audio bed wiring with silent fallback** — lets M2c ship real SFX without touching scenes.
6. **RNG layering cleanup** — moved `RNG` into `core/` so `procgen` doesn't break the purity invariant.

## What went right

- **Bite-sized phases let subagents carry implementation without drift.** Eleven phases, eleven dispatches, every one returned DONE with matching commit SHAs and tests green. The only `DONE_WITH_CONCERNS` was Phase B's expected fixture ripple (two old tests needed version bumps — minimal, reviewed, accepted).
- **Layering invariant survived a structural move.** Phase G relocated `RNG` across the `core/` boundary without leaving an `@engine/RNG` import anywhere. The grep check at the end was load-bearing.
- **Scene threading went cleanly.** Adding a fourth constructor arg (`loadout: Loadout`) to four scenes in Phase E took one commit because every call site was already visible from the plan text.
- **GameLoop frame-order bug from M2a handoff fixed early.** Moving `input.endFrame()` out of the fixed-update accumulator unblocked every button click in the game. Would have cost a full playthrough to chase later.
- **TypeScript strict flags caught at least three signature drifts at plan-vs-reality time** — `Scene.render(ctx, alpha)`, `Renderer.drawRect` naming, `SceneContext.audio` field — each adapted in-place by the implementing subagent without escalation.

## What hurt

- **Manual playthrough + perf capture are still owed.** The headless gate caught typecheck/lint/test/build but cannot run the browser. Action: first M2c session must open `npm run dev`, execute `docs/production/retros/m2b-playthrough-script.md`, record worst-frame + avg-frame from the F3 overlay. Block combat work behind that capture.
- **`ship.moduleIds` still hardcoded to `[]` in both `SpaceScene.buildSnapshot` and `StationScene.buildSnapshot`.** Load-from-slot rebuilds a bare `Loadout(shrike)` with just the base reactor. Action: M2c save v3 must serialize and restore installed module ids.
- **Door-pair indexing in `DungeonScene` is a simplification.** `doorIdx % placedDoors.length` works for the graph-walks-but-rooms-don't-line-up scope we're in, but any player who expects geometric continuity is going to notice. Action: M2c geometric door pairing.
- **Plan doc initially conflated M2b and M2c scope.** The M2a retro's "M2b scope handoff" section listed combat, weapons, enemies — that's M2c Loops per the master plan. Caught during plan drafting, but leaves the M2a retro's tail section misleading. Action: append a correction note to `m2a-retro.md` before M2c planning if it blocks anyone.

## Decisions locked in (ripple into M2c+)

- **Save format v2 is the new frozen shape.** `scene.type` + `scene.params` is the sub-scene restore protocol; new scenes must contribute a case to `sceneFromSnapshot` in `TitleScene`. Save v3 will add inventory/loot/module ids.
- **`RNG` lives in `core/`.** Engine code that needs RNG imports from `@core/RNG`. No RNG-adjacent helper may land in `engine/` without a scope review.
- **Scene constructors follow `(captain, seed, loadout, ...specific)`.** Any new scene that needs the captain/ship context honors this order so threading stays mechanical.
- **`SaveStore` has both instance (`slot0` legacy) and static (`loadFromSlot`/`saveToSlot`) APIs.** New call sites use static. The default instance in `main.ts` is vestigial — delete in M2c if nothing else grabs it.
- **Audio is silent-fallback by default.** No scene may depend on a specific `play` actually producing sound. Missing buffers must never throw.
- **Camera follow is 0.15 lerp, no inverse dt.** If we later want frame-rate-independent smoothing, change it once in `Camera.ts` — don't add a second follow curve elsewhere.

## Risks surfaced / raised

- **`DungeonGen` is currently pure topology, zero tile stitching.** Rooms don't line up physically; the generator only guarantees the room-graph is connected. Combat encounters that care about line-of-sight between rooms (M2c) will hit this.
- **`buildSnapshot` in `SpaceScene` doesn't serialize the player's world position yet** — on reload from a `SpaceScene` slot, the ship respawns at sector origin. Tolerable for M2b (scene type + station/planet id is enough) but a regression the moment M2c wants "save anywhere".
- **Save slot picker does zero confirmation on overwrite.** Clicking a populated slot overwrites it immediately. Low stakes today; wire a confirm dialog before M2d ironman mode.
- **No audio files means we have not verified the `loop` flag actually loops** — we only verified it typechecks and doesn't crash. Action: the first real ambient sample in M2c is a live test of the loop path.
- **Bundle size hit +3.95 kB gzip for this phase.** Most of it is the slot picker + DungeonGen + scene-factory indirection. Still comfortably inside the envelope, but M2c combat + projectile pool will add more. Keep an eye on it.

## Action items before M2c

1. **Manual playthrough** against `docs/production/retros/m2b-playthrough-script.md`. Record any failures before touching M2c code.
2. **60 s perf capture** in SpaceScene + a full dungeon walk. Record worst-frame + avg-frame from the F3 overlay. Budget is ≤ 20 ms worst. Block combat work if over.
3. **Save v3 design session**: serialize `ship.moduleIds`, ship position/velocity, current dungeon room + player tile. Draft migration v2→v3.
4. **Door-pair geometric connection** in `DungeonScene` (match door tiles on opposite sides of two rooms). Drop the modulo fallback.
5. **Append a correction note** to `m2a-retro.md`'s "M2b scope handoff" section pointing at the master plan.
6. **Delete the vestigial `SaveStore("slot0")` instance** in `main.ts` if no call site grabs it.

## M2c scope preview (Loops)

Per master plan §2: combat loop primitives, enemy AI (rusher + shooter), weapon system with real Loadout+PowerBudget gating, tactical pause stub, determinism audit, perf budget ≤ 20 ms with 20 traders + 8 enemies + 40 projectiles on-screen.

M2b carries these prereqs forward:
- Seeded RNG is already load-bearing → combat rolls plug in cleanly.
- `Camera.shake(mag, dur)` is already wired → hook on damage events.
- `DebugOverlay.worst()` is already wired → perf gate is one readout away.
- Audio bed is already wired → weapon SFX drop in without scene plumbing.
- `Loadout` + `PowerBudget` already gate install — weapons just need an activation path and projectile spawn on fire.

## Overall

M2b is done. Eleven subagent phases, zero rollbacks, 8 new tests, 14 new modules, and the game now has a full scene graph from title → sector flight → station → loadout UI → planet landing → procedurally-seeded ruin dungeons with room-to-room transitions → save across three slots → restore into any of those scenes. The headless gate is green. The owed piece is the browser playthrough — which is one `npm run dev` + the checklist in `m2b-playthrough-script.md` away.

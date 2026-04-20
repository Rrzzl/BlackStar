# M2c Loops — Retrospective

**Date:** 2026-04-17
**Phase:** M2c (Loops — combat primitives, enemy AI, weapons, tactical pause, save v3)
**Status:** Headless gate passed. Manual playthrough + F3 worst-frame capture owed before M2d opens.

## Gate results

| Gate | Result | Notes |
| --- | --- | --- |
| `tsc --noEmit` | Clean | strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| `eslint src tests` | Clean | No warnings |
| `vitest run` | **89 / 89** | 20 test files, 1.16 s total |
| `vite build` | 41.52 kB js (13.65 kB gzip) | 52 modules, 370 ms |

Test count delta vs M2b: +24 (6 Health + 3 ProjectilePool + 4 Hit + 4 Weapon + 4 EnemyAI + 2 Determinism + 1 extra Save migration). Module count delta: +8. Gzip delta: +2.38 kB. Everything still fits comfortably in the envelope.

## What landed

### Phase A — Combat primitives
- `Health` (pure): shield-first damage, hp clamping, dead at `hp <= 0`.
- `ProjectilePool` with fixed capacity (64), `spawn` / `free` / `tick` / `active`.
- `circleHit` (circle-circle).
- All three files live in `src/core/combat/*` and import only from each other. Core purity preserved.

### Phase B — Weapons
- `WeaponDef` + `WeaponRuntime` + `canFire` + `fire` + `tickCooldown`. Fire emits a `ProjectileSpawn` — pool wiring stays in the scene.
- `src/content/weapons.json` tuning file for the 3 weapons (pulse, autocannon, flak cannon).
- `flak_cannon_i` added to `modules.json` so it's installable.
- Space fires the primary weapon (first installed weapon slot).

### Phase C — Enemies
- `EnemyArchetype` data in `src/content/enemies.json` — rusher (fast, rams) and shooter (slow, kites + autocannon).
- 4 hand-placed spawns at sector coordinates.
- Pure steering: `steerRusher` (direct intercept) and `steerShooter` (approach → strafe at preferred range).

### Phase D — Damage resolution
- Projectile vs enemy and projectile vs player hit resolution via `circleHit`.
- Player `Health` calculated from hull base (100 hp / 50 shield) + loadout `stats.hp` / `stats.shield` additive bonuses.
- Enemies filtered out when `isDead`. Player death → `TitleScene`.
- Rusher contact damage: circle overlap with the player → applies `contactDamage` and rusher dies on impact.

### Phase E — Feedback scaffolding
- `Camera.shake(mag, duration)` called on player damage — smaller shake for projectile hits, bigger for rams.
- Red vignette overlay (`damageFlash`) that fades out over ~200 ms on hit.
- Muzzle flash list (yellow-white on fire, white on enemy-hit, orange on player-hit) — lightweight particle stub, no pool needed at this count.

### Phase F — Tactical pause + determinism
- Pause (`KeyP`) freezes everything except ship rotation. A dashed yellow line shows predicted max-range trajectory so the player can plan a shot.
- `grep "Math.random" src/core` returns empty. The two remaining `Math.random` uses in `Camera.ts` are cosmetic shake jitter (non-authoritative).
- `tests/core/combat/Determinism.test.ts` asserts RNG seed stability and steering purity. Combat code paths cannot silently regress.

### Phase G — Save v3
- `CURRENT_SAVE_VERSION = 3`.
- New `SerializedEnemy` shape in the sector snapshot; `ship.hp` + `ship.shield` fields now written from the real `playerHealth` (not hardcoded 100/50).
- v2→v3 migration appended — adds empty `enemies: []` to the sector.
- All three affected test files (Save, SaveSnapshot, SaveSnapshotMigration) updated: fixtures bumped to v3, the migration chain extended, one new case verifying the v2→v3 step.
- `StationScene.buildSnapshot` updated to include `enemies: []` so docked saves still pass the schema.

## Ambition delta vs vanilla M2c

Vanilla M2c (per the M2a retro's handoff section) called for: combat primitives, 2 enemy archetypes, 3 weapons, tactical pause stub, determinism audit, perf budget. Five stretch targets landed on top:

1. **Pure pooled projectiles** — no per-frame allocations. Future scaling is a pool-size constant change.
2. **Shield-first damage math** with loadout bonuses — full character build already feeds into combat.
3. **Save v3 includes enemies** — reload resumes mid-fight, not just pre-fight.
4. **Combat feedback scaffolding** — shake + vignette + flashes all in place so M2d graphics pass has hooks to upgrade, not hunt for.
5. **Determinism regression test** — keeps the combat RNG story honest as it grows.

## What went right

- **Fresh subagent per phase** was still the right call for Phase A (clean TDD tasks), but Phase B onward was faster inline because the scope was small and the edit sites were known. Don't force subagents when inline is cheaper.
- **TDD for all pure-logic modules** — Health, ProjectilePool, Hit, Weapon, EnemyAI, Determinism. Every combat module has a test file. Nothing combat-adjacent landed without coverage.
- **Core purity held through an 8-module expansion.** `src/core/combat/*` imports only from `@core/`. The layering invariant is surviving everything we throw at it.
- **Save v3 migration covers both v1→v3 and v2→v3** paths in tests. Any saved game from any prior version restores cleanly.
- **Feedback is wired even without art.** Combat at rectangles-and-flashes already reads — damage is legible, hits feel like something, ramming feels heavier than shooting. Pass 1 (M2d graphics) has a stable scaffold to decorate.

## What hurt

- **`availablePower` is hardcoded to 100 in three call sites** (`SpaceScene` player fire, enemy shooter fire twice). `PowerBudget` exists in core but isn't plumbed into `canFire`. M2d polish task.
- **Player death → TitleScene is crude.** No "you died" screen, no captain-log entry, no estate inheritance. Legacy mechanic is future milestone work.
- **Enemy spawns are hand-placed.** M2c ships 4 enemies at fixed coordinates. A real encounter/wave system belongs to M2d+.
- **Dungeon still has no combat.** Ship-vs-ship only. Dungeon-floor combat (WASD + weapon) is M2d.
- **Manual browser playthrough + F3 worst-frame capture not yet done.** Headless gate is clean but cannot prove the game *feels* right. Block M2d work until someone runs the script.
- **Modules.json duplicates weapon tuning that weapons.json also carries.** Damage + range exist in both places. The module entry is for slot fit, weapons.json for behavior — but that's a footgun. M2d cleanup: drop the redundant stats from modules.json.

## Decisions locked in (ripple into M2d+)

- **Save format v3 is frozen.** Any additive combat field (e.g. weapon overheat, per-ship damage log) needs v3→v4 migration.
- **Projectile pool capacity is 64.** If a weapon type or wave needs more, bump the constant — don't add a second pool.
- **Combat RNG comes from `@core/RNG`.** No `Math.random` in any gameplay path.
- **Weapon tuning lives in `weapons.json`.** Slot fit lives in `modules.json`. These are two sides of one concept and both are authoritative for their axis — never duplicate.
- **Player death resets to title.** Permadeath-with-legacy will replace this in the Legacy milestone; until then, death is a hard reset and saves are the continuity mechanism.
- **Feedback scaffolding is the canonical hook point for the graphics pass.** Pass 1 (M2d) upgrades existing call sites, does not introduce new ones.

## Risks surfaced / raised

- **`SpaceScene` is getting heavy.** ~450 lines, five concerns entangled: flight + economy + traders + enemies + UI. If M2d adds particles and sprite rendering, a split is overdue. Candidate: move combat update/render into a `CombatSystem` class the scene calls.
- **Tactical pause freezes projectiles in flight.** Arguably correct (they're time-frozen), arguably wrong (rendering them hanging in space looks broken). Pass 1 will show us which reads better visually.
- **Shooter's `d < 260` firing-range check is hardcoded** in SpaceScene, not pulled from the weapon or archetype. Duplicate tuning knob. Move to archetype data in M2d.
- **Enemies never replenish.** Kill all 4 and the sector is empty forever. Waves, respawn timers, or the Decay Clock spawning them on schedule — pick the model in M2d.
- **Gzip is at 13.65 kB and modules at 52.** Not a concern yet, but M2d (graphics + audio) will dominate the bundle. Budget ceiling for M2d completion: 25 kB gzip / 80 modules. Revisit if breached.

## Action items before M2d

1. **Manual playthrough** against `docs/production/retros/m2c-playthrough-script.md`. Record any failures.
2. **60 s F3 capture** in a combat scenario — worst frame ≤ 20 ms is the bar.
3. **Drop weapon tuning from modules.json** (keep slot + power only; behavior lives in weapons.json).
4. **Plumb `PowerBudget` into `canFire`** so weapon gating is real.
5. **Move `shooter.firingRange` into the archetype JSON** (currently hardcoded to 260 in SpaceScene).
6. **Consider splitting `SpaceScene`** before M2d graphics lands. Proposed: `CombatSystem` (projectiles, enemies, hits, feedback) as its own class.

## Graphics roadmap — locked in

Standing commitment (per earlier decision): graphics come in **three scheduled passes**, not one end-of-development crunch.

- **Pass 1 = M2d "Combat Feedback."** Sprite art for ships and projectiles, particle pool for impacts/engine trails, animated damage states, real muzzle/hit art, hit stop, damage number popups. Required before combat can be tuned.
- **Pass 2 = "Tone Pass"** (after signature mechanics — Decay Clock, Legacy, Black Star event). UI redesign from gray rectangles to ship-HUD aesthetic, per-scene color grading, faction iconography, alien glyph fonts for ruins.
- **Pass 3 = "Launch Polish"** (before ship). Transitions, trailer moments, final palette tuning.

Placeholder rectangles are the correct aesthetic *for now*. Every `r.drawRect` for combat entities becomes a sprite call in Pass 1 — clean swap.

## M2d scope preview (Combat Feedback)

- Sprite pipeline: `Renderer.drawSprite`, basic atlas loader, sprite imports for the 5 combat entities (player ship, rusher, shooter, projectile, muzzle).
- Particle system: per-hit particle bursts, engine trails, explosion on death.
- Polish: PowerBudget integration, enemy waves or Decay-driven spawns, `CombatSystem` refactor out of `SpaceScene`.
- Carry the 3-pass graphics plan forward — Pass 1 ships alongside these systems.

## Overall

M2c is done. Eight phases, 22 commits, +24 tests, +8 modules. The game has real combat: fire, hit, take damage, die, save mid-fight, restore mid-fight. The core/engine/scenes layering invariant survived another major expansion. The scaffolding for the graphics pass is in place and waiting.

Next real work is a browser playthrough to confirm M2c *feels* like combat, then M2d graphics + polish.

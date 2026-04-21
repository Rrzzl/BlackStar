# M3a Handoff — Read This First

This doc exists so a fresh Claude Code chat can pick up execution of M3a without any prior conversation context. Point the new session at this file and it should have everything it needs.

## What we're doing

Executing the implementation plan at:

**`docs/superpowers/plans/2026-04-20-m3a-planet-foundation.md`**

That plan is self-contained: file paths, exact code blocks, exact commands, test fixtures, commit messages. Read it front to back before starting.

## Game premise (in one paragraph)

Black Star is a 2D game where **on-planet is a side-scrolling metroidvania** (Blasphemous / Hollow Knight lineage — hand-crafted rooms, gravity + jump + melee, gothic-alien ruin tone, souls-like difficulty) and **space is a second layer** (dogfight combat, trade, exploration between planets). The space half is already built through M2c Loops. On-planet is being rebuilt from the ground up starting with M3a.

## What's shipped

- **M1** engine foundations (GameLoop, Scene, Input, Renderer, Save, Audio, etc.)
- **M2a** economy (Trader + Pricing + Stockpile), ship Loadout + PowerBudget, save v1
- **M2b** surfaces (StationScene, ShipLoadoutScene, PlanetLandingScene, save slots, save v2)
- **M2c** space combat (projectile pool, weapons, 2 enemy archetypes, tactical pause, save v3)

Tags: `m2b-complete`, `m2c-complete`. 89 tests passing. Bundle 41.5 kB js (13.65 kB gzip).

## What M3a does

1. **Demolishes the old top-down dungeon** (`DungeonScene`, `DungeonGen`, `RoomDef`, `rooms.json`). These are scaffolding from a pre-pivot game shape.
2. **Builds a pure-logic 2D platformer substrate in `src/core/platformer/`** — `TileMap`, `Physics2D`, `Collision`, `Controller`, `TiledLoader`. All TDD. All tested.
3. **Introduces Tiled `.tmj.json` as the canonical level format** — hand-author rooms in the [Tiled Map Editor](https://www.mapeditor.org/) or by hand.
4. **Ships one hand-authored room** at `src/content/planets/kepler-7b/entry.tmj.json` — 20×12 tiles with floor, walls, two platforms, player spawn, exit marker.
5. **Wires a new `PlanetScene`** that replaces `DungeonScene` in the planet-landing flow. Player runs, jumps, collides, reaches exit → returns to `PlanetLandingScene`.
6. **Bumps save format to v4** — renames the `"DungeonScene"` scene type to `"PlanetScene"` with a v3→v4 migration.

No combat. No enemies. No save points. Just the foundation. Combat lands in M3b.

## Non-negotiable constraints

These are load-bearing. Violating them breaks the architecture.

- **Layering invariant:** `src/core/` NEVER imports from `@engine/`, `@scenes/`, or `@ui/`. Verify with `grep -rn "@engine\|@scenes\|@ui" src/core` — must be empty.
- **Strict TS:** `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. Array accesses need `!` or null checks.
- **Seeded RNG only** in authoritative paths. `Math.random()` banned in `src/core/` and gameplay paths. Cosmetic jitter (e.g. camera shake) is allowed.
- **Level format is `.tmj.json`** (Tiled JSON with `.json` extension appended so Vite imports it natively). Do NOT use bare `.tmj` — Vite doesn't recognize that extension by default.
- **Pause key is `KeyP` everywhere.** Never F10 (browsers capture it).
- **Save format is versioned.** M3a bumps CURRENT_SAVE_VERSION to 4 and adds a v3→v4 migration. Every schema change needs a migration.
- **Commits use the bot identity:** `git -c user.email="dev@blackstar.local" -c user.name="Black Star Dev" commit -m "..."`. No emojis in commit messages. No `Co-Authored-By` trailers unless explicitly requested. No `🤖 Generated with Claude Code` lines.
- **No `--no-verify`, no `--amend`.** If a hook fails, fix the cause and create a new commit.

## Execution flow

The plan assumes **subagent-driven execution** — same pattern that shipped M2b and M2c cleanly. One subagent per phase (not per task — phases group 2-4 related tasks):

1. Read the current phase's tasks from the plan.
2. Dispatch a general-purpose subagent with:
   - The complete task text from the plan (not a summary — full code blocks, full commands).
   - The relevant file-level context (what exists, what signatures are already in use).
   - Explicit non-negotiable rules from this doc.
   - Expected commit SHAs and test counts.
3. When the subagent reports DONE, verify independently: `git log --oneline -N`, `git show --stat <sha>`, `npm run typecheck`, `npm run test:run`.
4. Mark the phase done in a `TodoWrite` list. Dispatch the next phase.
5. After the last phase, do a final clean build (`rm -rf node_modules/.vite dist && npm run typecheck && npm run lint && npm run test:run && npm run build`).

Each phase is its own commit chain. Don't batch-commit across phases. Don't skip the spec-vs-implementation verification.

## Tools / conventions already in the repo

- `npm run dev` — Vite dev server on http://localhost:5173/
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint over `src tests`
- `npm run test:run` — Vitest one-shot
- `npm run build` — typecheck + Vite build
- Path aliases live in `tsconfig.json` + `vite.config.ts` — `@engine/`, `@core/`, `@scenes/`, `@ui/`, `@content/`.
- Scene lifecycle: `enter(ctx)`, `update(ctx, dt)`, `render(ctx, alpha)`, `exit(ctx)`. `Scene.render` is `(ctx: SceneContext, alpha: number) => void`.
- `SceneContext` services: `input`, `renderer`, `assets`, `audio`, `saveStore`, `worldClock`, `changeScene`.
- Current `SpaceScene` constructor: `(captain: CaptainState, seed: number, loadout: Loadout, spawnBodyId?: string, snapshot?: SaveSnapshot)`.
- Other scene constructors: `(captain, seed, loadout, planetId|stationId)`.
- `PauseOverlay` accepts optional `onSave` — scenes that can't persist yet omit it.

## How to start a fresh chat

Paste the following as your opening message to a new Claude Code chat:

---

**Executing implementation plan at `docs/superpowers/plans/2026-04-20-m3a-planet-foundation.md` using the subagent-driven-development skill. Before starting, read `docs/production/m3a-handoff.md` for full context and non-negotiable constraints. Verify the current state matches the handoff (git log, tests green, tag `m2c-complete` present) then begin Phase A.**

---

That opening, plus this doc, plus the plan doc = full context. No other conversation history needed.

## If something looks wrong

- **The plan's first-draft tuning numbers** (`runSpeed: 120`, `jumpVelocity: -320`, `gravity: 900`, `coyoteTimeSec: 0.1`, `jumpBufferSec: 0.12`) are guesses. They compile and tests pass, but the game may feel floaty or snappy or weird. That's an M3b tuning concern, not an M3a blocker. Ship first, tune second.
- **The first room is hand-authored and minimal.** Two platforms and an exit. It's a correctness proof, not a fun room. Full rooms come in M3c.
- **Art is programmer rectangles.** Gray walls, colored player, yellow exit dot. Sprite art is the Pass 1 graphics task in M3b.
- **If Vite complains about `.tmj.json` imports**, the file rename in Task 8 handles it. Don't add a `vite.config.ts` asset rule.
- **If a subagent reports BLOCKED**, provide more context or break the task smaller. Don't retry the same task with the same model unchanged — something needs to change.

## After M3a ships

Next plan is **M3b Melee Combat**. Write that plan only after M3a's retro is on disk and the manual playthrough confirms the platformer substrate feels right. Don't stack milestones.

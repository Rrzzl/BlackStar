# M2 Integration Slice — Master Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement each sub-plan task-by-task. This master plan is the **spine** — actual bite-sized execution lives in the four sub-plans (M2a/b/c/d) linked below.

**Goal:** Build the Black Star Integration Slice — a shallow-but-wide end-to-end playable loop (character create → ship loadout → space flight → planet landing → procgen dungeon → combat → loot → station sale → outpost founding → faction quest → save/reload) that proves every system handoff works and answers the four sandbox questions in [04-vertical-slice.md](../../production/04-vertical-slice.md#1-what-the-integration-slice-proves).

**Architecture:** Continue the layered engine from M1. New layer above `engine/`: `core/` (pure-logic systems — combat, inventory, economy, quests, save), `scenes/` (presentation), `content/` (data-driven JSON for items, dungeon rooms, NPC dialogue, shop inventories), `ui/` (reusable Panel/Button/List widgets drawn via Renderer). All scene transitions go through a single `SceneContext.changeScene(factory)` API; save/load works at any scene boundary via a `SaveSnapshot` root object. Economy ticks on a fixed 1Hz world clock that runs in `SpaceScene` and freezes in menu/dungeon scenes.

**Tech Stack:** TypeScript 5.x strict, Vite 5, Vitest, HTML5 Canvas 2D, Web Audio API, JSON content files under `src/content/`.

**Reads before starting:**
- [TDD](../../tech/01-tdd.md) — especially §2 (layered architecture), §7 (save format), §9 (performance budgets)
- [Integration Slice spec](../../production/04-vertical-slice.md)
- [Ship-building spec](../../design/systems/ship-building.md) §1–§4 (slot loadout is in scope)
- [Outposts spec](../../design/systems/outposts.md) §1–§5 (founding flow is in scope)
- [Living economy spec](../../design/systems/living-economy.md) §3–§5 (price formula + trader loop)
- [Factions & quests spec](../../design/systems/factions-and-quests.md) §2, §5 (rep model + quest templates)
- [GDD](../../design/02-gdd.md) v0.2
- [Milestones](../../production/02-milestones.md) M2 row

---

## 1. Ambition delta over vanilla spec

This plan pushes **past** the conservative scope in `04-vertical-slice.md §2` on four dimensions where a little more effort buys large future dividends:

| Dimension | Vanilla spec | This plan | Why the stretch is worth it |
|---|---|---|---|
| NPC traders | ~10 | **20** | Economy at 10 traders is visibly scripted; 20 pushes into "simulation" territory and flexes the perf budget before M3 |
| Enemy types | 1 rusher + boss | **2 (rusher + shooter) + boss** | Tests combat AI composition, not just HP sponges. Critical for deepening confidence. |
| Weapons | 2 (bullet + laser) | **3 (bullet + laser + shotgun spread)** | Proves weapon data-driving, not hard-coding |
| Tactical pause | deferred to M3 | **Stub in M2c** (pause, can issue "move here" + "attack target", no abilities yet) | Tactical pause is a defining pillar of the combat fantasy; better a stub now than to discover in M3 that the combat scene wasn't designed for it |
| Save migration | stub | **Real v1→v2 migration test** with one field added | Proves the migration story once, cheaply. Catches architectural issues before content accumulates. |

Everything else matches the vanilla integration slice: one class (Gunslinger), one species (Human), one hull (Shrike), one biome (Alien Ruin), one sector (Grayline Reach), 2 factions, slot loadout UI only (no grid). **These stretches do not justify scope creeping anything else.** Cut-before-add rule applies inside this plan as much as outside it.

---

## 2. Phase map

Each phase is a separately-scheduled 4-week sub-plan. Phase gates are hard — slippage is absorbed by cutting scope within the phase, never by pushing into the next.

| # | Phase | Weeks | Sub-plan | Gate |
|---|---|---|---|---|
| M2a | Foundations | 1–4 | [2026-04-12-m2a-foundations.md](2026-04-12-m2a-foundations.md) | SpaceScene flies + 20 NPC traders moving visibly + Audio/Assets/Save engines shipped |
| M2b | Surfaces | 5–8 | `2026-0?-??-m2b-surfaces.md` (written at end of M2a) | Station + Planet Landing + Dungeon scenes + scene transitions round-trip with save/load |
| M2c | Loops | 9–12 | `2026-0?-??-m2c-loops.md` (written at end of M2b) | Combat (on-foot + space), loot, inventory, shop, quests, rep, **tactical pause stub** |
| M2d | Integration | 13–16 | `2026-0?-??-m2d-integration.md` (written at end of M2c) | Outpost founding + real economy simulation + M2 playtest + retrospective |

**Why sub-plans are written just-in-time:** each phase's retrospective is the most reliable source of truth for what the next phase actually needs. Writing all four now would lock in guesses that M2a will invalidate. The master plan is the architectural spine; the sub-plans are the tactical execution.

---

## 3. File structure after M2 is complete

```
src/
├── main.ts                              (updated M2a)
├── engine/                              (M1 — unchanged unless bug)
│   ├── Vec2.ts
│   ├── RNG.ts
│   ├── Input.ts
│   ├── Renderer.ts
│   ├── Scene.ts
│   ├── GameLoop.ts
│   ├── EventBus.ts
│   └── DebugOverlay.ts
├── engine/                              (new in M2a)
│   ├── Audio.ts                         # M2a — WebAudio wrapper
│   ├── Assets.ts                        # M2a — image/json loader + cache
│   ├── Save.ts                          # M2a — serialize/deserialize + migration
│   └── Physics.ts                       # M2a — AABB + circle intersection
├── core/                                (new in M2 — pure-logic systems, no rendering)
│   ├── combat/
│   │   ├── Damage.ts                    # M2c — damage resolution
│   │   ├── Projectile.ts                # M2c — kinematic projectile
│   │   ├── WeaponDef.ts                 # M2c — data shape for weapons
│   │   └── AI.ts                        # M2c — rusher + shooter AI state machines
│   ├── inventory/
│   │   ├── Inventory.ts                 # M2c — flat list inventory
│   │   └── ItemDef.ts                   # M2c — item data shape
│   ├── economy/
│   │   ├── Goods.ts                     # M2a — goods registry
│   │   ├── Stockpile.ts                 # M2a — station stockpiles
│   │   ├── Pricing.ts                   # M2a — price formula (pure)
│   │   ├── Trader.ts                    # M2a — NPC trader agent
│   │   └── Economy.ts                   # M2a — top-level tick orchestrator
│   ├── procgen/
│   │   ├── DungeonGen.ts                # M2b — room-graph generator
│   │   └── RoomDef.ts                   # M2b — room data shape
│   ├── factions/
│   │   ├── FactionState.ts              # M2c — rep + status per faction
│   │   └── Reputation.ts                # M2c — rep calc rules
│   ├── quests/
│   │   ├── QuestDef.ts                  # M2c — quest data shape
│   │   ├── QuestState.ts                # M2c — active quest tracker
│   │   └── QuestLog.ts                  # M2c — top-level journal
│   ├── outposts/
│   │   ├── OutpostDef.ts                # M2d — outpost data shape
│   │   ├── OutpostState.ts              # M2d — founded outposts
│   │   └── OutpostYield.ts              # M2d — passive yield tick
│   ├── ship/
│   │   ├── HullDef.ts                   # M2a — Shrike hull spec
│   │   ├── ModuleDef.ts                 # M2a — module data shape
│   │   ├── Loadout.ts                   # M2a — slot-based loadout validation
│   │   └── PowerBudget.ts               # M2a — power draw calc
│   ├── world/
│   │   ├── WorldClock.ts                # M2a — 1Hz tick that drives economy
│   │   ├── Sector.ts                    # M2a — Grayline Reach graph
│   │   └── SaveSnapshot.ts              # M2a — root save object shape
│   └── player/
│       ├── Captain.ts                   # M2a — persistent captain state
│       └── PlayerShip.ts                # M2a — current ship state
├── scenes/
│   ├── TitleScene.ts                    (updated M2a — New Game button)
│   ├── GameScene.ts                     (retired in M2a — replaced by SpaceScene)
│   ├── CharacterCreationScene.ts        # M2a
│   ├── SpaceScene.ts                    # M2a
│   ├── LoadingScene.ts                  # M2a
│   ├── PauseOverlay.ts                  # M2a
│   ├── PlanetLandingScene.ts            # M2b
│   ├── StationScene.ts                  # M2b
│   ├── ShipLoadoutScene.ts              # M2b
│   ├── DungeonScene.ts                  # M2b
│   ├── ShopScene.ts                     # M2c
│   ├── QuestBoardScene.ts               # M2c
│   ├── OutpostDashboardScene.ts         # M2d
│   └── GameOverScene.ts                 # M2c
├── ui/                                  (new in M2a)
│   ├── Panel.ts                         # M2a
│   ├── Button.ts                        # M2a
│   ├── List.ts                          # M2a
│   ├── Bar.ts                           # M2a — HP/shield/power bars
│   ├── Label.ts                         # M2a
│   └── Layout.ts                        # M2a — flex helpers
├── content/                             (new in M2a — data-driven JSON)
│   ├── goods.json                       # M2a — 8 goods
│   ├── hulls.json                       # M2a — Shrike only
│   ├── modules.json                     # M2a — 6 starter + 4 dungeon drops
│   ├── weapons.json                     # M2c — 3 types
│   ├── enemies.json                     # M2c — rusher + shooter + boss
│   ├── rooms.json                       # M2b — 5 Alien Ruin rooms
│   ├── items.json                       # M2c — loot + shop inventory
│   ├── quests.json                      # M2c — 2 starter quests
│   ├── factions.json                    # M2c — 2 factions
│   ├── outposts.json                    # M2d — outpost templates
│   ├── sectors/
│   │   └── grayline-reach.json          # M2a — sector data
│   └── dialogue/
│       └── shopkeeper.json              # M2c — 4 lines
└── tests/                               (expand under each system)
    ├── engine/                          (M1 + M2a additions)
    │   ├── Save.test.ts                 # M2a
    │   ├── Physics.test.ts              # M2a
    │   └── Assets.test.ts               # M2a
    └── core/                            (new in M2)
        ├── economy/
        │   ├── Pricing.test.ts          # M2a
        │   ├── Stockpile.test.ts        # M2a
        │   └── Trader.test.ts           # M2a
        ├── ship/
        │   ├── Loadout.test.ts          # M2a
        │   └── PowerBudget.test.ts      # M2a
        ├── procgen/
        │   └── DungeonGen.test.ts       # M2b
        ├── combat/
        │   ├── Damage.test.ts           # M2c
        │   └── AI.test.ts               # M2c
        ├── inventory/
        │   └── Inventory.test.ts        # M2c
        ├── quests/
        │   └── QuestState.test.ts       # M2c
        ├── factions/
        │   └── Reputation.test.ts       # M2c
        ├── outposts/
        │   └── OutpostYield.test.ts     # M2d
        └── world/
            └── SaveSnapshot.test.ts     # M2a (round-trip) + M2c (migration)
```

**Invariant:** `core/` never imports from `engine/` or `scenes/`. It is pure logic and fully unit-testable without a canvas. This is the load-bearing rule — if a task feels like it wants to break this, the task is wrong.

---

## 4. Dependency graph between phases

```
M2a Foundations
├── Audio / Assets / Save / Physics engines
├── Economy pure logic + WorldClock
├── Ship loadout pure logic
├── Sector data + SpaceScene (flight + 20 NPC trader rendering)
└── CharacterCreationScene + SaveSnapshot round-trip
         │
         ▼
M2b Surfaces
├── StationScene (interior) + ShipLoadoutScene (UI over M2a loadout logic)
├── PlanetLandingScene
├── DungeonGen + DungeonScene (rooms render, no combat yet)
└── Full scene-graph round-trip (Title → Create → Space → Station → Loadout → Space → Planet → Dungeon → Space → save → reload → same state)
         │
         ▼
M2c Loops
├── Combat (on-foot projectiles + shooter AI + tactical pause stub)
├── Inventory + Shop + ShopScene
├── Quest system + QuestBoardScene + quest turn-in
├── Faction reputation
└── GameOverScene (captain lives — tiered permadeath scaffold)
         │
         ▼
M2d Integration
├── Outpost founding UI + OutpostDashboardScene
├── Economy full simulation (traders actually buy/sell on stockpile)
├── Playtest build
└── M2 retrospective → writes Deepening Slice spec
```

---

## 5. Performance budget lock-in (checked at end of every phase)

From [TDD §9](../../tech/01-tdd.md):

| Scene | Active entities | Target FPS | Max frame time | Memory ceiling |
|---|---|---|---|---|
| SpaceScene (20 traders + player + 3 pirates + projectiles) | ~50 | 60 | 16.7 ms | 220 MB |
| DungeonScene (player + 8 enemies + projectiles + particles) | ~80 | 60 | 16.7 ms | 220 MB |
| StationScene (mostly static) | ~10 | 60 | 16.7 ms | 180 MB |

**Rule:** at each phase gate, run the busiest scene for 60 seconds with the debug overlay showing frame time. If worst-case frame exceeds 20 ms, stop and optimize before proceeding. Frame budget debt compounds.

---

## 6. The Grayline Reach sector (canonical data — referenced by all phases)

```
Grayline Reach (one sector, self-contained, no jump travel)
├── The Crossing (station — faction: Free Worlds Congress)
│   ├── Shop (15 items)
│   ├── Mission board (2 quests)
│   └── Save point + mission turn-in
├── Tessra-3 (planet — Homesteader colony, faction: Free Worlds)
│   ├── Landing zone Alpha (claimable for outpost)
│   ├── Passive yield on outpost: 120 credits / game-day + 5 grain / game-day
│   └── NPC trader route origin for: grain, water
├── Kepler-7b (planet — uninhabited ruin world)
│   ├── Landing zone Omega (not claimable — pre-ruined)
│   ├── Alien Ruin dungeon entry
│   └── Lore fragment: "the dead man's logbook" (mystery breadcrumb)
└── Asteroid Belt G-4 (hazard zone)
    ├── 3 pirate ships on fixed patrol
    └── Drops: iron ore nodes (shootable in space combat — M2c)
```

**NPC trader routes (M2a ships 20 traders total):**
- 8 traders on `Tessra-3 ↔ The Crossing` (grain/water outbound, meds/electronics inbound)
- 6 traders on `The Crossing ↔ Kepler-7b virtual salvage node` (alien tech inbound only)
- 4 traders on `Tessra-3 ↔ Kepler-7b virtual` (iron ore trading)
- 2 **Scrapfather-flagged** traders on random routes (visual faction flavor — no behavior delta yet)

All routes are deterministic on save/load — traders' current leg + cargo are serialized.

---

## 7. Save format (locked M2a — all later phases extend this shape)

```typescript
// src/core/world/SaveSnapshot.ts
export interface SaveSnapshot {
  version: number;               // 1 at M2a end. Bumped on schema change.
  seed: number;                  // World seed for determinism
  worldClock: number;            // Game-time in seconds since sector start
  captain: CaptainState;         // Persistent identity (M2a)
  ship: PlayerShipState;         // Current ship + loadout (M2a)
  sector: SectorState;           // Stockpiles, trader positions (M2a)
  inventory: InventoryState;     // Flat list (M2c — empty in M2a)
  factions: FactionStateMap;     // Per-faction rep (M2c — defaulted in M2a)
  quests: QuestLogState;         // Active + completed (M2c — empty in M2a)
  outposts: OutpostStateMap;     // Founded outposts (M2d — empty until then)
  scene: { type: string; params: unknown }; // Current scene to restore
}

export const CURRENT_SAVE_VERSION = 1;

export interface Migration {
  from: number;
  to: number;
  apply(raw: unknown): unknown;
}
```

Every phase adds fields; every field addition bumps `CURRENT_SAVE_VERSION` and adds a `Migration`. **Unit-tested at every bump** with a fixture save at the old version.

---

## 8. The four sandbox questions, and how the M2 master plan answers each

From [04-vertical-slice.md §1](../../production/04-vertical-slice.md#1-what-the-integration-slice-proves):

1. **Do the system handoffs work?** — Answered by the end-of-M2d full-loop playtest (the 1-hour run through every scene with save at each boundary).
2. **Does the core loop have a rhythm?** — Answered by the M2c gate playtest (30-min run target) and validated again at M2d.
3. **Are the technical risks validated?** — Answered incrementally: perf at end of every phase gate (§5), save migration at M2a, procgen determinism at M2b, economy simulation scale at M2d.
4. **Is there a loop worth deepening?** — Answered by the M2 retrospective document written at the end of M2d. The retrospective is a **deliverable**, not a nice-to-have.

---

## 9. Risk register cross-reference

Risks this plan actively probes (see [03-risk-register.md](../../production/03-risk-register.md)):

| Risk | How this plan probes it | Phase |
|---|---|---|
| R1 Scope collapse | Phase gates are hard; stretches listed in §1 are the only adds and are pre-authorized | all |
| R16 Living economy fails to emerge fun | 20 traders at real-time, observable debug overlay | M2a + M2d |
| R17 Ship-building overwhelms new players | Slot loadout only, no grid | M2a + M2b |
| R18 Sandbox purposelessness | Quests + outposts land in M2c/M2d before the retrospective | M2c + M2d |
| R20 Simulated NPC count perf ceiling | 20-trader space scene is an explicit perf test | M2a gate |

---

## 10. Exit criteria for M2 as a whole

M2 is complete when **all** of the following are true:

- [ ] A fresh playtester installing the build from scratch can play through the full loop in ≤ 40 minutes without hitting a broken state
- [ ] Save at any scene, reload, and land back in the same state with the same sector/trader positions/inventory/rep
- [ ] `pnpm typecheck && pnpm lint && pnpm test:run` all pass with zero errors
- [ ] Worst-case frame time in any scene ≤ 20 ms (measured over 60s run)
- [ ] M2 retrospective document written at `docs/production/05-m2-retrospective.md` answering question 4 (§8) honestly
- [ ] Deepening Slice (M3) spec exists at `docs/production/06-deepening-slice.md`
- [ ] At the M2 gate meeting (one-person studio = one-person meeting with a cold playtest session), the answer to "is this loop worth deepening?" is yes. If no: the scope levers in `01-roadmap.md §4` are pulled before M3 starts.

---

## 11. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial master plan. Architecture spine, file structure, dependency graph, ambition delta (20 traders / 2 enemy types / tactical pause stub / real save migration) over vanilla spec, phase map, save format locked, exit criteria defined. Sub-plans M2b/c/d to be written at the end of each prior phase. |

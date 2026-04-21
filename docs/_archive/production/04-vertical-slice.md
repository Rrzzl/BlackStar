# Black Star — Integration Slice Specification

**Document owner:** Design Lead + Production Lead
**Status:** Draft v0.2 (sandbox-first pivot)
**Last updated:** 2026-04-12
**Supersedes:** Draft v0.1 (dungeon-centric "Vertical Slice" model)
**Reads before:** [GDD](../design/02-gdd.md), [TDD](../tech/01-tdd.md), [Roadmap](01-roadmap.md)

---

## 0. Why this document was rewritten

The original v0.1 vertical slice was a **dungeon-centric VS**: one class, one ruin, one station, one full combat-to-loot loop at launch quality. That approach works for roguelikes and linear games. It does **not** work for sandbox games because in a sandbox, **you cannot tell if combat is fun until combat is attached to progression, which is attached to economy, which is attached to factions**. A polished dungeon disconnected from the rest of the game tells you nothing about whether *Black Star* is fun.

Real studios de-risk sandbox games by proving the **handoff between systems** before any subsystem is deepened. That requires a two-stage slice:

1. **Integration Slice (Phase 3a, ~16 weeks)** — the full loop plays end-to-end. Ugly art, shallow content, but every system is real and the handoffs work. *This document.*
2. **Deepening Slice (Phase 3b, ~20 weeks)** — take the integration slice and bring every subsystem to launch quality for the content in scope. *Separate document, written after Phase 3a retrospective.*

Black Star v0.2 of this spec is the **integration slice**. It is not the traditional "vertical slice" — it is deliberately shallow in every subsystem, and deliberately wide across all of them.

---

## 1. What the integration slice proves

The slice answers exactly four questions:

1. **Do the system handoffs work?** Can a player go from character creation → ship loadout → flight → dungeon → combat → loot → station → sale → outpost founding → faction quest → back to flight, without ever hitting a broken seam or a "this part isn't real yet" wall?
2. **Does the core loop have a rhythm?** 30 minutes of play should feel like a complete session. Three hours of play should feel like progress. 10 hours of play should feel like the game the GDD promised.
3. **Are the technical risks validated?** Canvas 2D performance with ~200 simulated entities. Save format across all scene types. Procgen dungeon + living economy interaction. Scene transitions between space, surface, station, and dungeon.
4. **Is there a loop worth deepening?** If the integration slice is shippable *as a tiny bad game*, then Phase 3b can deepen it into a shippable great game. If it is not shippable — if any seam is fundamentally broken — we stop, cut scope, or pivot before sinking deepening effort into a broken foundation.

What the integration slice does **not** try to prove:
- Whether combat *feels* great (that's Deepening Slice)
- Whether the economy has interesting emergent behavior at scale (that's Deepening Slice + early production)
- Whether the art style is final (that's Deepening Slice)
- Whether the dungeon generator produces variety (that's Deepening Slice + production)

---

## 2. Scope

### 2.1 Player-facing content

**One sector: Grayline Reach**
- 2 landable planets: Tessra-3 (Homesteader colony) and Kepler-7b (uninhabited ruin world)
- 1 trading station: The Crossing
- 1 asteroid field with 2–3 pirate NPCs
- Hand-authored, ugly — placeholder art is fine

**One playable character**
- Species: Human (only)
- Class: Gunslinger (only)
- Character creation screen exists but has **~4 options total** (name, species, class, ship paint)
- No stat sliders, no backstory, no portraits beyond a text option

**One starter ship: Shrike (T1)**
- Fixed hull. Players cannot buy other hulls in the slice.
- **Slot loadout UI only** (not the full grid). 2 weapon slots, 2 internal slots, 1 utility slot. Players can swap between ~6 starter modules. Power budget is tracked but overbudget = warning, not a hard block, in the slice.
- Cosmetic: 3 paint colors. No decals, no name plate editor yet (name is set at character creation).

**One dungeon biome: Alien Ruin (Kepler-7b)**
- 5 hand-authored rooms, assembled by procgen into 5–8 room runs
- 1 enemy type: a basic "rusher" AI that charges the player
- 1 boss (at the end of every run): slightly larger rusher with more HP
- 5 loot types: credits, iron ore, meds, a random weapon module, a single unique Black Star artifact (only dropped once per run at low chance)
- No traps, no puzzles, no elites. This is a **combat and loop tester**, not a dungeon showcase.

**One station: The Crossing**
- 1 interior hub room (visual)
- Shop with ~15 items (modules, consumables, goods)
- 1 NPC shopkeeper (speaks 4 pre-written lines)
- 1 NPC mission-board giving 2 faction quests (one Free Worlds, one Scrapfather-leaning) that each complete in a single dungeon run
- Save point

**One outpost founding flow**
- Tessra-3 has one claimable landing zone
- Outpost UI exists with 3 slot types only: Market I, Shipyard I, Defense I (no upgrade tiers yet)
- Founding cost: 15,000 credits + 50 iron ore
- Founding = 1-click event. No founding cinematic. Dashboard appears on completion.
- Passive yield tick runs every game-day; player can collect credits on visit
- No reconquest mechanic — outpost cannot be attacked in the slice

**One faction system (thin)**
- 2 factions active: Free Worlds Congress (friendly) and Scrapfather Syndicate (neutral-to-friendly)
- Reputation meter exists and ticks based on quest completion
- No faction operations simulated yet; rep is just a number with prices responding
- No faction hostility in the slice — player cannot become enemy of a faction

**One economy simulation**
- ~8 goods: iron ore, grain, water, steel, meds, electronics, nullbloom, alien tech
- The Crossing + Tessra-3 market + Kepler-7b (virtual, as ruin drop source) run production/consumption ticks
- ~10 NPC trader ships spawn and run routes between The Crossing and Tessra-3 with real cargo
- Prices respond to stockpile level per the formula in `living-economy.md §3.1`
- Player can buy low and sell high; the system reacts

### 2.2 Core loop coverage

The slice must play this full loop without gaps:

```
1.  Title screen → "New Game"
2.  Character creation (name, species, class, paint color) → "Launch"
3.  Spawn in The Crossing station interior
4.  Tutorial prompts point to: (a) shop, (b) mission board, (c) dock-out
5.  Player buys a module, accepts a quest, docks out
6.  Space flight — Grayline Reach sector map with The Crossing, Tessra-3, Kepler-7b
7.  Fly to Kepler-7b (60–120 seconds of actual flight)
8.  Optional: pirate encounter in space (deterministic on first playthrough)
9.  Land at Kepler-7b — transition cutscene (text is fine)
10. Enter dungeon → procgen rooms → combat → loot → boss → clear
11. Exit dungeon → auto-return to ship in orbit
12. Fly to Tessra-3 → land → outpost founding prompt → found outpost
13. Fly back to The Crossing → dock → sell loot → turn in quest
14. Save → repeat loop
```

**One full loop = 20–40 minutes.** Two loops (~1 hour) should feel like a complete session.

### 2.3 What is explicitly NOT in the integration slice

Cut for integration slice scope, returning in Deepening Slice or Production:

- **Ship building grid UI** (slot loadout only in M2; grid in M3)
- **Subsystem targeting in combat** (flat hull HP only)
- **Companions** (no recruitment, no party, no tactical pause — Gunslinger solo only)
- **Fleet management** (only the starter ship)
- **Other classes** (Tactician, Voidsmith, Mercer, Exile — M3+)
- **Other species** (Drellan, Ksar, Vex — M3+)
- **Other hulls** (only the Shrike — M3+)
- **Other biomes** (7 of 8 — production)
- **Other sectors** (only Grayline Reach)
- **Jump travel** (sector is self-contained in the slice; no inter-sector travel)
- **Main story / central mystery** (one discoverable lore fragment as a breadcrumb; no mystery progression)
- **Faction through-lines** (only ambient quest templates)
- **Faction operations simulation** (factions exist but don't run operations yet)
- **Outpost reconquest** (outposts can't be lost)
- **Outpost tier upgrades** (slot tiers all locked to I)
- **Trade routes between outposts** (requires 2 outposts; slice has 1)
- **Diplomacy** (rep tracks but no hostility or treaties)
- **Pit fights, research, broadcast tower** (outpost slots restricted to Market / Shipyard / Defense)
- **Multiple save slots** (one save is fine)
- **Cloud save, achievements, controller support, localization, voice acting**
- **Final art, final audio, final UX polish** (all placeholder-acceptable)

---

## 3. Quality bar

**The integration slice is NOT at launch quality.** It is at *playable* quality. Every scene works, every system is real, every handoff functions, but polish is deliberately deferred.

Minimum bars:

### Code
- TypeScript strict mode, no any leaks
- Save/load works reliably across all scene types
- No crash bugs during a 30-minute playthrough
- Deterministic procgen (same seed → same dungeon)
- Test coverage for pure-logic modules (Vec2, RNG, EventBus, inventory, economy-pricing, save-migration)

### Performance
- 60 FPS in the busiest scene (space sector with 30 NPC traders + player + 3 pirates + effects)
- Memory < 300 MB
- Load times < 3 seconds for any scene transition

### Art / audio
- **Placeholder is fine.** Text labels, flat colors, basic shapes. The art style direction doc is the *target*, not the bar.
- SFX is nice-to-have. Music is nice-to-have. Silent is acceptable.
- The only visual requirement is *readability* — every entity must be visually distinct from every other.

### UX
- Keyboard + mouse control works for every screen
- Every button does something
- No dead-end menus
- Settings screen exists with at least: volume, key rebinding (crude is OK), fullscreen toggle

### What is **not** required
- Animation polish
- Audio mix
- Accessibility features beyond the baseline (colorblind, slow-mode → cut to Deepening Slice)
- Marketing screenshots — the slice is not publicly shown

---

## 4. Technical scope

From the TDD, the integration slice requires:

### Engine (some exists from M1)
- [x] `GameLoop`, `Scene`, `Renderer`, `Input`, `Vec2`, `RNG`, `EventBus`, `DebugOverlay` (M1 complete)
- [ ] `Audio` (M2 — barebones WebAudio wrapper, load and play)
- [ ] `Assets` (M2 — image + json loader with caching)
- [ ] `Save` (M2 — JSON serialization with schema version + migration stub)
- [ ] `Physics` (M2 — AABB collision + circle-vs-circle for combat)

### Scenes
- [ ] `TitleScene` (exists, needs New Game button)
- [ ] `CharacterCreationScene`
- [ ] `StationScene` (docked interior view)
- [ ] `ShipLoadoutScene` (slot-based module swapping)
- [ ] `SpaceScene` (sector view with planets, stations, NPCs)
- [ ] `PlanetLandingScene` (transition: choose landing zone)
- [ ] `DungeonScene` (top-down twin-stick combat in procgen rooms)
- [ ] `OutpostDashboardScene`
- [ ] `PauseOverlay`
- [ ] `LoadingScene` (between scene transitions)

### Systems
- [ ] Combat (on-foot): damage, projectiles, HP, death
- [ ] Combat (space): ship weapons, shields, HP, death, escape pod on defeat
- [ ] Procgen dungeon generator (room-graph with the 5 Alien Ruin rooms)
- [ ] Loot system: drop tables, pickup, inventory
- [ ] Inventory (grid is cut, flat list is fine for slice)
- [ ] Shop transactions (buy/sell with price lookup)
- [ ] Economy tick: station stockpiles, prices, NPC trader decision loop (simplified)
- [ ] Quest system: track 2 quest states with objectives and turn-in
- [ ] Reputation tracker (two factions)
- [ ] Outpost founding + slot installation + passive yield
- [ ] Save/load round-trip across scene transitions
- [ ] HUD overlays for each scene

### UI
- Main menu, settings, pause
- Character creation form
- Station interior with clickable hotspots
- Ship loadout screen
- Shop screen
- Mission board / quest journal
- Space flight HUD
- Dungeon combat HUD
- Outpost dashboard
- Lore fragment / text popup reader

---

## 5. Content production targets

### Art (placeholder tier)

| Asset | Count | Notes |
|---|---|---|
| Player character sprite | 1 | 4-direction walk + shoot + hurt |
| Enemy sprite (rusher) | 1 | 4-direction walk + attack + death |
| Boss sprite | 1 | Palette swap of rusher, scaled up |
| Shrike ship sprite | 1 | 8-direction rotation |
| Pirate ship sprite | 1 | Palette swap of Shrike |
| NPC trader ship sprite | 1 | Another palette swap |
| Weapon projectile | 2 | One bullet, one laser |
| Dungeon room tiles | ~20 | Alien Ruin, flat colors |
| Station interior tile | ~10 | One hub room |
| Planet surface tile | ~10 | Tessra-3 landing zone |
| Space background | 1 | Starfield + 2 planet icons |
| UI panels | ~15 | Flat frames, text-driven |
| Icons | ~20 | Inventory items, goods, abilities |
| **Total** | **~80 pieces** | All placeholder — final art is Deepening Slice |

### Audio (optional tier)

Nice-to-have list. Silent is acceptable for the integration slice. If bandwidth allows:
- 1 ambient loop for space
- 1 ambient loop for dungeon
- 4 SFX: player shot, enemy shot, hit, pickup
- Title screen music (royalty-free placeholder acceptable)

### Narrative

- 1 opening text card: the dead man's logbook
- 4 lines of shopkeeper flavor dialogue
- 2 quest descriptions (one per quest)
- 1 lore fragment in the dungeon (mystery breadcrumb)
- Tutorial tooltips (~15 one-liners)

---

## 6. Success criteria

### The "loop works" test
- [ ] Fresh player can complete 1 full loop in < 40 minutes without a guide
- [ ] Loop has no dead-end states (every transition returns to a playable state)
- [ ] Save/load works at every scene boundary
- [ ] Save from one loop can be loaded into a second loop reliably

### The "handoffs work" test
- [ ] Items bought at the station can be equipped on the ship
- [ ] Modules swapped on the ship affect combat
- [ ] Loot from dungeons shows up in inventory
- [ ] Selling loot to the station shifts station stockpile and price visibly
- [ ] Founding an outpost on Tessra-3 causes the outpost dashboard to exist on return
- [ ] Completing a quest shifts faction rep and the rep bar reflects it

### The "systems are real" test
- [ ] Economy prices change as player sells goods
- [ ] NPC traders visibly fly between planets carrying real cargo (inspectable with a debug toggle)
- [ ] Procgen dungeons produce different layouts on different seeds
- [ ] Outpost passive yield ticks and accumulates over multiple game-days

### The "game is shippable-as-bad" test
The integration slice is done when a stranger could install the build, play for 20 minutes, and say "this is a playable video game with the structure of an interesting sandbox, even though it's ugly and shallow." **If a playtester cannot describe the gameplay loop in their own words after playing, the slice has failed and we iterate before Deepening.**

---

## 7. Anti-patterns to avoid

Temptations that would compromise the integration slice:

- **"Let me polish this one system while I'm here."** No. Every minute spent polishing is a minute not spent proving a handoff. Polish is Deepening Slice work.
- **"We can fake the economy for now."** No. Building fake systems to prove system handoffs proves nothing. Build the simplest **real** simulation.
- **"Let me add one more class."** No. One class proves the handoff model. Adding more classes is production work.
- **"Just a little more content."** No. Content counts are ceilings, not floors.
- **"Let me refactor the engine before adding X."** If the engine is broken, refactor. If the engine just feels awkward, ship and refactor in Deepening.
- **"Let me design the ship grid UI now so I don't have to redo it."** No — the slot loadout is the MVP. The grid is Deepening. Doing both is scope creep.

---

## 8. Integration Slice timeline (M2)

Target: **16 weeks**. Structured as four 4-week phases:

| Weeks | Phase | Focus |
|---|---|---|
| 1–4 | **M2a — Foundations** | Audio/Assets/Save engines, SpaceScene with flight, basic NPC movement |
| 5–8 | **M2b — Surfaces** | StationScene, DungeonScene, PlanetLandingScene, scene transitions, save/load round-trips |
| 9–12 | **M2c — Loops** | Combat (on-foot + space), loot, inventory, shop, quest system, rep |
| 13–16 | **M2d — Integration** | Outpost founding, economy simulation, NPC traders, polish enough to playtest, M2 retrospective |

Each phase has its own milestone gate. Slippage is managed by cutting scope within the current phase, not by pushing into the next phase. If M2a slips past week 5, we cut — not extend.

See `docs/superpowers/plans/2026-04-??-m2a-foundations.md` for the first detailed plan.

---

## 9. Open questions

1. **How does the player first learn the game?** A short text tutorial? A guided first loop? An intro cinematic? Needs decision. *Resolve by: M2a kickoff.*
2. **How much text goes into an integration slice where nothing is polished?** The answer affects the placeholder quality bar. *Resolve by: M2c.*
3. **Do we playtest the integration slice externally, or keep it internal?** Lean internal — external playtests are Deepening Slice. *Resolve by: M2d.*
4. **How do we decide if a system needs to move back to post-launch?** The M2 retrospective is the gate; any system that cannot be made fun in the Deepening Slice is a cut candidate.

---

## 10. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Dungeon-centric VS: one class, one system, one biome, one station, one full loop. Content targets, quality bar, success criteria defined. |
| 0.2 | 2026-04-12 | **Full rewrite after sandbox-first pivot.** Reframed as Integration Slice (Phase 3a) that proves system handoffs end-to-end, not subsystem polish. Deferred ship-building grid, companions, tactical pause, other classes/species/biomes/sectors. Added outpost founding, NPC economy simulation, faction rep. 4-phase M2 plan split into M2a–d. Integration slice is deliberately shallow-and-wide, not deep-and-narrow. Deepening Slice (Phase 3b) now holds what was previously this doc's scope. |

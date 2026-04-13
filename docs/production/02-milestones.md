# Black Star — Milestones

**Document owner:** Production Lead
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before:** [Roadmap](01-roadmap.md)

---

## 0. How to read this document

Each milestone is a **named deliverable** with a date target, a scope definition, and a gate condition. Missing a milestone is a signal to re-plan, not to crunch. If three consecutive milestones slip, scope must be cut.

Dates here are **relative to project start (day 0 = concept approval)** and assume the roadmap's ~17-month target timeline. Slippage is expected and acceptable within the scope-lever framework.

---

## 1. Milestone list

### M0: Pre-production Complete
**Target:** Week 4
**Phase:** Pre-production → Prototype

**Deliverables:**
- All design, narrative, art, audio docs at v0.1+ ✅
- TDD complete and reviewed ✅
- System specs for critical systems ✅
- Risk register populated
- Vertical slice spec reviewed and approved
- First implementation plans drafted and reviewed

**Gate:**
- Pre-production docs signed off
- No unresolved blocking risks
- Team aligned on scope

---

### M1: Engine Foundation
**Target:** Week 6
**Phase:** Prototype

**Deliverables:**
- Project builds and runs in browser (black canvas minimum)
- Vite + TypeScript + Vitest + ESLint configured
- Engine primitives: `Vec2`, `RNG`, `Game`, `Scene`, `Input`, `Renderer`, `Assets`
- A basic scene switcher (title → test scene)
- A test that passes (proves the test pipeline works)
- A debug overlay (FPS counter)

**Gate:**
- All of the above merged and green in CI
- No reliance on placeholders for anything in this list — these are production-quality

---

### M2: Combat Prototype
**Target:** Week 8
**Phase:** Prototype

**Deliverables:**
- Player character with twin-stick movement in an empty room
- One weapon that shoots projectiles with damage
- One enemy type (Rusher) with basic AI
- Basic collision (AABB)
- Kill → drop placeholder → pick up → inventory entry
- Simple health/damage/death loop

**Gate:**
- Combat feels responsive (subjective, but team-agreed)
- Frame time < 10ms even at 100 entities
- No crash bugs under normal play

---

### M3: Dungeon Generator Prototype
**Target:** Week 10
**Phase:** Prototype

**Deliverables:**
- Hand-authored room templates for one biome (5 rooms minimum)
- Room-graph generator produces valid, connected dungeons
- Player can walk from start to exit
- Enemies spawn via spawn points, loot drops via loot budget
- Determinism verified: same seed → same dungeon

**Gate:**
- Running 100 random generations produces 100 valid dungeons
- Generation time < 200ms per dungeon
- Prototype playable end-to-end: enter → clear → exit

---

### M4: Space & Station Prototype
**Target:** Week 12
**Phase:** Prototype

**Deliverables:**
- A single star system with 2 planets and 1 station
- Ship movement and basic combat in space
- Land on a planet → transition to dungeon scene
- Dock at station → transition to station scene
- Station has a basic shop (buy/sell placeholder items)
- Save/load with placeholder data

**Gate:**
- Full core loop playable: station → space → planet → dungeon → back → shop
- Save and reload works
- No major bugs

---

### M5: Prototype Complete (Prototype Gate)
**Target:** Week 14
**Phase:** Prototype → Vertical Slice

**Deliverables:**
- Prototype build with all of M1–M4
- Internal playtest with written feedback
- Prototype retrospective: what's fun, what isn't, what needs to change
- Decision: proceed to Vertical Slice, iterate further, or re-scope

**Gate:**
- **"Is this fun?"** — if no, we don't proceed. This is the highest-stakes gate in the project.

---

### M6: VS Foundation
**Target:** Week 17
**Phase:** Vertical Slice

**Deliverables:**
- Production-quality art pipeline (Aseprite → sprite sheet → runtime)
- Production-quality audio pipeline (Web Audio wrapper + one set of real SFX)
- Real HUD (not placeholder) in the quality bar defined by art direction
- Main menu, settings menu, pause menu
- Save system with full schema (not just placeholder)

**Gate:**
- Foundation is what we're using for the rest of the VS — no more placeholder systems

---

### M7: VS Content Pass 1
**Target:** Week 20
**Phase:** Vertical Slice

**Deliverables:**
- One playable class (Gunslinger) with production art and audio
- One star system (hand-authored, beautiful) with two landable planets
- One station (hand-authored) with a functional shop
- One biome (alien ruin) with 15+ room templates
- 3 enemy types (production-quality art, animation, audio, AI)
- 6 weapons (production art + sounds)
- 8 items (consumables, utility)
- 5 quests (one main, four side)

**Gate:**
- All content passes the art and audio quality checks
- Content is in the game, not just assets on disk

---

### M8: VS Playable
**Target:** Week 22
**Phase:** Vertical Slice

**Deliverables:**
- Full slice loop is playable from main menu to credits
- New game → first dungeon → first boss → return → shop → second dungeon → end-of-slice marker
- Internal playtest build
- Known-issue list

**Gate:**
- 30-minute guided playtest with 3+ internal testers
- All P1 issues fixed

---

### M9: Vertical Slice Complete (VS Gate)
**Target:** Week 24
**Phase:** Vertical Slice → Production

**Deliverables:**
- Final VS build
- Screenshots, GIFs, 60-second pitch trailer
- External playtest: 5+ players outside the team, written feedback
- VS retrospective

**Gate:**
- External playtesters report fun in their written feedback
- Art/audio/UI meet the quality bar
- Technical targets met (60 FPS on reference hardware)
- No blocking bugs
- **Greenlight decision**: proceed to production, re-scope, or cancel

---

### M10: Alpha 1 — Systems Complete
**Target:** Week 38
**Phase:** Production — Alpha

**Deliverables:**
- All 5 classes implemented with abilities
- All 8 biomes have at least one dungeon generating correctly (content thin but present)
- Ship combat fully implemented (all weapon archetypes, shields, heat, boost)
- Companion system implemented (recruit, party, combat AI, loyalty)
- Empire system v0 (outposts, basic trade routes)
- Quest system infrastructure complete
- Full save system
- All UI screens (even if not polished)

**Gate:**
- Game is playable end-to-end (new game → some ending) with placeholder content
- No major systems missing
- All tests passing

---

### M11: Alpha 2 — Content Pass 1
**Target:** Week 50
**Phase:** Production — Alpha

**Deliverables:**
- 30 star systems (hand-authored)
- 100 planets
- 30 main quests, 40+ side quests (first pass)
- 12 companions with recruitment + base dialogue
- 20 unique ships
- 40 base enemy types
- 30 legendary items
- First draft of all main story content

**Gate:**
- Feature-complete except polish
- Content audit: does every content target have a first draft?

---

### M12: Beta 1 — Content Complete
**Target:** Week 62
**Phase:** Production — Beta

**Deliverables:**
- All 50 launch systems
- All 200 launch planets
- All companions with full arcs, loyalty missions
- All endings playable
- All 8 biomes at content target
- Full first-pass voice acting for cinematics
- Full first-pass music and SFX

**Gate:**
- Content-complete
- No missing systems, no missing content
- First balance pass applied

---

### M13: Beta 2 — Balance & Bug
**Target:** Week 68
**Phase:** Production — Beta → Polish

**Deliverables:**
- Balance pass across all classes, weapons, enemies, economy
- Bug fix pass (P1 and P2 targets)
- Difficulty tiers tuned (Voidrunner / Captain / Void / Dead Stars)
- New Game+ implemented and tested

**Gate:**
- All P1 bugs fixed
- < 30 P2 bugs open
- Balance feels tight in internal playtests

---

### M14: Release Candidate
**Target:** Week 72
**Phase:** Polish → Ship

**Deliverables:**
- Final polish pass
- Final audio mix
- Final localization (if applicable)
- Final performance pass on min-spec
- Store page assets
- Legal and credits review
- External QA pass complete

**Gate:**
- Zero P1 bugs
- < 10 P2 bugs
- Release candidate signed off by all department leads

---

### M15: Ship
**Target:** Week 73+
**Phase:** Ship

**Deliverables:**
- Game released
- Day-one patch ready (if needed)
- Community support plan active
- Post-launch roadmap published

**Gate:**
- Player reviews monitored
- First post-launch patch planned within 2 weeks of release

---

## 2. Slippage protocol

Milestones will slip. Here's how we handle it.

### Minor slip (< 1 week)
- Push the milestone. Document the cause. Continue.

### Moderate slip (1–2 weeks)
- Escalate to production lead. Review scope of the current milestone. Consider cutting non-critical items.

### Major slip (> 2 weeks)
- Halt new feature work.
- Re-forecast remaining milestones.
- Apply scope levers from `01-roadmap.md §4`.
- Communicate to all stakeholders.

### Three consecutive major slips
- Emergency replan.
- Consider cancelling the nearest milestone entirely and re-scoping.
- Consider cancelling the project — this is a legitimate outcome.

---

## 3. Milestone review rhythm

- **Daily:** standups (async OK), progress against the current milestone
- **Weekly:** full team sync, review milestone burn-down
- **Milestone end:** retrospective, gate review, go/no-go for the next milestone
- **Monthly:** scope and timeline review against the overall roadmap

---

## 4. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. 15 milestones across 6 phases. Slippage protocol and review cadence. |

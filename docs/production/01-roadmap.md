# Black Star — Production Roadmap

**Document owner:** Production Lead
**Status:** Draft v0.1
**Last updated:** 2026-04-12

---

## 0. Purpose

This document defines the **phases** of Black Star's development, the **deliverables** expected at each phase, the **gates** that must be cleared to move to the next phase, and the **rough timeline**. It is the high-level schedule. The detailed milestone breakdown lives in `02-milestones.md`.

---

## 1. Phases overview

Six phases, AAA-standard structure:

```
Concept → Pre-production → Prototype → Vertical Slice → Production → Polish → Ship
```

Each phase has a **gate** — a decision point where the project is reviewed and either greenlit to proceed, sent back for rework, or cancelled. Cancellation is on the table at every gate; this is normal for AAA development and protects the team from dying on a doomed project.

---

## 2. Phase definitions

### Phase 0: Concept (days, not weeks)
**Goal:** Answer "what is this game?" in one paragraph and three pillars.

**Deliverables:**
- `docs/design/01-concept.md` ✅ complete

**Gate (Concept Gate):**
- Concept document approved
- Tone, genre, target audience locked
- No more pivots to a different core fantasy

### Phase 1: Pre-production (weeks)
**Goal:** Answer "what are we building and how?" Detailed enough to start producing assets and code without constant design fire drills.

**Deliverables:**
- GDD ✅
- Narrative Bible ✅
- Art Direction ✅
- Audio Direction ✅
- TDD ✅
- System specs (combat, progression, economy, procgen, AI, save) ✅
- Production roadmap + milestones + risk register ← (in progress now)
- Vertical Slice spec ← (next)
- First implementation plan(s)

**Gate (Pre-production Gate):**
- All pre-production docs reviewed and signed off
- Risks identified and mitigations planned
- Vertical slice scope is realistic and agreed-on
- Team (or solo developer) understands the plan

### Phase 2: Prototype (4–8 weeks)
**Goal:** Prove the core gameplay feels good in isolation. Throwaway code is fine. No art quality bar. No narrative. No production-quality polish. Focus purely on mechanics.

**What gets prototyped:**
- Twin-stick combat (on-foot) with placeholder art
- A procedural dungeon with one biome, three enemy types, one boss
- Basic weapon and loot drop system
- A single station with a basic shop
- A single star system with basic flight and one ship-to-ship encounter

**Deliverables:**
- Playable prototype build
- Prototype retrospective document: what worked, what didn't, what to keep

**Gate (Prototype Gate):**
- **"Is the core loop fun?"** If no, iterate or cancel. This is the most honest gate in AAA development. Many projects die here. That is the point.
- Technical risks validated (canvas perf at 500 entities, save format sane, procgen determinism works)
- Tuning pass showed what the final target numbers should be, roughly

### Phase 3: Integration Slice + Deepening Slice (formerly "Vertical Slice")

**Note (2026-04-12):** After the sandbox-first pivot, the single-VS model was replaced with a **two-stage slice**. A traditional VS focused on one subsystem at launch quality is the wrong shape for a sandbox game — you cannot tell if combat is fun until combat is attached to progression, which is attached to economy, which is attached to factions. Real studios de-risk sandboxes by proving the handoff between systems *before* any subsystem is deep.

#### Phase 3a: Integration Slice (~16 weeks)

**Goal:** Prove the **full loop** plays end-to-end. Minimum viable version of every pillar system stitched together. Ugly art, placeholder audio, shallow content — but every system is real and the handoffs between them work.

**What the integration slice contains:**
See `04-vertical-slice.md` for the full spec. Headline: ugly character creation → slot-loadout ship (no grid yet) → fly between 2 planets in one sector → land → small dungeon (one biome, one enemy type) → combat → return → sell loot at station → found a first outpost (one-button) → one faction quest that nudges world state. All systems are real, nothing is scripted-that-looks-real.

#### Phase 3b: Deepening Slice (~20 weeks)

**Goal:** Take the integration slice and bring every subsystem to launch quality for the content that is in it. The ship-building grid works. The outpost dashboard is real. The economy has NPC traders moving physical cargo. One faction through-line questline is playable end-to-end.

This is what would traditionally be called "the vertical slice." The reason we split it into two is that the integration slice is where design lessons get learned, and the deepening slice is where quality is built. Conflating them costs months of rework when integration surprises force design changes.

**Deliverables:**
- Vertical slice build
- Design review
- Marketing material (screenshots, GIFs, pitch trailer) — *this is the "greenlight" moment if we're seeking funding or showing publishers*

**Gate (Vertical Slice Gate):**
- The VS is *fun* by external playtest standards (not just the team's)
- Art, audio, and UI meet the quality bar defined in the direction docs
- The slice runs at 60 FPS on target hardware
- All risk items from the risk register have been validated or mitigated

### Phase 4: Production (months)
**Goal:** Build the rest of the game at the quality bar established in the VS. Content creation, system completion, scope enforcement.

**Sub-phases:**
- **Alpha 1** — all systems implemented, placeholder content for everything, game is playable end-to-end
- **Alpha 2** — systems refined, first pass of all content (classes, ships, companions, quests, biomes, factions)
- **Beta 1** — all content-complete, first polish pass
- **Beta 2** — balance and bug fixing

**Deliverables:**
- Playable builds at each alpha/beta milestone
- Content audit at each milestone
- Bug database

**Gate (Production Gate — at end of Beta 2):**
- Feature-complete
- Content-complete
- All P1 and P2 bugs resolved
- Achievements / milestones / codex entries all implemented
- Ready for final polish

### Phase 5: Polish (months)
**Goal:** Fix what's broken, tune what's off, polish every screen and every animation. No new features. No new content.

**Focus:**
- Bug fixing (priority order: P1 → P2 → P3)
- Balance tuning based on playtest data
- UI/UX polish (every menu reviewed for friction)
- Audio mix pass
- Animation polish pass
- Performance optimization
- Accessibility pass
- Localization (if applicable)

**Gate (Ship Gate — "gold"):**
- Zero P1 bugs
- < 10 P2 bugs
- Performance targets met on min-spec hardware
- External QA pass complete
- Marketing and store assets finalized
- All legal (EULA, credits, third-party licenses) complete

### Phase 6: Ship & post-launch
**Goal:** Release the game. Support players. Plan updates.

**Ongoing:**
- Patch cycles for bugs
- Balance patches based on community feedback
- Content updates (possibly paid DLC)
- Community management

---

## 3. Rough timeline

**Assumption:** one senior engineer + AI pair-programming at the pace of a small indie studio. Timeline scales with team size.

### The honest number

**Black Star's realistic target ship date is 30–42 months from pre-production start.** Full stop.

The original v0.1 roadmap quoted ~17 months. That estimate predated the sandbox-first pivot and the four pillar systems that were formalized on 2026-04-12: ship-building (hybrid grid-sim), outposts (strategic hub), living economy (real-time NPC trader simulation), and factions-and-quests (dynamic faction operations with six through-lines). Each of those is, on its own, the size of a small indie game. Together they are the scope of a small-AAA or large-indie production. 17 months was never realistic for that scope; it reflected an earlier, tighter design.

### Reference points

| Game | Studio size | Dev time | Closest comparable Black Star system |
|---|---|---|---|
| *Hades* | Supergiant, ~20 | 2.5 years | Combat + run-based progression |
| *Dead Cells* | Motion Twin, ~10 | 3+ years | Procgen dungeons |
| *Rimworld* | Ludeon, solo → small | 5+ years to 1.0 | Systems-driven simulation |
| *Mount & Blade* | TaleWorlds, ~30 | 6+ years to Bannerlord | Sandbox + faction politics |
| *Starsector* | Fractal, solo | 12+ years, still in EA | Living economy + ships |
| *Kenshi* | Lo-Fi Games, solo → small | 12 years | Sandbox + factions + simulation |

Black Star's **scope is closer to Starsector and Kenshi than to Hades.** Those games were solo-dev projects that took 10+ years because their scope was comparable to what we're describing.

### Indicative phase timeline (30-month target)

| Phase | Duration | Cumulative | Notes |
|---|---|---|---|
| Concept | 1 week | 1 week | ✅ complete |
| Pre-production | 4 weeks | 5 weeks | ← currently here. Expanded docs pushed it +1wk |
| Prototype | 12 weeks | 17 weeks (~4 months) | Longer — we must prove ship-building, dungeon, and combat individually |
| **Integration Slice** (new M2 target) | 16 weeks | 33 weeks (~7.5 months) | Formerly "vertical slice." Proves the full loop end-to-end thin |
| **Deepening Slice** (M3) | 20 weeks | 53 weeks (~12 months) | Takes the integration slice and makes each subsystem shippable |
| Production | 72 weeks | 125 weeks (~29 months) | Content creation at scale |
| Polish | 12 weeks | 137 weeks (~32 months) | Bug fixing, balance, accessibility |
| **Total to ship (optimistic)** | **~32 months** | | |

**Realistic band: 30–42 months**, with 36 months as the planning default.

If we are still shipping at 48 months, we have scope-crept past the budget and must cut aggressively (see §4). If we are past 54 months with no ship date in sight, we cancel or radically restructure.

### The principle

Scope is the lever we pull when the timeline slips. Features get cut, not crunched into existence. **Sustainable pace** is non-negotiable for a multi-year solo project — see R12 in the risk register.

---

## 4. Scope levers

When the timeline is in danger, these are the levers we pull **in order**. Each lever's system spec has its own more detailed lever list; this is the aggregated macro view.

### Tier 1 — easy cuts (pull first)
1. **Cut post-launch features.** Cloud save, mod support, localization, controller support — all cut from launch, planned for post-launch updates.
2. **Reduce content counts.** 50 systems → 25; 12 companions → 8; 60 weapons → 40. Quality over quantity.
3. **Drop playable species from 4 to 2 (Human + 1 alien).** Remaining species become NPC only. Saves art + dialogue per-species scope.

### Tier 2 — meaningful cuts (pull second)
4. **Drop secondary biomes.** 8 biomes → 5 biomes. Cut the least distinctive ones.
5. **Drop a class.** 5 classes → 4 classes. The Exile is the riskiest; could be cut or moved to post-launch.
6. **Ship-building: drop the grid, go to slot loadout.** Hulls have fixed slots instead of grid placement. Halves UI work and a third of design time. See `ship-building.md §9`.
7. **Outposts: cut operation count from 10 to 6.** Market, Shipyard, Trade Office, Diplomatic Wing, Defense, Real Estate only. See `outposts.md §9`.

### Tier 3 — pillar cuts (pull third, reluctantly)
8. **Living economy: cap NPC traders / abstract far sectors.** Simulation stays but galaxy feels quieter. Last simulation-preserving lever. See `living-economy.md §9`.
9. **Faction through-lines: reduce from 6 to 4.** Cut Verdant Church + Hollow Fleet through-lines (keeping them as flavor factions). The Keeper and Destroyer endings would move to post-launch DLC.
10. **Drop ship-building entirely, ship fixed ship loadouts.** Cuts a pillar. Major impact on the "my ship, my story" fantasy. Reserved for severe schedule pressure.

### Tier 4 — fallback posture (pull fourth)
11. **Fallback to Roguelike-First.** Ship Black Star as a tight Hades-scale roguelike dungeon crawler with empire as background flavor. Cut the living economy, reduce outposts to passive income only, cut 3 of 6 factions to static dispositions, keep ship-building as loadout-only. **This is a shippable game in ~15 months.** It is not the game we set out to make, but it is better than an unshipped dream.

### Tier 5 — end conditions
12. **Cancel.** If the above fail, cancel the project. This is a real option for any studio. Honest cancellation at month 18 with a working prototype is better than desperate shipping at month 48 with a broken game.

**Cut before add rule:** from pre-production onward, any new feature proposal requires identifying something to cut of equivalent cost. No net-add.

---

## 5. Team composition (aspirational)

At solo-dev scale (current reality), one person wears all hats. At small-studio scale:

| Role | Count | Notes |
|---|---|---|
| Game director / design lead | 1 | Owner of vision and pillars |
| Technical director | 1 | Owner of architecture and TDD |
| Gameplay engineers | 2–3 | Systems, combat, AI |
| Content engineer | 1 | Tools, data pipeline |
| Pixel artists | 2 | Characters, environments, UI |
| Animator | 1 | Hand-animates key actions |
| Audio designer / composer | 1 | Double duty on music + SFX, hire out voice |
| Writer / narrative designer | 1 | GDD, quests, dialogue |
| Producer | 1 | Schedule, meetings, discipline |
| QA | 1 | Builds pipeline, playtests, bug tracking |
| **Total** | **~12** | |

This is a *small AAA / large indie* team. Most of the timeline estimates assume this size. Solo dev with AI assistance can approximate some of this but cannot approximate all of it — expect longer timelines.

---

## 6. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Phases, gates, timeline, scope levers, team composition. |
| 0.2 | 2026-04-12 | Sandbox-first pivot. Timeline revised upward from ~17 months to 30–42 months (36-month planning default). Phase 3 split into Integration Slice + Deepening Slice to de-risk the sandbox handoffs. Scope levers reorganized into tiers with a "Roguelike-First fallback" option explicitly named. Cut-before-add rule locked. |

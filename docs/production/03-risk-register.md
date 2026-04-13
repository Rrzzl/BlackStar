# Black Star — Risk Register

**Document owner:** Production Lead
**Status:** Draft v0.1
**Last updated:** 2026-04-12

---

## 0. Purpose

A **risk register** is a living document of everything that could kill or damage the project. Every risk is scored, assigned an owner, and given a mitigation. The register is reviewed monthly and at every milestone gate.

**The point of a risk register is not to list every possible bad thing.** The point is to identify things that would be expensive or impossible to fix if discovered late, so they can be fixed early when it's cheap.

---

## 1. Risk scoring

Each risk gets three scores:

| Dimension | Scale |
|---|---|
| **Likelihood** | 1 (rare) – 5 (nearly certain) |
| **Impact** | 1 (minor annoyance) – 5 (project-ending) |
| **Score** | Likelihood × Impact (1–25) |

Risks with score ≥ 12 are **red** and require immediate mitigation. Scores 6–11 are **amber**. Scores 1–5 are **green** (track but don't drop everything).

Each risk also has a **trigger condition** — the early-warning signal that the risk is becoming real.

---

## 2. Active risks

### R1: Scope explosion — THE DEFINING RISK
- **Category:** Production
- **Description:** The GDD is ambitious. The sandbox-first pivot on 2026-04-12 formalized four pillar systems (ship-building, outposts, living economy, factions-and-quests) that together push Black Star into small-AAA / large-indie territory. Each pillar is, on its own, the size of a small game. Without aggressive enforcement, scope grows until the project becomes unshippable.
- **Likelihood:** 5
- **Impact:** 5
- **Score:** 25 (RED — THE DEFINING RISK OF THE PROJECT)
- **Trigger:** Any of: a milestone slips by > 2 weeks; a new system is added outside the current slice without a cut being made elsewhere; content counts start rising from the GDD targets; the integration slice isn't playable at 16 weeks
- **Mitigation:**
  1. Every milestone gate includes a scope audit
  2. The integration slice (new M2) is ruthlessly scoped to the minimum that proves the full loop — not any single subsystem at launch quality
  3. **Cut-before-add rule** — any new feature in any phase requires identifying something to cut of equivalent cost. Enforced at code review and at milestone gates.
  4. Content counts in the GDD are ceilings, not floors
  5. The roadmap's scope levers (§4) are **pre-authorized** — the producer does not need a separate sign-off to pull a Tier 1 or Tier 2 lever when the schedule warrants it
  6. **The Roguelike-First fallback is always on the table.** If at any milestone the full sandbox game cannot be built, shipping the roguelike subset is a respected outcome, not a failure
  7. Solo developer has explicit permission to cancel the project at any milestone without guilt
- **Owner:** Production Lead
- **Status:** Mitigation plan in place. This risk will never be "resolved" — it is monitored for the entire life of the project.

---

### R2: "Not fun" prototype
- **Category:** Design
- **Description:** After 10+ weeks of prototyping, the core loop isn't fun. Team morale drops, everything downstream is built on a shaky foundation.
- **Likelihood:** 3
- **Impact:** 5
- **Score:** 15 (RED)
- **Trigger:** Internal playtests at M2–M5 consistently report "meh"; the team can't articulate what's fun about the prototype
- **Mitigation:**
  1. Prototype gate is a real gate — we will cancel at M5 if the prototype isn't fun
  2. Multiple early playtests with internal and external testers (not waiting for M5 to find out)
  3. Willingness to pivot in prototype phase — it's cheap to change there, expensive to change later
  4. Keep a running "what's fun" document; when something feels good, preserve it
- **Owner:** Design Lead
- **Status:** Live risk. Prototype phase upcoming.

---

### R3: Canvas 2D performance ceiling
- **Category:** Technical
- **Description:** HTML5 Canvas 2D may not sustain 60 FPS at the target entity count (500 in space scenes). Late discovery would force a renderer rewrite.
- **Likelihood:** 3
- **Impact:** 4
- **Score:** 12 (RED)
- **Trigger:** Perf tests at M2–M3 show frame times > 10ms at 300+ entities
- **Mitigation:**
  1. Perf benchmark early (M2) with synthetic 500-entity load
  2. Sprite batching via offscreen canvas atlases
  3. Dirty-rect rendering for static backgrounds
  4. Fallback: migrate to Pixi.js (WebGL) if Canvas 2D caps out — fallback is non-trivial but not project-ending
  5. Keep entity counts down through good design (de-dup, culling, LOD)
- **Owner:** Tech Lead
- **Status:** Will validate at M1 / M2 with synthetic benchmarks

---

### R4: Procedural generation feels repetitive
- **Category:** Design
- **Description:** Procgen dungeons feel like the same dungeon every time with different doors. Players lose interest by hour 20.
- **Likelihood:** 4
- **Impact:** 4
- **Score:** 16 (RED)
- **Trigger:** Internal playtests note repetition; "I've seen this room before" comments are common; completion rates drop
- **Mitigation:**
  1. Large room library per biome (40+ rooms)
  2. Room variation via enemy spawn shuffling, light placement, decorative variation
  3. Biome-specific room personalities so even similar layouts feel different
  4. Hand-authored set pieces sprinkled into procgen runs
  5. Rare room types that appear unpredictably
  6. Playtest specifically for repetition at every alpha/beta
- **Owner:** Systems Designer
- **Status:** Design mitigation in spec; must validate in prototype

---

### R5: Companion AI feels bad
- **Category:** Technical / Design
- **Description:** Companion AI is the single hardest problem in the game. Bad companion AI makes the game feel unplayable.
- **Likelihood:** 4
- **Impact:** 4
- **Score:** 16 (RED)
- **Trigger:** Playtesters dislike having companions; companions die stupidly; players turn off tactical pause
- **Mitigation:**
  1. Companion AI spec is thorough (`ai-behavior.md §8`)
  2. Early prototype of a single companion with a single player to validate the feel
  3. Iteration budget: 3× the normal dev time for companion AI; we expect it to be hard
  4. Fallback: if full companion AI is too hard, reduce scope (companions auto-follow, no tactical pause command, simpler behavior)
- **Owner:** AI Designer + Tech Lead
- **Status:** Spec in place; will prototype after basic enemy AI works

---

### R6: Save format breaks on update
- **Category:** Technical
- **Description:** An update ships that breaks older saves, losing player progress and generating outrage.
- **Likelihood:** 3
- **Impact:** 5
- **Score:** 15 (RED)
- **Trigger:** Players report saves failing to load after an update
- **Mitigation:**
  1. Every save schema change requires a migration + migration test
  2. Golden fixtures for every historical save version
  3. Save version bumps are in the code review checklist
  4. Loading a corrupted save prompts the user rather than crashing
  5. Backup slot always kept alongside the primary save
- **Owner:** Systems Engineer
- **Status:** Spec in place (`save-and-persistence.md`)

---

### R7: Art pipeline bottleneck
- **Category:** Production
- **Description:** Content creation (pixel art, animation) is slower than system development. Content becomes the project's critical path.
- **Likelihood:** 4
- **Impact:** 3
- **Score:** 12 (RED)
- **Trigger:** At M7 (VS Content Pass), art deliverables are > 1 week late; placeholder art lingers past its deadline
- **Mitigation:**
  1. Establish art pipeline early (M1)
  2. Create a reusable asset library — tiles and sprites that serve multiple biomes
  3. Prioritize art that the player sees most (player character, common enemies, first biome) at highest quality
  4. Lower-priority art (rare enemies, deep biomes) can ship at competent-but-not-beautiful quality
  5. Hire freelance pixel artists for specific content drops if needed
- **Owner:** Art Director + Production Lead
- **Status:** Pipeline to be validated in M1/M6

---

### R8: Audio latency / glitches
- **Category:** Technical
- **Description:** WebAudio can stutter or delay on busy frames, breaking the combat feel.
- **Likelihood:** 2
- **Impact:** 3
- **Score:** 6 (AMBER)
- **Trigger:** Internal playtests report audio pops, missed SFX, delayed gunfire sounds
- **Mitigation:**
  1. Pre-decode all critical SFX at load time
  2. Limit simultaneous voices (32 max)
  3. Priority system — drop low-priority sounds if voice budget exceeded
  4. Profile audio performance early
- **Owner:** Audio Engineer
- **Status:** Will address in M1

---

### R9: Economy becomes trivial or broken
- **Category:** Design
- **Description:** Players find a loop that generates infinite money, breaking progression; or the economy is too tight and feels punishing.
- **Likelihood:** 4
- **Impact:** 3
- **Score:** 12 (RED)
- **Trigger:** Playtesters accumulate wealth too fast or can't afford basic gear
- **Mitigation:**
  1. Economy sim includes price elasticity and NPC traders to normalize profitable routes
  2. Stock caps at stations prevent infinite selling
  3. Ongoing balance passes throughout alpha/beta
  4. Telemetry on credits-per-hour across all playtesters
- **Owner:** Systems Designer
- **Status:** Design spec in place; validate in alpha

---

### R10: Companion permadeath feels punishing
- **Category:** Design
- **Description:** Players rage-quit when a beloved companion dies in a random dungeon, feeling the game is unfair.
- **Likelihood:** 3
- **Impact:** 4
- **Score:** 12 (RED)
- **Trigger:** Playtest feedback: "I stopped playing after I lost X"; high churn at the first companion death
- **Mitigation:**
  1. Companion death is telegraphed — when they drop low, a clear warning and retreat option appears
  2. High-loyalty companions have a one-time "save from death" ability
  3. Difficulty options include a "companion immortality" toggle for casual players
  4. Companion bodies can be recovered if the captain survives the dungeon
  5. Explicit tutorial teaches players about companion permadeath before they recruit anyone
- **Owner:** Design Lead
- **Status:** Design direction set; test aggressively in VS

---

### R11: Story scope vs. budget
- **Category:** Production
- **Description:** The narrative bible is ambitious. A team without a dedicated writer may not produce enough quality writing; voice acting is expensive.
- **Likelihood:** 4
- **Impact:** 3
- **Score:** 12 (RED)
- **Trigger:** Quest backlog at alpha is thin; dialogue is placeholder at beta
- **Mitigation:**
  1. Limit voice acting to core cinematics + barks (see audio direction)
  2. Text-first dialogue for 95% of the game
  3. Hire a narrative designer / writer for production phase if solo author can't sustain output
  4. Cut the number of companions before cutting their quality — 8 great companions beat 12 mediocre ones
- **Owner:** Narrative Lead + Production Lead
- **Status:** Watch closely

---

### R12: Solo developer burnout / drop-off
- **Category:** Human
- **Description:** A solo developer (current project reality) burns out on an 18-month project. Health, motivation, or life circumstances pull them away.
- **Likelihood:** 4
- **Impact:** 5
- **Score:** 20 (RED)
- **Trigger:** Weeks of low output, loss of enthusiasm, personal crisis
- **Mitigation:**
  1. Sustainable pace — no crunch. Timeline accommodates 30-hour weeks, not 60-hour weeks.
  2. Regular "nothing-to-show" breaks allowed at milestone gates
  3. Scope is the lever, not hours
  4. Build a small accountability loop (dev log, weekly check-in with a friend, community)
  5. Clear exit criteria for the project — it's OK to stop at any milestone with a partial shippable result
- **Owner:** Developer (themselves)
- **Status:** Primary risk for a solo project; be honest about bandwidth

---

### R13: Browser compatibility
- **Category:** Technical
- **Description:** The game runs in Chrome but not Firefox/Safari, cutting the audience.
- **Likelihood:** 2
- **Impact:** 3
- **Score:** 6 (AMBER)
- **Trigger:** Testers on Firefox/Safari report broken features
- **Mitigation:**
  1. Use only standards-track APIs (no Chromium-specific features)
  2. CI matrix test in Chrome + Firefox + Safari (headless)
  3. Feature detection with graceful degradation
- **Owner:** Tech Lead
- **Status:** Standard practice, low effort

---

### R14: Localization surprise
- **Category:** Production
- **Description:** Localization is deferred but not designed against. When we finally localize, every string is hardcoded and the system explodes.
- **Likelihood:** 3
- **Impact:** 3
- **Score:** 9 (AMBER)
- **Trigger:** Any string in the codebase not going through a string table
- **Mitigation:**
  1. All user-facing strings go through a single `t("key")` function from day 1, even if the table is English-only
  2. Localization-ready infrastructure in M1
  3. Actual translation work deferred to post-launch
- **Owner:** Tech Lead
- **Status:** Easy to do upfront, painful to retrofit

---

### R15: Accessibility missed until too late
- **Category:** Design / Ethics
- **Description:** Accessibility is designed in, then forgotten during production, resulting in a game that locks out disabled players.
- **Likelihood:** 3
- **Impact:** 3
- **Score:** 9 (AMBER)
- **Trigger:** Accessibility review at beta finds systemic gaps
- **Mitigation:**
  1. Accessibility checklist in every milestone gate
  2. Accessibility-dedicated playtest in beta
  3. Key features (colorblind modes, subtitles, key remapping) planned from day 1
- **Owner:** Design Lead
- **Status:** Part of ongoing reviews

---

### R16: Living economy simulation fails to emerge fun
- **Category:** Design / Technical
- **Description:** The NPC-trader simulation is deterministic and conservation-of-goods, but "technically simulated" does not guarantee "emergently interesting." The economy may stabilize into boring equilibria, or fail to produce trade opportunities the player can spot, or produce exploits that break the game.
- **Likelihood:** 4
- **Impact:** 4
- **Score:** 16 (RED)
- **Trigger:** Integration slice players don't spontaneously engage with trading; pricing feels the same everywhere; NPC trader behavior looks random rather than motivated
- **Mitigation:**
  1. Build the economy simulator as a standalone sandbox with debug visualization **before** wiring it into gameplay
  2. Run 1000-hour simulation tests with no player to verify prices stabilize in interesting ranges, not in degenerate equilibria
  3. Add hand-authored **seeded shortages** (faction-induced, story-motivated) as interesting-events layer on top of emergent simulation
  4. Economic UI surfaces opportunities (the "!" trend markers) so players without X4-brain can still engage
  5. **Scope lever:** fall back to simpler price tables if the simulation doesn't work (see `living-economy.md §9`)
- **Owner:** Systems Designer + Tech Lead
- **Status:** Will build standalone sim in prototype phase before gameplay integration

---

### R17: Ship-building overwhelms new players
- **Category:** Design / UX
- **Description:** The hybrid grid-sim with power routing, heat, subsystem targeting, and module rotation is deep and satisfying for returning players but intimidating for the first 30 minutes. New players bounce off the menu complexity before discovering the fun.
- **Likelihood:** 4
- **Impact:** 3
- **Score:** 12 (RED)
- **Trigger:** Tutorial completion rate below 80%; ship-building UI is where playtesters get stuck
- **Mitigation:**
  1. **Tier 0 Dinghy** is truly simple — no real build choices, no grid puzzle, one-weapon default
  2. First real ship (Shrike) arrives with a **pre-configured "captain's build"** — players can fly it as-is and only need to engage the build system when they *want* to
  3. Tutorial introduces modules one at a time over the first three hours of play, not all at once
  4. **Auto-build** button — one-click suggested loadouts for players who don't want to engage
  5. Test Flight simulator lets players experiment without credit loss
  6. **Scope lever:** drop the grid for fixed slot loadouts if onboarding is irrecoverable
- **Owner:** Design Lead + UX
- **Status:** Onboarding design to be prototyped in integration slice

---

### R18: Sandbox purposelessness
- **Category:** Design
- **Description:** Without a forced main quest, some players will bounce off Black Star within an hour because they "don't know what to do." The Mount & Blade / Kenshi audience is used to this, but mainstream expectations may not be met.
- **Likelihood:** 4
- **Impact:** 4
- **Score:** 16 (RED)
- **Trigger:** Playtest feedback "I don't know what I'm supposed to do"; first-hour drop-off rate > 40%
- **Mitigation:**
  1. **Opening rumor** — every new game starts with a dead man's logbook that points to a specific coordinate. The player is never without a lead, but the lead is optional.
  2. **Quest-giver density** — stations have visible mission boards with 5+ offers at any time
  3. **Ambient goal hints** — the main menu shows "Recent galaxy news" items the player can click to pursue
  4. **No-pressure tutorial** — the first 30 minutes gently walks the player through "here's the station, here's your ship, here's how to fly, here's a nearby ruin to try" without forcing any of it
  5. **Codex "What to do next" panel** — surfaces the top 3 available quest threads at any time
  6. Target audience is Mount & Blade / Kenshi / Starsector / X4 players — we market there, not to the Hades crowd
- **Owner:** Design Lead
- **Status:** Opening experience to be rigorously tested in integration slice

---

### R19: Outpost management feels like menu-slog
- **Category:** Design / UX
- **Description:** Outposts are menu-driven strategic hubs. If the menus are slow, cluttered, or feel like bureaucracy rather than empire building, players will stop founding outposts — which disconnects them from one of the core fantasies.
- **Likelihood:** 3
- **Impact:** 3
- **Score:** 9 (AMBER)
- **Trigger:** Playtesters found one outpost and never a second; dashboard interactions take > 5 minutes in typical sessions
- **Mitigation:**
  1. One-screen dashboard rule (see `outposts.md §7`)
  2. Collect-all-yields in one click
  3. Urgent events highlighted, optional events de-emphasized
  4. **Visible outposts** on the galaxy map with single-click access from anywhere
  5. Build-order clarity — tooltip shows "this upgrade will give you +2,400 cr/day" before the click
- **Owner:** UX
- **Status:** Design pass in pre-VS

---

### R20: Simulated NPC count performance ceiling
- **Category:** Technical
- **Description:** The living economy requires 200+ simulated ships in the player's current sector. Combined with combat, effects, and UI rendering, this may exceed the Canvas 2D perf budget.
- **Likelihood:** 3
- **Impact:** 4
- **Score:** 12 (RED)
- **Trigger:** Sector perf tests show frame times > 12ms with 200 NPC traders + player combat
- **Mitigation:**
  1. Trader decision logic runs at 0.1–0.25Hz, not per-frame
  2. LOD for distant traders: rendered as sprites without individual thinking below a certain distance
  3. Sprite batching and atlas rendering
  4. Abstract non-current sectors entirely (see `living-economy.md §6.2`)
  5. **Scope lever:** cap traders per sector at 15 if perf can't be achieved
- **Owner:** Tech Lead
- **Status:** Will benchmark in M2 with synthetic 500-entity economy load

---

## 3. Retired risks

None yet. As risks are resolved, they move here with a note on how they were mitigated.

---

## 4. Risk review cadence

- **Weekly:** production lead scans the register for trigger conditions
- **Milestone gates:** full team review of red and amber risks
- **Monthly:** risk register update (new risks added, resolved risks retired, scores re-scored)
- **Ad hoc:** any team member can raise a new risk at any time

---

## 5. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. 15 active risks identified and scored. |
| 0.2 | 2026-04-12 | Sandbox-first pivot. R1 elevated to "Defining Risk" with expanded mitigations (pre-authorized scope levers, Roguelike-First fallback, explicit cancel permission). Added R16 (economy emergence), R17 (ship-building onboarding), R18 (sandbox purposelessness), R19 (outpost menu-slog), R20 (simulated NPC perf). Register now 20 active risks. |

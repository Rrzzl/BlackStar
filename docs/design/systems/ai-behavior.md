# System Spec: AI Behavior

**Owner:** AI Designer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before:** [Combat](combat.md), [TDD §3.1, §4](../../tech/01-tdd.md)

---

## 1. Goals

1. **Readable.** The player can predict what an enemy will do next, most of the time. Surprise is reserved for elites and bosses.
2. **Competent, not cheating.** AI plays by the same rules as the player — same LOS, same damage, same movement. Advantage comes from numbers and positioning, not God vision.
3. **Diverse.** Different enemy types feel different. Same-type enemies in groups coordinate but don't feel identical.
4. **Performant.** AI cost scales with entity count; 200 AI-driven entities must run comfortably in the combat-scene budget.

---

## 2. Architecture

### Behavior trees + utility scoring

Black Star uses **behavior trees** for structure and **utility scoring** for decisions inside leaves. This is the same pattern used by *The Last of Us*, *F.E.A.R.*, *Shadow of Mordor*, and many modern action games.

**Behavior tree** = the top-level decision logic. "If I can see the player AND I am in range, attack. Otherwise, move to a good attack position."

**Utility scoring** = inside a leaf like "pick attack position," score several candidate positions and pick the best.

### Node types
- **Sequence** — run all children in order, fail if any fail
- **Selector** — try each child, succeed if any succeed
- **Parallel** — run children simultaneously
- **Decorator** — modify a child's execution (e.g., "only if cooldown ready")
- **Action** — leaf that does something (move, attack, say line)
- **Condition** — leaf that checks something (can I see the player? am I below 25% HP?)

### Blackboard
Each AI entity has a **blackboard** — a key-value store of current state. Examples:
- `target` — current target entity
- `lastKnownTargetPos` — last seen position of the player
- `threat` — current threat level
- `alertness` — idle, suspicious, combat
- `cooldowns` — map of ability → last-used time

Behavior trees read and write the blackboard; no AI-to-AI communication except via the shared squad blackboard.

---

## 3. Perception

AI detects the player through three senses:

### Sight
- Cone of vision (configurable per enemy type, typically 90° forward, 8–16 tiles)
- Raycast from eye to player, blocked by opaque tiles and closed doors
- Faster detection at close range; slower at far range
- Time-to-detect (1–2 seconds of sustained LOS) prevents instant reactions from a flickered view

### Hearing
- Omnidirectional, shorter range (6–10 tiles)
- Triggered by: player footsteps, gunfire, explosions, loud abilities
- Hearing does NOT set `target` directly — it sets `lastKnownTargetPos` and raises alertness

### Awareness broadcast
- When one enemy detects the player, it broadcasts to nearby allies within a radius
- Broadcast includes `lastKnownTargetPos` and alertness bump
- Prevents "fog of war per enemy" which looks dumb when the player shoots one enemy 2m from another and the second just stares

---

## 4. Alertness states

Four states every enemy moves through:

| State | Behavior |
|---|---|
| **Idle** | Default. Patrols, stands, performs idle animations. |
| **Suspicious** | Something felt wrong. Investigates `lastKnownTargetPos`. Weapons un-stowed. |
| **Combat** | Has an active target. Runs combat behavior tree. |
| **Searching** | Lost the target. Moves through possible hiding spots for a duration, then returns to idle. |

State transitions:
- Idle → Suspicious: hearing or peripheral sight
- Suspicious → Combat: confirmed sight of target
- Suspicious → Idle: time-out with no confirmation
- Combat → Searching: lost LOS for 3+ seconds
- Searching → Combat: re-established sight
- Searching → Idle: time-out (typically 20 seconds)

---

## 5. Behavior archetypes

Match the enemy types from Combat §6. Each archetype is a behavior tree template.

### Rusher
```
Root (Selector):
├── [Condition: HP < 20%] → Flee
├── [Condition: target visible]
│   └── Sequence:
│       ├── MoveTo(target, melee range)
│       └── MeleeAttack(target)
└── InvestigateLastKnownPos
```

### Shooter
```
Root (Selector):
├── [Condition: HP < 25%] → RetreatAndHeal
├── [Condition: target visible AND in range]
│   └── Sequence:
│       ├── PickCoverPosition (utility scored)
│       ├── MoveTo(coverPosition)
│       └── ShootTarget
└── [Condition: target visible AND out of range]
│   └── MoveTo(target, optimalRange)
└── InvestigateLastKnownPos
```

### Sniper
```
Root (Selector):
├── [Condition: HP < 40%] → Relocate (distance themselves)
├── [Condition: target visible]
│   └── Sequence:
│       ├── AimDelay(600ms, telegraphed laser sight)
│       └── Fire
└── [Condition: NOT target visible]
│   └── RepositionForAngle
└── Idle
```

### Bomber
```
Root (Selector):
├── [Condition: target within explode radius]
│   └── Sequence:
│       ├── Beep(flash)
│       └── Explode
├── [Condition: target visible]
│   └── MoveTo(target, recklessly)
└── Idle
```

### Tank
```
Root (Selector):
├── [Condition: target in melee range]
│   └── HeavyMeleeAttack
├── [Condition: target visible]
│   └── MoveTo(target, ignoring most cover)
└── [Condition: HP < 50%]
│   └── RaiseShield
└── Idle
```

### Caster
```
Root (Selector):
├── [Condition: cooldown ready AND target in range]
│   └── Sequence:
│       ├── ChannelAbility(800ms, telegraphed)
│       └── CastAbility
├── [Condition: allies nearby]
│   └── MoveBehindAllies
└── MoveTo(target, optimalRange)
```

Each archetype has a corresponding behavior tree file in `src/systems/ai/behaviors/`.

---

## 6. Squad coordination

When 3+ enemies of the same faction are within a coordination radius (~20 tiles) and share a target, they form an **ad-hoc squad** with a shared blackboard. The squad logic runs above individuals:

- **Role assignment:** one enemy becomes "frontline" (engages at short range), others become "support" (stay at range)
- **Flanking:** the squad picks 1–2 members to circle the target
- **Suppression:** one member fires continuously to pin the target while others maneuver
- **Retreat protocol:** if the squad takes 70% casualties, survivors retreat to regroup

Squad logic is lightweight — it biases individual decisions via the blackboard, doesn't override behavior trees.

---

## 7. Boss AI

Bosses are hand-authored state machines, not behavior trees. Each boss gets its own file with explicit phase transitions, telegraphed attacks, and unique mechanics.

Rules for bosses:
1. Every attack is telegraphed ≥ 600ms (longer than standard enemies) because bosses hit harder and the player needs reaction time
2. Bosses have 2–4 phases triggered by HP thresholds
3. Each phase adds or changes a mechanic (no "same fight but faster" phases)
4. Bosses have **intent telegraphs** — a UI banner says "preparing: Void Lance" before the cast
5. Bosses must be killable with any build — no damage-type gating

Example phase structure for a boss:
- **Phase 1 (100–66%):** basic attack rotation
- **Phase 2 (66–33%):** adds a new mechanic (summons adds, new attack pattern)
- **Phase 3 (33–0%):** desperate phase — new signature attack, shorter cooldowns, environmental hazards

---

## 8. Companion AI (the hardest problem)

Companion AI is *the* hardest AI problem in Black Star. Good companion AI feels like a trusted crew member. Bad companion AI feels like a malfunctioning Roomba.

### Principles
1. **Follow smart, fight smart, obey orders.** The player should never feel they have to babysit a companion.
2. **Don't be the star.** Companions should feel competent but the player should be doing the cool stuff.
3. **Respond to tactical pause.** When the player issues an order, execute it predictably.
4. **Never die stupidly.** Companions should not walk into telegraphed AoE or stand in fire.

### Behavior tree (high-level)

```
Root (Selector):
├── [Condition: has player order]
│   └── ExecuteOrder  // movement, target, ability
├── [Condition: player in danger (low HP, elite nearby)]
│   └── PrioritizeThreatToPlayer
├── [Condition: enemy visible]
│   └── EngageSmartly
├── [Condition: in combat but no enemy]
│   └── AdvanceWithPlayer
└── FollowPlayer
```

### Positioning rules
- Stay within 8 tiles of the player in combat (or 15 tiles if ordered to hold)
- Never stand in the player's line of fire
- Spread out — companions avoid clustering, reducing AoE vulnerability
- Use cover when available

### Order execution
- **Move** — move to point, stop when reached
- **Attack target** — engage that target until it dies or another order arrives
- **Hold position** — stay here, shoot enemies in range
- **Follow** — default state
- **Retreat** — move toward player, drop aggro
- **Use ability** — cast ability at target, continue previous behavior

### Tactical pause integration
When the player pauses and issues orders, those orders are **queued** on the companion. On unpause, each companion executes its queue. Multiple queued orders chain (move → attack → use ability).

### Companion-specific quirks
Each named companion has small personality quirks in their AI — Sable always rolls to the side when shot at, Runt throws grenades recklessly, Thane holds position longer than ordered. These are small overrides on the base companion tree.

---

## 9. Space AI (ship AI)

Most of the above applies to ship combat with adjustments:

### Differences from on-foot
- Larger scale (range in hundreds of tiles, not tens)
- Newtonian-ish movement — AI must predict target movement, lead shots
- Facing matters (shields, weapon arcs)
- AI considers formation bonuses when multiple ships fight together

### Ship archetypes
- **Scout** — hit-and-run, fast, fragile, favors long range
- **Interceptor** — close in, brawl, die fast
- **Gunship** — mid-range, balanced, frontline fighter
- **Bomber** — slow, high-damage, rocket-oriented
- **Capital** — slow-moving broadside fighter, stands off and pounds

### Pirate AI
- Prioritizes cargo ships, then ships smaller than itself
- Retreats when damaged below 40%
- Breaks off pursuit if player outruns them for 10+ seconds
- Multiple pirates coordinate via squad blackboard

### Hollow Fleet AI
- Doesn't retreat
- Coordinates at the squad level with perfect intel (narrative: they share a hive-mind)
- Performs "formation attacks" — linked shots, synchronized beam weapons, ramming attacks with intent

---

## 10. Performance

### AI update budget
- AI ticks at **10 Hz** (100ms), not 60 Hz. Behavior decisions don't need per-frame fidelity.
- Within an AI tick, only active AI (in the current scene, within the update radius of the camera) run
- Distant AI (out of update radius) run a reduced "coarse" behavior tree
- Total budget: ~2ms per frame for AI (from the 6ms simulation budget in TDD)

### Level of detail (LOD)
| Distance from camera | AI behavior |
|---|---|
| 0–30 tiles (on screen) | Full behavior tree, 10 Hz |
| 30–60 tiles (nearby) | Simplified tree, 5 Hz |
| 60+ tiles (off-screen) | Only check: should I be culled? Simplified simulation at 1 Hz |

### Squad thinking
- Squad decisions run at 2 Hz, not 10 Hz — coordination changes slowly
- Squad broadcasts are event-driven, not polled

---

## 11. Debug tooling

- **AI debug overlay:** draw behavior tree state, blackboard values, perception cones, paths on top of each AI entity
- **AI step-through:** freeze all AI, tick one at a time
- **AI force state:** manually set an AI's alertness state
- **Spawn enemy:** drop any enemy type at the cursor
- **Print tree:** dump a full behavior tree evaluation trace to the console

---

## 12. Open questions

1. **GOAP vs. behavior trees?** GOAP (Goal-Oriented Action Planning) is more flexible but harder to debug. Sticking with behavior trees for Black Star; revisit for AAA sequel if perf allows.
2. **Player-readable AI intent indicators?** Should enemies show their current target / intended attack via a UI marker? *Leaning yes for elites, no for chaff.*
3. **Learning / adapting AI?** Enemies that remember player tactics across runs? *No — out of scope; would break the pattern-learning loop players need.*

---

## 13. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. BT + utility architecture, perception, alertness states, archetypes, squad coordination, companion AI, space AI, performance LOD. |

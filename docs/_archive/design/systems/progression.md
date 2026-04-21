# System Spec: Character & Ship Progression

**Owner:** Systems Designer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before:** [GDD §4.5, §4.6](../02-gdd.md)

---

## 1. Goals

1. **Every hour of play advances the player.** No dead sessions.
2. **Build variety is real.** Different builds play meaningfully differently, not just bigger numbers.
3. **Class choice matters early, doesn't lock the player forever.** The first 10 hours play differently; the endgame converges on player choice.
4. **Ship and character progression are independent but synergistic.** You can pour points into one or both.

---

## 2. Experience & levels

### XP sources
- **Combat kills** (majority of XP)
- **Quest completion**
- **Discovery** (new systems, new ruins, new lore fragments)
- **Trade** (small XP for large-margin trades — rewards economic play)

### Level curve
- 30 max level at launch (diminishing returns past that for new game+)
- Each level grants 1 skill point + stat bonuses (+5 HP, +2 stamina, +1% all damage)
- XP curve is front-loaded: levels 1–5 fast, 6–15 moderate, 16–30 slow
- No grinding mechanics — level expectations are calibrated so a player who completes most content in a region is the right level for the next

### XP formula

```
xp_to_next(level) = 100 * level^1.8
```

Levels 1–30 sum to roughly **30,000–40,000 XP of total progression** — a typical playthrough earns this organically.

---

## 3. Captain skill trees

Three branches — **Flesh**, **Steel**, **Spark** — each with roughly 20 nodes. Points can be spent across all three; no hard branch locking.

### Flesh (body, endurance, melee)

| Node | Effect |
|---|---|
| Iron Skin | +20 max HP (can take 5 times) |
| Second Wind | Once per combat, regenerate 30% HP when below 25% |
| Brawler | +25% melee damage |
| Dodge Master | +1 dodge charge, +2 frames of i-frames |
| Pain Tolerance | Take 20% less damage below 50% HP |
| Unbreakable | Immune to stagger once per 10 seconds |
| Marathon | +50% stamina, stamina regen doubled |
| Rage | Each kill grants +10% damage for 5 seconds (stacks to 5) |
| ... | 12 more |

### Steel (weapons, tactics, combat)

| Node | Effect |
|---|---|
| Gunslinger | +10% small-arms damage (can take 3 times) |
| Rifleman | +15% rifle damage, +20% rifle range |
| Explosive Expertise | +30% AoE damage, +20% AoE radius |
| Crit Eye | +5% crit chance (can take 5 times) |
| Tactician | +1 command point, pause time +1 second |
| Marksman | Zero recoil below 50% fire rate |
| Weapon Mastery | +1 mod slot on every weapon |
| Killer Instinct | First shot in combat crits automatically |
| ... | 12 more |

### Spark (tech, hacking, utility, crafting)

| Node | Effect |
|---|---|
| Hacker | Unlock hacking minigame for doors, terminals, turrets |
| Salvager | +30% salvage yield from destroyed ships |
| Scanner | Reveal enemies through walls within 20 tiles |
| Crafter | Craft items at any station for half materials |
| Energy Management | +30% energy regen, -20% ability cost |
| Drone Pilot | Deploy a combat drone (passive ally) |
| Void Attunement | +25% damage to First One-derived enemies |
| Scholar | +50% lore-fragment XP, unlock hidden dialogue options |
| ... | 12 more |

### Respec
- Free respec at level-up
- After level-up, respec costs credits (scales with level), available at medical stations
- Fixed cost to respec class ability trees (see below)

---

## 4. Class abilities

Each class has **3 active abilities** that define its identity, unlocked at levels 1, 5, and 10. Abilities can be upgraded with class-specific skill points (1 per 3 levels).

### Gunslinger
- **Lv1 — Quickdraw:** Instant reload, next shot crits. CD 15s.
- **Lv5 — Ricochet Shot:** Next shot bounces between up to 3 enemies. CD 20s.
- **Lv10 — Last Stand:** For 6 seconds, each kill restores 15 HP. CD 60s.

### Tactician
- **Lv1 — Rally:** Allies gain +30% damage and move speed for 8 seconds. CD 30s.
- **Lv5 — Focus Fire:** Mark a target; all allies auto-target it. CD 20s.
- **Lv10 — Overwatch:** Pause time extends by 5 seconds and is free for this combat. CD 90s.

### Voidsmith
- **Lv1 — Repair Pulse:** Restore 40% armor/shield to self and nearby allies. CD 30s.
- **Lv5 — Tractor Bomb:** Create a singularity that pulls enemies in, then explodes. CD 45s.
- **Lv10 — Overcharge:** Weapons deal +100% damage for 8 seconds but overheat faster. CD 60s.

### Mercer
- **Lv1 — Silver Tongue:** Next NPC interaction treats reputation as +2 tiers. CD 5 min (combat-agnostic).
- **Lv5 — Bribe:** Pay credits to instantly stun non-boss enemies (scales with wealth). CD 30s.
- **Lv10 — Grand Contract:** Hire any nearby neutral NPC to fight alongside you for 60 seconds. CD 5 min.

### Exile
- **Lv1 — Risk & Reward:** Activate to double damage taken *and* damage dealt for 8 seconds. CD 20s.
- **Lv5 — Shadowstep:** Teleport a short distance, becoming invisible for 2 seconds. CD 15s.
- **Lv10 — Last Hand:** At 0 HP, survive once per run with 1 HP and full stamina. Passive, one use per run.

---

## 5. Ship progression

### Ship XP (separate from captain)
- Each ship earns XP from combat and exploration *while being piloted*
- Ships level up independently from the captain
- Ship level grants module slots and unlocks

### Ship upgrade slots

Every ship has slot categories:

| Category | What it does |
|---|---|
| **Weapon hardpoints** | Primary and secondary weapons |
| **Shield module** | Shield type, strength, regen rate |
| **Engine module** | Speed, boost, maneuverability |
| **Power core** | Energy cap, regen, heat dissipation |
| **Hull mods** | Armor, repair systems |
| **Utility** | Tractor beam, stealth, sensors, cargo |
| **Crew quarters** | How many companions can ride |

Ship classes (scout, fighter, corvette, freighter, capital) differ in how many of each slot they have. Capital ships are weapons-heavy and slow; scouts are fast and fragile; freighters are cargo-heavy and poorly armed.

### Module rarity
- Common, Uncommon, Rare, Legendary same as loot
- Legendary modules often have unique effects (e.g., "Void Engine: your ship leaves a corrupted trail that damages pursuers")

### Shipyard upgrades
- Some upgrades are only available at **shipyards** (special stations)
- Allow reconfiguring ship slot counts, refitting weapon bays, or transferring modules between ships

---

## 6. Ships available

### Starter ships (one per class)
Already detailed in GDD §4.5. Each is fixed and linked to its class.

### Acquirable ships
- **20 total at launch**, spanning 5 size classes
- Acquired through: buying at shipyards, capturing in combat, story rewards, faction unlocks
- Each ship is a distinct model with its own stat profile, slot layout, and aesthetic
- Players can own multiple ships (soft cap 6 active, more stored) — see fleet section

### Ship stats
- **Hull** (HP)
- **Shield** (regen cap)
- **Speed** (top, accel, maneuverability)
- **Energy** (cap, regen, heat dissipation)
- **Cargo** (volume, weight)
- **Crew cap** (companion slots)

Stats are balanced against each other — no ship is universally best. The player picks based on playstyle and mission.

---

## 7. Crew progression

### Companion XP
- Each companion earns XP when in the active party (dungeon or space)
- Level cap: matches captain level, can't exceed
- Per level: 1 companion skill point + stat bonuses

### Companion skill trees
- Each companion has a **smaller, focused skill tree** (8–12 nodes)
- Trees are thematic to the character — Sable has a flight tree, Runt has a tech/salvage tree
- Companions can't respec freely; a companion's build feels like theirs, not the player's

### Companion loyalty
- Separate from skill progression
- Grows through: dialogue, quest choices, gift-giving, combat proximity
- **Tiers:** Hostile, Neutral, Friendly, Loyal, Devoted
- Higher loyalty unlocks: personal quests, new abilities, romance options, a one-time save-from-death
- Devoted companions trigger their loyalty ending in the epilogue

---

## 8. Player progression pacing

### Target pacing for a typical playthrough

| Hour | Captain level | Ships owned | Companions | Credits |
|---|---|---|---|---|
| 1 | 1–2 | 1 | 0 | ~500 |
| 5 | 5–7 | 1 | 1 | ~5,000 |
| 10 | 10–12 | 2 | 3 | ~25,000 |
| 20 | 16–18 | 3 | 5 | ~150,000 |
| 40 | 22–24 | 4 | 7 | ~500,000 |
| 80 | 28–30 | 5+ | 10+ | ~2,000,000 |

The curve is an *expectation*, not a constraint. Some players will race ahead, others will over-level. Content scales within ranges to accommodate both.

---

## 9. New Game+

- Available after any ending
- Carries over: captain level (capped at 30), unlocked skills, unlocked ships (but not the ships themselves), codex, lore discoveries
- Does NOT carry: credits, ship fleet, crew, empire, inventory
- NG+ adds: harder enemies, remixed loot, new narrative branches, additional endings
- Max three NG+ tiers; beyond that, difficulty ceases to increase

---

## 10. Open questions

1. **Class-locking of abilities** — can a Gunslinger learn Tactician abilities eventually? Leaning no; class identity should stay distinct, with captain skill trees as the cross-class progression.
2. **Permadeath of captain at hardcore difficulty** — does the captain losing all progression kill NG+ unlocks too? *Leaning no; some meta-progression must survive.*
3. **Companion recruitment cap** — hard cap at 12 named, or can the player hire unlimited generic crew? *Leaning 12 named + unlimited generic crew for ship staffing.*

---

## 11. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Levels, skill trees, class abilities, ship progression, companion progression, pacing targets. |

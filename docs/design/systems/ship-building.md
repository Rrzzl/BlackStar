# Ship Building System

**Document owner:** Systems Designer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before this one:** [GDD §4.8](../02-gdd.md), [Combat](combat.md)

---

## 0. Purpose

Ship building is one of Black Star's pillar systems. It is the mechanical expression of the **"my ship, my story"** fantasy and the gate through which progression, combat identity, economy, and exploration all flow. This document specifies the hybrid grid-sim model: hull-constrained module placement with a power budget, no free-form hull construction.

This is **not** a prototype spec — the decisions here lock the whole game's combat, progression, and economy subsystems together.

---

## 1. Design principles

1. **Every ship is recognizable.** A player can glance at any ship in the galaxy — theirs, an NPC's, an enemy's — and read its role in under one second from silhouette + running lights.
2. **Every build is meaningful.** Two Shrikes with different modules play *noticeably* differently in combat and trade. No cosmetic-only choices inside the hull.
3. **The grid is a puzzle, not a blank canvas.** Players fit modules into a fixed hull shape. The satisfaction is in the fit, not in inventing hull geometry.
4. **Power is the universal currency.** Every module costs power; total consumption cannot exceed the reactor's output *while a module is active*. Players route priorities instead of disabling features.
5. **Death has a component story.** When a ship is disabled or salvaged, the specific modules are what survive, get stolen, drop as loot, or get repaired. Modules are the atoms of ship-level persistence.
6. **No lockouts.** Any hull can eventually install any module class (with slot constraints). Progression is about acquiring hulls, modules, and the **credits/reputation/materials** to afford the build — not about ability trees restricting what you can buy.

---

## 2. Hulls

A **hull** is a ship class with a fixed silhouette, fixed grid pattern, and fixed base stats. Players never edit hull geometry. They buy, salvage, or are gifted whole hulls.

### 2.1 Hull tiers (launch target: 8 hulls)

| Tier | Example name | Role | Grid size | Base reactor | Hardpoints | Cost to acquire |
|---|---|---|---|---|---|---|
| T0 | **Dinghy** | Tutorial-only shuttle | 3×3 | 3 | 0 | Given |
| T1 | **Shrike** | Light fighter | 5×4 | 8 | 2 | ~15k credits or starter gift |
| T1 | **Albatross** | Light freighter | 4×6 | 7 | 1 | ~20k credits |
| T2 | **Kestrel** | Corvette | 6×5 | 14 | 3 | ~70k credits |
| T2 | **Grinder** | Heavy utility / salvage | 5×6 | 12 | 2 | ~90k credits |
| T3 | **Warden** | Gunship | 7×6 | 22 | 5 | ~250k credits + Concord rep |
| T3 | **Caravan** | Heavy freighter | 6×8 | 18 | 2 | ~300k credits + Free Worlds rep |
| T4 | **Sovereign** | Cruiser | 9×8 | 40 | 7 | Endgame, faction-gated |

**Tier meanings:**
- **T0** is purely tutorial. No real build choices. The player upgrades out within the first 60 minutes of play.
- **T1** is the working captain's ship. Most players spend 5–20 hours here. All core loop activities must be viable on a T1 hull.
- **T2** is the first real upgrade. Meaningfully larger build space; new module classes (command modules, advanced sensors) become installable.
- **T3** is mid-game power. Requires faction reputation to buy or salvage — not just credits.
- **T4** is endgame. Few players own one before hour 40. Story and economy gate this tier.

### 2.2 Hull grid

Each hull has a fixed grid of **slots**. Slots are typed:

- **Structural** (S) — cannot hold modules; represents hull plating. Always the hull's outline.
- **Internal** (I) — can hold any module that doesn't require an exterior mount.
- **Hardpoint** (H) — exterior-facing, can hold weapons, sensors, tractor beams. Limited per hull.
- **Core** (C) — fixed central slot(s) for the reactor. Cannot be moved; reactor can be upgraded in place.

Example Shrike grid (5×4 — 20 cells):

```
. S S S .      S = structural
S H I H S      I = internal
S I C I S      H = hardpoint
. S S S .      C = core (reactor)
```

The Shrike has: 2 hardpoints, 4 internal slots, 1 core slot, 13 structural cells (visual only). Of 20 cells, 7 are buildable.

**Module size:** modules occupy 1–4 connected cells. A small railgun is 1×1; a heavy cargo bay is 2×2; a capital-grade shield generator is 2×3. Players rotate modules during placement.

**Adjacency rules (light):**
- **Reactor radiators** adjacent to the core gain +10% efficiency.
- **Cargo bays** adjacent to each other merge capacity (no loading door overhead).
- **Shield emitters** only protect cells within 3 grid cells.

Adjacency bonuses are small but noticeable — they reward thoughtful packing without punishing casual builds.

---

## 3. Modules

A **module** is an installable unit with: class, size, power draw, mass, cost, tier, and mechanical effects.

### 3.1 Module classes (launch target: ~40 base modules)

| Class | Purpose | Example modules |
|---|---|---|
| **Reactor** | Generate power | Mk I / II / III reactors; fusion vs. exotic |
| **Weapon** | Fire at enemies | Railgun, laser, missile pod, EMP, plasma cannon, mining beam |
| **Shield** | Deflect damage | Light / medium / heavy shield generators; ablative, regenerative |
| **Engine** | Provide thrust | Stock drive, boost drive, silent drive |
| **Cargo** | Hold goods | Standard bay, refrigerated, armored, smuggling compartment |
| **Crew** | Quarters for companions | Bunk room, medbay, captain's quarters, training room |
| **Sensor** | Detect at range | Short-range array, long-range scanner, signature damper |
| **Utility** | Specialized actions | Tractor beam, mining drill, repair arm, EMP burst, stealth cloak |
| **Command** | Fleet bonuses (T2+) | Command module, comms relay, fire-control computer |
| **Cosmetic** | Visual only | Running lights, hull paint, decal plates, nameplate |

Modules have **tiers** I–IV. Tier II of a module class is usually unlocked at T2 hulls; tier III at faction quest completion; tier IV at endgame artifacts.

### 3.2 Module stats (example: Mk II Railgun)

```
Class:        Weapon
Size:         2×1 (rotatable to 1×2)
Slot type:    Hardpoint
Power:        4
Mass:         8
Heat/shot:    3
Cost:         8,000 cr
Tier:         II
Effects:
  - Projectile: 45 base damage
  - Range: 800m
  - Fire rate: 1.2s
  - Hull pierce: 2
  - Signature: Loud (alerts nearby NPCs)
```

**All modules must include a "signature"** — the sensory footprint they leave. Loud weapons alert patrols. Heat-leaking reactors are detectable by Hollow Fleet. Silent drives halve detection range. This is how the stealth/aggression axis stays mechanical, not scripted.

### 3.3 Module acquisition

- **Credits at markets.** Most tier I–II modules are off-the-shelf at station shops.
- **Faction reputation.** Tier II–III modules from faction-aligned shops require standing (e.g., Iron Concord Warden requires Concord ally rank).
- **Salvage.** Defeated NPC ships drop 10–40% of their modules at random, damaged to varying degrees. Repairs cost materials.
- **Quests.** Unique modules come from hand-authored quest rewards. A Black Star tier module is functionally unique.
- **Crafting.** Voidsmith class specialty — turn scrap + rare materials into modules at outpost shipyards.

---

## 4. Power budget

Each hull has a **base reactor output**. Each module has a **power draw** while active. The core constraint:

```
sum(module.power for module in ship.modules if module.active) <= reactor.output
```

Players resolve over-budget builds by:

1. **Upgrading the reactor.** Mk II reactor installed in the core slot. Costs credits + rare materials.
2. **Toggling modules.** Modules can be manually set **active/standby**. A standby cloak costs 0 power but takes 2 seconds to warm up. A standby cargo bay can't store goods until activated. Most tactical play is managing which modules to have hot.
3. **Auto-routing.** The ship AI auto-shuts low-priority modules when the player activates a high-priority one ("bringing weapons hot → life support drops to minimum"). Priority order is player-configurable.
4. **Overcharge.** A short window (up to 8 seconds) where the reactor exceeds rated output. Risks heat buildup and reactor damage.

**Heat** is a secondary constraint. Every active module generates heat. The hull dissipates heat passively. Exceeding the heat cap damages modules. This creates DPS-over-time constraints in combat: you cannot alpha-strike forever.

---

## 5. Progression path

What the player experiences:

| Hours | State of ship |
|---|---|
| 0–1 | **Dinghy** (T0). Tutorial. No real builds. |
| 1–5 | First real ship: **Shrike** (T1). Basic loadout, usually 1 weapon + 1 cargo + 1 shield. |
| 5–15 | Shrike is rebuilt across 3–5 purchases. Player feels their choices mattering. |
| 15–30 | Upgrade to **Kestrel** (T2) or specialized T1 variant. First command module, first companion assigned to a bunk. |
| 30–60 | **Warden** or **Caravan** (T3). Major fleet or trade role locked in. |
| 60+ | Optional **Sovereign** (T4). Endgame. |

A player who never upgrades past T1 Shrike can still complete the main story. Upgrade pacing is driven by player ambition, not forced progression gates.

---

## 6. Ship UI

The ship-building UI is a **scene**: the player enters it at any station shipyard, outpost shipyard, or (with a portable kit, T3+) mid-flight.

### 6.1 Layout

```
+--------------------------------------------------------------+
|  [Ship Name: "Shrike Mk 4"]     [Credits: 45,210]    [X]    |
|--------------------------------------------------------------|
|   Module Library               Ship Grid               Stats |
|   +-----------------+   +------------------+   +----------+ |
|   |                 |   |                  |   | Hull: T1 |
|   | [Railgun  2x1]  |   |    . S S S .     |   | Reactor  |
|   | [Laser    1x1]  |   |    S [R][I][H]S  |   | 8 / 12   |
|   | [Shields  2x2]  |   |    S [I][C][I]S  |   | Mass:    |
|   | [Cargo    2x2]  |   |    . S S S .     |   | 24 / 40  |
|   | ...             |   |                  |   | Heat cap |
|   +-----------------+   +------------------+   | 48       |
|                                                +----------+ |
|   [ Save Build ]  [ Test Flight ]  [ Undock ]              |
+--------------------------------------------------------------+
```

- **Drag** modules from library to grid slots.
- **Rotate** with R.
- **Remove** with right-click (stored back in inventory, no credit loss).
- **Stats** update live as modules are placed.
- **Test Flight** — launches a combat test scenario in a pocket simulation. Free to use. Prevents regret-purchases.

### 6.2 Visual feedback

- Invalid placement → red highlight + tooltip.
- Power over budget → reactor bar turns red, a warning sits at the top.
- Successful adjacency bonus → green connector line drawn between the two modules.
- Mass over hull cap → ship icon droops visibly; engine efficiency shown reduced.

---

## 7. Combat integration

When the ship takes damage:

- **Damage hits hull first**, then spreads to nearest module(s) along the hit vector.
- Each module has its own HP. Damaged modules degrade: a half-destroyed engine halves thrust; a half-destroyed shield generator provides half the shield pool; a destroyed cargo bay spills goods into space.
- **Subsystem targeting:** the player can lock a specific enemy module and direct fire there. Skilled players disable engines, knock out reactors, or shoot the cargo bay to loot the contents. Same applies to NPC-controlled enemies.
- When a ship is **captured** (boarded and taken intact), the victor inherits all surviving modules.

This makes every combat encounter a negotiation: **how intact do you want the prize?**

---

## 8. Cosmetic layer

Visual-only customization that never affects stats:

- **Paint schemes** — a palette swap using the hull's material channels. ~20 launch paints; faction-themed unlocks.
- **Running lights** — color and pattern of exterior lights. Some factions recognize light patterns and react.
- **Decals** — stamp up to 4 decals onto the hull. Unlocked via quests, achievements, rep tiers.
- **Nameplate** — player names the ship; appears on any UI that displays the ship.

Cosmetic customization is important because players spend 30+ hours with the same ship. The ship must feel **theirs**.

---

## 9. Scope levers

If ship-building threatens the timeline, these are the cut levers in order of severity:

1. **Reduce hull count from 8 to 5.** Drop T0 (replace with a brief narrative cut) and two T2 variants.
2. **Drop the grid, go to slot loadout.** Each hull has "2 weapon slots, 3 internal slots, 1 utility slot" — no grid puzzle. Loses a pillar of feel but halves UI work and a third of design time.
3. **Drop adjacency bonuses.** Flatten the grid to pure slot occupation.
4. **Drop test flight simulator.** Players regret-purchase; bad but not project-ending.
5. **Drop subsystem targeting.** Combat becomes hull-HP-only; hull deaths trigger loot rolls instead of module persistence.

Ship cosmetics and nameplate are immovable — cutting them kills the ownership fantasy.

---

## 10. Open questions

1. **Can ships be painted mid-flight or only at shipyards?** Immersion argues for shipyards; player convenience argues for anywhere. *Owner: Design Lead. Resolve by: VS complete.*
2. **Are module sprites unique per tier or shared across tiers with a badge?** Unique art = scope; shared sprites with color badge = cheap but less satisfying. *Owner: Art Director. Resolve by: VS content pass.*
3. **Does the player own multiple hulls simultaneously, or is there one "active" ship and stored ships are in storage?** GDD §4.8 says fleet up to 6 active — the build UI needs to handle switching between hulls. *Owner: Design Lead. Resolve by: VS scope review.*
4. **Can enemy NPCs use the full build system, or are they hand-authored loadouts?** Full-sim is consistent but expensive to balance. *Owner: Systems Designer. Resolve by: M3.*

---

## 11. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Hybrid grid-sim model locked. 8 hulls, ~40 modules, power budget, heat, subsystem targeting, cosmetic layer, scope levers. |

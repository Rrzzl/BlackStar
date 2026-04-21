# System Spec: Combat

**Owner:** Combat Designer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before:** [GDD §4.2](../02-gdd.md)

---

## 1. Goals

1. Combat should be **readable** at all times. The player always knows what's threatening them and how to respond.
2. Combat should be **skill-based** at the core. A good player with a starter loadout beats a bad player with a legendary one.
3. Combat should **scale** from one-on-one twin-stick duels to fleet engagements without changing the control metaphor.
4. Combat should have **weight**. Hits feel impactful; deaths feel earned; victories feel real.

---

## 2. Combat modes

### 2.1 On-foot combat (dungeons, stations, boardings)

- **Twin-stick:** WASD move, mouse aim, LMB fire, RMB secondary, space dodge, E interact, shift sprint, tab inventory, 1–4 utility slots
- Player has: health, shield (optional, regen), stamina (dodge/sprint)
- Damage types: kinetic (bullets), energy (lasers, plasma), fire, cold, shock, corrosive, void (First One-derived)
- Each enemy has resistances and weaknesses; damage types matter but are never strictly required (a kinetic weapon always does at least 25% damage)

### 2.2 Space combat (ships)

- **Twin-stick equivalent:** WASD thrust, mouse aim/face, LMB primary weapon, RMB secondary, space boost, Q shield cycle, E cycle target
- Player ship has: hull, shield (regen), energy (for weapons/boost), heat (for firing, accumulates, forces cooldown)
- Same damage type taxonomy; space enemies have ship-level armor/shields

### 2.3 Shared principles

Both modes follow the same design grammar:
- Enemy attacks are **telegraphed** with at least 200ms windup
- All projectiles are **visible and avoidable** (no hitscan against the player)
- Damage over distance falls off linearly past optimal range
- All hits have **hit stop** (2–3 frame freeze) and **knockback**
- Critical hits do +50% damage, visually distinct

---

## 3. Tactical pause

### Trigger
- Press `Space` (on-foot) or `Q` (in space) to pause
- Only available when the player has at least one ally in the scene
- Disabled in certain encounters (boss solo phases, stealth sections)

### Pause UI
- World freezes; slight desaturation to signal pause
- Each ally sprouts a **command ring** in world space
- Click/drag to issue move orders; click enemy to target; press ability hotkey to queue ability
- Multiple orders per ally can be queued (basic, not full RTS waypoints)
- Press `Space`/`Q` again to unpause

### Order types
- **Move** — go to point
- **Attack** — target this entity
- **Hold** — stop moving, engage whoever's in range
- **Follow** — stay near the captain
- **Retreat** — fall back to a marked safe point
- **Use ability X on Y** — specific ability, specific target
- **Formation (fleet only)** — cluster, spread, wedge, line abreast

### Time cost
- Pause is free by default at Normal difficulty
- At Hard/masochist difficulty, pausing costs a resource (command points) that regenerates slowly. Encourages efficient use rather than constant pause.

---

## 4. Damage model

### Damage formula

```
raw_damage = weapon_base * (1 + bonuses) * crit_multiplier
type_modifier = 1 + (resist_table[damage_type] for target)  // can be negative for weakness
mitigation = (1 - armor_reduction) * (1 - shield_absorption_if_shielded)
final_damage = max(raw_damage * type_modifier * mitigation, raw_damage * 0.25)
```

The `max(..., raw_damage * 0.25)` floor ensures no build is worthless — even a kinetic weapon vs. kinetic-resistant target does ~25% damage. This prevents rock-paper-scissors deadlocks and respects Pillar 5 (respect time).

### Health tiers

Enemies come in health tiers:
- **Chaff** — dies in 1–2 hits from a starter weapon (most enemies)
- **Standard** — dies in 3–6 hits
- **Elite** — dies in 10–15 hits, has a visible marker
- **Boss** — custom health, multi-phase, tuned individually

Player starts with 100 HP; a chaff enemy does ~10 damage per hit, standard does ~20, elite does ~40. Death is always possible from a single engagement with multiple standard enemies if the player is careless.

---

## 5. Weapons

### Weapon archetypes (on-foot)

| Archetype | Feel | Example |
|---|---|---|
| **Pistol** | Fast-firing, accurate, low damage | Starter sidearm |
| **Rifle** | Versatile, medium range/damage/rate | Iron Concord Standard |
| **Shotgun** | Close-range, spread, high burst damage | Scrapper |
| **SMG** | Very fast fire, low damage, hip-fire spray | Scatter-9 |
| **Sniper** | Slow, high damage, long range, charge-up | Longshot |
| **Heavy** | Rocket/grenade/plasma, AoE, slow | Ramhead |
| **Melee** | Twin blades, stun baton, vibro-axe | Many variants |
| **Experimental** | First One-derived, unique effects | Nullbeam, phase blade |

### Weapon archetypes (ship)

| Archetype | Feel |
|---|---|
| **Autocannon** | Fast fire, kinetic, medium damage |
| **Laser** | Instant hit, heat-limited, precise |
| **Missile** | Homing, heavy damage, limited ammo |
| **Plasma** | Slow projectile, high damage, area effect |
| **Mine** | Drop-and-forget area denial |
| **Beam** | Continuous damage, heat-intensive |

### Weapon stats

Every weapon has: `damage`, `rate`, `range`, `spread`, `reload`, `mag`, `type`, `special` (e.g., "pierces shields," "knocks back," "sets on fire"). See `docs/design/systems/weapons/` for full lists.

### Mods

Weapons have 2–4 mod slots. Mods add or alter effects: `+damage`, `+rate`, `+crit chance`, `+X type damage`, `adds ricochet`, `adds slow`, `chains to nearby enemy`, etc. Rare and legendary weapons have unique mod-slot constraints.

---

## 6. Enemy design

### Threat vocabulary

Every enemy has a **threat pattern** the player learns to recognize:

- **Rusher** — closes distance, melee attack. Telegraph: anticipation crouch.
- **Shooter** — stays at range, shoots. Telegraph: weapon charge glow.
- **Sniper** — very long range, high damage, slow. Telegraph: laser sight.
- **Bomber** — charges in, self-destructs. Telegraph: beeping, flashing.
- **Tank** — slow, high HP, hard to flank. Telegraph: heavy footsteps, shield up.
- **Flyer** — flies over cover. Telegraph: buzz, shadow on ground.
- **Caster** — ranged AoE abilities. Telegraph: channeling stance, glowing hands.
- **Swarmer** — small, many, low HP. Telegraph: skittering sounds.
- **Elite** — buffed standard enemy with a unique ability. Visually marked.

No enemy has more than **one** primary threat pattern. Compound threats (flying shooter with AoE) are elites only.

### Enemy AI levels

- **Scripted** — follows a fixed behavior tree (most enemies)
- **Reactive** — picks behaviors based on context (elites)
- **Squad** — coordinates with nearby allies (Iron Concord units)
- **Boss** — hand-authored state machine with multiple phases

See `ai-behavior.md` for the full AI spec.

### Telegraphing rules

- Melee windups: 200–400ms
- Ranged attacks: visible projectile OR 150–300ms charge-up
- AoE attacks: floor marker for ≥500ms before damage lands
- Bosses: every ability is telegraphed with both animation AND UI warning

---

## 7. Player abilities

### Universal abilities
- **Dodge roll** (on-foot): 12 frames of i-frames, 0.5s cooldown, costs 1 stamina
- **Boost** (space): brief acceleration burst, drains energy
- **Interact** (E): pick up loot, open door, talk to NPC

### Class abilities

Each class gets 1 passive + 3 active abilities that define its identity. Abilities unlock as the class levels up.

Example — **Gunslinger:**
- *Passive:* +20% small-arms damage, +1 dodge charge
- *Active 1 (lvl 1):* **Quickdraw** — instant reload, next shot crits
- *Active 2 (lvl 5):* **Ricochet Shot** — next shot bounces between enemies
- *Active 3 (lvl 10):* **Last Stand** — regain HP for each kill for 6 seconds

See `progression.md` for full class ability lists.

---

## 8. Ship combat specifics

### Movement
- Newtonian-lite: ships have thrust and inertia, but dampeners limit top speed and auto-brake over time
- Rotation is direct (ship faces mouse cursor)
- Strafe is weaker than forward thrust — forces directional fighting
- Boost: brief high-speed dash, costs energy, 2s cooldown

### Energy & heat
- **Energy** powers weapons, shields, boost, abilities. Regens when idle.
- **Heat** accumulates with firing; at 100%, weapons shut down for 3 seconds. Encourages bursting + cooling cycles rather than holding the trigger.

### Shields
- Shields absorb damage first, regen after 4 seconds of not being hit
- Shield directions: many ships have facing shields (front stronger than rear). Tactical maneuvering matters.
- Shield type: kinetic (stops bullets), energy (stops lasers), composite (both, weaker)

### Fleet combat

- Player pilots their lead ship
- Up to 5 AI-piloted allies in formation
- Tactical pause queues orders
- Formation bonuses: wedge gives +10% damage to the lead ship, line abreast gives +10% defense, cluster gives shield regen overlap

---

## 9. Tuning targets

These are the feel targets the design team tunes to. Numbers are tuned against these, not the other way around.

### Time-to-kill (player → enemy)
- Chaff: **0.3–0.5 seconds**
- Standard: **1.5–3 seconds**
- Elite: **5–8 seconds**
- Boss: **60–180 seconds**

### Time-to-kill (enemy → player)
- Player starts at 100 HP with no shield
- **Player must be able to survive a mistake** — no one-shot kills at normal difficulty except clearly telegraphed big hits
- In a typical encounter, player takes damage equal to ~30% of max HP before clearing it

### Combat tempo
- Dungeon: ~1 combat encounter every 30–60 seconds during active exploration
- Space: ~1 hostile contact every 2–5 minutes during traversal

### Pause usage
- Design target: at normal difficulty, skilled players pause ~2 times per dungeon room. Less = too easy to play without pause. More = pause becomes mandatory, which violates Pillar 2 (twin-stick is primary).

---

## 10. Playtesting metrics

Metrics we'll track during playtests to validate the design:

- **Player deaths per hour** (target: 0.5–2 at normal difficulty)
- **Combat encounters per session** (target: 15–40 per hour)
- **Weapon variety** — what fraction of the weapon pool does the average player actually use? (target: > 40% in a 20-hour run)
- **Pause usage** — average pauses per encounter (target: 0.5–2)
- **Ability usage** — are class abilities used? (target: > 60% of players use all three class abilities)

---

## 11. Open questions

1. **Shield mechanics on player (on-foot)** — does the player character have a shield on top of HP? Leaning yes for the sci-fi fantasy. *Decision deferred to VS playtest.*
2. **Ammo economy** — unlimited ammo with reload cycles? Or finite ammo with pickups? *Leaning reload-cycle (no finite ammo management) for twin-stick feel.*
3. **Friendly fire** — does the player damage allies? *Leaning no (too frustrating with companions).*
4. **Pause in multiplayer (future)** — if we add co-op, does pause stop the world for both players? *Defer.*

---

## 12. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Modes, damage model, weapon/enemy vocabulary, abilities, fleet combat, tuning targets. |

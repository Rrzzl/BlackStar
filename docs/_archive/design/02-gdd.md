# Black Star — Game Design Document

**Document owner:** Design Lead
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before this one:** [Concept Document](01-concept.md)

---

## 0. How to read this document

This is the **game design bible**. It describes the full intended game at ship. It does not describe what we build first — that's the [Vertical Slice Spec](../production/04-vertical-slice.md). This doc is the destination; the VS is the proof. Individual system design docs in `docs/design/systems/` expand each section into implementable detail.

When this doc contradicts an individual system spec, **this doc wins** unless the system spec has an explicit "supersedes GDD §X" note and a design-lead sign-off.

---

## 1. Vision & pillars (reference)

Reproduced verbatim from the concept for convenience. The authoritative copy lives in `01-concept.md`.

1. **Every run matters** — persistent consequences
2. **One seamless fantasy** — space, foot, empire all live in the same world
3. **Gritty, dark, heroic** — Firefly × Mass Effect × 40K-lite
4. **Systems that gossip** — no siloed subsystems
5. **Respect the player's time** — depth without demanding it
6. **Sandbox first, story invited** — the galaxy exists with or without the player; the story is waiting for those who look for it, not gating those who don't

---

## 1.1 Sandbox-first commitment

Black Star is a **sandbox** in the Kenshi / Mount & Blade lineage, not a JRPG with a gated main quest. From minute one, every system in the game is available to the player as far as they can afford it. Outposts can be founded in hour 2 if a player finds a claimable planet. Factions can be befriended or attacked at any moment. The main mystery (the Unmaking, the First Ones, the Hollow Fleet) is real and active in the world, but it is **discoverable**, not a required path. A player can complete a full Black Star playthrough by:

- Founding an empire of trade outposts and retiring wealthy
- Rising through one faction's ranks to reshape the political map
- Hunting pirates for bounties and never touching the story
- Becoming a pirate king and never setting foot in a legitimate port
- Pursuing the central mystery to its endgame climax
- Any blend of the above

No path is more valid than another. The story unlocks *more content* for players who engage with it; it does not lock *less content* from players who don't. See [`factions-and-quests.md`](systems/factions-and-quests.md) for the sandbox quest architecture.

---

## 2. The core gameplay loops

Black Star has **three nested loops** the player experiences at different time scales. A well-designed game keeps all three loops tight and each one rewarding enough to pull the player into the next.

### 2.1 Moment-to-moment loop (seconds)

This is the twin-stick combat / flight / movement loop. The player is always doing one of these:

- Flying a ship in space (WASD thrust, mouse aim, LMB fire)
- Walking a character in a ruin (WASD move, mouse aim, LMB fire)
- Reading UI / managing inventory (no time pressure)

**Success criteria:** each mode feels responsive within 16ms of input. Combat reads at a glance: what is the threat, how do I deal with it, what is the reward. No hidden information in core combat encounters.

### 2.2 Session loop (10–60 minutes)

A single "expedition." The player:

1. Plans an expedition from their ship/station (pick a system, pick a planet, pick a ruin, pick a loadout, optionally bring crew)
2. Flies there (space)
3. Lands (on-foot)
4. Explores/fights/loots (dungeon)
5. Returns (space)
6. Cashes in (station — sell, upgrade, repair, rest)
7. Progresses the meta (crew dialogue, empire updates, faction standings, new rumors)

**Success criteria:** the loop is *satisfying at 10 minutes* (quick raid on a shallow ruin) *and epic at 60 minutes* (deep dive, multiple space encounters, high-tension return trip). The player should be able to walk away after any Step 7 and feel a session ended cleanly.

### 2.3 Meta loop (hours → weeks)

The empire/progression arc. The player:

1. Accumulates credits, items, lore, faction standings
2. Recruits crew (each with loyalty missions, dialogue, skills)
3. Upgrades ship and unlocks new ships
4. Claims first outpost → builds trade routes → claims more
5. Engages faction politics (alliances, wars, betrayals)
6. Uncovers the mystery of the Old Empire's fall (main narrative arc)
7. Reaches one of several endings (see §10)

**Success criteria:** every session advances the meta loop in some visible way. No session should feel like "pure grinding" — even a failed dungeon yields lore, rumors, relationship fallout, or faction intel.

---

## 3. Player fantasy

The player is a **voidrunner captain**: competent but not mythic, dangerous but not a demigod, ambitious but not yet a king. The fantasy escalates — but not along a single track. Different players pursue different dreams, and the game is designed so each is a complete arc:

**The Builder's arc (outpost / trade focus):**

| Hour | State |
|---|---|
| 1 | "I have a battered ship and a loadout. I hope I survive the next ruin." |
| 5 | "I landed on Tessra-3 and found an open spot. I think I'm going to claim it." |
| 20 | "My first outpost runs three trade routes. I know every shopkeeper on Grayline by name." |
| 60 | "Four outposts, a trade network, and the Free Worlds owe me." |
| 100+ | "I have an empire. People write songs about my ports." |

**The Wanderer's arc (pure roguelike / exploration focus):**

| Hour | State |
|---|---|
| 1 | "I have a battered ship. I hope I survive the next ruin." |
| 10 | "I've cleared eight ruins. My loadout is getting dangerous." |
| 30 | "I've been to every biome. My ship is a walking arsenal. I own nothing but my story." |
| 60 | "I have legendary items that no one else knows exist." |

**The Faction's arc (story / political focus):**

| Hour | State |
|---|---|
| 1 | "I have a battered ship and a dream." |
| 10 | "The Iron Concord captain remembers my face. I have a favor banked." |
| 30 | "I am a known operator in Concord space. Free Worlds sees me as an enemy." |
| 80+ | "I'm reforming the Concord from within. This galaxy will know my decisions." |

Each arc is a legitimate way to play. A player who stops at hour 15 should feel they had a full experience *for whichever arc they were pursuing*.

---

## 4. Mechanics overview

### 4.1 Movement

**Space mode:**
- Newtonian-ish inertia with dampeners (arcade-leaning, not Elite Dangerous simulation)
- WASD thrust (forward/reverse/strafe), mouse orientation
- Boost on shift (uses energy)
- Scaled camera that zooms out at speed

**On-foot mode:**
- Twin-stick: WASD move, mouse aim/face
- Dodge roll on space (i-frames, small stamina cost)
- Sprint on shift (stamina)
- Interaction prompt on E

**Parity:** the *feel* of both modes should share a family resemblance. Same aim-reticle conventions, same enemy highlighting, same damage-number style.

### 4.2 Combat

**Twin-stick action is the default.** Every combat encounter can be resolved as a skill-based twin-stick fight.

**Tactical pause** activates when the player has allies — dungeon party or space fleet. Pressing `Space` (or `Q`) freezes time and opens a command ring around each ally. The player can:

- Issue move orders (click destination)
- Issue target orders (click enemy)
- Issue ability orders (select ability → select target)
- Issue formation orders (fleet mode: cluster, spread, wedge, etc.)

Unpausing resumes action with orders queued. This is Mass Effect–style, not RTS — you directly control the captain at all times, allies follow your orders.

See `docs/design/systems/combat.md` for the full combat design.

### 4.3 Exploration

**Space exploration:**
- Hand-authored star systems at launch (~50); procedural backfill in post-launch if scope allows
- Systems contain: planets (landable), stations (dockable), anomalies (scan-able), asteroid fields, jump points to neighbors
- Sensors reveal nearby objects; long-range scans reveal distant anomalies
- Exploration rewards: lore fragments, rumors, cached supplies, ruined ships to salvage

**On-foot exploration:**
- Each ruin is a procedurally generated dungeon with a biome (alien ruin, crashed ship, feral colony, underground hive, etc.)
- 5–20 rooms per ruin depending on depth/difficulty tier
- Room types: combat, loot, trap, shrine/encounter, boss, elite, treasure
- Line-of-sight driven — rooms reveal as you enter them
- Minimap in HUD; full map on Tab

See `docs/design/systems/procgen-dungeons.md` and `docs/design/systems/procgen-galaxy.md`.

### 4.4 Inventory & loot

- **Grid-based inventory** (ship cargo hold) with weight/volume budgets
- **Personal loadout:** primary weapon, secondary weapon, sidearm, 3 utility items, suit mods
- **Loot tiers:** Common (white), Uncommon (green), Rare (blue), Legendary (purple), **Black Star (orange — unique named artifacts with game-changing effects)**
- Legendary+ items carry lore fragments; collecting them fills the Codex
- Stacking items combine on pickup; unique items always take a slot
- Cargo can be sold to stations, used as trade goods, or stashed at your home station

### 4.5 Character creation: species and classes

Players create a captain by choosing a **species** (narrative + cosmetic + small stat bias) and a **class** (starting loadout + ship + abilities). Species and class are orthogonal — any species can be any class.

#### Species (4 at launch)

See narrative bible §2.5 for the full cultural and historical context. Mechanical summary:

| Species | Bias | Passive |
|---|---|---|
| **Human** | Balanced | +1 to all skills at creation |
| **Drellan** (tall, silver-skinned Concordance-era subspecies) | Long-lived, proud | +10% XP gain, -5% rep recovery with enemies |
| **Ksar** (short, plating-skinned, nomadic) | Sturdy | +15 HP, -5% move speed |
| **Vex** (alien, four-armed, First One–era survivors) | Uncanny | +10% ability cooldown reduction, locked out of Verdant Church questline |

Species do not restrict playstyle; they flavor it. A Vex shopkeeper gets treated differently by Verdant NPCs than a Human shopkeeper. A Ksar in a brawl takes hits better than a Drellan. Species-specific dialogue lines exist in every major conversation.

Post-launch expansion may add more playable species and NPC-only species (the Menagerie's collected aliens, the Drift's ship-born humans, etc.).

#### Classes

Five starting classes, each defining a playstyle via starting ship, starting loadout, and passive bonuses. Classes are **not** straitjackets — any class can learn any skill over time — but they define the first 10 hours.

| Class | Core fantasy | Starting bonus | Starting ship |
|---|---|---|---|
| **Gunslinger** | Twin-stick ace, run-and-gun dungeon diver | +20% small-arms damage, +1 dodge charge | *Shrike* — fast light fighter |
| **Tactician** | Fleet commander, loves tactical pause | Pause time slowed 30%, +1 starting crew slot | *Kestrel* — balanced corvette with command module |
| **Voidsmith** | Tech/engineer, loves salvage and crafting | +50% salvage yield, can repair mid-combat | *Grinder* — heavy utility ship with tractor beam |
| **Mercer** | Trader, negotiator, economy-maximizer | +20% sell prices, market intel | *Albatross* — light freighter with large cargo hold |
| **Exile** | High-risk high-reward, ruin specialist | Starts with one legendary item, no home station | *The Last Hand* — unique starter ship, irreplaceable |

Class-specific content: loyalty mission for their starting companion, unique dialogue options, unique questline.

See `docs/design/systems/progression.md`.

### 4.6 Progression

- **Captain skill tree** — three branches: *Flesh* (health, stamina, melee), *Steel* (weapons, combat abilities, tactics), *Spark* (tech, hacking, crafting, scanning)
- Skill points earned by leveling (XP from kills, quest completions, discovery)
- Soft level cap at 30, diminishing returns past that
- **Ship tree** — per-ship upgrade slots (weapons, shields, engines, utility modules, cargo)
- **Crew skills** — each companion has their own skill tree and leveling curve
- **Faction reputation** — separate meter per faction, affects prices, missions, dialogue, hostility

### 4.7 Companions & party

- **Recruitment:** companions are hand-authored NPCs found in taverns, rescued from ruins, or unlocked via questlines. Soft cap: ~12 named companions at ship. Each has a personality, backstory, loyalty arc, and optional romance/friendship track.
- **Party composition:** up to 3 companions can accompany the captain into a dungeon. Remaining companions can be assigned to ships in the fleet or to empire duties (trade routes, outpost defense, research).
- **Companion death:** if a companion dies in a dungeon run, they are **gone forever**. The body can be recovered if the captain survives and returns, but the character slot is permanently lost.
- **Loyalty:** high-loyalty companions unlock abilities, lower prices for services, and may save the captain once per run (negating a would-be death).

See `docs/design/systems/companion-and-fleet.md`.

### 4.8 Fleet management & ship building

**Ship building is one of Black Star's pillar systems.** Each ship has a **fixed hull** (chosen from 8 launch hulls across 4 tiers, from shuttle to cruiser) and a **grid of slots** into which the player places **modules** (weapons, shields, engine, reactor, cargo, crew, sensors, utility). Every module has a power draw; the reactor sets the budget; the player manages power routing and heat to stay operational. Adjacency bonuses reward thoughtful packing. Cosmetic paint, decals, running lights, and a player-chosen nameplate make the ship *theirs*.

This is a **hybrid grid-sim** — not full Cosmoteer free-form hull design, not a shallow ME loadout. The reference is FTL's placement satisfaction plus Cosmoteer's power routing at a controllable scope. See [`ship-building.md`](systems/ship-building.md) for the full spec.

**Fleet scale:**
- Own multiple ships simultaneously (soft cap ~6 active, more stored at shipyards)
- In space combat with a fleet: the captain pilots the lead ship, AI pilots the rest, tactical pause issues orders
- Out of combat: ships can be assigned to trade routes, outpost defense, patrol duty, or stored
- Each ship has a persistent module loadout and crew assignment

### 4.9 Trade & the living economy

Black Star's economy is a **real-time simulation**, not a table of static prices. Every NPC trader physically flies between stations carrying real cargo. Every station has production and consumption rates that tick in game time. Prices emerge from stockpile levels, not from a refresh timer. Player ships and NPC ships participate in the same simulation — a player who pirates a freighter is performing the same operation any NPC pirate is, and the economy reacts the same way.

Key properties:

- **Conservation of goods.** Every unit of cargo is somewhere specific: in a hold, in a stockpile, in a drifting pod. Goods do not spawn from the ether.
- **Prices are local.** Same good, different stations, different prices. Route profit is the fuel of trade.
- **NPC traders hunt profit.** They run a decision loop that reroutes on price spikes — trade monopolies decay over time unless defended.
- **Piracy, blockade, and tariff** are mechanical levers, not flavor text. A blockaded station's prices will crater or spike; the player sees it in real time.
- **Player trade routes** assign owned ships to run automated routes between player outposts, generating passive income and attracting pirate attention.

The full simulation mechanics live in [`living-economy.md`](systems/living-economy.md). The high-level economic design (goods tiers, balance targets, profit margins) lives in [`economy-and-trade.md`](systems/economy-and-trade.md).

### 4.10 Outposts & empire

**Outposts are available from hour 2.** The moment a player finds a claimable landing zone and scrapes together the founding cost, they can plant a flag. There is no Act gate, no story lock, no level requirement. Most players will not found their first outpost until hour 5–15, but that is a pacing choice, not a restriction.

An **outpost** is a strategic hub on a planet: menu-driven operation slots (shipyard, market, trade office, diplomatic wing, real estate, research, defense, infirmary, broadcast tower, pit/arena) that the player invests in. Operations generate passive yields while the player is away and unlock active operations when they visit. This is not a colony sim — the reference is Suikoden's castle or Mount & Blade's fief, not RimWorld.

Empire-level scale emerges from **multiple outposts on multiple planets**:

- **Trade routes** between owned outposts generate passive income (see [`living-economy.md`](systems/living-economy.md))
- **Diplomatic wings** let the player mediate faction deals and shift the political map
- **Defensive assets** protect against raids and faction annexation
- **Eventually**, at high reputation and multiple outposts, **declaring independence** creates the player's own faction with flag, missions, and diplomacy

Outposts can be **lost** — neglect, faction annexation, or successful raids can trigger reconquest events. This is the non-dungeon permadeath layer.

See [`outposts.md`](systems/outposts.md) for the full outpost spec and [`empire-and-colonization.md`](systems/empire-and-colonization.md) for the broader empire/faction politics layer.

### 4.11 Permadeath system (tiered)

Following the concept decision:

- **On-foot death in a dungeon:** expedition is lost. Captain respawns at last station with:
  - All items/cargo brought on the expedition → **lost**
  - Companions who died on the expedition → **permanently dead**
  - Companions who survived (were in orbit/station) → **safe**
  - Captain XP/skill progress → **kept**
  - Faction reputation gains from the expedition → **kept** (already committed)
  - Ship → **safe** (was in orbit)
- **In-space death (ship destroyed):** captain ejects in escape pod. Ship and cargo lost. Crew on the lost ship → 50% survival roll each. Captain respawns at nearest friendly station.
- **In-space death without escape pod** (advanced ships may disable this): captain dies. **Game over**, run ends. Player starts a new captain with reduced meta progression (some unlocks carry, most don't). **Optional permadeath mode** for hardcore players.
- **Empire:** persistent. Outposts, trade routes, relationships all survive all deaths short of total game-over.

See `docs/design/systems/save-and-persistence.md`.

---

## 5. Content scope (at ship)

These are the **launch content targets**. Vertical slice and alpha numbers are in the production roadmap.

| Content type | Launch target |
|---|---|
| Star systems | 50 hand-authored + procedural backfill for ~150 |
| Planets | ~200 landable |
| Ruin biomes | 8 (alien, crashed-ship, feral-colony, hive, necropolis, void-temple, lab, ice-cavern) |
| Classes | 5 |
| Companions | 12 named (each with full arc) |
| Ships | 20 unique (across 5 size classes: scout, fighter, corvette, freighter, capital) |
| Weapons | ~60 base (with tiered variants) |
| Enemies | ~40 base types (with faction skins → ~150 visual variants) |
| Factions | 6 major + 10 minor |
| Main story missions | 30 |
| Side quests | 80+ |
| Legendary items | 50 |
| Black Star artifacts | 12 (unique named game-changers, one per "ending path") |

---

## 6. World structure

```
Galaxy
  └─ Sectors (5–8 regions, each with political character)
       └─ Star Systems (hand-authored + procedural)
            └─ Planets (landable destinations)
                 └─ Locations (ruins, colonies, stations on the ground)
                      └─ Dungeons (procedural instances)
```

- **Galaxy** is static — the same galaxy every save, so lore, landmarks, and missions are consistent.
- **Sectors** have political character: Core Worlds (ex-empire, civilized, expensive), Frontier (contested, lawless), Deep Black (unexplored, dangerous, rewarding).
- **Systems** are mostly static but with dynamic elements: wandering fleets, shifting faction borders, random events.
- **Dungeons** are procedural — even a "known" ruin rerolls its layout between expeditions (with narrative explanation: the ruin shifts, tectonic activity, active defenders rearranging).

See `docs/design/systems/procgen-galaxy.md`.

---

## 7. UI/UX flow

### Main menu
- New Game (choose class) | Continue | Settings | Codex | Credits | Quit

### In-game HUD (on-foot)
- Top-left: health bar, stamina bar, shield bar (if equipped)
- Top-right: minimap, compass, objective marker
- Bottom-left: active weapon, ammo, reload indicator
- Bottom-right: active utility items, cooldowns
- Center (contextual): enemy health bars on damage, interaction prompts

### In-game HUD (space)
- Top-left: ship health, shield, energy
- Top-right: system map, jump readiness, threat warnings
- Bottom-left: ship weapons, heat
- Bottom-center: throttle, boost charge
- Right side (when fleet): ally ship panel with health/status

### Menus (Esc)
- Inventory | Character | Ship | Fleet | Map | Empire | Codex | Journal | Settings

### Shop / station UI
- Split view: player inventory (left) | station stock (right)
- Drag-and-drop to trade, right-click for info
- Prices shown in player's currency; margin indicator (green/red) shows whether this is a good buy/sell based on market intel

### Empire UI
- Map view of owned outposts
- Per-outpost dashboard (production, threats, assigned crew, queued upgrades)
- Trade route overlay
- Faction diplomacy screen

---

## 8. Difficulty & accessibility

### Difficulty tiers
- **Voidrunner** (easy) — more forgiving, slower enemies, richer loot, permadeath optional
- **Captain** (normal) — the intended experience
- **Void** (hard) — tighter economy, smarter enemies, no safety nets
- **Dead Stars** (masochist) — single save, true permadeath, one life total

### Accessibility
- Full key remapping
- Colorblind modes (three palettes)
- UI scaling 80%–150%
- Text-to-speech optional for dialogue
- Slow-mode toggle (global time scale 0.5x) for motor-impairment accommodation
- Screen shake and flash can be disabled individually
- Subtitles with speaker labels, adjustable size/background

---

## 9. Monetization

**Premium, one-time purchase.** No microtransactions, no loot boxes, no battle pass, no season pass. Post-launch expansions may be paid DLC if scope justifies it; cosmetic DLC is acceptable only if gameplay-neutral. This is an enforced design constraint, not a marketing suggestion.

---

## 10. Endings

Black Star has **multiple endings**. Unlike a linear JRPG, there is **no single "main ending" the player is pushed toward**. Endings are reached by playing a faction's through-line questline to completion, or by reaching certain sandbox state milestones (owning enough outposts, reaching hero-tier rep with a faction, etc.), or by discovering enough of the central mystery.

### Ending paths

1. **Restorer** — complete the Iron Concord through-line; the Concordance rises again under their banner.
2. **Free World** — complete the Free Worlds Congress through-line; a new parliamentary order emerges.
3. **Warlord** — found enough outposts and reach hero rep to **declare independence**; the player forms their own faction and ends the game as its sovereign.
4. **Wanderer** — reach 100 hours of play without taking a faction to hero tier and without founding more than two outposts; the Wanderer credits roll with a retrospective of your deeds.
5. **Keeper** — complete the Verdant Church through-line AND collect ≥15 mystery revelations; seal the First One sites forever.
6. **Destroyer** (secret) — complete the Hollow Fleet through-line; wake the First Ones yourself.
7. **Homesteader** — complete the Homesteaders through-line; a new, decent civilization is founded.

**No ending is forced.** A player who ignores every questline and just hunts pirates will eventually reach a natural **"retirement" state** with their own partial credits roll, reflecting the arc they actually lived. This is the Mount & Blade approach — the game always has an ending, but the ending fits the player.

### Gating

Endings are unlocked by:
- Faction through-line completion
- Outpost count and independence declaration
- Mystery revelation collection (≥15 for Keeper/Destroyer paths)
- Specific companion loyalty states
- Time played (Wanderer-style retirement)

A single playthrough can reach one ending. New Game+ carries selected unlocks (ships, modules, mystery revelations already known) to encourage seeing other endings. Full completion requires multiple playthroughs.

---

## 11. Cut features (for the record)

Features considered during concept and deliberately cut. Documented so we don't re-litigate them.

- **VR support** — scope killer
- **Multiplayer / co-op** — would rewrite every system; post-launch consideration only
- **First-person mode** — breaks the top-down art direction
- **Real-time-only combat (no pause)** — cuts the fleet-command fantasy
- **Turn-based combat** — cuts the twin-stick fantasy
- **Procedural galaxy at launch** — we want hand-authored systems to feel lived-in; procgen backfill is a stretch goal
- **Deep colony sim** (à la Rimworld) — we are action-first; outposts are lightweight
- **Romance "harem" mechanics** — we do romance like Mass Effect: limited, meaningful, exclusive
- **Pay-to-win MTX** — not negotiable

---

## 12. Open design questions

These are unresolved and must be closed before their respective systems ship. Each has an owner and a decision-by date.

1. **Jump travel model** — instant (click system, load)? Or piloted (fly to jump point, load screen, appear at destination)? → *Owner: design lead. Resolve by: pre-Alpha 1.*
2. **Crew permadeath severity** — does a dead companion's gear return, or is it lost with them? → *Owner: design lead. Resolve by: pre-VS complete.*
3. **Empire revolt system** — if a player neglects an outpost, does it rebel? Or just decay? → *Owner: design lead. Resolve by: pre-Alpha 2.*
4. **Faction war declaration** — player-initiated, AI-initiated, both? → *Owner: design lead. Resolve by: pre-Alpha 2.*
5. **Time passage** — does the galaxy simulate while the player is in a dungeon? → *Owner: design lead + tech lead. Resolve by: pre-Alpha 1.*

---

## 13. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Pillars, loops, mechanics, content scope, endings locked from concept + brainstorming. 5 open design questions documented. |
| 0.2 | 2026-04-12 | Sandbox-first pivot. Added §1.1 sandbox commitment and 6th pillar. Rewrote §3 player fantasy as three parallel arcs (Builder / Wanderer / Faction). §4.5 adds 4 playable species. §4.8 adds ship-building hybrid grid-sim reference. §4.9 reframes economy as real-time simulation. §4.10 removes Act 2 outpost gate — outposts available from hour 2. §10 endings reframed as faction through-lines and sandbox state milestones rather than Act 3 gates. Added 7th ending (Homesteader). New system specs referenced: ship-building.md, outposts.md, living-economy.md, factions-and-quests.md. |

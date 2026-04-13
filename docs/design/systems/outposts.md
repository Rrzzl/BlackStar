# Outposts System

**Document owner:** Systems Designer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before this one:** [GDD §4.10](../02-gdd.md), [Living Economy](living-economy.md), [Factions and Quests](factions-and-quests.md)

---

## 0. Purpose

An **outpost** is the player's home base on a planet. Outposts are **strategic hubs** — not colony sims. The player never places individual buildings or manages villagers; they invest resources into predefined **operation slots** to unlock buildings, trade offices, diplomatic wings, and defensive assets. This doc supersedes the outpost-level portions of `empire-and-colonization.md`. Faction territory, war, and political layer remain in that doc.

The fantasy is: **you landed on a world, claimed a piece of it, and over weeks or months it became a place people go when they hear your callsign.** Outposts are where the player shifts from "lone captain" to "local power," and they are the seed from which the full empire grows.

---

## 1. Design principles

1. **Light but meaningful.** Outposts are menu-driven. A session-long outpost interaction is 3–10 minutes, not 30. RimWorld is not the reference; Suikoden's castle is.
2. **Every slot is a choice with teeth.** Investing in a shipyard means you did not invest in a trade office. Slot scarcity creates identity.
3. **Outposts belong to one planet.** No "my outpost network" screen. Each outpost is a location on a planet with local character, local faction dynamics, and local risk.
4. **Passive yields reward presence.** Outposts generate credits, goods, and rumors while the player is away. But **active operations** (missions, diplomatic plays, trade-route rotations) require the player to *be there.*
5. **Outposts can be lost.** A neglected outpost can be raided, starved, or politically toppled. Loss is permanent unless the player actively reconquers.
6. **No unlock gates from the main story.** A player can found an outpost as early as hour 2, the moment they find a claimable planet and scrape together the entry cost.

---

## 2. Founding an outpost

### 2.1 Requirements

To found an outpost on a planet, the player needs:

1. **A claimable landing zone.** Most planets have 1–3 pre-marked landing zones. Some zones are controlled by factions (must be bought, negotiated, or conquered). Some are open (first come, first served). A handful of elite zones are locked behind quests.
2. **Entry cost.** Typical: 25,000 credits + 200 units of basic materials + 1 companion assigned as Governor *or* 5,000 credits hired-NPC surcharge.
3. **Clearance.** Hostile presence must be reduced (a firefight, a bribe, or a diplomatic deal) before the foundation ritual completes.
4. **Reputation threshold with the planet's dominant faction**, if any. Hostile to the locals? They'll sabotage you. Friendly? Free land grant possible.

The first outpost has a **small subsidy** — founding cost is halved to ease the onboarding bump.

### 2.2 Founding flow

```
Player on planet surface
  → walk to landing zone anchor
  → "Claim this landing zone?" prompt
  → Requirements checklist (✓ credits, ✓ materials, ✓ governor, ✓ no hostiles, ✓ rep)
  → Confirmation → cinematic flag-planting (short) → outpost is live
  → Tutorial popup points to the Outpost Dashboard
```

The first outpost triggers a **tutorialized walkthrough** of the dashboard. Subsequent outposts skip it.

---

## 3. Outpost slots

Every outpost has a fixed **slot budget** based on the planet's quality. Slots are filled with **operations**.

### 3.1 Slot budget

| Planet quality | Example | Total slots | Notes |
|---|---|---|---|
| **Frontier** | Rocky ice ball | 4 | Cheap to claim, limited growth |
| **Standard** | Temperate habitable | 6 | The default |
| **Rich** | Resource-rich or politically strategic | 8 | Typically contested |
| **Prime** | Core worlds or First One sites | 10 | Quest-locked or endgame |

More slots cost more to defend and attract more attention. Frontier outposts are the safest.

### 3.2 Operation types

The player fills slots from a menu of operation types. Each operation has: **cost to install**, **passive yield**, **active operations unlocked**, **upgrade tiers**.

| Operation | Cost | Passive yield | Active operations | Upgrades (3 tiers) |
|---|---|---|---|---|
| **Shipyard** | 50k + 300 steel | Repair / refuel station; ~2k cr/day in services | Sell ships, construct ship parts, store hulls | Tier I → repair; Tier II → sell T1–T2 ships; Tier III → sell T3 ships |
| **Market** | 40k + 200 goods | Local market; ~3k cr/day from trade taxes | Buy/sell goods at local prices; set export tariffs | Tier I → 10 goods; Tier II → 25 goods; Tier III → rare goods |
| **Trade Office** | 35k + 100 goods | +5% to all owned trade routes using this planet | Assign ships to trade routes; manage tariffs | Tier I → 2 routes; Tier II → 5; Tier III → 10 |
| **Diplomatic Wing** | 30k | +1 faction standing per week with visiting factions | Host negotiations; sign treaties; broker peace | Tier I → 1 standing/wk; Tier II → 2; Tier III → 4 |
| **Real Estate** | 25k | Passive rent income ~1.5k cr/day | Rent/sell property to NPCs for rep; host events | Tier I → 5 units; Tier II → 15; Tier III → 50 |
| **Research Lab** | 60k + exotics | Generates research points | Unlock module blueprints, faction intel, First One lore | Tier I → basic; Tier II → advanced; Tier III → exotic |
| **Defense** | 45k + steel | Passive: reduces raid severity | Station turrets, garrison crew, patrol ship assignment | Tier I → turrets; Tier II → garrison; Tier III → patrol flight |
| **Infirmary** | 30k | Slowly heals wounded companions kept in residence | Revives knocked-down crew faster; cures status effects | Tier I → basic; Tier II → surgery; Tier III → void-grade |
| **Broadcast Tower** | 40k | +1 reputation per week with all factions you are not hostile toward | Plant rumors, influence markets, track wanted players | Tier I → local; Tier II → system; Tier III → sector-wide |
| **Pit / Arena** | 50k | Passive entertainment income | Host pit fights, recruit fighters, take Scrapfather side-jobs | Tier I → arena; Tier II → grand arena; Tier III → legendary |

A slot is **one operation at one tier**. Upgrading an operation consumes the same slot; it does not take a new slot.

### 3.3 Build-order examples

- **Trader build** (6 slots, Standard planet): Market III, Trade Office II, Shipyard I, Diplomatic Wing I, Real Estate I, Defense I. Goal: maximize passive trade income.
- **Warlord build**: Shipyard III, Defense III, Pit II, Broadcast Tower I, Infirmary I, Market I. Goal: project force from this hub.
- **Diplomat build**: Diplomatic Wing III, Broadcast Tower II, Market II, Real Estate II, Research Lab I, Defense I. Goal: faction power without ships.

There is no single "correct" build. Each hub has a flavor based on what the player invests in.

---

## 4. Passive yields and the away-from-outpost loop

Every real-world day the player is active (game calculates at scene transitions), outposts generate yields:

```python
for outpost in player.outposts:
    for slot in outpost.slots:
        yield = slot.passive_yield * slot.tier * outpost.prosperity_multiplier
        player.pending_yields.add(yield)

    if outpost.unattended_days > 14:
        trigger_neglect_event(outpost)
```

**Prosperity multiplier** depends on: local faction rep, connected trade routes, recent events, and whether the governor companion's loyalty is high.

**Unattended neglect** at 14+ days starts rolling random events: small raid, faction crisis, trade disruption. At 30+ days, severe events can begin — revolt, faction annexation, asset loss. A player can leave an outpost for a month if they trust their governor and defenses. Longer than that is risky.

**Yield collection:** yields are held in a pending queue. The player collects them on their next visit to the outpost or via a **Courier Ship** mechanic (T2+ outposts) that auto-ships yields to the player's current station for a 10% courier fee.

---

## 5. Active operations

Active operations are the reason to *visit* an outpost. Each operation type unlocks distinct verbs at the dashboard:

- **Mission board:** outpost-specific side quests generated by the faction-and-quest system. These use the outpost as a starting point.
- **Trade routes:** assign owned cargo ships to routes between two or more outposts. Routes require upkeep; returns scale with route length and goods diversity.
- **Diplomacy:** host a faction representative, choose a deal (treaty, alliance, ceasefire, trade agreement). Success shifts faction standing globally.
- **Construction queue:** upgrade operations in sequence. Takes in-game days, during which the slot is reduced capacity.
- **Crew management:** assign companions to outpost duties (governor, quartermaster, engineer, ambassador). Each role has passive bonuses. Assigned companions are **not available** on dungeon runs while on duty.

---

## 6. Defense and loss

### 6.1 Attack model

Any outpost can be attacked. The attack model runs a simple simulation:

```
AttackPower = sum(attacker.forces.strength) * faction.AggressionMod
Defense     = sum(outpost.defense_value) + governor.bonus + (garrisoned_ships * 5)

if AttackPower > Defense * 1.5:
    outpost_falls()
elif AttackPower > Defense:
    outpost_damaged(severe)
elif AttackPower > Defense * 0.5:
    outpost_damaged(minor)
else:
    attack_repelled()
```

**Outpost falls** triggers a **reconquest quest**: the player has a limited window (typically 7 in-game days) to retake the outpost before it is lost permanently. The reconquest is a hand-directed event — a space battle, a surface skirmish, a diplomatic play, or all three.

### 6.2 Player-attended defense

If the player is at the outpost when an attack triggers, the attack becomes a **playable scenario**. The player fights through a scripted + procedural defense event (space battle + ground action). Success preserves the outpost fully. Failure still triggers reconquest but starts the clock earlier.

### 6.3 Permanent loss

If the reconquest window expires or the reconquest attempt fails, the outpost is **lost permanently**. All installed operations and their cost are gone. Any unique items stored there drop as reclaimable wreckage but can be stolen by the conquering faction.

This is the **non-dungeon permadeath layer** — the outpost persistence has stakes.

---

## 7. Outpost dashboard UI

### 7.1 Layout

```
+---------------------------------------------------------------+
|   TESSRA-3 OUTPOST            Prosperity: 82%        [X]      |
|---------------------------------------------------------------|
|   [Slot 1 - Market II]     [Slot 2 - Shipyard I]             |
|   Income: +2,400/day       Income: +900/day                   |
|   [ Manage ] [ Upgrade ]   [ Manage ] [ Upgrade ]            |
|                                                               |
|   [Slot 3 - Defense II]    [Slot 4 - Diplomat I]             |
|   ...                      ...                                |
|                                                               |
|   [Slot 5 - empty]         [Slot 6 - empty]                  |
|   [+ Install operation]    [+ Install operation]             |
|---------------------------------------------------------------|
|   Governor: Iona "Runt" Meska (Loyalty 4/5)                  |
|   Pending yields: 18,400 cr / 45 goods  [ Collect ]          |
|   Active events: 1 (Pirate raid warning, 3 days)             |
|   Trade routes: 2 active   [ Manage routes ]                 |
|---------------------------------------------------------------|
|   [ Mission board ] [ Diplomacy ] [ Construction ]           |
+---------------------------------------------------------------+
```

### 7.2 Flow principles

- One screen shows the whole outpost at once. No tab hunting.
- Every button leads to exactly one action or one sub-screen.
- The player can always collect yields in one click.
- Urgent events are highlighted in red at the top.

---

## 8. Integration with other systems

- **Living economy:** outpost Markets are actual nodes in the NPC-trader simulation. Goods flow in and out based on supply/demand. An outpost with a strong market attracts NPC traders.
- **Factions:** every outpost has a **local faction standing** that deviates from global standing. A Scrapfather-aligned player can still run an outpost in Free Worlds space if local standing is high enough. Outposts can host **faction operatives** who run their own agenda in the background.
- **Ship building:** Shipyard slots unlock module and hull sales. A player who invests in a Shipyard III on a Rich planet can eventually sell T3 ships there.
- **Companions:** assigned companions gain or lose loyalty based on how the outpost is run. Neglected outposts demoralize governors; flourishing ones build loyalty fast.
- **Main story:** some First One research progression requires a Research Lab III at a planet near a Lattice ruin. The story *uses* outposts but never requires one.

---

## 9. Scope levers

If outposts threaten the timeline:

1. **Cut operation count from 10 to 6.** Market, Shipyard, Trade Office, Diplomatic Wing, Defense, Real Estate only.
2. **Cut tier system.** One flat tier per operation.
3. **Cut reconquest mechanic.** Lost outposts are simply gone; no retake window.
4. **Cut player-attended defense scenarios.** Attacks resolve in a results screen only.
5. **Cut trade route management.** Outposts still exist; route management returns in post-launch.
6. **Cut the entire outpost system.** Fall back to "you own stations" with passive income only. Last resort; removes an entire pillar.

---

## 10. Open questions

1. **Who controls construction time?** In-game days are fine; real-time is not. Game days pass during space travel and station visits. *Owner: Systems Designer. Resolve by: M3.*
2. **Can outposts be sold back for partial refund, or only abandoned?** Selling adds a "reverse the investment" safety valve. *Owner: Design Lead. Resolve by: VS complete.*
3. **Does an outpost trigger its own faction, or is it always under an umbrella?** Late-game "declare independence" in the GDD implies the player can found their own faction from accumulated outposts. *Owner: Design Lead. Resolve by: Alpha 2.*
4. **Is there a maximum outpost count?** Soft cap via governor availability (need 1 companion per outpost) or hard cap (e.g., 6 total). *Owner: Design Lead. Resolve by: M4.*

---

## 11. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Strategic hub model locked: slot-based, menu-driven, founded from hour 2, passive yields + active operations, reconquest on loss. |

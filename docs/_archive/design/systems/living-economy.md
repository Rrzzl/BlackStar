# Living Economy System

**Document owner:** Systems Designer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before this one:** [Economy & Trade](economy-and-trade.md), [Outposts](outposts.md), [GDD §4.9](../02-gdd.md)

---

## 0. Purpose

The living economy is the simulation layer that makes Black Star's galaxy feel **alive**. Goods do not teleport between stations. Prices do not refresh on a timer. NPC ships physically fly between stations carrying real cargo, and every cargo hold — player, NPC, or pirate — is part of the same simulation. Disrupting a trade flow anywhere in the galaxy shifts prices everywhere connected.

This document specifies the mechanical model. The high-level economic design (trade tiers, prices, profit margins, player strategy) lives in `economy-and-trade.md`. Where the two conflict, this document's mechanical details govern the simulation; `economy-and-trade.md` governs designed outcomes (balance targets, player-facing rules).

The north star is **X4 / Elite Dangerous / Port Royale** — a simulation players can see, participate in, and exploit. The anti-pattern is a fake economy with prices on a timer that players learn to ignore.

---

## 1. Design principles

1. **Conservation of goods.** Every unit of cargo that exists is somewhere specific. It is in a station's stockpile, in a ship's hold, in a cargo pod drifting in space, or in a player outpost. Goods do not spawn from the ether.
2. **Prices emerge, never scripted.** A station's buy/sell prices come from its stockpile level and its production/consumption rates. If pirates choke the ore supply to a shipyard, steel prices rise at that shipyard automatically.
3. **Player ships are first-class participants.** A player flying cargo and a Free Worlds NPC freighter flying cargo are the same kind of entity to the economy simulation.
4. **Scale via LOD.** The simulation runs at full fidelity in the player's current sector and one sector out. Distant sectors abstract to statistical updates. The player never notices the transition.
5. **Exploitation is OK — emergent, not broken.** Finding a broken trade loop should feel like a discovery, not a bug. Bad loops are patched by tuning the sim, not by locking the player out.

---

## 2. Goods

### 2.1 Goods categories

From `economy-and-trade.md`, four categories:

| Category | Example goods | Volume | Perishable | Contraband |
|---|---|---|---|---|
| **Bulk** | Ore, grain, water, scrap | High | No | No |
| **Manufactured** | Components, steel, electronics, meds | Medium | No | No |
| **Rare** | Exotic materials, luxury goods, alien tech | Low | No | Sometimes |
| **Contraband** | Slaves, nullbloom, stolen art, weapons | Low | Rarely | Yes |

Each **good** is an integer-countable item with:

```
Good {
    id: string                // "ore_iron"
    name: string              // "Iron Ore"
    category: Category
    base_price: int           // reference price, never used in trade directly
    volume_per_unit: float    // cargo slot footprint
    mass_per_unit: float      // ship mass impact
    legal_factions: FactionID[]  // who considers this legal
    production_chains: Chain[]   // what recipes use this
}
```

### 2.2 Production chains

Goods are produced and consumed at **stations**. Example chain:

```
Asteroid Field → (Mining Rig) → Iron Ore
Iron Ore + Coal → (Foundry) → Steel
Steel + Electronics → (Shipyard) → Ship Parts
Ship Parts → (Shipyard) → New Hulls (expensive, rare production)
```

Every station declares: **producers** (what they generate per tick) and **consumers** (what they consume per tick). These are deterministic numbers read from station data, not randomized.

```python
station_tick(station, dt):
    for producer in station.producers:
        station.stockpile[producer.good] += producer.rate * dt

    for consumer in station.consumers:
        if station.stockpile[consumer.input] >= consumer.rate * dt:
            station.stockpile[consumer.input] -= consumer.rate * dt
            station.stockpile[consumer.output] += consumer.yield_rate * dt
```

If inputs are missing, the consumer stalls and downstream goods dry up. This is the economic pressure that creates trade opportunities.

### 2.3 Station stockpiles

Every station has a stockpile dictionary `good_id -> units`. Stockpiles have **soft caps** (where production slows) and **hard caps** (where production stops). Surplus leaves via trade ships. Shortage is priced into the station's buy orders.

---

## 3. Prices

### 3.1 Price formula

A station's buy/sell prices for a good are:

```python
def station_price(station, good):
    stockpile = station.stockpile[good.id]
    capacity = station.capacity[good.id]
    demand_mult = station.demand_multiplier(good)  # production-derived

    # Stockpile ratio: 0.0 = empty, 1.0 = at hard cap
    ratio = stockpile / capacity

    # Base price scales from 2.0x (empty) to 0.4x (full)
    scarcity_mult = clamp(2.0 - 1.6 * ratio, 0.4, 2.0)

    base = good.base_price * scarcity_mult * demand_mult

    # Buy (station buys from player) is base * 0.95
    # Sell (station sells to player) is base * 1.05
    return (base * 0.95, base * 1.05)
```

This is deliberately simple. It is **not** a full supply-demand equilibrium; it is a price feedback loop that reacts to stockpile levels. Players can see the effect: sell 200 units of ore to a station in one go → the price of that good drops at that station.

### 3.2 Regional price variance

Same good, different stations, different prices. This is the fuel of trade:

- A grain-producing colony sells grain at 0.6× base.
- A mining station with no agriculture buys grain at 1.6× base.
- A pirate port with blockaded supply lines might pay 3.0× base.

Routes that move grain from producer to consumer earn profit. Route profit *is* the emergent trade opportunity.

---

## 4. NPC traders

### 4.1 Trader ship model

An **NPC trader** is an entity with:

```
NPCTrader {
    ship: Ship             // full ship config, same as player
    faction: FactionID
    captain: string        // name for flavor
    cargo: CargoHold       // current goods
    credits: int
    home_station: StationID
    current_goal: TradeGoal
    patience: int          // how long to wait before retrying
}

TradeGoal {
    action: "FLY_TO" | "BUY" | "SELL" | "IDLE"
    target_station: StationID
    target_good: GoodID
    target_units: int
    target_price: int
}
```

### 4.2 Decision loop

Each trader runs a simple decision loop, updated every few ticks (not every frame):

```python
def trader_think(trader):
    if trader.current_goal.action != "IDLE":
        return  # still executing current goal

    # Find best single-good round trip within N systems
    best_profit = 0
    best_plan = None

    nearby_stations = stations_within_range(trader, max_systems=3)

    for buy_station in nearby_stations:
        for good in buy_station.stockpile:
            buy_price = buy_station.sell_price(good)
            for sell_station in nearby_stations:
                if sell_station == buy_station: continue
                sell_price = sell_station.buy_price(good)
                max_units = min(
                    trader.ship.cargo_free,
                    buy_station.stockpile[good],
                    trader.credits // buy_price
                )
                profit = max_units * (sell_price - buy_price)
                profit -= travel_cost(trader, buy_station, sell_station)
                if profit > best_profit:
                    best_profit = profit
                    best_plan = (buy_station, sell_station, good, max_units)

    if best_plan and best_profit > 100:
        trader.queue_plan(best_plan)
    else:
        trader.fly_to_home()  # idle at home station
```

**Complexity budget:** this evaluates O(stations² × goods) per trader. For 500 traders and 200 stations, that's too expensive. Mitigations:

- Stations publish **suggested routes** — a short precomputed list of their best buy/sell partners.
- Traders only re-plan every 5–30 seconds.
- Plans run O(stations × nearby_good_list) — maybe 20 stations × 5 goods = 100 checks per trader per re-plan.
- At 500 traders × 100 checks × 0.1Hz re-plan = 5,000 ops/sec, trivial.

### 4.3 Trader archetypes

Different trader archetypes apply different goals:

- **Hauler** — executes preset routes assigned by a faction or player; doesn't think, just flies.
- **Independent trader** — runs the decision loop above, chasing profit.
- **Specialist** — only deals in one good category (e.g., a Bazaar antiquarian only trades rare goods).
- **Opportunist** — looks for price spikes and chases them. More volatile, more interesting.
- **Smuggler** — prefers contraband, avoids patrols.

---

## 5. Combat as economic input

### 5.1 Piracy

Pirates are a force that removes goods from the simulation. A pirate attacks a trader, kills it, loots the cargo, and either:

- Hoards the cargo at a pirate base (contraband market node).
- Sells the cargo at a pirate-friendly port (drives local oversupply, spikes).
- Jettisons low-value cargo (goods are conserved — they drift as pods until decayed or picked up).

**Player piracy** follows the same rules. A player who intercepts a freighter and steals its cargo is performing the same operation as any NPC pirate. The economy reacts the same way.

### 5.2 Destruction (goods lost)

If a ship is destroyed in combat with no survivors and no looter, **the cargo is destroyed**. This is the only sink that removes goods from the closed system permanently. It is important for economic stability that this sink exists — without it, ports would flood and prices would crash over time.

### 5.3 Salvage

Destroyed ships leave **wreckage** — scrap goods generated from the lost hull and modules. Scavenger NPCs and the player can recover scrap. This is the **source** that offsets the combat sink.

---

## 6. Performance budget

### 6.1 Entity counts

Target live simulation per sector the player is in:

| Entity | Budget |
|---|---|
| NPC traders in current system | 30–60 |
| NPC traders in neighboring systems | 20–30 per system |
| Pirates in current system | 10–20 |
| Stations in current system | 2–8 |
| Planets in current system | 3–12 |
| Trade pods / wreckage | 5–15 |

Total live entities in a busy sector: ~200. The Canvas 2D perf target is 500 entities at 60 FPS, so the economy sim fits comfortably inside the budget.

### 6.2 Far-sector abstraction (LOD)

Sectors the player is not in run an abstracted simulation:

- Station stockpiles still tick.
- Traders in distant sectors are **statistical groups**, not individual ships. When the player enters a sector, the sim spawns actual ship entities matching the statistical state.
- Random events (pirate raids, trade disruptions) roll at low frequency.

The **transition** from abstract to concrete is the hardest part — must not produce ships "snapping into existence" in front of the player. Solution: spawn new ships offscreen at the sector edge, have them fly in naturally.

### 6.3 Tick frequency

- **Per-frame:** ship motion, collisions, visuals.
- **Every 0.25s:** trader decision checks, weapon fire.
- **Every 1s:** stockpile ticks, price updates.
- **Every 30s:** trader replanning (ones that need it).
- **Every 5 min (game time):** abstracted far-sector ticks.

---

## 7. Player interaction touchpoints

All the ways a player can plug into the economy:

1. **Buy/sell at stations** (classic trade)
2. **Establish trade routes** (automate hauling between owned outposts)
3. **Piracy** (intercept and loot)
4. **Escort** (protect NPC traders for a payment or reputation boost)
5. **Monopolize** (buy out a station's entire stockpile of a good — a short-term price spike)
6. **Tariff** (outposts with Trade Offices can set taxes on routes through them)
7. **Blockade** (politically or physically prevent access to a station — devastates their local economy)
8. **Disaster response** (factions pay for emergency shipments to stations in crisis)
9. **Smuggling** (illegal goods through patrol zones)
10. **Information arbitrage** (Broadcast Tower scans reveal distant price spikes before competitors)

Each of these is a playable verb. The economy is the substrate; the verbs are the game.

---

## 8. UI: reading the economy

The player needs to *see* the simulation to engage with it.

### 8.1 Station screen

When docked, the player sees a **commodity list**:

```
TESSRA-3 MARKET
-----------------------------------------------------
  Good        Stock   Buy    Sell    Trend (24h)
-----------------------------------------------------
  Iron Ore    ████░   42     48      ↓ -6
  Grain       █░░░░   115    125     ↑ +22
  Steel       ███░░   80     92      → 0
  Meds        ░░░░░   320    410     ↑ +84  (!)
-----------------------------------------------------
```

- **Stock** bar shows stockpile ratio visually.
- **Trend** shows 24-hour price movement.
- **(!)** marks goods in severe shortage or surplus — a hint that a trade opportunity exists.

### 8.2 Galaxy market view

A sector-level overlay the player can toggle on the star map. Each station shows heatmap coloring for a selected good: green if cheap, red if expensive. Makes routes readable at a glance.

### 8.3 Ship cargo readout

The ship HUD shows a small cargo panel: what is onboard, total volume used, estimated value at nearest known station. Always visible.

---

## 9. Scope levers

If the living economy threatens the timeline:

1. **Cap NPC trader count at 15/sector.** Simulation is cheaper, but the galaxy feels quieter.
2. **Abstract all non-current sectors.** Only one sector runs concrete ship entities at a time.
3. **Reduce station count.** Fewer nodes = fewer routes = a simpler economy.
4. **Cut piracy-as-economic-input.** Destroyed ships just disappear; no cargo drop.
5. **Cut trader decision loop.** Traders run scripted paper-routes only. Player can still trade, but NPC behavior is shallow.
6. **Fallback: static prices.** Stations have fixed prices with weekly refreshes. Last resort; the economy becomes flavor, not substrate.

---

## 10. Open questions

1. **Does the player see NPC ship cargo at a glance, or only on inspection?** Inspection is realistic; at-a-glance helps piracy gameplay. *Owner: Design Lead. Resolve by: M3.*
2. **Can NPC ships carry player goods (hire a hauler)?** Adds a gameplay verb, costs a contract system. *Owner: Systems Designer. Resolve by: Alpha 1.*
3. **How are contraband laws enforced at station docking?** Random scans? Faction rep threshold? Both? *Owner: Design Lead. Resolve by: Alpha 1.*
4. **Do trade pods attract other NPCs (scavengers, pirates)?** If yes, elegant emergent behavior; if no, cleaner UX. *Owner: Systems Designer. Resolve by: M4.*

---

## 11. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Conservation-of-goods model, station production chains, NPC trader decision loop, LOD for distant sectors, 10 player interaction verbs. |

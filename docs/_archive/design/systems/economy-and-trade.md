# System Spec: Economy & Trade

**Owner:** Systems Designer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before:** [GDD §4.9](../02-gdd.md)

---

## 1. Goals

1. **Profitable trade is discoverable.** A player who explores finds trade opportunities without a guide.
2. **Economy reacts to the player.** Flooding a market depresses its price; extracting a resource scarcifies it.
3. **NPCs compete.** The economy simulates even when the player isn't looking.
4. **Depth without spreadsheet tedium.** UI surfaces what matters; the sim runs below.

---

## 2. Currency

- **Credits (¢)** — universal currency
- **Rare currencies:** faction scrip (usable only in that faction's markets), Verdant offerings, Scrapfather chits. These are earned through faction play and spend on faction-exclusive items.

---

## 3. Trade goods

### Categories

| Tier | Examples | Weight/volume | Margin profile |
|---|---|---|---|
| **Bulk** | Ore, food, water, fuel | High volume, low price | Thin margins, move in quantity |
| **Manufactured** | Components, medical, weapons | Medium | Moderate margins |
| **Rare** | Artifacts, tech, exotics, nullbloom | Low volume, high price | Fat margins, high risk |
| **Illicit** | Drugs, slaves (!), stolen goods | Variable | Highest margins, legal risk |

**Note on illicit goods:** nullbloom and stolen goods are in; the game does not let the player trade in slaves. This is a scope/taste call and is non-negotiable.

### Per-good schema

```ts
interface TradeGood {
  id: string;
  name: string;
  category: "bulk" | "manufactured" | "rare" | "illicit";
  basePrice: number;       // reference price in neutral markets
  weight: number;          // per unit
  volume: number;          // per unit
  legal: boolean;          // true if legal in most jurisdictions
  producedBy: StationType[]; // station types that produce this
  consumedBy: StationType[]; // station types that consume this
  priceElasticity: number; // how much price moves with stock level
  storyTags?: string[];    // e.g., "Verdant-contraband"
}
```

---

## 4. Station economy

Each station runs a **local supply/demand simulation**:

```ts
interface StationMarket {
  stationId: string;
  stock: Map<GoodId, number>;         // current stock of each good
  production: Map<GoodId, number>;    // units produced per day
  consumption: Map<GoodId, number>;   // units consumed per day
  pricingMods: Map<GoodId, number>;   // -1..+∞, -1 = free, 0 = base, +1 = double
}
```

### Price formula

```
price = basePrice * (1 + elasticity * (targetStock - currentStock) / targetStock) * factionMod * (1 + priceMod)
```

- `targetStock` is what the station *wants* to have
- If currentStock < targetStock (scarce) → price goes up
- If currentStock > targetStock (flooded) → price goes down
- `factionMod` adjusts for faction relationships (ally = 0.9, enemy = 1.3)
- `priceMod` is narrative/event override (embargo, war, etc.)

### Production & consumption tick

Every in-game day (or simulated equivalent):

```ts
for (const station of stations) {
  for (const [good, rate] of station.production) {
    station.stock[good] += rate * daysElapsed;
  }
  for (const [good, rate] of station.consumption) {
    station.stock[good] = max(0, station.stock[good] - rate * daysElapsed);
  }
}
```

Stations can run out of goods they produce (broken machinery, raid, supply shortage) — this creates emergent quest hooks.

### Station types and their economies

| Type | Produces | Consumes |
|---|---|---|
| **Mining colony** | Ore, rare minerals | Food, water, medicine, tools |
| **Agricultural colony** | Food, water, fabrics | Tools, medicine, components |
| **Industrial station** | Components, manufactured goods | Ore, fuel, food |
| **Medical facility** | Medicine, bio-tech | Food, components |
| **Military base** | Weapons, ammo (limited sale) | Food, components, recruits |
| **Trading hub** | Small amounts of many goods | Small amounts of many goods |
| **Research outpost** | Rare tech, artifacts | Food, components, protection |
| **Black market** (Scrapfather) | Illicit goods, stolen items | Credits |

---

## 5. NPC traders

The simulation spawns **NPC trader ships** that fly between stations and move goods. They:

- Follow profitable routes (same as players would)
- Transport goods from high-supply to high-demand stations
- Gradually normalize prices across the galaxy
- Can be attacked and looted by the player (yielding their cargo + credits)
- Can be attacked by pirates — the player can be hired to escort them

### Why this matters

Without NPC traders, the player's trade routes are eternally profitable and become mandatory grinding. With NPC traders, profitable routes attract competition and margins erode over time, forcing the player to find *new* routes — which is the actual fun of trading in a simulation.

### Scale

At launch: ~50 active NPC traders galaxy-wide (plus many more simulated abstractly for distant systems). Performance-conscious — most traders are just ledger entries, not rendered ships, unless the player is in the same system.

---

## 6. Player trade loop

### Discovery
1. Player docks at Station A
2. Player sees the market UI: prices, stock levels, a **margin indicator** (green/red arrow) vs. known average prices
3. Player uses **intel** (purchased at stations for ¢50-500) to see prices at nearby stations
4. Player buys goods at Station A at low prices

### Execution
5. Player flies to Station B
6. During flight: pirate encounters, maybe escort requests, faction patrols
7. Player docks at Station B
8. Player sells goods at Station B at high prices
9. Profit = (sellPriceB - buyPriceA) * quantity - fuel - repair costs - time cost

### Feedback
10. Station B's market now has more of this good (player added supply) — future sells will earn less
11. Station A's market has less of this good — future buys will cost more
12. Over time, NPC traders normalize the route — profitability declines
13. Player seeks new routes

---

## 7. Automated trade routes

Unlocked after claiming at least one outpost (Act 2).

- Player assigns an owned ship to a route between two owned stations (or an owned station and any friendly station)
- Ship auto-flies the route, buying and selling at player-set goods lists
- Earns passive income
- **Vulnerable:** assigned ships can be attacked by pirates or hostile factions. The player must defend routes or accept losses.
- **Limited ships:** number of routes = number of ships assigned. Opportunity cost.

### Why "passive income with real risk"
The dream of running an empire is having money flow in while you do other things. But fully passive income trivializes progression. The compromise: income arrives while the player is off adventuring, but routes require maintenance, defense, and occasional re-routing — just like a real trade empire.

---

## 8. Faction prices

Reputation with a faction affects prices at their stations:

| Reputation | Buy price | Sell price |
|---|---|---|
| Hostile | N/A (refused) | N/A |
| Neutral | 100% | 100% |
| Friendly | 95% | 105% |
| Allied | 90% | 110% |
| Exalted | 80% | 120% |

Reputation also unlocks access to rare and exclusive goods.

---

## 9. UI

### Market screen
- Two-column: **My inventory** (left), **Station stock** (right)
- For each good: quantity, price, delta indicator (margin vs. base)
- **Intel toggle:** shows prices at nearby known stations for comparison
- **Filter:** by category, by legality, by profitability
- **One-click actions:** buy max, sell all
- **Route planner** (unlocked in Act 2): select two stations, shows best goods to move

### Route dashboard
- Lists all owned routes
- Shows: assigned ship, recent earnings, recent losses, status (running/attacked/returning)
- Click a route to reassign, reroute, or cancel

### Galactic economy overview
- Heat map showing which goods are scarce/abundant per region
- Late-game tool only (requires reputation with the Archivists to unlock)

---

## 10. Economic events

Random events that disrupt the economy and create opportunities:

- **Shortage** — a station's production collapses; prices of that good spike
- **Glut** — overproduction causes a crash; bulk buying opportunity
- **Embargo** — a faction refuses to trade a specific good
- **War** — faction war halts trade between warring factions; third-party smugglers profit
- **Discovery** — a new resource is found; early traders get huge margins
- **Pirate blockade** — a route becomes dangerous; escort missions appear

Events are telegraphed in news feeds at stations (another reason to dock frequently).

---

## 11. Tuning targets

- **Average starter profit margin:** 10–20% on a bulk run
- **Late-game average margin:** 20–40% on rare goods (with risk)
- **Time to first profitable route:** < 30 minutes of play
- **Time to first automated route:** ~8–12 hours of play
- **Maximum passive income from routes:** ~30% of player's total income at endgame (rest comes from quests, combat, and dungeon loot)

---

## 12. Anti-exploit design

- **No infinite loops:** two stations that produce and consume each other's outputs will normalize quickly; pure back-and-forth between two nearby stations is deliberately unprofitable
- **Price floor:** no station will buy a good for more than 150% of its base price no matter how scarce
- **Stock caps:** players can't sell more of a good than a station can reasonably absorb (backlog creates delayed sales)
- **Attention cost:** automated routes require ships + defense + crew — all of which have opportunity costs

---

## 13. Open questions

1. **Real-time or turn-based economy tick?** Real-time simulates continuously; turn-based ticks on docking. *Leaning real-time with coarse updates every in-game hour.*
2. **Does the player need a trade license?** Adds faction friction but could feel like tax. *Leaning no.*
3. **Commodities market / futures?** Cool but probably out of scope for launch.

---

## 14. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Good categories, price formula, station types, NPC traders, player loop, automated routes. |

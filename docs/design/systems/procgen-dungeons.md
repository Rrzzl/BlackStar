# System Spec: Procedural Dungeon Generation

**Owner:** Systems Designer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before:** [GDD §4.3](../02-gdd.md), [Combat](combat.md)

---

## 1. Goals

1. **Replayability** — every dungeon feels fresh across dozens of runs
2. **Handcrafted feel** — procedural dungeons should not feel "random." They should feel like someone *could* have built them.
3. **Readable structure** — the player can always understand where they are, where the exit is, and roughly what's ahead.
4. **Biome identity** — an alien ruin feels nothing like a crashed ship feels nothing like a feral colony.
5. **Determinism** — given the same seed + biome + params, the same dungeon generates. Important for debugging and shared seeds.

---

## 2. High-level approach: hand-authored rooms, procedural layouts

Black Star uses the **"room graph" approach** used by *Binding of Isaac*, *Enter the Gungeon*, *Hades*, and *Dead Cells*:

1. **Hand-authored rooms.** A large library of pre-designed rooms per biome. Each room is a small tile map with spawn points, doors, and metadata.
2. **Procedural layout.** The generator picks a set of rooms from the library and connects them into a graph.
3. **Procedural content within rooms.** Enemy spawns, loot placement, trap placement, decorative variation.

This is better than pure procedural generation (e.g., BSP, cellular automata) for a game where combat rooms matter — handcrafted rooms are always fair, balanced, and interesting. It's better than pure hand-authored for replayability.

---

## 3. Room definition

A room is a static structure:

```ts
interface RoomTemplate {
  id: string;                    // "ruin.combat.small.01"
  biome: BiomeId;                // which biomes can use this room
  size: { w: number; h: number }; // in tiles, always multiple of 8
  tileMap: TileId[][];           // tile layer
  doors: Door[];                 // where this room can connect
  spawnPoints: SpawnPoint[];     // enemy and loot spawn locations
  lightSources: LightSource[];   // light placements
  scripts?: RoomScript[];        // optional triggered events
  minDepth: number;              // earliest depth this room can appear
  maxDepth: number;              // latest depth
  weight: number;                // relative selection probability
  tags: RoomTag[];               // e.g., ["combat", "small", "two-door"]
}
```

**Doors** are the connection points. A room with a door on its east edge can connect to a room with a door on its west edge.

**Spawn points** are not hardcoded enemies; they're metadata like `{ type: "rusher", difficulty: "standard" }`. The generator fills them with actual enemies based on the run's difficulty budget.

### Room categories (tags)

- `start` — the entry room (always one per dungeon)
- `exit` — the exit room (one per dungeon, terminal)
- `combat` — standard fight room
- `elite` — combat room with an elite enemy
- `loot` — treasure room, no combat
- `shrine` — narrative encounter, NPC, buff
- `trap` — environmental hazards, no enemies
- `secret` — hidden room, requires searching to find
- `boss` — boss fight (one per dungeon; some dungeons are boss-less)

### Room sizes

- **Small:** 12×8 tiles (~384×256 px)
- **Medium:** 20×16 tiles (~640×512 px)
- **Large:** 32×24 tiles (~1024×768 px)

The player fits in a 2×2 tile space; standard enemies in 2×2 or 3×3; elites up to 4×4.

---

## 4. Layout generation algorithm

Pseudocode:

```ts
function generateDungeon(seed: number, biome: BiomeId, depth: number): Dungeon {
  const rng = new RNG(seed);
  const params = DungeonParams[biome][depth];

  // 1. Pick room count
  const roomCount = rng.int(params.minRooms, params.maxRooms);

  // 2. Place start room
  const start = pickRoom(rng, biome, "start");
  const rooms = [placeRoom(start, origin)];

  // 3. Grow the graph
  while (rooms.length < roomCount - 1) {
    const anchor = pickRandomRoomWithOpenDoor(rng, rooms);
    const door = pickRandomOpenDoor(rng, anchor);
    const candidate = pickCompatibleRoom(rng, biome, door, rooms.length);
    if (candidate && fits(candidate, anchor, door)) {
      rooms.push(placeRoom(candidate, anchor, door));
    }
    if (attempts > maxAttempts) break; // safety
  }

  // 4. Place exit room at farthest node from start
  const exitRoom = pickRoom(rng, biome, "exit");
  const farthestAnchor = findFarthestRoomFromStart(rooms);
  rooms.push(placeRoomAtFarthest(exitRoom, farthestAnchor));

  // 5. Inject special rooms (shrine, loot, secret) by biome rules
  injectSpecialRooms(rng, rooms, biome, depth);

  // 6. Fill spawn points with actual enemies (see §5)
  populateEnemies(rng, rooms, params.difficultyBudget);

  // 7. Place loot drops
  populateLoot(rng, rooms, params.lootBudget);

  // 8. Return dungeon
  return { rooms, seed, biome, depth };
}
```

### Placement constraints

- Rooms must not overlap in world space
- Connections must align (door-to-door)
- At least one path must exist from start to exit (guaranteed by the growth algorithm — every new room is connected to an existing one)
- Minimum path length from start to exit (otherwise dungeons are trivially short)

### Determinism

Every random choice is drawn from the seeded RNG. Same seed → same dungeon. The global RNG is **never** read during dungeon generation — only the scoped dungeon RNG.

---

## 5. Enemy population

A dungeon has a **difficulty budget** — a number representing how much total enemy threat this dungeon should contain. Each enemy type has a "cost" (chaff = 1, standard = 3, elite = 10, etc.). The populator spends the budget across spawn points.

```ts
function populateEnemies(rng: RNG, rooms: Room[], budget: number) {
  for (const room of rooms.filter(r => r.category.includes("combat"))) {
    const roomBudget = budget * (room.size.w * room.size.h) / totalCombatArea;
    let spent = 0;
    for (const sp of room.spawnPoints) {
      if (spent >= roomBudget) break;
      const enemyType = pickEnemy(rng, room.biome, roomBudget - spent, sp.type);
      spawnEnemy(sp, enemyType);
      spent += enemyType.cost;
    }
  }
}
```

### Enemy selection rules

- Enemy type must be valid for this biome (e.g., feral enemies don't appear in crashed ships)
- Enemy level must be ≤ dungeon depth + 2
- Elite enemies appear only in rooms tagged `elite` OR with probability 0.1 in `combat` rooms past depth 3
- Enemy mix per room favors **one primary threat + variety**: e.g., a room of 4 rushers + 2 shooters reads better than 2 rushers + 2 shooters + 2 snipers

---

## 6. Loot population

Each dungeon has a **loot budget**: how many items/how much credit value should drop. Loot is placed at `loot` spawn points and scatter points (from defeated enemies).

### Loot rarity curve (per dungeon depth)

| Depth | Common | Uncommon | Rare | Legendary | Black Star |
|---|---|---|---|---|---|
| 1 | 80% | 18% | 2% | 0% | 0% |
| 5 | 60% | 30% | 9% | 1% | 0% |
| 10 | 40% | 40% | 17% | 3% | 0.1% |
| 20 | 20% | 35% | 30% | 14% | 1% |

Black Star tier artifacts are **quest-gated** — they don't drop randomly beyond a tiny fallback chance. You find them by completing specific dungeons, piecing together clues, and earning them.

---

## 7. Biomes

Launch biomes (8):

### Alien ruin (First One)
- **Tone:** cold, still, wrong
- **Tiles:** seamless stone, impossible geometry, glowing glyphs
- **Enemies:** First One constructs (geometric, silent, high-damage), reactivated relics
- **Hazards:** void pits, phase doors, memory traps
- **Loot bias:** rare artifacts, lore fragments

### Crashed ship
- **Tone:** claustrophobic, panicked
- **Tiles:** corroded metal, sparking wires, broken bulkheads
- **Enemies:** feral survivors, reanimated crew, rogue drones
- **Hazards:** fire, pressure doors, gravity loss
- **Loot bias:** weapons, ship components

### Feral colony
- **Tone:** tragic, human
- **Tiles:** farmhouses, fences, crops, old homes
- **Enemies:** feral humans, mutated wildlife
- **Hazards:** traps set by residents, collapsing structures
- **Loot bias:** consumables, story items

### Hive
- **Tone:** organic, invasive
- **Tiles:** bioluminescent walls, chitin, webbing
- **Enemies:** swarmers, brood, queen
- **Hazards:** acid, webbing slow, eggs that hatch on disturbance
- **Loot bias:** bio-tech items, crafting materials

### Necropolis
- **Tone:** sacred, mournful
- **Tiles:** old stone, sarcophagi, broken statues
- **Enemies:** cultists, reanimated dead, Verdant enforcers
- **Hazards:** curse rooms, locked tombs
- **Loot bias:** heirlooms, religious artifacts

### Void temple
- **Tone:** reverent, forbidden
- **Tiles:** obsidian-like material, pools of reflective liquid
- **Enemies:** Seventh Gate cultists, Hollow Fleet probes
- **Hazards:** cold damage, mind-touch effects
- **Loot bias:** void-type weapons, Hollow Fleet intel

### Lab (Concordance research facility)
- **Tone:** clinical, abandoned
- **Tiles:** white panels, shattered glass, research terminals
- **Enemies:** rogue AI drones, experimental subjects
- **Hazards:** electrical shock, chemical spills, locked doors (hackable)
- **Loot bias:** tech items, schematics

### Ice cavern
- **Tone:** lonely, beautiful
- **Tiles:** ice, snow, buried structures
- **Enemies:** frost-adapted wildlife, buried cultists
- **Hazards:** thin ice, avalanche, freezing temperatures (limits stamina)
- **Loot bias:** cold-type weapons, preserved relics

---

## 8. Room library size targets

For the dungeons to feel non-repetitive, each biome needs enough room templates that the average 10-room dungeon repeats at most 1 room.

**Per-biome target:** ~40 rooms
- 20 combat rooms (varied size and spawn layouts)
- 5 elite rooms
- 5 loot rooms
- 3 shrine rooms
- 3 trap rooms
- 2 secret rooms
- 1 start room
- 1 exit room

**Across 8 biomes:** ~320 rooms total for launch. Additional rooms are a clear post-launch content lever.

---

## 9. Special mechanics

### Fog of war
- Rooms start hidden. Entering a room reveals it.
- Unexplored rooms show as a dim icon on the minimap after a doorway is seen.
- Revealed rooms stay on the minimap permanently for this run.

### Line of sight
- In-room, enemies react when they can see the player (raycast from enemy to player vs. opaque tiles)
- Players can use cover to break LOS and reset combat pacing

### Permadeath
- Dying in a dungeon loses this expedition's loot (see GDD §4.11)
- Save points are optional — a dungeon has no mid-run save

### Dynamic regeneration
- A dungeon you've cleared "repopulates" after ~3 in-game days (or after changing systems), generating a new layout from a new seed
- Narrative justification: First One sites shift; feral colonies rebuild; new scavengers arrive

---

## 10. Validation

Generated dungeons must pass validation before being used:

- [ ] Start and exit rooms exist
- [ ] A path exists from start to exit
- [ ] No overlapping rooms
- [ ] All doors are connected or sealed
- [ ] Total enemy budget within ±10% of target
- [ ] At least one loot room if budget ≥ 100
- [ ] Minimum path length from start to exit ≥ 3 rooms

Failed validations trigger a regeneration with an adjusted seed. Hard cap of 10 attempts before emitting an error and falling back to a known-good static dungeon.

---

## 11. Debug tooling

- **Dungeon viewer:** render the whole dungeon graph with room names and paths
- **Seed override:** force a specific seed for reproducibility
- **Content injector:** drop the player anywhere in a generated dungeon
- **Enemy spawn override:** force specific enemies at specific points
- **Performance profiler:** measure generation time, target < 200ms for a 20-room dungeon

---

## 12. Performance targets

- Dungeon generation: **< 200ms** for a 20-room dungeon
- Dungeon loading (entering the scene): **< 500ms** including asset streaming
- Runtime: dungeons fit in the 200-entity budget from the TDD

---

## 13. Open questions

1. **Can rooms be rotated/mirrored?** Rotating rooms increases library flexibility ~4x at the cost of complicating door alignment. *Leaning yes for the final game; deferring for VS.*
2. **Multi-floor dungeons?** Bosses at the bottom, stairs/elevators between floors. *Probably yes for deep dungeons, but not required for VS.*
3. **Scripted "set-piece" rooms** that are designed once and only appear once per run? *Probably yes for narrative dungeons.*

---

## 14. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Room-graph approach, biome definitions, loot curve, validation rules, performance targets. |

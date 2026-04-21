# System Spec: Save & Persistence

**Owner:** Systems Engineer
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before:** [GDD §4.11](../02-gdd.md), [TDD §3.8](../../tech/01-tdd.md)

---

## 1. Goals

1. **Never lose the player's progress.** Save integrity is non-negotiable.
2. **Tiered permadeath that feels fair.** Losses are real but the meta game is safe.
3. **Forward-compatible format.** Saves from older versions load in newer versions via migrations.
4. **Fast.** Save and load < 200ms for a typical save file.

---

## 2. Save structure

### Top-level save file

```ts
interface SaveFile {
  version: number;              // schema version
  timestamp: number;            // when saved
  playTimeMs: number;           // total playtime
  captain: CaptainSave;
  ships: ShipSave[];
  companions: CompanionSave[];
  galaxy: GalaxySave;
  empire: EmpireSave;
  quests: QuestSave;
  codex: CodexSave;
  settings: SettingsSave;
  sceneHint: SceneHint;         // where to resume
  rngSeed: number;              // master seed for reproducibility
  meta: MetaProgressionSave;    // NG+ unlocks, achievements
}
```

Each nested object is its own schema. Migrations target specific nested schemas for minimal churn.

### CaptainSave

```ts
interface CaptainSave {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  xp: number;
  stats: { hp: number; maxHp: number; stamina: number; maxStamina: number };
  skillPoints: { flesh: number; steel: number; spark: number; class: number };
  unlockedSkills: SkillId[];
  abilities: AbilityId[];
  inventory: InventorySave;
  activeShipId: string;
  activeCompanions: string[];   // companions currently in party
  faction: Map<FactionId, number>; // reputation
  credits: number;
  lastStationId: string;        // respawn point
}
```

### ShipSave

```ts
interface ShipSave {
  id: string;
  templateId: ShipTemplateId;
  name: string;                  // player-given or default
  level: number;
  xp: number;
  hull: number; maxHull: number;
  shield: number; maxShield: number;
  energy: number; maxEnergy: number;
  modules: Map<SlotId, ModuleId>;
  cargo: InventorySave;
  crewAssigned: string[];        // companion ids assigned to this ship
  location: LocationSave;        // current system + position
  assignment: ShipAssignment;    // "active" | "parked" | "trade-route" | "defense"
}
```

### GalaxySave

The galaxy save is the largest persistent state. It holds:

```ts
interface GalaxySave {
  discoveredSystems: Set<SystemId>;
  visitedPlanets: Set<PlanetId>;
  clearedRuins: Map<RuinId, { clearedAt: number; nextRespawnAt: number }>;
  stationMarkets: Map<StationId, StationMarketState>;
  npcTraders: NPCTraderState[];
  factionStates: Map<FactionId, FactionState>;
  worldEvents: WorldEvent[];
}
```

This can grow to hundreds of KB for a long run. See §6 for storage strategy.

### EmpireSave

```ts
interface EmpireSave {
  ownedOutposts: OutpostSave[];
  tradeRoutes: TradeRouteSave[];
  treasury: number;
  governance: { model: "captain" | "council"; officials: CompanionId[] };
  declaredWars: FactionId[];
  alliances: FactionId[];
}
```

---

## 3. Save lifecycle

### Auto-save triggers
- Scene transition (space → dungeon, dungeon → station, any major context switch)
- Companion recruited or lost
- Major quest milestone
- Boss defeated
- Outpost claimed
- Every 5 minutes during any gameplay

### Manual save
- Three manual save slots
- Available from the pause menu, only in "safe" contexts (on ship, at a station, not in combat)
- Manual save does not replace auto-save

### Save file locations

| Storage | Contents |
|---|---|
| `localStorage["blackstar.save.<slot>.main"]` | Top-level save file, compressed |
| `IndexedDB: blackstar / galaxy / <slot>` | Galaxy state (offloaded if > 1MB) |
| `IndexedDB: blackstar / codex / <slot>` | Codex / lore fragments |

---

## 4. Save format & compression

### Serialization
- JSON is the base format — maximum compatibility, human-readable for debugging
- `Map` and `Set` instances converted to arrays during serialization via a custom replacer
- `Date` / `bigint` / class instances explicitly handled (no `JSON.stringify` surprises)

### Compression
- Saves > 100 KB compressed with **lz-string** before localStorage write
- IndexedDB saves stored uncompressed (browser storage is generous; compression adds load time)

### Size targets
- Early-game save: 20–50 KB compressed
- Mid-game save: 200–500 KB compressed
- Late-game save: 1–3 MB compressed
- Hard cap: 5 MB (enforced; saves larger than this are an engineering bug, not a player-facing limit)

---

## 5. Versioning and migrations

### Version number
- Saved as `version: N` in the top-level file
- Incremented whenever the schema changes (any field added, removed, or renamed at any level)

### Migration system

```ts
const migrations: Migration[] = [
  { fromVersion: 1, toVersion: 2, migrate: migrate_1_to_2 },
  { fromVersion: 2, toVersion: 3, migrate: migrate_2_to_3 },
  // ...
];

function loadSave(raw: unknown): SaveFile {
  let save = raw as SaveFile;
  while (save.version < CURRENT_VERSION) {
    const migration = migrations.find(m => m.fromVersion === save.version);
    if (!migration) throw new SaveIncompatibleError(save.version);
    save = migration.migrate(save);
  }
  return save;
}
```

### Migration rules
- Each migration must be **pure** — same input → same output
- Each migration must be **unit-tested** against a golden fixture from the previous version
- Migrations are **append-only** — never modify an existing migration
- Old migrations are never removed; we want to load a v1 save in v40
- On catastrophic migration failure: back up the save, prompt the user, exit to main menu (never corrupt)

---

## 6. Tiered permadeath — persistence rules

Restating the rules from GDD §4.11 in enforcement terms:

### On dungeon death (most common)

**Lost:**
- All items in captain inventory from this expedition
- Companions who died in the dungeon (marked `permadead`, removed from roster)
- XP earned during this expedition (*decision pending*; leaning "keep XP" for player satisfaction)

**Kept:**
- All ships (in orbit or parked)
- All companions not on the expedition
- Empire, trade routes, outposts, credits
- Faction reputation (already committed)
- Captain's base level/skills from before the expedition
- Codex entries (already committed)

**Implementation:** when the expedition begins, the save system takes a **snapshot** of captain inventory and expedition participants. On death, the snapshot is rolled back (inventory restored *except* items acquired this run are removed; party members flagged accordingly).

### On ship destruction in space (uncommon)

**Lost:**
- The destroyed ship (permanent)
- All cargo on the ship
- Companions aboard the ship: 50% survival roll each; survivors return to the home station
- Any modules installed on the ship

**Kept:**
- Captain (ejects in escape pod)
- Everything else

**Implementation:** at ship-destroyed event, roll survivability for each companion, remove the ship from the roster, transfer the captain to nearest friendly station.

### Total captain death (rare)

**Triggered only by:** specific narrative events, hardcore mode, or ship destruction without an escape pod.

**Lost:** everything in the current run.
**Kept:** meta-progression (NG+ unlocks, codex, achievements).

**Implementation:** the save file is archived (`blackstar.save.<slot>.archive.<timestamp>`) and a new save file is initialized with inherited meta-progression.

---

## 7. Save corruption recovery

### Defenses
- On every save: write to a temporary slot, verify by reading back, then promote to the real slot (atomic-ish)
- Keep the previous save as a backup (`.prev` slot) — two generations of recovery
- Validate the save structure on load; reject malformed saves with a clear error

### If a save is corrupted
- Prompt the user: "Save file is damaged. Load backup? (Yes / No / Export broken save for support)"
- Loading the backup loses up to one save-tick of progress (auto-save interval = 5 min, so worst case)
- Exporting the broken save lets support diagnose without destroying data

### Never do
- Silent fallback to a backup — the player must always know
- Overwrite the backup during a failed save
- Assume `JSON.parse` can't throw

---

## 8. Save UI

### Main menu
- **Continue** — loads the most recent auto-save
- **Load Game** — opens the load menu

### Load menu
- Shows all manual slots + the auto-save slot
- Each slot shows: captain name, class, level, playtime, last location, last save time
- Hover shows additional info (credits, ships, outposts)
- Delete slot with confirmation (cannot be undone)

### Save menu (in-game pause)
- Shows slots; saving to a slot replaces it with confirmation
- "Save to auto-save" is always available in safe contexts

### Error surfaces
- If save fails: in-game toast "Save failed: <reason>. Retrying..."
- If load fails: main menu modal with options (load backup, export, cancel)

---

## 9. Cloud save (post-launch)

Not at launch. When added:
- Back end: Steam Cloud (if we ship on Steam), otherwise a minimal custom service
- Conflict resolution: newer timestamp wins; cloud save prompts on load if local is newer
- Opt-in in settings

---

## 10. Testing

### Required tests
- Round-trip serialization: save → load → save produces an identical byte-for-byte second save
- Migration: every migration has a golden fixture and a test that loads the old format
- Corruption: intentionally malform a save, confirm the load fails gracefully
- Size: simulate an empire-scale save, confirm it stays under the size target
- Perf: save and load a large save, measure duration (target < 200ms each)

### Fixtures
- `tests/fixtures/saves/v1-minimal.json` through `vN-maximal.json` as the test corpus
- Generated fixtures for stress tests (5MB saves)

---

## 11. Open questions

1. **Do we support copying saves between browsers?** Would require an export/import feature and a fixed schema. *Leaning yes — simple JSON export/import button in settings.*
2. **Do we version content?** A save from before an item was added shouldn't break when it loads in a newer version. *Yes — missing content is ignored with a warning, not fatal.*
3. **What happens to a companion "on loan" (assigned to a trade route) if the route ship is destroyed?** Defer to permadeath rules — 50% survival roll, survivors return to home station.

---

## 12. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Save structure, lifecycle, permadeath enforcement, corruption recovery, testing. |

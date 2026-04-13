# Black Star — Technical Design Document

**Document owner:** Technical Director
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before this one:** [GDD](../design/02-gdd.md), [Art Direction](../design/04-art-direction.md)

---

## 0. Purpose

This document is the **engineering bible**. It defines the tech stack, architecture, core systems, data formats, performance budgets, testing strategy, and tooling for Black Star. Every engineering decision is measured against it. When the TDD contradicts the GDD, the GDD wins on what; the TDD decides how.

---

## 1. Tech stack (locked)

| Layer | Choice | Why |
|---|---|---|
| **Language** | TypeScript 5.x, strict mode | Type safety, JS ecosystem, zero runtime for types |
| **Runtime** | Modern evergreen browsers (Chromium 120+, Firefox 120+, Safari 17+) | Universal reach, no install, native Canvas/WebAudio |
| **Renderer** | HTML5 Canvas 2D API | Pixel-art-friendly, simple, enough perf for 2D top-down |
| **Bundler / dev server** | Vite 5+ | Fast HMR, zero-config TS, proven at scale |
| **Testing** | Vitest | Vite-native, Jest-compatible API, fast |
| **Linting** | ESLint 9 + @typescript-eslint | Standard choice |
| **Formatting** | Prettier | Standard choice |
| **State persistence** | `localStorage` + IndexedDB | Browser-native, no server required |
| **Desktop wrapper (post-launch)** | Tauri 2 | Smaller bundle than Electron, better perf |
| **Audio** | Web Audio API wrapper (custom or Howler.js) | Browser-native, low-latency |
| **Physics** | Custom 2D AABB / circle collision | Full game scope is simple; no third-party needed |

### What we explicitly did NOT pick and why

| Rejected | Reason |
|---|---|
| **Unity / Unreal / Godot** | Overkill for a 2D top-down game; tool lock-in; can't run in-browser without hoops |
| **Phaser** | Framework opinions would fight our hybrid scene system; less control over the game loop |
| **Pixi.js** | WebGL renderer is overkill for 32×32 pixel art; we don't need shaders at launch |
| **React for UI** | Would fight the game loop; we build UI directly in Canvas |
| **Redux / Zustand / MobX** | Game state doesn't benefit from reactivity layer; plain TS classes are clearer |
| **A full ECS library** | ECS is powerful but overkill for our entity counts (~1000 max); plain classes with composition are simpler for a project this size |
| **Rust + WASM** | Premature optimization; we're not perf-bound; TS is fast enough |

---

## 2. High-level architecture

### Layered design

```
┌────────────────────────────────────────────────────┐
│  Application Layer                                 │
│   - main.ts (entry point)                          │
│   - Game (main loop, scene manager)                │
├────────────────────────────────────────────────────┤
│  Scene Layer                                       │
│   - TitleScene, SpaceScene, DungeonScene,          │
│     StationScene, ShopScene, LoadingScene          │
│   - Each scene owns its entities and update loop   │
├────────────────────────────────────────────────────┤
│  Gameplay Systems                                  │
│   - Combat, Movement, AI, Loot, Inventory,         │
│     Trade, Quests, Empire, Save/Load               │
├────────────────────────────────────────────────────┤
│  Engine Services                                   │
│   - Renderer, Input, Audio, Asset Manager,         │
│     Physics, RNG, EventBus, Timer                  │
├────────────────────────────────────────────────────┤
│  Platform                                          │
│   - Browser APIs (Canvas, WebAudio, localStorage)  │
└────────────────────────────────────────────────────┘
```

### Dependency rule

**Higher layers depend on lower layers. Lower layers never import from higher layers.** An engine service must never `import { SomeScene }`. Violations of this rule are a build error.

---

## 3. Core engine systems

### 3.1 Game loop

- **Fixed timestep simulation** at 60 Hz (16.667ms per step)
- **Variable render step** (matches browser refresh via `requestAnimationFrame`)
- **Panic clamp:** if more than 10 simulation steps are pending (e.g., tab was hidden), drop accumulated time rather than simulate a death spiral
- **Pause:** global pause flag stops simulation but continues render

Pseudocode:
```ts
const STEP = 1 / 60;
let accumulator = 0;
let lastTime = performance.now();

function frame(now: number) {
  const dt = Math.min((now - lastTime) / 1000, 0.25); // clamp to 250ms
  lastTime = now;
  accumulator += dt;

  let steps = 0;
  while (accumulator >= STEP && steps < 10) {
    scene.update(STEP);
    accumulator -= STEP;
    steps++;
  }
  if (steps >= 10) accumulator = 0; // panic clamp

  scene.render(renderer, accumulator / STEP);
  requestAnimationFrame(frame);
}
```

### 3.2 Scene manager

- One active scene at a time
- Scene transitions are explicit (`game.switchScene(new DungeonScene(...))`)
- Scenes own their entities; no global entity registry
- Transitions can be instant or animated (fade, wipe)
- Scene stack (for modals like pause menu, inventory) is supported via a secondary overlay scene drawn on top

### 3.3 Input

- Wraps keyboard, mouse, and (later) gamepad
- Exposes `isDown`, `wasPressed`, `wasReleased` for each input
- Input state updated once per frame, before `update`
- Key rebinding layer: logical actions (`fire`, `dodge`, `interact`) map to physical keys, remappable in settings

### 3.4 Renderer

- Canvas 2D context with `imageSmoothingEnabled = false`
- Internal resolution 640×360, scaled up with `scale()` on the context
- Layers: background, world, entities, foreground, HUD, overlay
- Camera (translate + zoom) applied before world rendering, reset before HUD
- Batching: naive (draw each sprite) at first; sprite sheet atlas for optimization later

### 3.5 Asset manager

- Preloads sprite sheets, audio, font, data JSON
- Promise-based: `await assets.load(manifest)`
- Loading scene shows progress until all assets are ready
- Hot reload in dev: on file change, reload asset and notify dependents

### 3.6 Event bus

- Simple pub/sub with typed events
- Used for cross-system notifications (e.g., `EnemyDied` → Loot system, XP system, Quest system all listen)
- Each event is a plain object with a string `type`
- Scenes subscribe on enter, unsubscribe on exit (to prevent leaks)

### 3.7 RNG

- Seedable pseudorandom generator (Mulberry32 or similar)
- Every procedural generator (dungeon, galaxy, loot) takes an RNG instance
- Save files include the global seed; derived seeds for each gen context
- Deterministic given the same seed + inputs (important for debugging and reproducible runs)

### 3.8 Save / load

- Save data is a JSON object containing:
  - Player captain data (stats, inventory, skills)
  - Ship roster (all owned ships + state)
  - Crew roster (all companions + state)
  - Galaxy state (discovered systems, faction reputations, trade route stockpiles)
  - Empire state (owned outposts, trade routes)
  - Quest log state
  - Current scene hint (so reload returns to the same scene)
  - Global RNG seed
- Saved to `localStorage` under a versioned key (`blackstar.save.v1`)
- Large state (discovered galaxy, codex entries) offloaded to IndexedDB if it exceeds ~2MB
- **Save versioning:** each save has a schema version; migrations upgrade older saves to current format
- **Auto-save** on: scene transition (space → dungeon, dungeon → station), significant events (companion recruited, boss defeated), every 5 minutes
- **Manual save slots:** 3 slots for the player + 1 auto-save

### 3.9 Audio system

- Wraps Web Audio API (see `05-audio-direction.md` for requirements)
- Priority-based voice limiter (32 voices max)
- Three buses: music, sfx, voice — each with independent volume
- Positional audio via pan based on source vs. listener position
- Reverb zones (convolution) for stations/ruins; none in space

### 3.10 Physics / collision

- 2D circle and AABB primitives, no rigid-body simulation
- Spatial hash for broadphase (tile-based grid, cell size 2× largest collider)
- Per-frame: movement → collision resolution → callbacks
- No continuous collision detection at launch; step is small enough (60 Hz) that tunneling shouldn't matter for typical speeds
- Add CCD only if we hit tunneling bugs with fast projectiles

---

## 4. Entity model

### Composition over inheritance

Entities are plain classes with composable components, not an ECS framework. This is a deliberate choice for this project's scale.

```ts
class Entity {
  id: number;
  pos: Vec2;
  vel: Vec2;
  active: boolean;
  components: Map<string, Component>;

  add<T extends Component>(c: T): T;
  get<T extends Component>(key: string): T | undefined;
  update(dt: number): void;
  render(r: Renderer): void;
}
```

Typical components: `Sprite`, `Health`, `Weapon`, `AI`, `Collider`, `Inventory`, `Interactable`.

### Why not a "pure ECS"?

- Entity counts are small (< 1000 typical)
- We rarely need the data-oriented layout benefits
- Plain classes are more readable, debuggable, and AI-pair-programming-friendly
- If we ever hit perf problems, we can migrate hot paths to a more data-oriented layout later

---

## 5. Data formats

### Content data (ships, weapons, items, enemies, etc.)

- **JSON files** under `src/content/`
- Typed via TypeScript interfaces — data validated at load time
- Hot-reloadable in dev
- Example: `src/content/weapons.json`, `src/content/ships.json`, `src/content/enemies.json`

### Save data

- Single JSON blob serialized to `localStorage`
- Versioned schema with migrations
- Compressed (lz-string or similar) if size becomes an issue

### Localization (post-launch)

- Key-based string tables per language
- Fallback to English
- Right-to-left support deferred

---

## 6. Performance budgets

### Per-frame (16.67ms total at 60 FPS)

| Phase | Budget |
|---|---|
| Input | 0.5ms |
| Simulation (entity updates, AI, physics) | 6ms |
| Event bus / system updates | 2ms |
| Rendering | 6ms |
| Audio & bookkeeping | 1ms |
| Headroom | 1.17ms |

### Memory

- **Working set:** < 200 MB total
- **Save file:** < 5 MB (compressed)
- **Asset bundle:** < 50 MB at launch (pixel art + music + SFX)

### Entity counts

- **Dungeon scene:** up to 200 entities (enemies, projectiles, loot, effects)
- **Space scene:** up to 500 entities (ships, projectiles, asteroids)
- **Station scene:** up to 100 entities (NPCs, background elements)

---

## 7. Testing strategy

### Test pyramid

1. **Unit tests (most)** — pure logic: Vec2, RNG, inventory, damage formulas, save serialization, procgen determinism, economy calculations
2. **Integration tests (some)** — system interactions: spawn an enemy, fire a projectile, assert it takes damage
3. **Smoke tests (a few)** — the game boots, loads assets, starts a new game, enters a scene, doesn't crash
4. **Manual playtests (always)** — feel, UX, balance, bugs that tests can't catch

### Test-driven development

TDD is the default for all pure-logic systems (procgen, combat math, economy, save/load). For rendering and input, manual smoke testing is acceptable because test scaffolding costs more than the tests save.

### Coverage target

Not a hard percentage. The target is **"every non-trivial function has at least one test that would catch a regression."** Vanity coverage metrics are explicitly rejected.

---

## 8. Build, deploy, tooling

### Development

- `npm run dev` — Vite dev server with HMR
- `npm run test` — Vitest in watch mode
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`

### CI

- GitHub Actions (or equivalent) on push:
  1. `npm ci`
  2. `npm run typecheck`
  3. `npm run lint`
  4. `npm run test`
  5. `npm run build`
- Builds are artifacts; no auto-deploy until alpha

### Build output

- Vite produces a static `dist/` folder (HTML + JS + assets)
- Served as a plain static site for web builds
- For desktop wrapper: `tauri build` produces native installers for Windows/Mac/Linux

### Debug tooling

To be built during foundation work:
- In-game debug overlay (F3): FPS, frame time, entity count, scene name
- Scene switcher (F4): instantly load any scene
- God mode (F5): invincible, infinite ammo
- Teleport (F6): click a system/planet/dungeon to jump there
- Console (F12): read/write game state, trigger events

These are not shipped to production builds — they're stripped by a build flag.

---

## 9. Directory structure

```
black-star/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── index.html                     # Entry HTML
├── src/
│   ├── main.ts                    # App entry
│   ├── engine/                    # Layer 0: engine services
│   │   ├── Game.ts
│   │   ├── Scene.ts
│   │   ├── Renderer.ts
│   │   ├── Input.ts
│   │   ├── Audio.ts
│   │   ├── Assets.ts
│   │   ├── EventBus.ts
│   │   ├── Vec2.ts
│   │   ├── RNG.ts
│   │   ├── Timer.ts
│   │   └── Physics.ts
│   ├── core/                      # Layer 1: game-level state
│   │   ├── GameState.ts
│   │   ├── SaveLoad.ts
│   │   ├── Inventory.ts
│   │   └── items.ts
│   ├── content/                   # JSON data + TS types
│   │   ├── ships.json
│   │   ├── weapons.json
│   │   ├── enemies.json
│   │   ├── items.json
│   │   └── types.ts
│   ├── entities/                  # Entity classes and components
│   │   ├── Entity.ts
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   ├── Projectile.ts
│   │   ├── Ship.ts
│   │   └── components/
│   │       ├── Sprite.ts
│   │       ├── Health.ts
│   │       ├── Weapon.ts
│   │       ├── AI.ts
│   │       └── Collider.ts
│   ├── scenes/                    # Layer 2: scenes
│   │   ├── TitleScene.ts
│   │   ├── SpaceScene.ts
│   │   ├── DungeonScene.ts
│   │   ├── StationScene.ts
│   │   └── LoadingScene.ts
│   ├── systems/                   # Gameplay systems
│   │   ├── Combat.ts
│   │   ├── Loot.ts
│   │   ├── DungeonGenerator.ts
│   │   ├── GalaxyGenerator.ts
│   │   ├── Economy.ts
│   │   ├── Quests.ts
│   │   └── Empire.ts
│   ├── ui/                        # UI widgets drawn on canvas
│   │   ├── HUD.ts
│   │   ├── InventoryUI.ts
│   │   ├── DialogueUI.ts
│   │   └── MenuUI.ts
│   └── debug/                     # Dev-only tools (stripped in prod)
│       ├── DebugOverlay.ts
│       └── DebugConsole.ts
├── assets/                        # Sprites, audio, fonts
│   ├── sprites/
│   ├── tiles/
│   ├── ships/
│   ├── ui/
│   ├── audio/
│   └── fonts/
├── tests/                         # Vitest tests (mirrors src/)
│   └── ...
└── docs/                          # Design, tech, production docs
    ├── design/
    ├── tech/
    └── production/
```

---

## 10. Coding standards

- **TypeScript strict mode** — `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`
- **No `any`** — if you need an escape hatch, use `unknown` and narrow
- **Named exports** over default exports
- **File naming:** `PascalCase.ts` for classes, `camelCase.ts` for modules of functions
- **Imports:** no deep relative paths (`../../../`); use path aliases configured in `tsconfig.json` (`@engine/*`, `@core/*`, etc.)
- **Comments:** explain *why*, not *what*. See the repo CLAUDE.md rules.
- **Tests colocated in `tests/`** (not next to source), mirroring the source structure

---

## 11. Known risks (to be expanded in risk register)

1. **Canvas 2D performance at scale** — might hit a wall at 500+ entities per frame. Mitigation: sprite sheet atlasing, dirty rect rendering, offscreen canvas pre-composition.
2. **Save file size growth** — a long-running empire save could exceed localStorage quota (~5MB). Mitigation: IndexedDB migration path, lz-string compression.
3. **Procedural generation determinism across platforms** — floating point differences between engines. Mitigation: all procgen uses integer arithmetic where possible; `Math.fround` for critical paths.
4. **Browser audio latency** — WebAudio can stutter on resource contention. Mitigation: pre-decode all critical SFX, limit simultaneous voices, monitor.
5. **Scope explosion** — the GDD is ambitious. Mitigation: vertical slice first, ruthless feature cut at each milestone gate.

See `docs/production/03-risk-register.md` for the full register.

---

## 12. Open technical questions

Unresolved. Must be closed before relevant systems ship.

1. **Galaxy simulation while player is in a dungeon** — does the galaxy "tick" (trade, faction moves, events) in real time while the player is off doing something else? Could be wall-clock or game-clock time. Impacts save format and determinism. → *Owner: tech lead + design lead. Resolve by: pre-Alpha 1.*
2. **Multi-scene hot state** — when the player jumps from space to dungeon, does the space scene stay alive in memory (ship orbiting) or fully unload? Impacts memory budget. → *Owner: tech lead. Resolve by: end of foundation work.*
3. **Mod support** — is Black Star moddable at launch? Affects data format decisions (JSON vs. binary). *Decision: JSON for launch, leaving a mod hook open. No official modding API at launch.*
4. **Cloud save** — needed? Nice-to-have, requires a server. Defer until post-launch unless Steam launch requires it.

---

## 13. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Tech stack locked. Architecture, engine systems, data formats, performance budgets, testing strategy, directory structure, coding standards defined. 4 open tech questions documented. |

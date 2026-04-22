# BLACK STAR — Compass

*A short document meant to be opened when you sit down and go "what should I work on tonight."*

---

## Where we are

- **Story:** World Bible v5 is the authoritative source. Spine is solid. Texture will be filled in as specific things are worked on.
- **Lore working doc:** `docs/production/black-star-lore.md` is the living design journal. Append per session. Opening sequence, Order internals, six backgrounds, art direction, combat model, and ship design are locked there as of 2026-04-21.
- **Code:** The Black Star codebase has been reshaped for *The Ninth Heir*. Space combat, economy, and the old character creation have been archived to `src/_archive/`. Engine + platformer substrate + TitleScene + Cabin/Witness/Court/Planet scene stubs are live. No art yet — rectangles on dark backgrounds are the correct placeholder.
- **Art:** Not started. Style guide (`docs/style-guide.md`) and lore doc together now define the full visual spec. Character pipeline is AI concept → Aseprite hand-pixel → PNG sheets under `src/assets/sprites/`.

## Architectural commitments (locked 2026-04-21)

These are no longer open questions. Work should honor them.

- **Hybrid camera.** Top-down (three-quarter) is the default for overworld travel, ship interior, claimant courts, hubs, dialogue scenes. Side-view platformer is reserved for handcrafted boss encounters only, roughly 5-12 across the whole game.
- **The M3a platformer substrate is NOT deprecated.** It has a new, narrower role: side-view boss combat. `src/core/platformer/` (TileMap, Physics2D, Collision, Controller, TiledLoader) retains full value under this new framing.
- **Top-down controller does not exist yet.** It is stubbed at `src/core/controllers/TopDownController.ts`. 4-direction movement, no gravity, tile-edge collision, iframe roll, primary + secondary weapon slots. To be implemented when overworld work starts.
- **The camera-mode switch is a diegetic beat.** Whip-pan + parchment-edge vignette + sound cue (bell / door / quill dropped). The Record turns the page. See `black-star-lore.md` for the design spec.
- **Combat is split by camera.** Top-down for regular encounters, mini-bosses, exploration jumpscares, and optional hidden bosses. Side-view for the handcrafted boss setpieces. HP / stagger / iframes / status model is shared across both.
- **Ship is a walkable top-down hub, not a vehicle UI.** The Impartial Regard has rooms (Cabin, bridge, hold, galley). The player walks them. Stubbed at `src/scenes/ShipInteriorScene.ts`.
- **Ship combat is eliminated from scope.** The ship is unarmed. The only defensive tool is a chaff-launcher used in scripted encounters. Space sector simulation, dogfight physics, piloting UI, and transit resource management are all cut.
- **Ship travel is scripted scenes every trip.** Not a generic loading screen. Each trip is an authored beat keyed to origin, destination, and story flags. Stubbed at `src/core/travel/TravelScene.ts`.
- **Character sprites are pixel art, 32-40px tall.** Chained Echoes / Lisa the Painful is the tonal reference. Blasphemous is explicitly *not* the target — too ambitious for solo production and fights the tone. Sharp, no anti-aliasing. See `style-guide.md`.
- **UI and world are two visual languages.** The Long Record (IM Fell English, parchment, wax, gold foil, ink) renders in an illustrated layer. The world renders in pixel. They do not bleed into each other. This separation is deliberate.

## Guiding principles

1. **Work on what you want to work on tonight.** The game is a long conversation with yourself. Not a sprint.
2. **The Long Record is the spine.** When in doubt, work on it. It touches every other system.
3. **Story texture gets filled in when a system forces it.** Don't write Damar's dialogue in a vacuum — write it when you're designing his court scene.
4. **Keep the codebase disciplined.** Strict TypeScript. Tests. No shortcuts. Future you will thank you.
5. **Use Claude Design.** Part of this project is discovering what the tool can do. Don't be shy with it.

## Things that are interesting to work on next

Pick whichever one pulls you on the night you sit down. No order is wrong.

### A. The Long Record — data layer
The single most distinctive system. Likely the most satisfying to build. Ordered sub-steps:
- Design the append-only event log format (JSON structure, entry types, timestamps, flag deltas)
- Implement the data layer + migration from save v4 to v5
- Write test coverage for the "entries cannot be unwritten" invariant
- Stub a minimal "write an entry" flow, text-only, no fancy UI yet
- Then: the book UI comes later, once the mechanics are solid

### B. The Long Record — book UI
The visible payoff. Should be worked on *after* the data layer is sketched, but doesn't need the full data layer to exist first. The standalone `src/ui/LongRecord.html` mock is the aesthetic target.
- Page turn animation. Physical feel. Opening sound eventually.
- Writing ritual: the UI for choosing one of 4 phrasings after an event
- Page marks: seals, blots, folded corners, torn edges
- Reading predecessor entries

### C. Opening sequence — Acts I-IV
The first hour, now specified. Same book, same candle, same quill throughout.
- Act I: The Bell. Founding rite writes itself on the page.
- Act II: The Binding. Witness creation, full-body illustrated character.
- Act III: The Taking. Short authored vignette per background (six backgrounds × 2-3 variations).
- Act IV: The Desk. Wake in the cabin. Sevasti's letter.
- Smallest viable slice: Act IV only, text-only. Build outward from there.

### D. Top-down controller + a walkable room
The first real test of the locked camera model.
- Fill in `TopDownController.ts`: 4-direction input, tile-edge collision against the existing TileMap, roll with iframes
- Build one walkable top-down room as proof (likely the ShipInteriorScene cabin)
- Prove the scene transitions cleanly between top-down and the existing side-view PlanetScene

### E. Damar Hul's cluster
The first vertical slice target. Can be worked on piecemeal forever.
- Write Damar's throne-room dialogue (top-down court scene)
- Sketch the Thorned Provinces from orbit
- Draft the dungeon's room layout (Tiled, side-view)
- Boss fight mechanics: he's Gifted with pain feedback — what does that *feel* like in side-view combat?

### F. Elara's letters from Auriel
Pure writing. Low technical demand. High emotional demand. Can be done anywhere.
- Write three of the letters Auriel sent her over two years
- Each reveals something different (his fear, his knowledge, his affection)
- In-game readable content, placed in the Nursery library

### G. Art — first pass
The slowest-burning contribution. Doing *some* art regularly is better than doing none.
- Generate an AI reference of the Witness sprite using the locked prompt (pixel, 32-40px, grey robes, belted, candle rim-lit)
- Aseprite: clean up one pose, then animate a 4-frame walk cycle
- Drop it into the repo under `src/assets/sprites/` and render it in one scene

## Things we are deferring

These will matter someday. Not today.

- Companions (Meridian, Vaspar, Kestrel)
- Legacy / Witness death & succession
- The other eight claimants beyond Damar
- Unfinished missions of previous Witnesses
- The six-background Act III vignettes (structure is locked; authoring the scripts is later work)
- Audio

## Story questions that are open

Tracked in `black-star-lore.md` under "Open Questions". Answer them when a system forces you to.

---

*Last updated: 2026-04-21. Update this document whenever the compass needs to point somewhere new.*

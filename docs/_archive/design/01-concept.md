# Black Star — Concept Document

**Document owner:** Design Lead
**Status:** Draft v0.1
**Last updated:** 2026-04-12

---

## Logline

*A gritty, dark, heroic space-faring roguelike where you hunt pirates, raid alien ruins for legendary loot, recruit a crew, and carve an empire out of a dying galaxy — one expedition at a time.*

---

## Elevator pitch

The Old Human Empire collapsed four hundred years ago. What's left is a scatter of lost colonies, feral factions, and the ruins of civilizations older than ours, rotting on forgotten worlds. You are a **voidrunner** — captain, scavenger, mercenary — hauling a scarred ship and a second chance across the dark between stars.

**Black Star** fuses three experiences into a single seamless loop:

1. **Top-down space exploration and combat** — fly your ship between planets, raid pirate caravans, run from things bigger than you.
2. **Roguelike dungeon crawls on alien worlds** — land, disembark, and explore procedurally generated ruins on foot. Twin-stick combat, stacking loot, permadeath on the expedition.
3. **Long-game empire building** — claim outposts, recruit NPC crew, establish trade routes, and grow from a lone captain into the commander of a private fleet — with all the political, economic, and military consequences that brings.

Permadeath in dungeons gives every expedition weight. Your captain and empire persist. Death in a ruin costs you the expedition's loot and any crew you brought; death in space means ejecting and losing the ship but keeping the captain. The stakes are always real but the long game is always yours.

---

## Core pillars

These are the load-bearing design values. Every feature, content decision, and system trade-off is measured against them. If a feature doesn't serve a pillar, it gets cut.

### Pillar 1: **Every run matters**

The player's choices — which system to jump to, which ruin to dive, which loot to carry out versus abandon, which crew member to risk — all carry persistent weight. Permadeath in dungeons is the enforcement mechanism; the empire layer is the reward. We are *not* trying to replicate Isaac's frictionless restart loop. We want players to feel the weight of each decision.

### Pillar 2: **One seamless fantasy**

Space flight, on-foot combat, and empire management all live inside the same world, same controls, same tone. The player shouldn't feel like they're switching games when they land on a planet or open the empire screen. Transitions are diegetic (the ship landing animation, walking off the ramp, the captain's quarters) rather than loading screens into a different mode.

### Pillar 3: **Gritty, dark, heroic**

The universe is broken. The player is one of the few people trying to put it back together — or rule what's left. Tone is Firefly meets Mass Effect meets Warhammer 40K-lite: morally grey, stakes real, losses final, but with room for hope, swagger, and genuine heroism. Not grimdark for grimdark's sake.

### Pillar 4: **Systems that gossip with each other**

The combat system talks to the loot system talks to the economy talks to the empire layer. A rare artifact you pull out of a ruin changes which trade routes become profitable. A pirate faction you anger in space shows up at your outpost weeks later. Nothing is siloed. This is what separates Black Star from a platformer with three bolted-on modes.

### Pillar 5: **Respect the player's time**

Deep systems, short sessions. A 30-minute expedition should feel complete. A 4-hour session should feel epic. The player can walk away at any time and come back to a world that makes sense without a 10-minute re-orientation. Auto-save is frequent, UI is readable, tutorials are contextual.

---

## Unique selling points (USPs)

1. **The only game that fuses twin-stick roguelike dungeon-crawling with persistent space empire management.** Each pillar exists elsewhere; the combination is novel.
2. **Diegetic scale** — you are one captain, but the game scales seamlessly from "walk across your ship's bridge" to "command a fleet jumping between star systems."
3. **Consequence permadeath** — unlike pure roguelikes (lose everything) or pure save games (lose nothing), Black Star's tiered permadeath creates emergent narratives. The crew member who died on Kepler-7 is gone forever. The trade route they were flying is now defenseless.
4. **A galaxy that persists and reacts.** Factions remember. Systems you've helped prosper. Systems you've abandoned decay.
5. **Accessibility of a roguelike + depth of a space sim.** Pick up and play in 5 minutes, but there are 200 hours of systems to master.

---

## Target audience

**Primary:** PC players (Steam) aged 20–40 who already play and love at least one of:
- *Starsector* — open-world space sandbox fans
- *FTL* — tension/stakes/run-based space fans
- *The Binding of Isaac / Nuclear Throne / Hades* — twin-stick roguelike fans
- *Mount & Blade / Rimworld / Kenshi* — emergent-narrative empire-building fans

**Secondary:** Players who bounce off the opacity of Starsector or the brutality of pure roguelikes but want depth beyond a straight action game.

**Audience size estimate:** The intersection is smaller than any single audience but the union is enormous. Success = reach the core ~50k–200k players in the intersection, expand outward from there through word-of-mouth and the genre-blending hook.

---

## Competitive set / inspirations

| Game | What we take | What we avoid |
|---|---|---|
| **Starsector** | Persistent open-world space, fleet combat, faction politics, emergent economy | Opaque UI, steep early game, modding-dependent content |
| **FTL: Faster Than Light** | Run tension, meaningful choices, permadeath weight | Limited scope per run (we want more systems) |
| **The Binding of Isaac** | Stacking item synergies, procedural runs, twin-stick clarity | Meta-progression grind, purely disposable runs |
| **Hades** | Narrative-driven run structure, character voice, polish | Linear progression (we want open-world) |
| **Mass Effect 2** | Crew recruitment, loyalty missions, tone, pause-and-command combat | Linear story structure |
| **Mount & Blade: Warband** | Scale from lone warrior to kingdom, emergent politics, companions | Real-time strategy battles (too much to build) |
| **Rimworld** | Emergent storytelling, systems-driven narratives, colony attachment | Deep colony sim mechanics (we're action-first) |

---

## Genre tag

**Primary:** Action-roguelike / Space sim hybrid
**Secondary:** Top-down shooter, Empire-builder, RPG

---

## Platform & tech

- **Platform:** PC (Windows, macOS, Linux) via browser and desktop wrapper
- **Tech stack:** TypeScript + HTML5 Canvas + Vite + Vitest, custom engine
- **Rationale:** Runs anywhere, zero install for prototype, straightforward path to Electron/Tauri desktop wrapper for distribution. Custom engine over a framework because we want full control over the hybrid scene system and the economy/AI simulations will benefit from it.

See `docs/tech/01-tdd.md` for the full technical rationale.

---

## High concept summary

> You are a voidrunner in a galaxy the old empire couldn't hold. You start with a battered ship, a handful of credits, and a dead man's logbook hinting at ruins worth raiding. Fly your ship. Land on worlds. Crawl their bones. Come back rich, or don't come back at all. Recruit a crew. Claim a station. Run trade routes. Make enemies. Pick your fights. Build something that outlasts you — because in the dark between stars, nothing else will.

---

## What this document is for

This concept is the **north star** for every other document and every feature decision. It is short on purpose. If a feature can't be justified against a pillar in this doc, it doesn't ship. If a piece of content doesn't fit the tone established here, it gets reworked.

The next documents (GDD, narrative bible, art direction, TDD) build on this one. **None of them may contradict it.** If they need to, the concept gets revised first, with explicit sign-off.

---

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Pillars, pitch, competitive set, audience locked from brainstorming session with creative director. |

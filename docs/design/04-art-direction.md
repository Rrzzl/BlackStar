# Black Star — Art Direction Document

**Document owner:** Art Director
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before this one:** [Concept](01-concept.md), [Narrative Bible](03-narrative-bible.md)

---

## 0. Purpose

This document defines the visual identity of Black Star. Its job is to give every artist — and every engineer making art-adjacent decisions — a shared vocabulary for what the game *looks like*. When a pixel-art asset lands in review, this doc is the rubric.

---

## 1. Visual pillars

Three pillars, in priority order. When they conflict, higher-numbered pillars yield to lower-numbered ones.

### Pillar 1: **Readable at a glance**

Black Star is a twin-stick action game. The player needs to parse friend/foe/hazard/pickup/exit in under 200ms during combat. Every design decision — silhouettes, color, contrast, animation — is subordinate to this. *A beautiful screen that isn't readable is a failed screen.*

### Pillar 2: **Lived-in futurism**

Nothing in this galaxy is new. Every ship has dents. Every station has rust. Every corridor has graffiti. Every weapon has wear marks at the grip. The First Ones' ruins are the only exception — their technology looks untouched by time, which is part of what makes them uncanny.

### Pillar 3: **Gritty but not ugly**

The world is broken but not drab. Color is used deliberately and meaningfully. A Free Worlds market is warm and golden. A Hollow Fleet ambush is black and red. A First One ruin is cold blue-white and wrong-looking. The player should *feel* where they are from the palette alone, eyes closed and re-opened.

---

## 2. Art style decision

**Black Star is a 2D top-down pixel art game.**

- Base tile/sprite size: **32×32 pixels** (character sprites, tile size)
- Ship sprite size: **48×48 to 256×256 pixels** (depending on ship class)
- Render resolution: **640×360 internal** (2x scaled to 1280×720 default, 3x to 1920×1080)
- Pixel-perfect rendering (no sub-pixel smoothing) — this is a hard rule

**Why pixel art:**
1. Stylistically distinctive; stands out in a market of 3D space sims
2. Achievable with a small art team
3. Excellent at readable silhouettes (see Pillar 1)
4. Low technical overhead — fewer performance concerns, smaller downloads
5. Ages gracefully — pixel art from 2010 still looks intentional; photorealistic 3D from 2010 looks dated

**Why NOT pixel art alternatives (considered and rejected):**
- Vector art (Hollow Knight style) — wouldn't suit the gritty aesthetic
- HD 2D (Octopath Traveler style) — too expensive, wrong scale for twin-stick
- Low-poly 3D — performance risk, would compete with Starsector's aesthetic
- Hand-drawn (Disco Elysium style) — too expensive for scope

---

## 3. Palette

Black Star uses a **limited master palette** of ~48 colors, with **region palettes** (16 colors each) that characterize specific biomes and factions. Every asset is drawn from the master palette; region palettes are applied as color replacements for atmosphere.

### Master palette principles
- Desaturated mid-tones dominate
- Highlights are always warm (cream, amber, soft gold) unless the scene is deliberately cold
- Shadows are always cool (deep navy, desaturated plum) unless the scene is deliberately warm
- Pure black is reserved for the void of space and the Hollow Fleet
- Pure white is reserved for First One artifacts and lethal lighting (muzzle flashes, explosions)

### Faction palettes

| Faction | Primary | Secondary | Accent | Feel |
|---|---|---|---|---|
| Iron Concord | Brass #b8924a | Steel grey #7a8893 | Deep blue #253b5c | Regimented, worn authority |
| Free Worlds | Sun gold #e8c066 | Bone white #e4ddc4 | Warm red #c84a3a | Market warmth, dust |
| Verdant Church | Deep green #2d5a3e | Gold leaf #c8a050 | Bone ivory #e4ddc4 | Temple calm, unsettling |
| Hollow Fleet | Pure black #0a0a0a | Rust #6b2c20 | Blood red #a81a1a | Ghosts, wrong |
| Scrapfather Syndicate | Neon magenta #d14a8c | Industrial grey #444a52 | Electric cyan #4ac8d1 | Noise, life, danger |
| Verdant Remnant | Warm wood #8a5a34 | Linen cream #e8d9b8 | Soft green #6a8858 | Home, small joys |
| First Ones | Cold white #e8f2ff | Deep blue-black #0a1428 | Impossible teal #4af0d2 | Wrong, beautiful, old |

### Biome palettes
To be developed per biome. Launch-target biomes: alien ruin, crashed ship, feral colony, hive, necropolis, void temple, lab, ice cavern.

---

## 4. Silhouette language

Silhouettes must instantly communicate **role** before the player reads a single color pixel.

### Character silhouettes

| Role | Silhouette hallmark |
|---|---|
| Player character | Taller than most NPCs, distinctive helmet / hood / shoulder shape per class |
| Friendly NPC (civilian) | Rounded, smaller, no weapon held at ready |
| Friendly NPC (armed — guard, crew) | Similar to player but holding weapon lower, shoulder pads |
| Hostile (human) | Jagged silhouette — shoulder spikes, uneven armor, weapon at ready |
| Hostile (feral) | Hunched, four-limbed or multi-limbed, inhuman posture |
| Hostile (First One–derived) | Geometric, too-symmetrical, proportions slightly wrong |
| Elite enemy | Significantly larger + one visually dominant feature (a giant weapon, a crown, a halo) |
| Boss enemy | Screen-filling, unmissable, unique silhouette |

### Ship silhouettes

| Class | Silhouette hallmark |
|---|---|
| Scout | Small, needle-like, wide maneuvering thrusters |
| Fighter | Compact, weapons-forward, short wings |
| Corvette | Medium, balanced, visible weapon hardpoints |
| Freighter | Large central hull, small engines, cargo containers visible |
| Capital | Screen-filling, multi-part, dominates the frame |

**Faction** is communicated through surface details (color, trim, emblems). **Class** is communicated through silhouette (size, shape, proportion). This separation means the player can read "that's an Iron Concord fighter" at a glance.

---

## 5. Environment style

### Space
- Deep black background with subtle starfield (parallax, 2 layers)
- Nebula / dust clouds in faction or system color
- Planets are prerendered pixel art spheres with day/night shading and rotation (optional, cheap)
- Space stations are large sprite assemblages — visually distinct per faction
- Ships emit light (running lights, engine glow) — this is important for reading ship state

### Planets (landed)
- Tile-based environments, 32×32 tiles
- Parallax background layer (distant horizon, nebula, other planets in the sky)
- Foreground lighting: diegetic light sources (torches, holograms, reactors, First One glow)
- Weather effects: sand, snow, rain, ash — used sparingly as biome flavor

### Dungeons
- Interior tile sets with strong silhouette contrast (dark walls, lit floors)
- Light sources are gameplay elements: extinguishing a light can change an encounter
- Walls are opaque to line-of-sight; fog of war reveals as player enters

### Stations (interior)
- Hand-authored set-dressing on procedural floor plans
- Each faction has its own station aesthetic
- NPCs populate stations — the station feels *lived in*, not a menu

---

## 6. Animation principles

### Core rules
- **12 FPS base** for sprite animation (cinematic, readable). Action beats can hit 24 FPS for impact.
- **Anticipation and follow-through** on every meaningful action. No snapping between poses. Even a 2-frame anticipation makes an action feel weighty.
- **Squash and stretch** sparingly — only on impact, landing, and big ability windups. Over-used squash looks cartoonish, which we want to avoid.
- **Idle breath** — every character has an idle cycle with subtle motion. A character standing perfectly still looks dead.

### Combat animation
- **Windup frames** telegraph every enemy attack. The player can always know an attack is coming 200–300ms before it lands.
- **Hit stop** — on impact, freeze both attacker and defender for 2–3 frames. This is the single biggest juice upgrade.
- **Knockback** — all hits produce visible, recoverable knockback. Enemies and players alike.
- **Death animations** — 4 frames minimum, with a final "settled" pose. No pop-out-of-existence unless deliberate (First One enemies evaporating in light).

### UI animation
- Subtle, sparing, fast. UI shouldn't steal attention from gameplay.
- Menu opens and closes in 8–12 frames. No long slides.
- Tooltips appear immediately with a 1-frame fade.
- Damage numbers: pop, rise, fade. ~30 frames total.

---

## 7. Lighting

### 2D lighting is faked but takes it seriously

- Every scene has a **directional tint** — a subtle hue applied to the whole frame that establishes the mood
- Light sources are **sprite overlays** (additive blend) — glow around lamps, fires, muzzle flashes, First One artifacts
- Shadows are **hand-authored** into sprite and tile art, not dynamically computed
- **Dynamic darkness** in dungeons — the player has a limited light radius; rooms beyond are dark until entered
- **Screen darkening** on low health, boss intros, critical moments (used sparingly)

### Light colors
- Warm ambient = safety (stations, Remnant colonies, ally ships)
- Cold ambient = unease (First One ruins, Hollow Fleet engagements, deep space)
- No ambient = active threat (an unlit room in a dungeon means something's wrong)

---

## 8. UI visual style

### HUD
- **Diegetic-inspired but not literal** — HUD elements suggest a ship's display (brackets, tick marks, faint grid backgrounds) but don't pretend to be rendered on a screen inside the game world
- Primary HUD color: soft amber #e8b060 on transparent dark
- Warning color: warm red #d14040
- Critical color: saturated red #ff2020 with pulse animation
- Font: custom pixel font, ~8–10 px tall for HUD, ~12–14 px for dialogue
- All HUD text anti-aliasing OFF (pixel-perfect)

### Menus
- Dark background with amber accents
- Icons are small pixel-art illustrations
- Tooltips show on hover with a small border and description
- Every menu is keyboard-navigable and mouse-navigable in parallel

### Dialogue
- Portrait on the left, text on the right
- Portrait is a ~128×128 pixel art character bust
- Dialogue frame has a faction-colored border
- Speaker name above the text
- Options appear as a small list below, selectable with number keys or mouse

---

## 9. References (mood boards)

These are external games/art/films that serve as visual reference points. This is a *starting point* — not a target. We are not trying to replicate any of these exactly.

### Games
- **Starsector** — ship silhouettes, faction visual identity, space UI language
- **FTL: Faster Than Light** — station interiors, readable combat, HUD minimalism
- **Hyper Light Drifter** — pixel art quality bar, palette restraint, readable silhouettes
- **Nuclear Throne** — twin-stick readability, enemy visual language
- **Enter the Gungeon** — UI style, weapon variety presentation, projectile clarity
- **Dead Cells** — pixel animation fluidity, character rigging quality bar
- **Into the Breach** — telegraphed attacks, calm tactical clarity

### Films
- **Alien** (1979) — lived-in industrial future, practical sets, cold lighting
- **Blade Runner 2049** — color as atmosphere, scale, loneliness
- **Annihilation** (2018) — First One aesthetic reference, wrongness of beautiful things
- **Firefly / Serenity** — tone, faction dynamic, grounded sci-fi
- **Children of Men** — urban decay that still has life in it

### Art references
- Ian McQue ship paintings — lived-in industrial vehicles
- Simon Stålenhag — cold Nordic sci-fi, small figures in big landscapes
- Paul Lehr vintage sci-fi covers — retro-futurism, saturated skies
- Moebius (Jean Giraud) — alien environments, clean linework, unearthly color

---

## 10. Quality bar & review process

### Asset quality checklist

Every asset must pass these gates before entering the game:

- [ ] **Silhouette:** is the subject readable in pure black on a plain background? If not, fix.
- [ ] **Palette:** are all colors from the master palette? If not, justify or fix.
- [ ] **Pixel-perfect:** no sub-pixel placement, no anti-aliased edges, no off-grid rotation.
- [ ] **Animation (if animated):** does it have anticipation, impact, and follow-through? Does it loop cleanly?
- [ ] **Consistency:** does it match the established style of similar assets? (Run it alongside a reference asset and compare.)
- [ ] **Context:** does it read in its intended gameplay context, not just on a flat background?

### Review cadence
- Informal reviews daily during production
- Formal art review weekly, all artists + art director
- External review (other departments) monthly
- Quality audit before each milestone gate

---

## 11. Asset pipeline

- All source files in `assets/src/` as editable formats (Aseprite `.ase` preferred)
- Exported PNGs in `assets/sprites/`, `assets/tiles/`, `assets/ships/`, `assets/ui/`
- Sprite sheets packed via build step; individual files preserved for version control
- Animation data exported as JSON alongside the sprite sheet

---

## 12. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Three pillars, style locked to 32×32 pixel art, palette structure, animation rules, UI style, references. |

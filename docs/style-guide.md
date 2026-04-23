# BLACK STAR — Visual Style Guide

*One page. Meant to be used as: your own reference when drawing, the prompt base when generating with AI, the brief when someone offers to contribute.*

---

## The sentence that explains it

> An illuminated manuscript that has been left in a damp cellar. Everything is hand-drawn, everything is slightly rotted, and everything was once beautiful.

If a piece of art doesn't feel like that sentence, it's not Black Star.

---

## Style

- **Medium:** 2D pixel art. Hand-drawn, not vector. Target internal resolution scales to 1080p clean.
- **Reference North Star:** Blasphemous (The Game Kitchen, 2019). That level of density and craft is the aspiration. We will not hit it immediately. We aim for it.
- **Secondary refs:** Bloodborne's concept art (for tone), Castlevania: Symphony of the Night (for pixel craft), old illuminated manuscripts like the Book of Kells (for ornamentation), Zdzisław Beksiński (for religious horror painting).

---

## Palette

Low-chroma. The game should feel like candlelight and old paper. Pure saturated colors are *rare and intentional*.

Working palette to draw from:

- **Parchment / bone:** `#e8dcc4`, `#c9b896`, `#8b7355`
- **Deep shadow:** `#1a1410`, `#2a1f17`, `#3d2d21`
- **Rust / old blood:** `#6b2818`, `#8b3a22`, `#a04b2c`
- **Cold stone:** `#5a5f65`, `#3e4347`, `#2a2e32`
- **Candle warmth (rare, accent):** `#f4c57a`, `#d89b4a`
- **Ecclesiastical gold (rarer, sacred moments only):** `#c9a04b`

Per-region palettes extend this base:
- **Thorned Provinces:** Rusts + blacks + dried-blood reds
- **Perfected Coast:** Pale marble + pale blue + pale gold (sterile)
- **The Nursery:** Warm woods + soft browns + candle gold (the only warm place)
- **The Argent Court:** Silver-white + cold grey (inverted palette)
- **The Verge:** Muted blues + rain-greys + a single warm orange

---

## Silhouettes

- Characters are **small against architecture**. The Witness should always read as a small figure in a big room. Camera framing should emphasize this.
- Robes and cloaks **hide bodies**. Silhouettes should be tall verticals, not anatomical figures. Blasphemous-style.
- Heads are **slightly too small** relative to hooded silhouettes. Adds gravity, adds otherness.
- Enemies should have **one memorable silhouette feature** that reads from 30 feet away: a crooked spine, a too-long arm, a mask, a crown of something.

---

## Lighting philosophy

- **Rim-lit against dark.** Most scenes should have characters lit from one light source (a candle, a window, a fire) and deep shadow elsewhere.
- **Contact shadows matter.** Characters sit in the world by how their shadows fall on the floor beneath them.
- **Light sources are stories.** A lit candle in a corner means someone was here recently. A dead candle means they left.
- **Sacred moments break the rule.** Gold light, bright parchment, ceremonial whites. Used sparingly — 3-4 times per playthrough.

---

## Proportions

- **Player / Witness sprite:** ~64 pixels tall at 1x internal resolution. Small, slender, hooded.
- **NPCs:** Match Witness scale unless story-specific (Damar is larger, etc.)
- **Bosses:** 2-4x player height. Architecture-scale.
- **Environment tiles:** 16×16 base. Background parallax tiles may be larger.

---

## Line weight and rendering

- **Outlines:** Present but subtle. Dark brown (`#1a1410`) over the base color, not pure black.
- **Pixel perfect, not anti-aliased.** Hand-place every pixel when drawing by hand. AI outputs need pixelation post-processing.
- **Detail density:** Moderate. Not every pixel needs information. Blasphemous-level density is aspirational; at our scale, a calmer rendering is okay.
- **Texture:** Stone has cracks. Wood has grain. Metal has scratches. Nothing is new.

---

## Things the art should never be

- **Sci-fi clean.** This is not a space game in the aesthetic sense. It is a gothic religious world that happens to have ships.
- **Anime-cute.** No large sparkling eyes. No exaggerated expressions. Faces are restrained.
- **Horror for its own sake.** No gore for shock. The horror is always of recognition — *this thing used to be a person and that is the sadness.*
- **Bright or saturated.** If a scene feels cheerful it is probably wrong.
- **Visually noisy.** Negative space matters. Blasphemous-style density requires composition discipline; when in doubt, simpler.

---

## Bloodline imagery (important)

The Visible and Touched Vesh are a core visual motif. Their appearance should be:

- **Restrained, not spectacle.** A row of teeth slightly off. Eyes set too wide. A limb that hangs wrong. *Never* explicit body horror.
- **Beautiful, not grotesque.** They should be renderable as religious icons. They were loved by someone.
- **Saintly in composition.** Think Byzantine icons. Halos of dim gold behind them. Hands positioned for blessing. Eyes that are sorrowful but not hostile.
- **Always dignified.** The game's art must treat them as it treats Elara — as people who have been done wrong to, not as monsters.

---

## AI prompt base

When generating with Midjourney or similar, start with a prompt that includes these elements. Iterate from here.

```
gothic 2D pixel art, Blasphemous style, dark religious fantasy,
hand-drawn pixels, muted low-chroma palette, candlelight,
rusts and deep browns and bone-whites, illuminated manuscript tone,
dense detail, rim-lit shadow, hooded figures, small character
against vast architecture, painterly pixel rendering, ominous,
sorrowful, dignified, --stylize 400
```

Never accept first outputs. Iterate 8-12 times. Discard anything cheerful, bright, saturated, anime-styled, or clean sci-fi.

---

## Community contribution brief (if used)

If someone offers to draw something for the game, send them:
1. This document
2. A link to Blasphemous gameplay footage
3. A specific request (one sprite, one tile set, one portrait)
4. A note: *"We can iterate on it together. First drafts are always a conversation."*

---

## Pixel-art specification (locked 2026-04-21)

The earlier sections of this guide describe the painterly aspiration (Blasphemous as north star). That aspiration stays as the tonal reference for mood, lighting, and subject matter. For the actual shipped art, the project has committed to a more producible target.

**Tonal reference for execution: Chained Echoes / Lisa the Painful.** Not Blasphemous, not Hollow Knight. Blasphemous is too ambitious for solo production and fights the gothic-melancholy tone the game wants anyway. The Chained Echoes level of craft is achievable with Aseprite, AI-assisted references, and discipline.

### Character sprites

- **Scale:** 32-40 pixels tall per character. Big enough for a belted robe, a visible signet, a weapon at the hip. Small enough to animate without pain.
- **Proportions:** Slightly heroic — not chibi. Head-to-body ratio roughly 1:3.5. No smiling. Faces read as weathered, not cute.
- **Faces:** Visible by default. Two-pixel eyes, one-pixel mouths, readable expression. Hooded alternate sprite states exist for ceremony, stealth, and Order rites — but most of the game shows the Witness's face.
- **Construction:** Full-body standing figures. Strong silhouette. Lit implicitly from a single off-frame candle — rim highlight one side, contact shadow below.

### Palette (locked base)

Long Record palette is the canonical base for all world-layer pixel art:

- Deep shadow: `#1a1410`
- Parchment bone: `#e8dcc4`, `#c9b896`
- Ecclesiastical gold: `#c9a04b`
- Candle warmth: `#f4c57a`
- Rust / old blood: `#6b2818`

Mostly locked. Story-beat exceptions permitted but rare:
- Elara may carry one non-palette color (unspecified; discover when she is designed)
- A claimant's throne room may push one unusual hue for visual shock (Argent Court silver-white; a Senate chamber's peculiar green)

Muted, not monochrome. The game should read as *candlelit*, not desaturated.

### Grid discipline

- **Sharp, no anti-aliasing.** Every pixel is placed. Never scaled with smoothing. Aseprite's native export only.
- **One palette per scene** unless a story beat justifies otherwise.
- **Outlines are dark brown (`#1a1410`), not black,** matching the earlier spec.

### Two visual languages — by design

This is the most important partition in the style guide:

- **The world layer** is pixel. Characters, tiles, props, effects. Rendered by the engine's `drawRect` / `drawSprite` pipeline.
- **The Long Record layer** is illustrated — parchment, wax, gold foil, ink, serif typography (IM Fell English, Cormorant Garamond, Uncial Antiqua). Rendered as overlay UI. See `src/ui/LongRecord.html` for the aesthetic target.

They do not bleed. The Record never appears pixelated. The world never appears parchmented. When the Witness writes, the screen flips from one language to the other — that flip is itself a designed beat.

The rare crossover: wax seals, torn pages, and pressed flowers can appear as pixel props in the world (on desks, in safes) while their primary representation remains in the Record.

### Sprite-burden estimate per character

- **Characters in both camera modes** (Witness, Elara if extracted, any companion): top-down front/back/left/right walk cycles + side-view left/right walk, idle, attack, hit, roll. Roughly 10-12 sprite states.
- **Characters in top-down only** (Sevasti, shopkeepers, most NPCs): 4 walk cycles + idle. Roughly 5 states.
- **Characters in side-view only** (enemies, bosses): idle, walk, attack variants, hit, death. Roughly 6-8 states.

### Pipeline

1. AI concept — GPT-Image / Midjourney / Gemini for first-pass reference. Locked prompt forthcoming.
2. Aseprite hand-pixeling, guided by the reference but not tracing it.
3. Frame-by-frame animation: 4-6 frames per walk, 2-4 per attack.
4. PNG sheets into `src/assets/sprites/`, naming convention `{character}_{mode}_{state}_{frame}.png`.
5. Blender is not required. Revisit only if a character demands multi-angle consistency beyond what hand-pixeling sustains.

---

## Typography

Four font families. Each has a specific role. Do not substitute.

- **Cinzel** — institutional. Title card, menus, formal Order documents (edicts, seals, claimant correspondence rendered in the pixel world).
- **Uncial Antiqua** — intimate sacred text. Long Record volume names, founding rite display, ritual inscriptions. Never used in menus or UI chrome.
- **Cormorant Garamond** — prompt text, UI body copy. Acceptable as a Cinzel fallback if Cinzel fails to load for any reason.
- **IM Fell English** — Long Record entry body text. The handwriting-adjacent serif. Used for predecessor entries, player entries, and anything that reads as written-by-hand-in-the-book.

### Loading

Fonts load per-scene. A scene loads only the families it uses:
- TitleScene: Cinzel, Cormorant Garamond.
- Long Record UI: Uncial Antiqua, IM Fell English, Cormorant Garamond.
- In-game pixel-world overlays: Cinzel (for institutional captions), Cormorant Garamond (for body).

A font that pops in mid-fade is a rendering bug. Block scene-enter completion on font readiness.

### License notes

All four families are open-source (SIL Open Font License or similar permissive). Verify license terms in `src/assets/fonts/LICENSES/` before shipping.

---

*Last updated: 2026-04-22. Revisit when the visual language evolves.*

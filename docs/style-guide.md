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

*Last updated: 2026-04-20. Revisit when the visual language evolves.*

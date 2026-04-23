# Title Screen — UI Specification

*Scene: `TitleScene`*
*Authoritative reference: World Bible v6, Part Three "Title Screen (Locked)"*
*Drafted 2026-04-22 from v6 canon. Reconcile with paused-plan Appendix A if it diverges.*

---

## Purpose

The title screen is the player's first and last frame of the game. It is deliberately **non-diegetic** — it sits outside the pixel world and outside the Long Record's illuminated-manuscript language. It is a cinematic gallery. Its job is to establish tone (weight, dignity, distance) before the player clicks into the book.

Clicking **NEW WITNESS** routes into `OpeningSequenceScene` (Acts 0-IV). The title screen is never shown again on that save. Clicking **CONTINUE** loads the most recent Long Record write. **OPTIONS** opens the settings overlay.

---

## Resolution and Rendering

- **Source artwork:** authored at 2048×1024 (16:8, matching the hero composition's cinematic aspect).
- **Engine internal resolution:** 640×360 (unchanged; engine-wide).
- **Rendering path:** source asset loaded as a full-resolution texture and sampled down at draw time to fit the 640×360 framebuffer, preserving the painterly look. No pixel-perfect snapping on the background art.
- **Text overlays** (title card, menu, marginalia) render at engine resolution using the font stack below. Text is crisp at 640×360. Art is soft. The contrast is the point.

This decoupling means source art never needs re-authoring if engine resolution ever changes, and the engine never needs to adopt a cinematic aspect for a single scene.

---

## Six-Scene Rotation

A rotating background cycle. Hero image is the default load; the remaining five cycle on a timer while the player sits on the title screen, with a slow cross-fade between each.

| # | Asset slug | Description | Role |
|---|---|---|---|
| 1 | `impartial-regard` | Ship crossing starfield, planet-horizon glow | HERO — loads on cold start |
| 2 | `concord-chamber` | Witness standing before the nine-seat Concord | Institutional weight |
| 3 | `elara-window` | Elara at the Nursery window | The heir, watching |
| 4 | `long-record` | Book open in candlelight, quill poised | The instrument |
| 5 | `vault` | Shrouded bodies of the Touched | The cost |
| 6 | `claimant-court` | Throne and court, empty of bodies | The vacuum |

**Rotation behavior:**
- Hero displays on cold start and on return-from-menu.
- After 20 seconds of no player input, rotation begins.
- Each image holds 15 seconds, then cross-fades to the next over 2 seconds.
- Rotation order: `impartial-regard → concord-chamber → elara-window → long-record → vault → claimant-court → impartial-regard → ...`
- On player input (any key, any click), rotation pauses and holds the current image. It does not reset to hero.
- On menu-option hover, rotation is paused. On unhover (if no selection made), rotation resumes after 20 seconds.

**Asset paths:** `src/assets/ui/title-screen/{slug}_v1.png` — six files.

---

## Composition — Text Layers

### Title card

- **Text:** `BLACK STAR` (line 1) / `THE NINTH HEIR` (line 2)
- **Font:** Cinzel Bold
- **Color:** Parchment bone `#e8dcc4`
- **Drop shadow:** Deep shadow `#1a1410`, 2px offset down, 40% opacity (at engine resolution — adjust for DPI)
- **Line 1 size:** ~36px at engine resolution (fills ~40% of screen width at 640 wide)
- **Line 2 size:** ~18px at engine resolution (half the line-1 size)
- **Placement:** horizontally centered. Vertical: line 1 baseline at ~30% from top. Line 2 baseline ~50px below.
- **Letter-spacing:** Cinzel defaults, no tracking adjustments.
- **No animation on cold start.** Title is present from frame one.

### Menu

- **Items:** `NEW WITNESS`, `CONTINUE`, `OPTIONS`
- **Font:** Cinzel Regular
- **Size:** ~14px at engine resolution
- **Color (idle):** Parchment bone `#c9b896`
- **Color (hover/selected):** Candle warmth `#f4c57a`
- **Color (disabled):** Deep shadow mixed with parchment, ~40% alpha of idle color
- **Placement:** vertical stack, horizontally centered. Topmost item baseline at ~65% from top. Items spaced 28px apart (baseline to baseline).
- **Spacing:** items fit within the central 30% of screen width.
- **Hover affordance:** color shift + subtle letter-spacing increase (~0.5px).

### Marginalia (footer)

- **Text:** version string and build hash (small, unobtrusive)
- **Font:** Cormorant Garamond Italic
- **Size:** ~10px at engine resolution
- **Color:** Parchment bone `#c9b896` at 60% alpha
- **Placement:** bottom-left, 12px inset from both edges
- **Content format:** `v{semver} · {short-git-hash}` — populated at build time

No other text on the title screen.

---

## State Behavior

### `CONTINUE` enable state

- **Enabled** if at least one valid save exists in the save manager.
- **Disabled** if no save exists (first-run state), or all saves are corrupt/unmigratable.
- When disabled, `CONTINUE` renders in the disabled color with no hover response.
- Determining save existence is a Long Record read. This is TitleScene's only data dependency and the first piece of Long Record read-pattern infrastructure the codebase will need.

### Cold-start sequence

1. Scene enters. Hero image (`impartial-regard`) fades in from black over 1.5 seconds.
2. Title card and menu fade in, offset 0.5 seconds behind the hero image, over 1.0 second.
3. Marginalia fades in last, over 0.5 seconds.
4. Total cold-start sequence: ~3 seconds from scene enter to fully interactive.
5. During the sequence, input is captured but not acted on — a keypress at t=0.5s does not skip to a menu selection mid-fade. Sequence completes, then input resumes.

### Skip-to-interactive

- Any input during the cold-start sequence snaps all fades to complete.
- This is not the same as rotation: it's a one-time skip affordance on first load.

### Exit transitions

- **NEW WITNESS click:** cross-fade to black over 1.2 seconds. Background music ducks to silence over the same 1.2 seconds. At black, route to `OpeningSequenceScene` Act 0. Total: 1.2s.
- **CONTINUE click:** cross-fade to black over 0.8 seconds, route to `LoadingScene` with target save.
- **OPTIONS click:** no scene change. Open `OptionsOverlay` atop the title scene; title scene freezes (rotation paused, fades paused).

---

## Audio

*Audio assets TBD — hooks defined here so scene code can wire to the AudioService when assets land.*

- **Ambient music bed:** a single slow sustained track, looped. Drone-adjacent. Begins on scene enter, fades in over the hero image fade.
- **Hover SFX:** soft parchment-rustle, near-silent, on menu item hover.
- **Click SFX:** low bell-strike on NEW WITNESS. Softer click on CONTINUE/OPTIONS.
- **Rotation transition:** silent. The cross-fade is the only signal.

Asset paths reserved: `src/assets/audio/ui/title-bed.ogg`, `title-hover.ogg`, `title-select-bell.ogg`, `title-select-soft.ogg`.

---

## Typography Loading

Four font families required (see style-guide Typography). For title screen specifically:

- **Cinzel** (Regular + Bold) — title card, menu
- **Cormorant Garamond** (Italic) — marginalia

Other families (Uncial Antiqua, IM Fell English) are not used on the title screen. They belong to the Long Record UI language. Do not load them here.

Fonts must be preloaded before the scene's fade-in starts. A font that pops mid-fade is a rendering bug.

---

## Implementation Notes for Claude Code

- TitleScene is the first scene to exercise the **SceneContext + save-read** pattern. The "has any save?" query is the smallest real Long Record read. Design it such that the Long Record layer, when built, can answer this query without side effects (no migrations triggered, no locks taken, no implicit writes).
- Do **not** preload the opening-sequence assets from TitleScene. The NEW WITNESS transition goes through black; the loading happens there, not here.
- The rotation timer is scene-local state and is discarded on scene exit. Do not persist which background the player last saw.
- Fonts are a scene-level asset dependency. Block scene-enter completion on font readiness.
- Keep the scene update loop cheap. This is the screen the player may leave on their monitor while they make coffee.

---

## Dependencies on Upstream Decisions

- Long Record minimum-viable read interface (has-any-save). Layer 2 Phase B will need to expose this. If Phase C (TitleScene) ships before Phase B, TitleScene stubs the query to `return false` and renders CONTINUE disabled unconditionally.
- Six title-screen background assets at 2048×1024. Only `impartial-regard` (hero) is strictly required for first ship; the remaining five can land progressively, and the rotation can be authored to skip missing assets.

---

## Open Questions

- Cross-fade curve (linear, ease-in-out, specific cubic-bezier). Current default: linear. Revisit once the first two rotation images are in and the transition can be eyeballed.
- Whether the hero image reloads as default on every return-to-title (e.g., after Options close), or whether it resumes from the last shown image. Current default: resumes.
- Localization of title card and menu strings. Deferred — game is English-only for now.

---

*End of title-screen.md. Reconcile with paused-plan Appendix A on first reading; diverge only with reason documented in the changelog.*

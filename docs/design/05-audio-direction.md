# Black Star — Audio Direction Document

**Document owner:** Audio Director
**Status:** Draft v0.1
**Last updated:** 2026-04-12
**Reads before this one:** [Concept](01-concept.md), [Art Direction](04-art-direction.md)

---

## 0. Purpose

Audio is half the atmosphere. This document defines the sonic identity of Black Star — music, SFX, voice, and dynamic audio behavior. It is the rubric for every sound asset that ships.

---

## 1. Sonic pillars

### Pillar 1: **Silence is a weapon**

Silence is the loudest sound in Black Star. Empty ruins have no music. Deep space is quiet except for the hum of your ship. When silence breaks, it matters. Designers who want constant music should be vetoed.

### Pillar 2: **Readable in chaos**

In a crowded combat encounter, the player must be able to tell — by ear alone — what is shooting at them, from where, and whether it is dangerous. Enemy attacks are audible before they land. Friendly fire sounds different from enemy fire. Footsteps and reloads cut through the mix.

### Pillar 3: **Acoustic of place**

The Bazaar sounds like markets and neon. The Verdant Church sounds like temple bells and choir drones. Kepler Reach sounds like wind through broken hulls. Every location has an acoustic fingerprint the player can identify with eyes closed.

---

## 2. Music

### Style
- **Primary genre:** dark ambient with occasional orchestral swells
- **Influences:** Ben Salisbury & Geoff Barrow's *Annihilation* score, Jóhann Jóhannsson's *Arrival*, Vangelis's *Blade Runner*, Cliff Martinez's *Solaris*, the *Starsector* OST, *Hollow Knight* OST for restraint, *FTL* OST for layered tension
- **Avoid:** heroic brass bombast (wrong tone), aggressive synthwave (too upbeat), orchestral-cinematic-trailer music (too generic)

### Instrumentation
- **Foundation:** analog synth pads, tape-warped strings, deep sub drones
- **Texture:** processed acoustic instruments (piano, cello, violin, flute) with heavy reverb/delay
- **Rhythm:** sparse percussion — timpani hits, cloth-muted drums, industrial clangs. No drum kits. No electronic drums.
- **Voice:** wordless choral textures, processed breath sounds, occasional solo vocal fragments
- **Accents:** First One music uses instruments outside the standard palette (metal bowls, glass harp, bowed saw) to signal wrongness

### Track list (launch target)
Rough count: ~35 unique tracks, ~2 hours of music total. Layered stems allow dynamic mixing.

| Category | Count | Examples |
|---|---|---|
| Ambient (per sector/biome) | 8 | "Core Worlds drift," "Frontier marketplace," "Kepler silence," "Lattice hum" |
| Combat (tiered intensity) | 6 | "Pirates," "Hollow Fleet," "boss — human," "boss — feral," "boss — First One" |
| Exploration (per biome) | 8 | "Alien ruin," "crashed ship," "feral colony," etc. |
| Station (per faction) | 6 | "Iron Concord station," "Free Worlds market," "Verdant temple," etc. |
| Story beats | 5 | Title, key cutscene moments, endings |
| Main theme | 1 | Heard in title, credits, once in climax |
| Character themes | 1 | Woven subtly into companion scenes |

### Dynamic music behavior
- **Stem-based mixing.** Each track has 2–4 stems (base, tension, action, resolve) that fade in/out based on gameplay state.
- **Combat trigger:** when an enemy aggros, the combat stem fades in. When the last enemy dies, it fades out over ~4 seconds.
- **Exploration music never interrupts dialogue.** Dialogue volume duck, music stays.
- **Silence preserved:** during stealth, cold approaches, and most ruin interiors, music is OFF. Not quiet — off. This is deliberate and must be defended against well-meaning "fill the empty space" impulses.

---

## 3. Sound effects

### Principles
- **Every sound is source-grounded.** A laser has a firing sound, a travel sound, an impact sound. A player footstep has a shoe material, a surface material, and a weight.
- **Layered, not one-shot.** Important sounds (gunfire, explosions, ability activations) are constructed from 3–5 layers: body, attack, tail, texture, sweetener.
- **Distance attenuation and occlusion.** Sounds quiet with distance, muffle through walls. In space, we cheat (space has no sound) — all ship SFX are diegetic-but-audible with a slight vacuum filter.

### SFX categories and targets

| Category | Count | Notes |
|---|---|---|
| Weapons (base sounds) | 60 | One base set per weapon, randomized pitch on each firing for variation |
| Weapon impacts (by material) | 12 | Metal, flesh, concrete, glass, water, etc. |
| Footsteps (by surface) | 20 | Each surface has 4 variation footsteps |
| Enemy voices | 40 | Vocalizations for each enemy type — alert, attack, hurt, death |
| UI sounds | 15 | Hover, click, confirm, cancel, error, purchase, equip, level up |
| Ambient loops (per biome) | 8 | Background texture that sits under the music |
| Ship mechanical | 20 | Engine idle, boost, jump, damage, alarm, hull breach, etc. |
| Environmental | 30 | Wind, water, electrical, machinery, First One pulses |
| Impact / feedback | 10 | Hit stops, critical hits, kills, level-up chimes |

Total launch target: ~215 base SFX + variations.

### Priority tiers

Not every sound is equal. The mix prioritizes:

1. **Player-critical:** player damage, player death, low health warning, reload, dodge
2. **Threat-critical:** enemy attacks incoming, elite enemy alert, boss phases
3. **Feedback-critical:** kills, pickups, interactions
4. **Atmosphere:** ambient, music, non-critical environmental
5. **Flair:** decorative SFX that can drop without hurting gameplay

The audio engine **ducks** lower-priority sounds when higher-priority ones play. A boss telegraphing a kill move cuts through the mix even if the player is currently hearing ambient wind and their own footsteps.

---

## 4. Voice

### Voice acting policy

**Black Star has limited voice acting.** Full voice acting for every line is out of scope for the target team/budget. Instead:

- **Core cinematics** (~15 in the main story) are fully voice-acted
- **Companion barks** (short reactive lines in dungeons and space) are fully voice-acted
- **Dialogue trees** use *vocalization* — a short wordless sound (grunt, sigh, laugh, hum) that accompanies the text. Similar to Animal Crossing, Undertale, Hollow Knight. Each character has a distinct vocalization set.
- **Narration / lore fragments** are text-only

This mirrors what *Hollow Knight*, *Hades* (for non-main characters), and *Undertale* do. It preserves character voice without requiring 50,000 lines of recorded dialogue.

### Voice direction (for the core cinematics and companions)

- **Natural, grounded performances.** No soap-opera emoting. No trailer-voice.
- **Restraint over energy.** The world is quiet and weary. Performances match.
- **Accent diversity is welcome** but must serve a character, not a stereotype.
- **Re-record-ready:** we budget for 20% re-records in case of casting or performance misses.

---

## 5. Acoustic fingerprints (key locations)

Each major location has a signature sound design the player will learn to recognize.

| Location | Fingerprint |
|---|---|
| **Your ship (interior)** | Warm hum, distant machinery, occasional creak. Safety. |
| **Deep space** | Silence + faint ship hum. Cold. |
| **Iron Concord station** | Clean servo sounds, distant announcements over intercom, echoing corridors |
| **Free Worlds market** | Chatter, music, children, footsteps on stone, occasional ship taking off overhead |
| **Verdant temple** | Low choral drones, bells, water, whispered voices just at the edge of hearing |
| **Scrapfather Bazaar** | Neon hum, loud market chatter, metal on metal, distant music bleeding from multiple sources |
| **Remnant colony** | Farm sounds, wind, tools, human warmth |
| **First One ruin** | Impossibly deep sub-bass hum, distant bell tones, the *occasional sense* that something is breathing |
| **Hollow Fleet ambush** | Sudden silence, then — mechanical rumble, clicks like relays firing, alarm klaxons that seem to come from nowhere |

---

## 6. Mix philosophy

### Loudness
- Reference mix at **-18 LUFS** (a bit quieter than mobile game standard but appropriate for long sessions)
- Peak limit at **-3 dBFS** — leave headroom for dynamic moments
- Dialogue bus dominates: always audible, never ducked below readability

### Channels & spatial
- **Stereo at launch** (mono-compatible)
- **Positional audio** — SFX pan left/right based on source position relative to camera
- **3D audio** is out of scope for launch; consider for post-launch update
- **Haptics** (controller rumble) mapped to key events if controller is supported at launch

### Accessibility
- **Subtitles** for all voiced lines with speaker labels
- **Visual sound cues** option — off-screen threats show a directional indicator on the HUD (colorblind-friendly shape)
- **Music/SFX/Voice volume sliders** in settings, independent
- **Mono audio option** for single-ear listeners

---

## 7. Audio engine requirements

The technical audio system must support:

- Layered one-shots with per-layer volume/pitch randomization
- Stem-based music with crossfades
- Positional attenuation and optional occlusion
- Priority-based voice limiting (cap of ~32 simultaneous voices)
- Low-latency firing (< 50ms from trigger to playback)
- Reverb zones (station, temple, open space, ruin interior)
- Audio bus hierarchy (master → music/sfx/voice/ambient → individual sound groups)

Implementation: See `docs/tech/01-tdd.md` §audio-system. Likely a custom WebAudio wrapper or [Howler.js](https://howlerjs.com) as a starting point.

---

## 8. References

### Game audio
- *FTL: Faster Than Light* — brilliant use of silence, sparse percussion for tension, music duck on combat
- *Starsector* — long ambient tracks, sector-based music, restrained instrumentation
- *Hollow Knight* — stem-based dynamic scoring, character vocalizations, silence as weapon
- *Dark Souls* — layered ambient, silence in ordinary areas, music reserved for bosses
- *Dead Space* — horror sound design, directional audio, panic moments

### Film audio
- *Annihilation* (Salisbury & Barrow) — uncanny, organic, escalating tension
- *Arrival* (Jóhannsson) — vocal textures, low drones, sense of scale
- *Blade Runner 2049* (Zimmer/Wallfisch) — harsh synths, expansive spaces
- *Solaris 2002* (Martinez) — cold, melancholy, spacious
- *Dune* (Zimmer) — throat singing, processed voices, industrial percussion

---

## 9. Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-04-12 | Initial draft. Three sonic pillars, music style, SFX targets, voice policy, acoustic fingerprints. |

# Black Star — Project Handoff

Snapshot date: 2026-04-23 (evening session)
Aligned to: world-bible-v8-1.md (authoritative canon)
Companion to: black-star-glossary-v8-1.md
Purpose: operational state. Read this first when starting a new chat or session.

## Read Order for Someone New

1. This file (5 minutes) — know what's happening.
2. black-star-glossary-v8-1.md (3 minutes) — scan terminology.
3. world-bible-v8-1.md (45 minutes) — comprehensive canon.
4. The repo — check git log for current state of code and docs.

If you are picking up mid-session and just need to contribute: v8.1 is self-contained. Everything else is subordinate to it.

## Who's Doing What

- Ricky — solo developer. Owns all canon decisions. Sets direction.
- Chat partner (Claude) — story, worldbuilding, design, briefs, handoffs, review of outputs. Holds the canon between sessions.
- Claude Code (in VS Code) — repo implementation, docs commits, code scaffolding. Reads the actual filesystem.
- GPT-Image-2 — visual assets and design specs.

Files or copy-paste prompts only. Chat partner does not have filesystem access to the repo.

## The Central Fact

v8.1 is the authoritative world bible. It supersedes everything prior (v5, v6, v7 patch, v7.5 if it existed, v8 morning). All earlier bibles archive to docs/_archive/production/.

The v8.1 changes from v8 are substantial but do not contradict v8's core cosmology. v8 established the one-Witness truth. v8.1 extends it:

- The Black Star is older than the first Witness. It ran the cycle through other vessels across eternities. The Witness-form is a specific institutional arrangement that began with the first Witness's original walking.
- The chamber figure's wound is consent that outlived its context. He agreed to become the vessel originally for reasons that have not survived in his own memory.
- His original deeds are public galactic history — eight named atrocities every player hears. Only hunters connect them to the current Witness.
- The progression mechanic is the Witness-Elara-relic loop. Eight relics retrieved from realms, opened by Elara, yield eight powers.
- Memory-return entries in the Long Record are hunter-only, gated behind environmental triggers in each realm.
- The ritual ending is genuinely hidden (Rule 12). Many players never find it. No nudging.
- The game is GRRM-route (Rule 13). Kills don't feel morally proportional. Every ending is paid for in specific bodies.
- Open-world after the opening. Eight-plus realms accessible in any order. Difficulty communicated diegetically.
- Ending-specific kill requirements. Each surface ending requires a specific subset of claimants killed/spared.
- Aftermath layer. Three or four claimants get full authored aftermath; the rest carry generic acknowledgment.
- Elara is an active companion witness. She reacts to kills and sparings. Her relationship to the Witness shifts.

If a new chat asks about canon, point them at v8.1.

## In Flight Right Now

### 1. Layer 1 docs commit (possibly landed)

Status as of 2026-04-23 morning: Handed to Claude Code 2026-04-22. Unverified.

What it does: Adopts v6 as canonical (v8.1 now supersedes), archives v5 + black-star-lore.md + HANDOFF-2026-04-22.md, writes title-screen.md UI spec, relocates four malformed PNG drops, removes redundant .gitkeeps, patches compass.md + BLACK-STAR-HANDOFF.txt + style-guide.md.

Verify on resume: git log for commit message "docs: adopt v6 world bible; supersede v5; add title-screen spec". Confirm file moves and PNG relocations.

Note: Even though v8.1 supersedes v6, Layer 1 commit is still valuable — it cleans up the repo. After Layer 1 lands, a separate commit archives v6 and promotes v8.1.

### 2. v7.5 consolidation (may or may not have landed)

Status as of 2026-04-23 morning: Handed to Claude Code 2026-04-22 late evening. Unverified.

v8.1 supersedes v7.5 entirely. If v7.5 landed, archive it. If v7.5 was not yet written, tell Code to stop writing it.

### 3. v8 adoption (skip — v8.1 replaces)

v8 was written 2026-04-23 morning. v8.1 (evening) supersedes v8. Drop v8.1 at docs/production/world-bible-v8-1.md directly and archive all prior bibles including v8.

### 4. v8.1 adoption (next action)

Status: v8.1 written 2026-04-23 evening by chat partner alongside updated glossary and handoff.

Needs to happen: Drop world-bible-v8-1.md at docs/production/world-bible-v8-1.md. Drop black-star-glossary-v8-1.md at docs/production/black-star-glossary-v8-1.md. Drop black-star-handoff-v8-1.md at docs/production/black-star-handoff-v8-1.md. Archive all pre-v8.1 bibles to docs/_archive/production/. Update compass.md and BLACK-STAR-HANDOFF.txt to cite v8.1. Commit as "docs: adopt v8.1 world bible; archive all prior versions".

Do not create a v8.2 patch on top of v8.1. When next major changes happen, write v9.

### 5. Taker spritesheet v1

Status: Generated and accepted with documented deviations.

Location in repo: docs/production/art-reference/takers/taker_spritesheet_v1.png — verify actually present.

Canonical: Poses 1–5 (Hero, Front, Back, Profile, Walking Stride).
Supplementary (bonus, not canon): Poses 6–8.
Missing: Three one-off prompts queued (taker-oneoff-prompts-v1.md) — signet retrieval, book lift, dead-with-hood-fallen. Run when ready.

## Canon State — What V8.1 Locks (Beyond V8)

Cosmology:
- The Black Star predates the first Witness. It has run the cycle across eternities through many vessels. The Witness-form is the specific institutional refinement that began with the first Witness's original walking.
- The chamber figure's original consent is his wound. Not grief. He agreed to this, long ago, for reasons that have eroded in his own memory across sleeps.
- The Order formed around the first Witness partly as priesthood, partly as containment apparatus. The rites that summon him are also the rites that ensure his return.

Historical weight:
- The first Witness committed eight specific historical atrocities during his original walking. These are public galactic history — named events on textbook record. Every player hears them. Only hunters connect them to the current Witness.
- The deeds split into two registers: four founding-act (political, documentary, institution-building atrocities) and four channeling-act (direct, cosmic-scale acts during god-in-flesh periods).
- Miriath's killing is iteration two's ritual climax. She was Resonant Gifted. Her death was the bridging sacrifice. Elara parallels her structurally in iteration three — the cycle structurally produces a Resonant Gifted in the host bloodline at each ritual-ripe moment because the ritual requires one.

Progression mechanic (primary):
- The Witness-Elara-relic loop is the game's main leveling system.
- Each claimant realm yields a relic from its boss encounter. The relic is an object from one of the first Witness's original deeds, preserved across centuries by the faction.
- The Witness brings the relic to Elara. Elara's Resonant Gift opens the relic (does not consume). She extracts the method — the ability the first Witness used to produce the relic originally. She gives it to the current Witness.
- Opened relics display in the ship cabin. Over the game, the cabin fills with eight opened relics. By endgame, it is a reliquary.
- Memory-return: separately, if the player triggered the correct environmental event in the realm, Elara's opening also produces a Long Record entry in the Witness's own hand from centuries ago, describing the original deed. Hunter-only content.

Combat and powers:
- Powers split across two registers — founding-act (authority, naming, social unbecoming, documentary cruelty) and channeling-act (direct combat force, fire, devastating strikes).
- Roughly 4+4 across the eight.
- Powers scale with realm tier — early realms yield foundational abilities, later realms yield signature abilities.
- Starting kit: short blade, bow, basic dodge. No relic-derived abilities at start.

World structure:
- Open-world after the opening.
- Opening is fixed: wake in cabin, receive Sevasti's letter, retrieve Elara from Nadezh's Verge orphanage. Establishes ship, Elara, Long Record, first blood-taking ritual (the unlock for the relic system).
- After opening, seven-plus realms available in any order. Difficulty communicated diegetically — enemies in high-tier realms hit hard and resist, low-level player either dies, retreats, or skill-substitutes through.
- Souls-grammar.

Endings:
- Six surface (α Elara, β Nadezh, γ Sevened, δ burn Record, ε throne). Three hidden deep-lore (η kill chamber figure, θ release / apocalyptic, ι return).
- Each surface ending requires a specific subset of claimants killed/spared. Not shown as checklist — emerges through political logic.
- Ritual ending ζ requires all eight claimants killed, all eight relics opened, full memory-return progression, Elara alive and present. No escape hatch (Rule 3).
- Ritual ending is genuinely hidden (Rule 12). No nudging toward it after surface endings. Many players never find it.

Moral architecture:
- GRRM-route (Rule 13). Kills don't feel morally proportional. Sparing has its own costs. The arithmetic never balances.
- Aftermath layer: consequences of kill/spare choices reported back through bridge console news, letters, NPC dialogue on later realms, Long Record entries. Triggers tied to game-clock (realms completed, rest periods) not sequence position. Staged authoring: three or four claimants get full treatment, rest carry generic acknowledgment.

Elara as active companion:
- Travels with the Witness aboard Impartial Regard the whole game.
- Does not fight. Ever. Preserved from v8.
- Witnesses the kills (through presence, Long Record entries, the Witness returning with blood on his hands or without).
- Reacts. Her relationship to the Witness shifts based on his specific record of kills and sparings.
- Writes in the Long Record in her own hand sometimes.
- Does not know, at game start, that the current Witness is the chamber figure. Discovers alongside the hunter-player through the ritual's progression.
- Auriel's letters to her are fragmentary. Some of his instructions are wrong.

Claimant-heir structure:
- Per-realm relationship, not uniform.
- Some realms: distinct figures (Damar and his disfigured cousin).
- Some realms: same person (Nadezh is Vesh, is the claim and the heir).
- Some realms: regent arrangement (Sevened — Ise Varn operates, Vesh senator is functional heart).

## Deferred / Open

### Needs workshop (in rough priority order)

1. The chamber figure workshop. His god-in-flesh period. What his consent was (what he agreed to in the moment before the original walking). The emotional register of the chamber meeting scene (horror, kinship, grief, rage — all possible, player dialogue shapes which). His pre-original-walking identity is proposed permanent mystery but still formally Open until confirmed.

2. The eight deed-relic-power sets. Each needs: specific atrocity described, relic's current physical form and holder, environmental memory-trigger in the realm, Long Record entry the trigger produces, Elara-opening act, resulting power (mechanical design), Elara-reaction to the Witness bringing the relic home. This is the bulk of canon authoring remaining.

3. Miriath's killing and the specific parallel to Elara. What was the act. What object remains from it. Whether that object is an obtainable relic or is held specifically.

4. The ninth claimant. Current candidate concept: a figure who doesn't want the throne and is being overruled by their own political structure. Full workshop pending.

5. Ending-specific kill requirements. Final authored shapes for α, β, γ, δ, ε.

6. Aftermath authoring for the three or four full-treatment claimants.

7. Elara's reaction content for each kill and sparing.

8. Cover-story cracking moments — one per background (six total).

9. Ioran Kest's specific knowledge and dialogue when reached.

10. Ioran's specific environmental breadcrumbs that lead a player to him.

11. Full class design locks for Keepers, Elders, Inquisitors, Scribes (Takers locked).

12. Full character briefs — Sevasti, Witness production sheet, Elara production sheet, chamber figure visual, claimants, companions.

### Naming deferred

- The Black Star's true name, form, being.
- The chamber figure's true name (proposed permanent mystery).
- The Ruling Before's dynasty name.
- The first-recorded dynasty's name.
- The rebellion's name.
- The first Witness's original ritual name.
- The specific names of the eight original deeds (Long List is a working example only).
- The Tessarene bindery sisters' names.

### Game design deferred

- The Witness's specific 8 powers (rough register locked: 4 founding-act + 4 channeling-act).
- Specific mechanical design of each power.
- Specific Beat 2 Taker protocol-break line (candidates listed in v8 Part Seven).
- Former-Taker NPC (Beat 3) location and details.
- Cover-story cracking mechanic for Act II backgrounds.
- Dynasty duration (current placeholder: over a thousand years; may extend to two thousand).
- Whether blood-taking ritual persists throughout game or is a one-time unlock for relic system.

### Assets pending

- Chamber figure visual (blocked on partial character workshop).
- Witness full production spritesheet.
- Sevasti character brief.
- Elara full production spritesheet.
- Three one-off Taker poses (prompts ready).
- All remaining claimant briefs.
- Nine Vesh heirs' visual designs (one per claimant realm).
- Eight opened-relic visual designs (for ship cabin display).

## Asset Manifest

### In repo (verified or assumed)

| File | Status | Location |
|------|--------|----------|
| witness_characterbrief_v1.png | v1 brief | docs/production/art-reference/witness/ |
| elara_vesh_characterbrief_v1.png | v1 brief | docs/production/art-reference/elara/ |
| title-screen-hero-v1.png | reference | docs/production/art-reference/ui/ |
| title-screen-pitch-v1.png | reference | docs/production/art-reference/ui/ |
| taker_spritesheet_v1.png | accepted with caveats | docs/production/art-reference/takers/ |

### Pending generation

- taker_signet_retrieval_v1.png (prompt ready)
- taker_book_lift_v1.png (prompt ready)
- taker_dead_beat1_v1.png (prompt ready)
- Chamber figure visual
- Sevasti character brief
- Witness full production spritesheet
- Elara full production spritesheet
- Nine Vesh heirs (one per claimant realm)
- Nine claimants' briefs
- Eight opened-relics visual designs

### Canonical docs

- world-bible-v8-1.md (authoritative) — docs/production/
- black-star-glossary-v8-1.md — docs/production/
- black-star-handoff-v8-1.md — docs/production/
- ui-specs/title-screen.md — docs/production/ui-specs/
- _archive/production/world-bible-v5.md (archived)
- _archive/production/world-bible-v6.md (archive when v8.1 lands)
- _archive/production/world-bible-v7-patch.md (archive when v8.1 lands)
- _archive/production/world-bible-v7-5.md (archive if it was written)
- _archive/production/world-bible-v8.md (archive when v8.1 lands)
- _archive/production/black-star-lore.md (archived in Layer 1)
- _archive/production/HANDOFF-2026-04-22.md (archived in Layer 1)
- Prior glossary and handoff (v8 versions) archive to _archive/production/ alongside v8 bible.

### Session artifact files (reference only, not canonical)

- takers-design-lock.md — folded into v8.1 Part Seven.
- taker-brief-v2.md — the brief used for spritesheet v1.
- taker-gpt-prompt-v2.md — the GPT prompt used.
- taker-v1-acceptance.md — template for future asset acceptance.
- taker-oneoff-prompts-v1.md — keep active until poses generated.

## Immediate Next Steps (First Session Back at Desktop)

1. Verify Layer 1 commit landed. Check git log.
2. Verify or discard v7.5 (archive if written).
3. Drop v8.1 trio (bible, glossary, handoff) into docs/production/. Archive v6, v7 patch, v7.5 if present, and v8. Commit.
4. Update compass.md and BLACK-STAR-HANDOFF.txt to cite v8.1 only.
5. Verify Taker spritesheet in correct path.
6. Pick next creative task from options below.

## Creative Task Options (Pick What Grabs)

A. Chamber figure workshop. The keystone. His god-in-flesh period, his original consent, the emotional register of the chamber meeting. Highest leverage. Unlocks his visual brief and the three hidden endings' full specificity.

B. First deed-relic-power set (Damar / Thorned Provinces). The prototype. Design the full chain for one realm: the first Witness's iteration-one military atrocity in concrete detail, the preserved relic at Damar's court, the environmental memory-trigger in the Thorned Provinces, the Long Record entry, Elara's opening act, the resulting channeling-act power with mechanical design. Once Damar's chain works, the remaining seven can be patterned from the template.

C. Ninth claimant workshop. The placeholder slot. Candidate concept: the figure who doesn't want the throne and is being overruled. Identity, realm, Vesh heir, original-deed connection, relic.

D. Witness full production spritesheet brief. Same pattern as Takers. v8.1 context loaded in.

E. Elara companion brief + production spritesheet. Her visual design across ages 11 to 15, her relic-opening pose, her Verge retrieval scene.

F. Auriel's agenda workshop. Fragmentary prescience specifics — what he got wrong, what he got right, which letters in Elara's testament are the wrong ones.

G. Sevasti character brief.

H. Keepers design lock. Next Order class.

I. Founding rite text. The prayer in Act I. Pure writing.

## Code Task Options (Layer 2, sequenced)

- Phase A — Confirm src/engine/Renderer.ts targets 640×360. Read-only reconnaissance.
- Phase B — Long Record data layer. Highest-leverage. Append-only log, "cannot be unwritten" invariant, migration from v4, tests. No UI yet.
- Phase C — TitleScene replacement per title-screen.md.
- Phase D — TopDownController + minimum walkable CabinScene.
- Phase E — OpeningSequenceScene skeleton (Acts 0–IV state machine).
- Phase F — WitnessCreationScene.
- Phase G — Long Record book UI.
- Phase H — ShipInteriorScene expansion.
- Phase I — TravelScene system.

Do not skip phases. Each phase is a gate-clean commit.

## Pipeline Notes

### What works

- GPT-Image-2 holds identity across multi-pose sheets (proven on Takers).
- Written-brief → generation → verification-against-brief → accept-with-caveats-or-regenerate is the correct workflow.
- Claude Code handles doc commits reliably when given concrete path instructions.

### What's flaky

- GPT-Image-2 creative substitution — will invent poses or add ornaments unauthorized. Always review against brief before accepting.
- Chat partner (Claude) occasionally pattern-matches creative momentum as fatigue. Rule: if Ricky says he is working, trust that.

### What's still unknown

- Whether the chongdashu sprite-sheet pipeline will produce usable in-game sprites at our 32–40px scale. Defer testing until Phase F.
- Whether GPT-Image-2 can hold consistency across different characters in the same project. Test with Sevasti's brief.
- Whether direct in-game sprite generation will ever be viable for Black Star's scale.

## Session-Level Context

### What recent sessions did

2026-04-22 (long session): Started with v6 review, wrote v7 patch through a day of design work. Took Order from "shadowy institution" to "fanatical cult of the Black Star." Locked the three-architects model, the cyclical history, the chamber figure as priest-host, three hidden endings, low-fantasy commitment. Wrote Takers full design lock. Generated and accepted Taker spritesheet v1.

2026-04-23 morning: Ricky reviewed v7 patch, locked smaller decisions, then proposed the structural rework: nine claimants each hold a Vesh heir at their heart; Elara met at opening as leveling companion; ritual-sacrifice moved to hidden deep-lore path; then the biggest single move — there has only ever been one Witness, and the chamber figure is his sleeping self. Ioran Kest locked as a prior waking who refused to sleep. v8 written as the consolidated canon.

2026-04-23 evening: GPT's outside-read prompted the next round of sharpening. Ricky locked: Black Star predates the first Witness (Rule 14 new); the chamber figure committed specific terrible deeds during his original walking, Order formed around him partly for containment, his wound is consent that outlived its context; original deeds are public galactic history; ritual ending genuinely hidden (Rule 12 new); progression is Witness-Elara-relic loop; powers split founding-act / channeling-act; memory-returns are hunter-only environmental-trigger content; open-world after opening; ending-specific kill requirements (Rule 13, GRRM-route new); aftermath layer; Elara as active companion witness; claimant-heir varies per realm. v8.1 written as consolidated canon.

### The two failure modes to avoid

1. Rewrite loop. Black Star has real quality. Do not scrap-and-restart. New ideas fold in as additions, not replacements, unless genuinely contradictory.

2. Canon drift from AI pattern-matching. GPT and even Claude will reach for familiar story shapes. Ricky consistently steers toward tragedy, ambiguity, low fantasy. When an AI proposes something that sounds profound, check it against v8.1's Hard Rules before accepting.

### What Ricky responds to

- Push back on sentimentality.
- Terse code direction, prose-heavy story direction.
- Ask clarifying questions on big creative calls.
- When he says "AAA," he means take it seriously, not commercial scope.
- He is sometimes tired but does not appreciate being told he is tired. If he says he is working, trust that.

End of handoff. For depth: world-bible-v8-1.md. For quick-reference terminology: black-star-glossary-v8-1.md.

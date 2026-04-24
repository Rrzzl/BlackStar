# Black Star — Systems Spine v1

## 1. Purpose

This document is the implementation bridge between Black Star v8.1 canon and the codebase. It translates the world bible, glossary, and handoff into concrete architecture requirements future Codex tasks can implement without reinterpreting lore.

`docs/production/world-bible-v8-1.md` is the canon authority. `docs/production/black-star-glossary-v8-1.md` is the terminology authority. `docs/production/black-star-handoff-v8-1.md` is the operational-state authority. `world-bible-v8.md` is archived reference only for design, art, workflow, and code-architecture material explicitly preserved by v8.1; it must not override v8.1.

This document does not add canon. Where v8.1 marks content as workshop-pending, the implementation should model the slot and leave authoring data unset until canon exists.

## 2. Production Decision

Black Star will follow a hybrid rebuild.

Preserve the custom TypeScript engine where useful: renderer, input, scene framework, asset/audio services, tests, and the existing side-view platformer substrate. The engine is already aligned with a small custom 2D pixel-art game and should not be replaced without explicit direction.

Rebuild Black Star-specific game-state systems cleanly around v8.1. Old space-combat, economy, ship-loadout, and sector-simulation structures may remain archived, but they should not define the new state model. The new spine centers the Long Record, world state, claimant/heir decisions, Elara, relic progression, aftermath, ending eligibility, and the ship/cabin hub.

Preserve the v8/v8.1 presentation commitments: hybrid camera, two combat modes, ship-as-walkable-hub, scripted travel, five-act opening sequence, strict palette, Long Record as illuminated manuscript UI, and title screen as a later non-diegetic cinematic gallery. These are implementation constraints, not optional flavor.

## 3. Core Gameplay Loop

The intended loop is:

1. The Witness wakes into the current waking.
2. The player reads and writes through the Long Record.
3. The ship cabin acts as the central hub.
4. The player chooses travel from the ship.
5. The player enters a claimant realm.
6. The realm resolves claimant, Vesh heir, and relic outcomes.
7. The Witness returns to the ship.
8. Elara opens the recovered relic.
9. The Long Record writes consequences, powers, and optional memory-return entries.
10. Aftermath unfolds through news, letters, later dialogue, and Record entries.
11. Ending eligibility changes based on committed state.

This loop must work in open-world order after the fixed opening. Systems must not assume a single fixed claimant sequence.

Every ship journey should be eligible to become an authored beat. Travel is not a generic loading screen; it is a delivery surface for Long Record entries, letters, companion remarks, dreams, arguments, aftermath, or silence.

## 4. Global State Model

The codebase must track the following high-level state domains. Field names here are examples for implementation discussion, not TypeScript declarations.

- Player/Witness state: `wakingId`, `chosenName`, `coverBackground`, `bodyState`, `knownTruthLevel`, `startingKit`, `unlockedPowers`, `deathCount`, `currentScene`.
- Long Record state: `recordId`, `entries`, `lastCommittedEntryId`, `readCursor`, `slotMetadata`, `migrationVersion`.
- World clock/progression state: `worldDay`, `realmsCompletedCount`, `restsTaken`, `openingComplete`, `midgameTurnsSeen`, `deepPathSignalsFound`.
- Realm state: `realmId`, `availability`, `tier`, `visited`, `completed`, `resolution`, `difficultySignalsSeen`.
- Claimant state: `claimantId`, `realmId`, `status`, `playerJudgment`, `endingRelevance`, `aftermathProfile`.
- Vesh heir state: `heirId`, `realmId`, `relationToClaimant`, `status`, `knownToPlayer`, `extractedToShip`.
- Relic state: `relicId`, `realmId`, `register`, `recovered`, `openedByElara`, `displayedInCabin`, `powerId`, `memoryTriggerRequired`.
- Elara state: `presentOnShip`, `aliveState`, `relationshipFlags`, `reactionHistory`, `coReadEntries`, `knownTruthLevel`.
- Memory trigger state: `triggerId`, `realmId`, `found`, `foundAtProgressMarker`, `unlockedEntryId`.
- Aftermath state: `eventId`, `sourceRealmId`, `queueState`, `deliveryChannel`, `eligibleAt`, `deliveredEntryId`.
- Companion state: `companionId`, `present`, `trustState`, `placementRevealed`, `reactionFlags`.
- Ending eligibility state: `endingId`, `status`, `requirementsMet`, `blockedReasons`, `hiddenPathDiscovered`.
- Ship/cabin state: `roomsUnlocked`, `lettersAvailable`, `bridgeNewsItems`, `displayedRelics`, `deskState`, `travelTargets`.

All durable changes must eventually be representable as committed Long Record entries or as deterministic derivations from those entries.

## 5. Long Record System

The Long Record is the save system and the narrative artifact. It is append-only. A committed write cannot be edited, removed, reordered, or silently replaced.

Core requirements:

- Each entry has a stable `entryId`.
- Each entry records a world progression marker: clock value, realm count, rest count, or opening act marker.
- Each entry records a category.
- Reading is side-effect-free. Reading must not migrate, repair, commit, or unlock content by itself.
- Writing is explicit. A write represents an irreversible player/game commitment.
- Save equals write. Progress is preserved by appending an entry, not by overwriting a monolithic snapshot.
- Death/reload behavior must respect committed entries. Death without a recent write means the next waking inherits consequences without context.
- Migrations must move away from overwrite-style save snapshots toward an entry log plus derived state.

Entry categories should include at minimum:

- `current_waking`: entries written by or about the active Witness.
- `prior_waking`: historical entries from earlier wakings.
- `elara`: entries written by Elara in her own hand.
- `memory_return`: hunter-path entries surfaced by relic opening plus memory trigger.
- `aftermath`: consequences learned after leaving a realm.
- `realm_resolution`: claimant/heir/relic resolution commits.
- `relic_opening`: Elara opening a relic and granting a power.
- `travel`: authored travel beats.
- `death`: death, dormancy, or waking-transition markers.
- `system`: migration and slot metadata entries, if needed.
- `opening`: Body, Bell, Binding, Taking, and Desk commitments.

The Long Record must distinguish durable facts from presentation. The same committed entry may drive save restoration, book UI, scene unlocks, aftermath delivery, and ending eligibility.

Long Record presentation belongs to the illuminated-manuscript UI language: parchment, ink, wax, gold, Uncial Antiqua for sacred headings, and IM Fell English for entry body text. The data layer must not depend on that presentation, but it must expose enough metadata for the UI to render current-hand, prior-hand, and Elara-hand entries differently.

## 6. World State System

World state should be derived from committed Long Record entries plus current runtime state. The committed log is the source of durable truth; runtime state is temporary until written.

Derived world state must answer:

- Which realms are available.
- Which realms have been visited or completed.
- Whether each claimant is `unresolved`, `killed`, `spared`, `allied`, or otherwise canonically resolved.
- Whether each Vesh heir is `unknown`, `alive`, `dead`, `extracted`, `hidden`, or otherwise canonically resolved.
- Whether each relic is `unknown`, `available`, `recovered`, `opened`, or `displayed`.
- Whether each memory trigger is `not_found` or `found`.
- Whether aftermath is `queued`, `available`, `delivered`, or `expired`.
- Whether endings are `unknown`, `eligible`, `blocked`, `locked_out`, or `entered`.

Realm availability is open-world after the fixed opening. Difficulty is diegetic and should live in realm data and encounter behavior, not in a visible checklist or hard global level gate.

Ending lock/unlock state is internal. The player should infer requirements through political logic, dialogue, news, letters, and Record material.

## 7. Claimant Realm Module Pattern

Every claimant realm should follow a reusable module pattern:

- Realm ID: stable key, such as `damar_thorned_provinces`.
- Claimant: political claimant at the realm center.
- Vesh heir: the heir relationship for that realm.
- Realm tier: intrinsic difficulty band, hidden from UI.
- Gameplay mode: top-down exploration by default; side-view only for authored boss setpieces.
- Encounter taxonomy: claimant forces, Order enforcement, Concord enforcement, realm beasts, wildlife/hazards, or secret bosses.
- Boss/relic source: encounter or resolution that yields the relic.
- Resolution choices: kill, spare, alliance, extraction, refusal, or realm-specific equivalent.
- Environmental memory trigger: optional hunter-path interaction that wakes the relic's history.
- Relic: object recovered from the realm, with register and power mapping.
- Elara opening scene: ship-side scene where Elara opens the relic.
- Aftermath events: generic or full authored consequences.
- Ending relevance: which endings the claimant/heir state can affect.
- Long Record entries produced: realm resolution, relic recovery, memory-return, aftermath, Elara reaction.

Damar Hul / Thorned Provinces is the prototype. His module should model him as the Penitent King, his disfigured Vesh cousin as a claimant-heir relationship, his Crown Wars echo, and a channeling-act relic slot. Do not invent the specific relic, power, memory trigger, or final kill/spare requirements until canon authoring locks them.

## 8. Relic and Power System

There are eight relics tied to the first Witness's original deeds. Each is recovered from a claimant realm, brought back to the ship, opened by Elara, and left displayed in the cabin.

Relic lifecycle:

1. `unknown`: not yet surfaced to the player.
2. `identified`: the realm or faction context points toward the relic.
3. `recovered`: the Witness has obtained it from the realm.
4. `opened`: Elara has opened it and unlocked its power.
5. `displayed`: the relic is placed in the cabin reliquary.

Opening a relic unlocks a Witness power. It does not consume the relic. If the realm's environmental memory trigger was found before opening, the same opening may also create a memory-return Long Record entry in the Witness's prior hand.

Relic opening is a scene, not a menu transaction. The player should approach Elara or the relevant ship/cabin interaction point, the opening should commit through the Long Record, and the resulting power should appear as a consequence of the scene.

Power registers:

- Founding-act powers: authority, naming, documentary cruelty, social unbecoming, institutional force.
- Channeling-act powers: direct combat force, fire, devastating strikes, god-in-flesh force.

The exact eight powers, relic forms, holders, and triggers are workshop-pending. Implementation should support these as data-driven slots.

## 9. Elara System

Elara is a non-combat companion. She travels with the Witness, does not fight, opens relics, witnesses consequences, reacts to choices, co-reads the Long Record, and sometimes writes entries in her own hand.

Elara state must track:

- Whether she is present on the ship.
- Whether she is alive, absent, endangered, sacrificed, extracted, or safe.
- Her relationship/reaction state toward the Witness.
- Reactions to specific claimant kills, sparings, alliances, and heir outcomes.
- Which relic openings she has performed.
- Which Long Record entries she has co-read.
- Which entries she wrote herself.
- Her knowledge of the Witness's identity and the chamber figure truth.

Elara reactions are not a morality meter. They are authored content keyed to specific committed facts. Sometimes a sparing may wound the relationship more than a kill. Sometimes approval may be warm but costly. The system must support specific reactions, silences, entries, and later scene variants.

Elara state affects endings. Ending zeta requires Elara alive and present until the sacrifice path. Other endings may depend on whether she is alive, named, protected, endangered, or politically positioned.

The first blood-taking ritual establishes the bridge that makes relic opening possible. Later relic openings may use that established bridge unless canon later requires repeated blood-taking scenes.

## 10. Aftermath System

Aftermath is a queue of consequences caused by realm resolutions. It is delivered after the player leaves a realm, not at a fixed global sequence point.

Delivery channels:

- Bridge console news.
- Letters at the cabin desk.
- NPC dialogue in later realms.
- Long Record aftermath entries.

Aftermath events should support:

- Source realm and source decision.
- Generic or full authored treatment.
- Eligibility timing based on realms completed, rests taken, world clock, travel events, or Record writes.
- Delivery channel.
- Whether delivery has been seen or written.
- Optional follow-up events.

Three or four claimants will receive full authored aftermath. The others still need generic-but-present acknowledgment. Implementation must support both without assuming all realms have equal authoring density.

The travel system should be able to consume aftermath events. A queued aftermath item may surface during a ship journey, after a rest, at the bridge console, or in a later realm. It must not depend on the player visiting realms in a predetermined order.

## 11. Ending Eligibility System

Endings are not checklist UI. Eligibility is tracked internally and expressed through narrative, politics, available scenes, and consequences.

Known ending IDs:

- `alpha`: Name Elara.
- `beta`: Name Nadezh.
- `gamma`: Dissolve with the Sevened.
- `delta`: Burn the Record.
- `epsilon`: Take the Throne.
- `zeta`: The Sacrifice, hidden ritual path.
- `eta`: Kill the Chamber Figure, hidden.
- `theta`: Release the Chamber Figure, hidden/apocalyptic.
- `iota`: Return to the Chamber, hidden voluntary dormancy.

Eligibility inputs:

- Claimant kill/spare/alliance state.
- Vesh heir state.
- Elara alive/present/safe/sacrificed state.
- Relics recovered and opened.
- Memory-return progression.
- Hunter-path discovery state.
- Chamber path availability.
- Long Record commitments.
- Specific approach-to-ending scene state.

Standard endings are `alpha`, `beta`, `gamma`, `delta`, and `epsilon`. Hidden endings are `zeta`, `eta`, `theta`, and `iota`. Ending `zeta` requires all eight claimant relic paths resolved through the ritual shape: all eight claimants killed, all eight relics opened, full memory-return progression, Elara alive and present, and the approach-to-ritual sequence. Hidden chamber endings require the chamber path, which itself requires deep-lore discovery.

The system must allow endings to become unavailable because of earlier choices.

## 12. Ship/Cabin Hub

The ship is the Impartial Regard. It is a walkable top-down hub, not a vehicle combat UI. The ship is unarmed except for defensive chaff in scripted contexts.

Cabin hub responsibilities:

- Long Record desk: read, write, save/commit.
- Elara interaction point: relic openings, co-reading, relationship scenes.
- Relic display surfaces: shelves, desk, stand, or other authored placements.
- Letters: correspondence from Sevasti, claimants, survivors, or unexpected senders.
- Bridge console/news: aftermath feeds and travel-facing information.
- Travel interface: choose next destination or authored travel beat.
- Rest/write point: trigger Record writes, rest-based aftermath, and clock progression.
- Room progression: cabin first, then bridge, hold, galley, and other ship spaces as needed.

The cabin changes over time. It begins spare and becomes a reliquary as opened relics accumulate. Each displayed relic should have authored placement and optional inspect text. The cabin should communicate progress, complicity, Elara's presence, and the weight of prior choices.

## 13. Opening Sequence Requirements

The opening sequence is a five-act implementation flow. It should be a scene/state machine, not scattered one-off transitions.

- Act 0 Body: show the dead prior Witness composition, two Takers, signet retrieval, and Long Record removal. Establish death and continuity without explaining it.
- Act I Bell: bell, rite writing itself, name-scroll, title-card framing. This is the ritual wrapper for summoning.
- Act II Binding / Witness Creation: player creates the current Witness presentation: appearance, cover background, disposition, name. The commit should feel like a signature, not a casual form submit.
- Act III Taking: short illustrated/public-facing cover performance of the Takers taking the falling Witness. The system should support the preserved v8 target of background-driven variants, even if the first implementation uses one placeholder.
- Act IV Desk / Sevasti letter: current waking at the cabin desk, signet present, Long Record present, Sevasti letter directing retrieval of Elara.

After Act IV, the game transitions toward retrieving Elara from Nadezh's Verge orphanage. Do not write script dialogue in the systems layer. The sequence must produce initial Long Record and world-state commitments.

## 14. Camera and Gameplay Modes

Top-down three-quarter exploration is the default mode for overworld, ship, towns, courts, dialogue hubs, cabin, and regular exploration.

Side-view platformer/boss mode is a special combat mode for handcrafted setpieces. The existing platformer substrate may be reused for side-view movement, collision, Tiled loading, and boss arenas.

Top-down movement must be implemented separately. It must not be forced through gravity/platformer assumptions.

Mode transitions must be explicit and scene-controlled. A camera-mode switch is a authored beat, not an incidental renderer toggle. Shared systems should include health, damage, iframes, status, powers, and committed state; movement controllers and encounter presentation may differ by mode.

Top-down combat owns regular encounters, mini-bosses, environmental ambushes, optional hidden fights, weapon slots, spells, rolls, and exploration combat. Side-view combat owns the handcrafted boss grammar. Both modes must read the same durable world, power, and damage state.

The three preserved visual languages are separate implementation surfaces: pixel world for play, illuminated Long Record UI for the diegetic book, and cinematic non-diegetic title screen for later polish. Do not collapse these into one generic UI layer.

## 15. Minimum Vertical Slice

The first playable proof target should be:

1. Title.
2. New Witness.
3. Opening sequence skeleton.
4. Witness creation.
5. Cabin.
6. Long Record write/read.
7. Travel stub.
8. One Damar prototype realm.
9. Recover one placeholder relic.
10. Return to cabin.
11. Elara opens relic.
12. Unlock placeholder power.
13. Optional memory trigger.
14. One aftermath event.

This slice should prove the Systems Spine, not final content density. Placeholder relic/power labels are acceptable only as implementation placeholders; they must not be treated as canon names.

## 16. Implementation Order

Recommended build order:

1. Long Record data layer.
2. v8.1 WorldState model.
3. SaveStore integration/migration.
4. TopDownController.
5. CabinScene minimum walkable hub.
6. OpeningSequenceScene Acts 0-IV skeleton.
7. Relic opening flow.
8. Damar vertical slice.
9. Aftermath queue.
10. Ending eligibility tracker.

Each step should leave the repo in a testable state and should avoid touching unrelated systems.

## 17. Non-Goals For Now

- No full nine realms yet.
- No final combat polish.
- No full dialogue system.
- No final ending implementation.
- No visual asset overhaul.
- No title-screen polish until the spine exists.
- No Long Record visual polish before the data/write model exists.
- No lore rewrites during systems implementation.
- No replacement of the custom engine.
- No restoration of archived space-combat, economy, or ship-loadout loops as active systems.

## 18. Codex Task Rules Going Forward

Future Codex implementation tasks should:

- Touch one system at a time.
- Read the relevant canon and implementation docs before editing.
- State the plan before changing code.
- Update tests where possible.
- Keep changes small and reviewable.
- Summarize every file changed.
- Avoid canon invention.
- Preserve engine architecture unless explicitly told otherwise.
- Keep archived systems archived unless a task explicitly revives a piece.
- Prefer data-driven slots for workshop-pending canon instead of hardcoding invented details.
- Run available focused tests/build checks before claiming success.

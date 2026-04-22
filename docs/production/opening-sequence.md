# Black Star — Opening Sequence Specification

*Locked 2026-04-21. Five-act structure. Opening of every new playthrough and the shared ritual every Witness death on respawn.*

---

## Act 0 — The Body

Fade up from black held silent. Top-down pixel composition of a dead Witness lying on a stone floor in a sparse chamber. Grey robes spread around them, Order signet at chest, Record-issue short blade at left hip, closed Long Record beside them, candle almost guttered. Rust-red thread visible at collar. The body has been dead perhaps an hour — long enough for the candle to have burned down.

Two Order figures stand in the chamber. They do not speak. One kneels and removes the signet from the dead Witness's chest. The other lifts the closed Long Record.

On first playthrough, the body is a canonical predecessor Witness (design TBD — generic or lore-canonical, decide when Act 0 is implemented).

On death/respawn, the body is the player's own just-dead Witness. The Order takers arrive identically. Same ritual. Same framing.

## Act I — The Bell

One low bell strike.

The Long Record opens on a new desk — an intake desk the Order keeps for exactly this purpose. Empty page. Freshly lit candle.

An invisible hand lifts the quill. In cramped ecclesiastical script (Korien Vael's original hand), the Order's founding rite writes itself onto the page. Translation appears in smaller italics below. Reads as holy on first encounter. Is cruel on reflection. The rite text is unwritten as of this doc — pending its own authoring session.

The rite completes. The page turns.

The 900 names scroll past. Nine centuries of Witnesses in the same copied hand. Near the bottom, the most recent name — the Witness whose body was just shown — in still-drying ink. A blank line beneath it. Waiting.

Title card renders within the book as a chapter heading: BLACK STAR / The Ninth Heir.

Menu options render as marginalia in the same hand: NEW WITNESS, CONTINUE, OPTIONS.

Open decision: on Witness deaths after the first, does the rite play in full, in shortened form, or skip to the name scroll? Tune during implementation.

## Act II — The Binding

On NEW WITNESS, the book turns to a fresh intake page.

The Witness Creation form. Silent except for quill and candle. Player builds their Witness across:

- Appearance: skin tone, hair, face features, build, age bracket (Young / Tempered / Elder)
- Background: one of six (Former Soldier, Disgraced Theologian, Physician of the Verge, Lapsed Aristocrat, Born in the Orphan Worlds, No Record)
- Five disposition questions for hidden faction assignment (factions not named on screen)
- Name entry

On signature commit, the Order signet presses into the page with the sound of hot wax. The player's chosen name is inscribed at the bottom of the 900-name list from Act I, becoming the most recent entry. This same list will appear in future openings with the player's now-dead Witnesses as predecessors.

## Act III — The Taking

The page turns.

Illustrated scene plays — 20 to 30 seconds — specific to the chosen background. Three variations per background, selected at random. Shows the moment the Order found this Witness falling and pulled them into service. Full content of each variation documented in docs/production/black-star-lore.md.

Scene ends with the Order signet pressed into the Witness's life. Smash to black.

## Act IV — The Desk

Silence held. Two to three seconds past comfortable.

Cabin fades up. Top-down view. The Witness wakes at the desk. The signet is on their finger — the same signet the Order takers removed from the dead Witness in Act 0. Sevasti's letter lies open on the desk beside the Long Record. The letter was originally addressed to the Witness whose body was shown in Act 0. Sevasti has updated it for the new Witness.

Player takes control here.

## Death / Respawn Loop

This sequence is shared with the Witness death and respawn loop. On death, Act 0 replays with the player's just-dead Witness as the body. Acts I through IV follow, with tuning options for abbreviating Act I on repeat runs.

The structural implication: the opening of the game IS the respawn ritual. Every new Witness is a respawn. The first Witness is a respawn of an unseen predecessor.

## Open Decisions

- Canonical first-playthrough predecessor body — generic or lore-canonical?
- Act I rite duration on deaths after the first — full, shortened, or skipped to name scroll?
- Player skip option for the full opening after first viewing — allowed or disallowed (Souls-like commitment)?
- Cabin wake composition — what objects visible, what is the first frame of gameplay?
- Sevasti's letter — auto-opens on Cabin wake, or player walks to desk to read it?

## Implementation Dependencies

This sequence cannot be built until:
- Act 0: body illustration asset produced, top-down composition designed
- Act I: the Order's founding rite text authored; the 900 names system designed (procedural or authored)
- Act II: WitnessCreationScene implemented; appearance layered sprite system implemented; background selection UI; disposition question set written; faction assignment logic
- Act III: eighteen Taking scene illustrations produced, eighteen scripts written
- Act IV: CabinScene implemented; Sevasti's letter text authored; top-down controller implemented

When any of the above becomes ready, a targeted implementation prompt will reference this spec.

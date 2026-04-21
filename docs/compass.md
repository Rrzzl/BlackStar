# BLACK STAR — Compass

*A short document meant to be opened when you sit down and go "what should I work on tonight."*

---

## Where we are

- **Story:** World Bible v5 is the authoritative source. Spine is solid. Texture will be filled in as specific things are worked on.
- **Code:** m3a-complete. Engine + platformer substrate + space combat + economy all work. Looks like Pong because no art has been made yet. That's fine.
- **Art:** Not started. Style guide exists (see `style-guide.md`). Pipeline is: you draw, AI assists, community may contribute.
- **Unplayable beats:** Manual playthrough of M3a's single room (see `docs/production/retros/m3a-playthrough-script.md`). Low priority — we know the substrate is solid from the tests.

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
The visible payoff. Should be worked on *after* the data layer is sketched, but doesn't need the full data layer to exist first.
- Sketch the book's visual language (Claude Design)
- Page turn animation. Physical feel. Opening sound eventually.
- Writing ritual: the UI for choosing one of 4 phrasings after an event
- Page marks: seals, blots, folded corners, torn edges
- Reading predecessor entries

### C. Art & style guide
The slowest-burning contribution. Doing *some* art regularly is better than doing none.
- Draw one Witness sprite in your own hand at 1080p target. See how it feels.
- Try a Damar Hul portrait. Get a feel for the style.
- Generate some mood boards in AI using the style guide as prompt base.
- Start a color palette file with actual hex values.

### D. Damar Hul's cluster
The first vertical slice target if you ever want one. Can be worked on piecemeal forever.
- Write Damar's throne-room dialogue (the first one the Witness has with him)
- Sketch the Thorned Provinces' single planet — what does the world look like from orbit?
- Draft the dungeon's room layout (paper sketch or Tiled)
- Think about the boss fight's mechanics (he's Gifted with pain feedback — what does that *feel* like in combat)

### E. Elara's letters from Auriel
Pure writing. Low technical demand. High emotional demand. Can be done anywhere, even on paper.
- Write three of the letters Auriel sent her over two years
- Each should reveal something different (his fear, his knowledge, his affection)
- These become in-game readable content, placed in the Nursery library

### F. The Witness's first hour
Opening flow scene design. Combines writing and code.
- Where does the game begin? (Likely: aboard *Impartial Regard*, receiving the assignment)
- First dialogue with Sevasti or dispatcher
- First in-game entry the player writes in the Long Record

### G. Dialogue system (if nothing else pulls)
The big unbuilt system. Branching trees, flag gates. Needed eventually.
- Start with a minimal JSON-based tree format
- One NPC as a test case (probably Damar's throne-room attendant)
- Hook it into the existing Scene system

## Things we are deferring

These will matter someday. Not today.

- Companions (Meridian, Vaspar, Kestrel)
- Legacy / Witness death & succession
- The other eight claimants beyond Damar
- Unfinished missions of previous Witnesses
- Space combat reframing (Fourth-faction agents, Keeper interceptors)
- Audio
- Economy reframing

## Story questions that are open

Questions we haven't answered. Add to this list when you think of new ones. Answer them when a system forces you to.

- What does the Long Record's first page look like? (Visual + textual)
- What are the two Tessarene bindery sisters' names?
- What is Auriel's testament's full text?
- What is the Witness's starting equipment? (Presumably: the signet, the grey robes, a small blade, the Long Record itself)
- Does the Witness have a name, or are they addressed only as "Witness"?
- What language does the Order's private script actually look like? (Visual design question)
- What does Elara look like? (Visual design question)
- What does *Impartial Regard*'s cabin feel like? (Visual design question)

## Current tag in code: `m3a-complete`

When you sit down next, run `npm run test:run` first. If it's still green, you're good to start. If something broke from an environment change, fix that first.

---

*Last updated: 2026-04-20. Update this document whenever the compass needs to point somewhere new.*

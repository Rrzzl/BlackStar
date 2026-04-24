# AGENTS.md — Black Star Codex Instructions

## Project identity

Black Star is a 2D pixel-art action-RPG in a custom TypeScript engine.

Authoritative canon is in:

- docs/production/world-bible-v8-1.md
- docs/production/black-star-glossary-v8-1.md
- docs/production/black-star-handoff-v8-1.md

world-bible-v8.md is archived reference only for preserved design/art/workflow sections. Do not treat it as newer canon than v8.1.

## Core rule

Do not make broad rewrites unless explicitly asked.

Prefer small, reviewable changes.

Before editing code:
1. Inspect relevant files.
2. State the plan.
3. Make the smallest viable patch.
4. Run available tests/build commands.
5. Summarize every file changed.

## Architecture priorities

The codebase must eventually support:

- append-only Long Record writes
- irreversible save/write commits
- global world state
- claimant/heir state
- relic state
- Elara relationship/reaction state
- memory trigger state
- aftermath event queue
- ending eligibility logic
- ship/cabin progression
- top-down exploration
- side-view boss encounters

## Forbidden behavior

Do not invent new canon.
Do not rename major canon entities.
Do not delete files unless explicitly asked.
Do not modify generated assets unless explicitly asked.
Do not touch unrelated systems during a focused task.
Do not silently change build tooling, package manager, engine architecture, or folder structure.

## Reporting rule

At the end of each task, report:

- files read
- files changed
- commands run
- test/build results
- unresolved risks

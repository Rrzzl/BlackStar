// TODO(ninth-heir): wrap or extend the canonical platformer controller.
//
// The canonical implementation lives at src/core/platformer/Controller.ts
// (M3a substrate: run, coyote time, jump buffer, facing). That module is the
// single source of truth for side-view movement physics.
//
// SideViewController will eventually:
//   - Re-export the platformer Controller types with boss-combat semantics.
//   - Add attack frames, parry windows, and stagger on top of the base motion.
//   - Share the damage model (HP, iframes, status) with TopDownController.
//
// Side-view mode is reserved for handcrafted boss encounters (~5-12 across
// the whole game). Top-down is the default for everything else.
export {};

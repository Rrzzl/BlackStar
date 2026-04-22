// Hybrid camera model (locked 2026-04-21). See docs/compass.md and
// docs/production/black-star-lore.md for the full spec.
//
// 'top-down'  — default. Overworld travel, ship interior, courts, hubs,
//               dialogue scenes. Runs on TopDownController (not yet built).
// 'side-view' — reserved for handcrafted boss encounters (~5-12 across the
//               whole game). Runs on the existing platformer substrate in
//               src/core/platformer/.
export type CameraMode = "top-down" | "side-view";

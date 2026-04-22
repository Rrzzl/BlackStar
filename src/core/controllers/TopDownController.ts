// TODO(ninth-heir): implement the top-down controller.
//
// Responsibilities:
//   - 4-direction movement (8 permitted for diagonal feel)
//   - No gravity. Velocity is directly driven by input each frame.
//   - Tile-edge collision against TileMap (reuse resolveAABB from
//     @core/platformer/Collision, sweeping both axes independently).
//   - Roll / dodge with iframes on a short cooldown.
//   - Primary and secondary weapon slots (equip, fire, cooldown, power gating).
//   - Spells as a third capability, slot-limited.
//   - Shared damage model with side-view: HP, stagger, iframes, status.
//
// The top-down controller is the default camera mode. Overworld travel, ship
// interior, courts, and dialogue hubs all run on it. The side-view platformer
// substrate is reserved for handcrafted boss encounters.
export {};

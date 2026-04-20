import { describe, it, expect } from "vitest";
import {
  updateController,
  type ControllerState,
  type ControllerConfig,
} from "@core/platformer/Controller";

const CFG: ControllerConfig = {
  runSpeed: 120,
  jumpVelocity: -320,
  coyoteTimeSec: 0.1,
  jumpBufferSec: 0.12,
};

const AIR = { onGround: false, onCeiling: false, onLeftWall: false, onRightWall: false };
const GROUND = { onGround: true, onCeiling: false, onLeftWall: false, onRightWall: false };

function fresh(): ControllerState {
  return {
    vx: 0,
    vy: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    facing: 1,
  };
}

describe("Controller", () => {
  it("no input, grounded → velocity zero", () => {
    const s = updateController(fresh(), { left: false, right: false, jumpPressed: false }, GROUND, 1 / 60, CFG);
    expect(s.vx).toBe(0);
  });

  it("right input accelerates to runSpeed and sets facing", () => {
    const s = updateController(fresh(), { left: false, right: true, jumpPressed: false }, GROUND, 1 / 60, CFG);
    expect(s.vx).toBe(120);
    expect(s.facing).toBe(1);
  });

  it("left input sets facing to -1 and vx negative", () => {
    const s = updateController(fresh(), { left: true, right: false, jumpPressed: false }, GROUND, 1 / 60, CFG);
    expect(s.vx).toBe(-120);
    expect(s.facing).toBe(-1);
  });

  it("jump while grounded sets vy to jumpVelocity", () => {
    const s = updateController(fresh(), { left: false, right: false, jumpPressed: true }, GROUND, 1 / 60, CFG);
    expect(s.vy).toBe(-320);
  });

  it("coyote time: can jump briefly after leaving ground", () => {
    // Establish a grounded state first (coyote window full), then go airborne.
    const grounded = updateController(fresh(), { left: false, right: false, jumpPressed: false }, GROUND, 1 / 60, CFG);
    const justLeft = updateController(grounded, { left: false, right: false, jumpPressed: false }, AIR, 1 / 60, CFG);
    expect(justLeft.coyoteTimer).toBeCloseTo(CFG.coyoteTimeSec - 1 / 60, 3);
    const jumped = updateController(justLeft, { left: false, right: false, jumpPressed: true }, AIR, 1 / 60, CFG);
    expect(jumped.vy).toBe(-320);
  });

  it("coyote time expires: cannot jump after full window", () => {
    let s = fresh();
    for (let i = 0; i < 20; i++) {
      s = updateController(s, { left: false, right: false, jumpPressed: false }, AIR, 1 / 60, CFG);
    }
    const attempted = updateController(s, { left: false, right: false, jumpPressed: true }, AIR, 1 / 60, CFG);
    expect(attempted.vy).not.toBe(-320);
  });

  it("jump buffer: jump pressed mid-air triggers on landing", () => {
    const pressedMidAir = updateController(fresh(), { left: false, right: false, jumpPressed: true }, AIR, 1 / 60, CFG);
    expect(pressedMidAir.jumpBufferTimer).toBeCloseTo(CFG.jumpBufferSec - 1 / 60, 3);
    const landed = updateController(pressedMidAir, { left: false, right: false, jumpPressed: false }, GROUND, 1 / 60, CFG);
    expect(landed.vy).toBe(-320);
  });

  it("grounded resets coyote timer to full", () => {
    const s = updateController(fresh(), { left: false, right: false, jumpPressed: false }, GROUND, 1 / 60, CFG);
    expect(s.coyoteTimer).toBe(CFG.coyoteTimeSec);
  });
});

import { describe, it, expect } from "vitest";
import { steerRusher, steerShooter } from "@core/combat/EnemyAI";

describe("EnemyAI", () => {
  it("rusher points velocity directly at target", () => {
    const v = steerRusher({ x: 0, y: 0 }, { x: 100, y: 0 }, 50);
    expect(v.vx).toBeCloseTo(50);
    expect(v.vy).toBeCloseTo(0);
  });

  it("rusher stops when on top of target", () => {
    const v = steerRusher({ x: 5, y: 5 }, { x: 5, y: 5 }, 50);
    expect(v.vx).toBe(0);
    expect(v.vy).toBe(0);
  });

  it("shooter approaches until within preferred range, then strafes", () => {
    const far = steerShooter({ x: 0, y: 0 }, { x: 400, y: 0 }, 30, 180);
    expect(far.vx).toBeGreaterThan(0);
    const close = steerShooter({ x: 0, y: 0 }, { x: 100, y: 0 }, 30, 180);
    expect(Math.abs(close.vx)).toBeLessThan(Math.abs(close.vy));
  });

  it("shooter velocity magnitude matches input speed", () => {
    const v = steerShooter({ x: 0, y: 0 }, { x: 400, y: 0 }, 30, 180);
    expect(Math.hypot(v.vx, v.vy)).toBeCloseTo(30, 3);
  });
});

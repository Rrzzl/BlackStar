import { describe, it, expect } from "vitest";
import { stepPhysics, type PhysicsBody, type PhysicsOpts } from "@core/platformer/Physics2D";

const OPTS: PhysicsOpts = {
  gravity: 900,
  terminalVelocity: 600,
};

describe("Physics2D", () => {
  it("applies gravity to vy", () => {
    const body: PhysicsBody = { x: 0, y: 0, vx: 0, vy: 0 };
    const next = stepPhysics(body, 1 / 60, OPTS);
    expect(next.vy).toBeCloseTo(15);
  });

  it("clamps vy at terminal velocity", () => {
    const body: PhysicsBody = { x: 0, y: 0, vx: 0, vy: 700 };
    const next = stepPhysics(body, 1 / 60, OPTS);
    expect(next.vy).toBe(600);
  });

  it("does not clamp upward velocity", () => {
    const body: PhysicsBody = { x: 0, y: 0, vx: 0, vy: -500 };
    const next = stepPhysics(body, 1 / 60, OPTS);
    expect(next.vy).toBeLessThan(-500 + 16);
    expect(next.vy).toBeGreaterThan(-500);
  });

  it("advances position by velocity", () => {
    const body: PhysicsBody = { x: 100, y: 50, vx: 120, vy: 60 };
    const next = stepPhysics(body, 0.5, { gravity: 0, terminalVelocity: 1000 });
    expect(next.x).toBe(160);
    expect(next.y).toBe(80);
  });

  it("does not mutate input body", () => {
    const body: PhysicsBody = { x: 0, y: 0, vx: 0, vy: 0 };
    stepPhysics(body, 1 / 60, OPTS);
    expect(body).toEqual({ x: 0, y: 0, vx: 0, vy: 0 });
  });
});

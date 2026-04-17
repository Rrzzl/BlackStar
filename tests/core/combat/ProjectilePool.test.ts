import { describe, it, expect } from "vitest";
import { ProjectilePool } from "@core/combat/ProjectilePool";

describe("ProjectilePool", () => {
  it("spawns up to pool size then refuses", () => {
    const pool = new ProjectilePool(4);
    for (let i = 0; i < 4; i++) {
      const p = pool.spawn({ x: 0, y: 0, vx: 100, vy: 0, ttl: 1, damage: 5, ownerId: "a" });
      expect(p).not.toBeNull();
    }
    expect(pool.spawn({ x: 0, y: 0, vx: 100, vy: 0, ttl: 1, damage: 5, ownerId: "a" })).toBeNull();
  });

  it("tick advances active projectiles and retires expired ones", () => {
    const pool = new ProjectilePool(4);
    pool.spawn({ x: 0, y: 0, vx: 100, vy: 0, ttl: 0.5, damage: 5, ownerId: "a" });
    pool.tick(0.25);
    expect(pool.active().length).toBe(1);
    expect(pool.active()[0]!.x).toBeCloseTo(25);
    pool.tick(0.3);
    expect(pool.active().length).toBe(0);
  });

  it("free releases a projectile back to the pool", () => {
    const pool = new ProjectilePool(2);
    const p1 = pool.spawn({ x: 0, y: 0, vx: 0, vy: 0, ttl: 10, damage: 1, ownerId: "a" })!;
    pool.spawn({ x: 0, y: 0, vx: 0, vy: 0, ttl: 10, damage: 1, ownerId: "a" });
    pool.free(p1);
    expect(pool.active().length).toBe(1);
    expect(pool.spawn({ x: 0, y: 0, vx: 0, vy: 0, ttl: 10, damage: 1, ownerId: "b" })).not.toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { RNG } from "@core/RNG";
import { steerRusher, steerShooter } from "@core/combat/EnemyAI";

describe("Combat determinism", () => {
  it("same seed produces same AI rolls", () => {
    const a = new RNG(42);
    const b = new RNG(42);
    for (let i = 0; i < 10; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it("steering is pure: same inputs, same outputs", () => {
    const v1 = steerRusher({ x: 10, y: 10 }, { x: 100, y: 100 }, 50);
    const v2 = steerRusher({ x: 10, y: 10 }, { x: 100, y: 100 }, 50);
    expect(v1).toEqual(v2);

    const s1 = steerShooter({ x: 10, y: 10 }, { x: 400, y: 10 }, 30, 180);
    const s2 = steerShooter({ x: 10, y: 10 }, { x: 400, y: 10 }, 30, 180);
    expect(s1).toEqual(s2);
  });
});

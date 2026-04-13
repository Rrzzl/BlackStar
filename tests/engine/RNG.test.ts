import { describe, it, expect } from "vitest";
import { RNG } from "@engine/RNG";

describe("RNG", () => {
  it("is deterministic given a seed", () => {
    const a = new RNG(12345);
    const b = new RNG(12345);
    for (let i = 0; i < 10; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it("produces different sequences for different seeds", () => {
    const a = new RNG(1);
    const b = new RNG(2);
    expect(a.next()).not.toBe(b.next());
  });

  it("produces values in [0, 1)", () => {
    const r = new RNG(42);
    for (let i = 0; i < 100; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("int(min, max) produces integers in [min, max]", () => {
    const r = new RNG(7);
    for (let i = 0; i < 100; i++) {
      const v = r.int(5, 10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it("pick returns an element from the array", () => {
    const r = new RNG(99);
    const arr = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(r.pick(arr));
    }
  });

  it("chance returns true roughly at the given probability", () => {
    const r = new RNG(123);
    let hits = 0;
    for (let i = 0; i < 10000; i++) {
      if (r.chance(0.3)) hits++;
    }
    expect(hits).toBeGreaterThan(2500);
    expect(hits).toBeLessThan(3500);
  });

  it("derives a child RNG with a distinct but reproducible sequence", () => {
    const parent1 = new RNG(100);
    const parent2 = new RNG(100);
    const childA = parent1.derive("dungeon");
    const childB = parent2.derive("dungeon");
    for (let i = 0; i < 10; i++) {
      expect(childA.next()).toBe(childB.next());
    }
  });
});

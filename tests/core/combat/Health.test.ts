import { describe, it, expect } from "vitest";
import { applyDamage, heal, isDead, makeHealth } from "@core/combat/Health";

describe("Health", () => {
  it("makeHealth initializes shield and hp to max", () => {
    const h = makeHealth(100, 50);
    expect(h).toEqual({ hp: 100, maxHp: 100, shield: 50, maxShield: 50 });
  });

  it("damage consumes shield first", () => {
    const h = applyDamage(makeHealth(100, 50), 30);
    expect(h.shield).toBe(20);
    expect(h.hp).toBe(100);
  });

  it("damage overflows shield into hp", () => {
    const h = applyDamage(makeHealth(100, 50), 70);
    expect(h.shield).toBe(0);
    expect(h.hp).toBe(80);
  });

  it("damage clamps hp at zero", () => {
    const h = applyDamage(makeHealth(20, 0), 50);
    expect(h.hp).toBe(0);
  });

  it("isDead true only at zero hp", () => {
    expect(isDead(makeHealth(1, 0))).toBe(false);
    expect(isDead(applyDamage(makeHealth(1, 0), 1))).toBe(true);
  });

  it("heal clamps at max", () => {
    const h = heal(applyDamage(makeHealth(100, 0), 40), 99);
    expect(h.hp).toBe(100);
  });
});

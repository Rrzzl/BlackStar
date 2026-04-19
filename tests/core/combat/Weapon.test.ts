import { describe, it, expect } from "vitest";
import { makeWeaponRuntime, canFire, fire, tickCooldown, type WeaponDef } from "@core/combat/Weapon";

const PULSE: WeaponDef = {
  id: "pulse_laser_i",
  damage: 8,
  projectileSpeed: 400,
  rangeSeconds: 1.0,
  fireIntervalSeconds: 0.5,
  powerCost: 5,
};

describe("Weapon", () => {
  it("fresh weapon can fire", () => {
    const w = makeWeaponRuntime(PULSE);
    expect(canFire(w, 100)).toBe(true);
  });

  it("canFire false when power below cost", () => {
    const w = makeWeaponRuntime(PULSE);
    expect(canFire(w, 2)).toBe(false);
  });

  it("fire produces projectile spawn and sets cooldown", () => {
    const w = makeWeaponRuntime(PULSE);
    const spawn = fire(w, { x: 10, y: 0, angle: 0, ownerId: "ship" });
    expect(spawn.damage).toBe(8);
    expect(spawn.x).toBe(10);
    expect(spawn.vx).toBeCloseTo(400);
    expect(spawn.vy).toBeCloseTo(0);
    expect(spawn.ttl).toBeCloseTo(1.0);
    expect(spawn.ownerId).toBe("ship");
    expect(canFire(w, 100)).toBe(false);
  });

  it("cooldown ticks down, restoring canFire", () => {
    const w = makeWeaponRuntime(PULSE);
    fire(w, { x: 0, y: 0, angle: 0, ownerId: "ship" });
    tickCooldown(w, 0.25);
    expect(canFire(w, 100)).toBe(false);
    tickCooldown(w, 0.3);
    expect(canFire(w, 100)).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { Vec2 } from "@engine/Vec2";

describe("Vec2", () => {
  it("constructs with x and y", () => {
    const v = new Vec2(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });

  it("adds two vectors", () => {
    const a = new Vec2(1, 2);
    const b = new Vec2(3, 4);
    const sum = a.add(b);
    expect(sum.x).toBe(4);
    expect(sum.y).toBe(6);
  });

  it("subtracts two vectors", () => {
    const a = new Vec2(5, 7);
    const b = new Vec2(2, 3);
    const diff = a.sub(b);
    expect(diff.x).toBe(3);
    expect(diff.y).toBe(4);
  });

  it("scales a vector", () => {
    const a = new Vec2(2, 3);
    const scaled = a.mul(2);
    expect(scaled.x).toBe(4);
    expect(scaled.y).toBe(6);
  });

  it("computes length", () => {
    const a = new Vec2(3, 4);
    expect(a.length()).toBe(5);
  });

  it("normalizes to unit length", () => {
    const a = new Vec2(3, 4);
    const n = a.normalize();
    expect(n.length()).toBeCloseTo(1);
  });

  it("returns zero when normalizing zero vector", () => {
    const a = new Vec2(0, 0);
    const n = a.normalize();
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
  });

  it("computes distance between two vectors", () => {
    const a = new Vec2(0, 0);
    const b = new Vec2(3, 4);
    expect(a.distanceTo(b)).toBe(5);
  });

  it("computes dot product", () => {
    const a = new Vec2(1, 2);
    const b = new Vec2(3, 4);
    expect(a.dot(b)).toBe(11);
  });

  it("does not mutate the original on add", () => {
    const a = new Vec2(1, 2);
    const b = new Vec2(3, 4);
    a.add(b);
    expect(a.x).toBe(1);
    expect(a.y).toBe(2);
  });
});

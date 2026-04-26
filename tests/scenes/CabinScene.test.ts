import { describe, expect, it } from "vitest";
import {
  CABIN_OBSTACLES,
  CABIN_ROOM_TITLE,
  nextPauseSelection,
  resolveCabinPlayerCollision,
} from "@scenes/CabinScene";

describe("nextPauseSelection", () => {
  it("wraps upward from first pause option", () => {
    expect(nextPauseSelection(0, -1)).toBe(1);
  });

  it("wraps downward from last pause option", () => {
    expect(nextPauseSelection(1, 1)).toBe(0);
  });
});

describe("CabinScene room identity", () => {
  it("labels the first room as a movement test room", () => {
    expect(CABIN_ROOM_TITLE).toBe("MOVEMENT TEST ROOM");
  });
});

describe("resolveCabinPlayerCollision", () => {
  it("defines a compact four-obstacle movement test room", () => {
    expect(CABIN_OBSTACLES).toHaveLength(4);
  });

  it("stops the player at the left edge of cabin obstacles", () => {
    const desk = CABIN_OBSTACLES[0]!;
    const prev = { x: desk.x - 8, y: desk.y + desk.h / 2, facing: "right" as const };
    const next = { ...prev, x: desk.x + 8 };

    expect(resolveCabinPlayerCollision(prev, next).x).toBe(desk.x - 5);
  });

  it("stops the player at the top edge of cabin obstacles", () => {
    const desk = CABIN_OBSTACLES[0]!;
    const prev = { x: desk.x + desk.w / 2, y: desk.y - 10, facing: "down" as const };
    const next = { ...prev, y: desk.y + 8 };

    expect(resolveCabinPlayerCollision(prev, next).y).toBe(desk.y - 7);
  });

  it("stops the player at the right edge of cabin obstacles", () => {
    const locker = CABIN_OBSTACLES[1]!;
    const prev = { x: locker.x + locker.w + 8, y: locker.y + locker.h / 2, facing: "left" as const };
    const next = { ...prev, x: locker.x + locker.w - 8 };

    expect(resolveCabinPlayerCollision(prev, next).x).toBe(locker.x + locker.w + 5);
  });

  it("stops the player at the bottom edge of cabin obstacles", () => {
    const rail = CABIN_OBSTACLES[3]!;
    const prev = { x: rail.x + rail.w / 2, y: rail.y + rail.h + 10, facing: "up" as const };
    const next = { ...prev, y: rail.y + rail.h - 8 };

    expect(resolveCabinPlayerCollision(prev, next).y).toBe(rail.y + rail.h + 7);
  });

  it("leaves non-colliding movement unchanged", () => {
    const prev = { x: 180, y: 220, facing: "down" as const };
    const next = { x: 190, y: 228, facing: "right" as const };

    expect(resolveCabinPlayerCollision(prev, next)).toEqual(next);
  });
});

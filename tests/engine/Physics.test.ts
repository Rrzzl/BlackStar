import { describe, it, expect } from 'vitest';
import {
  aabbIntersects,
  circleIntersects,
  circleVsAabb,
  type AABB,
  type Circle,
} from '@engine/Physics';

describe('Physics', () => {
  it('detects overlapping AABBs', () => {
    const a: AABB = { x: 0, y: 0, w: 10, h: 10 };
    const b: AABB = { x: 5, y: 5, w: 10, h: 10 };
    expect(aabbIntersects(a, b)).toBe(true);
  });

  it('detects non-overlapping AABBs', () => {
    const a: AABB = { x: 0, y: 0, w: 10, h: 10 };
    const b: AABB = { x: 20, y: 0, w: 10, h: 10 };
    expect(aabbIntersects(a, b)).toBe(false);
  });

  it('detects overlapping circles', () => {
    const a: Circle = { x: 0, y: 0, r: 5 };
    const b: Circle = { x: 4, y: 0, r: 5 };
    expect(circleIntersects(a, b)).toBe(true);
  });

  it('detects circle vs AABB overlap', () => {
    const c: Circle = { x: 12, y: 5, r: 5 };
    const box: AABB = { x: 0, y: 0, w: 10, h: 10 };
    expect(circleVsAabb(c, box)).toBe(true);
  });

  it('reports no overlap when circle is beyond corner', () => {
    const c: Circle = { x: 20, y: 20, r: 3 };
    const box: AABB = { x: 0, y: 0, w: 10, h: 10 };
    expect(circleVsAabb(c, box)).toBe(false);
  });
});

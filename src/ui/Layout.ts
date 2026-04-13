export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function center(parent: Rect, w: number, h: number): Rect {
  return {
    x: parent.x + (parent.w - w) / 2,
    y: parent.y + (parent.h - h) / 2,
    w,
    h,
  };
}

export function stackV(parent: Rect, heights: number[], gap = 4): Rect[] {
  const out: Rect[] = [];
  let y = parent.y;
  for (const h of heights) {
    out.push({ x: parent.x, y, w: parent.w, h });
    y += h + gap;
  }
  return out;
}

export function inset(r: Rect, px: number): Rect {
  return { x: r.x + px, y: r.y + px, w: r.w - 2 * px, h: r.h - 2 * px };
}

export function containsPoint(r: Rect, x: number, y: number): boolean {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

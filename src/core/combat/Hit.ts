export interface Circle {
  x: number;
  y: number;
  r: number;
}

export function circleHit(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rs = a.r + b.r;
  return dx * dx + dy * dy <= rs * rs;
}

import type { Renderer } from "@engine/Renderer";
import type { Rect } from "./Layout";

export function drawBar(
  r: Renderer,
  rect: Rect,
  value: number,
  max: number,
  color = "#6cd27c",
): void {
  r.drawRect(rect.x, rect.y, rect.w, rect.h, "#0a0f18");
  const w = Math.max(0, Math.min(1, value / max)) * rect.w;
  r.drawRect(rect.x, rect.y, w, rect.h, color);
  r.drawRect(rect.x, rect.y, rect.w, 1, "#2a3548");
  r.drawRect(rect.x, rect.y + rect.h - 1, rect.w, 1, "#2a3548");
  r.drawRect(rect.x, rect.y, 1, rect.h, "#2a3548");
  r.drawRect(rect.x + rect.w - 1, rect.y, 1, rect.h, "#2a3548");
}

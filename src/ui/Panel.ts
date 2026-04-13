import type { Renderer } from "@engine/Renderer";
import type { Rect } from "./Layout";

export function drawPanel(
  r: Renderer,
  rect: Rect,
  fill = "#0c0f18",
  border = "#2a3548",
): void {
  r.drawRect(rect.x, rect.y, rect.w, rect.h, fill);
  r.drawRect(rect.x, rect.y, rect.w, 1, border);
  r.drawRect(rect.x, rect.y + rect.h - 1, rect.w, 1, border);
  r.drawRect(rect.x, rect.y, 1, rect.h, border);
  r.drawRect(rect.x + rect.w - 1, rect.y, 1, rect.h, border);
}

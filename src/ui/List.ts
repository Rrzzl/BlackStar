import type { Renderer } from "@engine/Renderer";
import type { Input } from "@engine/Input";
import { drawPanel } from "./Panel";
import { drawLabel } from "./Label";
import { stackV, containsPoint, type Rect } from "./Layout";

export function drawList<T>(
  r: Renderer,
  input: Input,
  rect: Rect,
  items: readonly T[],
  labelOf: (t: T) => string,
  onSelect: (t: T, index: number) => void,
  itemHeight = 14,
): void {
  drawPanel(r, rect);
  const rows = stackV(
    { x: rect.x + 2, y: rect.y + 2, w: rect.w - 4, h: rect.h - 4 },
    items.map(() => itemHeight),
    1,
  );
  const m = r.mouseToInternal(input.mouseX, input.mouseY);
  items.forEach((item, i) => {
    const row = rows[i];
    if (!row) return;
    const hovered = containsPoint(row, m.x, m.y);
    if (hovered) r.drawRect(row.x, row.y, row.w, row.h, "#1f2d45");
    drawLabel(r, labelOf(item), row.x + 4, row.y + row.h - 9);
    if (hovered && input.wasMousePressed(0)) onSelect(item, i);
  });
}

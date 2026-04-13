import type { Renderer } from "@engine/Renderer";

export function drawLabel(
  r: Renderer,
  text: string,
  x: number,
  y: number,
  color = "#cfd8e8",
  size = 8,
  align: CanvasTextAlign = "left",
): void {
  r.drawText(text, x, y, color, size, align);
}

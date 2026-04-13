import type { Renderer } from "@engine/Renderer";
import type { Input } from "@engine/Input";
import { drawPanel } from "./Panel";
import { drawLabel } from "./Label";
import { containsPoint, type Rect } from "./Layout";

export interface ButtonStyle {
  fill: string;
  fillHover: string;
  fillPressed: string;
  border: string;
  textColor: string;
}

const DEFAULT_STYLE: ButtonStyle = {
  fill: "#17202f",
  fillHover: "#1f2d45",
  fillPressed: "#0a1020",
  border: "#3b4a66",
  textColor: "#e6ecf5",
};

export function drawButton(
  r: Renderer,
  input: Input,
  rect: Rect,
  text: string,
  onClick: () => void,
  style: ButtonStyle = DEFAULT_STYLE,
): void {
  const m = r.mouseToInternal(input.mouseX, input.mouseY);
  const hovered = containsPoint(rect, m.x, m.y);
  const pressed = hovered && input.isMouseDown(0);
  const fill = pressed ? style.fillPressed : hovered ? style.fillHover : style.fill;
  drawPanel(r, rect, fill, style.border);
  drawLabel(
    r,
    text,
    rect.x + rect.w / 2,
    rect.y + rect.h / 2 - 3,
    style.textColor,
    8,
    "center",
  );
  if (hovered && input.wasMousePressed(0)) onClick();
}

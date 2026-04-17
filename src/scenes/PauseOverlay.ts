import type { Renderer } from "@engine/Renderer";
import type { Input } from "@engine/Input";
import { drawPanel } from "@ui/Panel";
import { drawLabel } from "@ui/Label";
import { drawButton } from "@ui/Button";
import { center } from "@ui/Layout";

export interface PauseActions {
  onResume(): void;
  onSave?(): void;
  onQuit(): void;
}

export function drawPauseOverlay(
  r: Renderer,
  input: Input,
  actions: PauseActions,
): void {
  const hasSave = typeof actions.onSave === "function";
  const panelH = hasSave ? 120 : 100;
  r.drawRect(0, 0, r.internalWidth, r.internalHeight, "rgba(0,0,0,0.65)");
  const panel = center(
    { x: 0, y: 0, w: r.internalWidth, h: r.internalHeight },
    180,
    panelH,
  );
  drawPanel(r, panel);
  drawLabel(
    r,
    "PAUSED",
    panel.x + panel.w / 2,
    panel.y + 16,
    "#e6ecf5",
    10,
    "center",
  );
  drawButton(
    r,
    input,
    { x: panel.x + 20, y: panel.y + 35, w: panel.w - 40, h: 16 },
    "Resume",
    actions.onResume,
  );
  if (hasSave) {
    drawButton(
      r,
      input,
      { x: panel.x + 20, y: panel.y + 55, w: panel.w - 40, h: 16 },
      "Save",
      actions.onSave!,
    );
  }
  drawButton(
    r,
    input,
    { x: panel.x + 20, y: panel.y + (hasSave ? 75 : 55), w: panel.w - 40, h: 16 },
    "Quit to Title",
    actions.onQuit,
  );
}

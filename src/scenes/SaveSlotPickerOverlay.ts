import type { Renderer } from "@engine/Renderer";
import type { Input } from "@engine/Input";
import type { SaveSnapshot } from "@core/world/SaveSnapshot";
import { drawPanel } from "@ui/Panel";
import { drawLabel } from "@ui/Label";
import { drawButton } from "@ui/Button";

export interface SaveSlotPickerProps {
  slots: Array<{ id: string; snap: SaveSnapshot | null }>;
  onPick(id: string): void;
  onCancel(): void;
  title?: string;
}

export function drawSaveSlotPicker(r: Renderer, input: Input, props: SaveSlotPickerProps): void {
  r.drawRect(0, 0, r.internalWidth, r.internalHeight, "rgba(0,0,0,0.7)");
  const panel = { x: 100, y: 60, w: r.internalWidth - 200, h: r.internalHeight - 120 };
  drawPanel(r, panel);
  drawLabel(r, props.title ?? "SAVE SLOT", panel.x + 10, panel.y + 10, "#e6ecf5", 10);

  props.slots.forEach((slot, i) => {
    const row = { x: panel.x + 20, y: panel.y + 40 + i * 32, w: panel.w - 40, h: 24 };
    const label = slot.snap
      ? `${slot.id}  —  ${slot.snap.captain.name}  (${slot.snap.scene.type}, ${Math.round(slot.snap.worldClock)}s)`
      : `${slot.id}  —  empty`;
    drawButton(r, input, row, label, () => props.onPick(slot.id));
  });

  drawButton(
    r,
    input,
    { x: panel.x + panel.w - 80, y: panel.y + panel.h - 26, w: 70, h: 18 },
    "Cancel",
    props.onCancel,
  );
}

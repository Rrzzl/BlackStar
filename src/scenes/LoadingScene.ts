import { Scene, type SceneContext } from "@engine/Scene";
import { drawLabel } from "@ui/Label";

export class LoadingScene extends Scene {
  private progress = 0;

  constructor(
    private readonly work: (
      onProgress: (p: number) => void,
    ) => Promise<() => Scene>,
  ) {
    super();
  }

  async enter(ctx: SceneContext): Promise<void> {
    const nextFactory = await this.work((p) => {
      this.progress = p;
    });
    ctx.changeScene(nextFactory());
  }

  update(_ctx: SceneContext, _dt: number): void {}

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#050709");
    drawLabel(r, "LOADING", r.internalWidth / 2, r.internalHeight / 2 - 8, "#cfd8e8", 10, "center");
    const barW = 160;
    const barH = 4;
    r.drawRect((r.internalWidth - barW) / 2, r.internalHeight / 2 + 4, barW, barH, "#1a2231");
    r.drawRect(
      (r.internalWidth - barW) / 2,
      r.internalHeight / 2 + 4,
      barW * this.progress,
      barH,
      "#6cd27c",
    );
  }
}

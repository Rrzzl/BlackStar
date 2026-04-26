export interface Point {
  x: number;
  y: number;
}

export function internalPointFromCssPoint(
  mx: number,
  my: number,
  cssWidth: number,
  cssHeight: number,
  internalWidth: number,
  internalHeight: number,
): Point {
  const scale = Math.min(cssWidth / internalWidth, cssHeight / internalHeight);
  const offsetX = (cssWidth - internalWidth * scale) / 2;
  const offsetY = (cssHeight - internalHeight * scale) / 2;
  return { x: (mx - offsetX) / scale, y: (my - offsetY) / scale };
}

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly internalWidth: number;
  readonly internalHeight: number;

  constructor(canvas: HTMLCanvasElement, internalWidth = 640, internalHeight = 360) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;
    this.internalWidth = internalWidth;
    this.internalHeight = internalHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  get scale(): number {
    return Math.min(this.canvas.width / this.internalWidth, this.canvas.height / this.internalHeight);
  }

  clear(color = "#000"): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  beginFrame(): void {
    this.ctx.save();
    const s = this.scale;
    const offsetX = (this.canvas.width - this.internalWidth * s) / 2;
    const offsetY = (this.canvas.height - this.internalHeight * s) / 2;
    this.ctx.setTransform(s, 0, 0, s, offsetX, offsetY);
  }

  endFrame(): void {
    this.ctx.restore();
  }

  drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color = "#e8b060",
    size = 8,
    align: CanvasTextAlign = "left",
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  mouseToInternal(mx: number, my: number): Point {
    const rect = this.canvas.getBoundingClientRect();
    return internalPointFromCssPoint(
      mx,
      my,
      rect.width,
      rect.height,
      this.internalWidth,
      this.internalHeight,
    );
  }
}

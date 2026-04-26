interface ClientRectOrigin {
  left: number;
  top: number;
}

export function localMousePoint(
  clientX: number,
  clientY: number,
  rect: ClientRectOrigin,
): { x: number; y: number } {
  return { x: clientX - rect.left, y: clientY - rect.top };
}

export class Input {
  private keysDown = new Set<string>();
  private keysPressedThisFrame = new Set<string>();
  private keysReleasedThisFrame = new Set<string>();

  private mouseDown = new Set<number>();
  private mousePressedThisFrame = new Set<number>();
  private mouseReleasedThisFrame = new Set<number>();

  mouseX = 0;
  mouseY = 0;

  constructor(target: HTMLElement) {
    const updateMousePosition = (e: MouseEvent): void => {
      const point = localMousePoint(e.clientX, e.clientY, target.getBoundingClientRect());
      this.mouseX = point.x;
      this.mouseY = point.y;
    };

    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      if (!this.keysDown.has(e.code)) {
        this.keysPressedThisFrame.add(e.code);
      }
      this.keysDown.add(e.code);
    });

    window.addEventListener("keyup", (e) => {
      this.keysDown.delete(e.code);
      this.keysReleasedThisFrame.add(e.code);
    });

    target.addEventListener("mousedown", (e) => {
      updateMousePosition(e);
      if (!this.mouseDown.has(e.button)) {
        this.mousePressedThisFrame.add(e.button);
      }
      this.mouseDown.add(e.button);
    });

    target.addEventListener("mouseup", (e) => {
      updateMousePosition(e);
      this.mouseDown.delete(e.button);
      this.mouseReleasedThisFrame.add(e.button);
    });

    target.addEventListener("mousemove", (e) => {
      updateMousePosition(e);
    });

    target.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  wasKeyPressed(code: string): boolean {
    return this.keysPressedThisFrame.has(code);
  }

  wasKeyReleased(code: string): boolean {
    return this.keysReleasedThisFrame.has(code);
  }

  isMouseDown(button: number): boolean {
    return this.mouseDown.has(button);
  }

  wasMousePressed(button: number): boolean {
    return this.mousePressedThisFrame.has(button);
  }

  wasMouseReleased(button: number): boolean {
    return this.mouseReleasedThisFrame.has(button);
  }

  endFrame(): void {
    this.keysPressedThisFrame.clear();
    this.keysReleasedThisFrame.clear();
    this.mousePressedThisFrame.clear();
    this.mouseReleasedThisFrame.clear();
  }
}

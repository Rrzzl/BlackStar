# Foundation Implementation Plan (M1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Black Star project and implement the engine primitives and core loop with TDD where applicable. End state: a black Canvas renders at 60 FPS with a title scene, an FPS overlay, and a passing test suite.

**Architecture:** TypeScript + Vite + Canvas 2D + Vitest, custom engine. Layered architecture per TDD §2: `engine` (primitives, game loop, scene manager, renderer, input, event bus) is the only code in this plan. No gameplay yet — that's M2.

**Tech Stack:** TypeScript 5.x strict, Vite 5, Vitest, ESLint, Prettier, HTML5 Canvas 2D API.

**Reads before starting:**
- [TDD](../../tech/01-tdd.md) (especially §2, §3, §9, §10)
- [Concept](../../design/01-concept.md)
- [Milestones](../../production/02-milestones.md) (M1)

---

## File structure created by this plan

```
black-star/
├── package.json              # Task 1
├── tsconfig.json             # Task 1
├── vite.config.ts            # Task 1
├── vitest.config.ts          # Task 1
├── .eslintrc.cjs             # Task 1
├── .prettierrc               # Task 1
├── .gitignore                # Task 1
├── index.html                # Task 1
├── src/
│   ├── main.ts               # Task 10
│   └── engine/
│       ├── Vec2.ts           # Task 2
│       ├── RNG.ts            # Task 3
│       ├── Input.ts          # Task 4
│       ├── Renderer.ts       # Task 5
│       ├── Scene.ts          # Task 6
│       ├── Game.ts           # Task 7
│       ├── EventBus.ts       # Task 8
│       └── DebugOverlay.ts   # Task 9
└── tests/
    └── engine/
        ├── Vec2.test.ts      # Task 2
        ├── RNG.test.ts       # Task 3
        └── EventBus.test.ts  # Task 8
```

---

## Task 1: Project setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.eslintrc.cjs`, `.prettierrc`, `.gitignore`, `index.html`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "black-star",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src tests --ext .ts",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\""
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "vitest/globals"],
    "baseUrl": ".",
    "paths": {
      "@engine/*": ["src/engine/*"],
      "@core/*": ["src/core/*"]
    }
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "src/engine"),
      "@core": resolve(__dirname, "src/core"),
    },
  },
  server: { port: 5173 },
  build: { target: "es2022", sourcemap: true },
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "src/engine"),
      "@core": resolve(__dirname, "src/core"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Create `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  env: { browser: true, node: true, es2022: true },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
  },
};
```

- [ ] **Step 6: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 7: Create `.gitignore`**

```
node_modules
dist
.vite
*.log
.DS_Store
.vscode
.idea
coverage
```

- [ ] **Step 8: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Black Star</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #0a0a0a;
        color: #e8b060;
        font-family: monospace;
        height: 100%;
        overflow: hidden;
      }
      #game-root {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      canvas {
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        background: #000;
      }
    </style>
  </head>
  <body>
    <div id="game-root">
      <canvas id="game" width="1280" height="720"></canvas>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 9: Install and verify**

Run:
```bash
npm install
npm run typecheck
```
Expected: typecheck passes (no files yet to typecheck, exits 0).

- [ ] **Step 10: Commit**

```bash
git init
git add .
git commit -m "chore: project setup (Vite, TS strict, Vitest, ESLint, Prettier)"
```

---

## Task 2: Vec2 (TDD)

**Files:**
- Create: `src/engine/Vec2.ts`
- Test: `tests/engine/Vec2.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/engine/Vec2.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { Vec2 } from "@engine/Vec2";

describe("Vec2", () => {
  it("constructs with x and y", () => {
    const v = new Vec2(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });

  it("adds two vectors", () => {
    const a = new Vec2(1, 2);
    const b = new Vec2(3, 4);
    const sum = a.add(b);
    expect(sum.x).toBe(4);
    expect(sum.y).toBe(6);
  });

  it("subtracts two vectors", () => {
    const a = new Vec2(5, 7);
    const b = new Vec2(2, 3);
    const diff = a.sub(b);
    expect(diff.x).toBe(3);
    expect(diff.y).toBe(4);
  });

  it("scales a vector", () => {
    const a = new Vec2(2, 3);
    const scaled = a.mul(2);
    expect(scaled.x).toBe(4);
    expect(scaled.y).toBe(6);
  });

  it("computes length", () => {
    const a = new Vec2(3, 4);
    expect(a.length()).toBe(5);
  });

  it("normalizes to unit length", () => {
    const a = new Vec2(3, 4);
    const n = a.normalize();
    expect(n.length()).toBeCloseTo(1);
  });

  it("returns zero when normalizing zero vector", () => {
    const a = new Vec2(0, 0);
    const n = a.normalize();
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
  });

  it("computes distance between two vectors", () => {
    const a = new Vec2(0, 0);
    const b = new Vec2(3, 4);
    expect(a.distanceTo(b)).toBe(5);
  });

  it("computes dot product", () => {
    const a = new Vec2(1, 2);
    const b = new Vec2(3, 4);
    expect(a.dot(b)).toBe(11);
  });

  it("does not mutate the original on add", () => {
    const a = new Vec2(1, 2);
    const b = new Vec2(3, 4);
    a.add(b);
    expect(a.x).toBe(1);
    expect(a.y).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- Vec2`
Expected: FAIL — `Cannot find module '@engine/Vec2'` or similar.

- [ ] **Step 3: Implement `Vec2`**

Create `src/engine/Vec2.ts`:
```ts
export class Vec2 {
  constructor(public x: number, public y: number) {}

  add(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  sub(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  mul(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  length(): number {
    return Math.hypot(this.x, this.y);
  }

  normalize(): Vec2 {
    const len = this.length();
    if (len === 0) return new Vec2(0, 0);
    return new Vec2(this.x / len, this.y / len);
  }

  distanceTo(other: Vec2): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  dot(other: Vec2): number {
    return this.x * other.x + this.y * other.y;
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  static zero(): Vec2 {
    return new Vec2(0, 0);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- Vec2`
Expected: PASS — all 10 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/engine/Vec2.ts tests/engine/Vec2.test.ts
git commit -m "feat(engine): add Vec2 primitive with tests"
```

---

## Task 3: RNG (TDD)

**Files:**
- Create: `src/engine/RNG.ts`
- Test: `tests/engine/RNG.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/engine/RNG.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { RNG } from "@engine/RNG";

describe("RNG", () => {
  it("is deterministic given a seed", () => {
    const a = new RNG(12345);
    const b = new RNG(12345);
    for (let i = 0; i < 10; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it("produces different sequences for different seeds", () => {
    const a = new RNG(1);
    const b = new RNG(2);
    expect(a.next()).not.toBe(b.next());
  });

  it("produces values in [0, 1)", () => {
    const r = new RNG(42);
    for (let i = 0; i < 100; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("int(min, max) produces integers in [min, max]", () => {
    const r = new RNG(7);
    for (let i = 0; i < 100; i++) {
      const v = r.int(5, 10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it("pick returns an element from the array", () => {
    const r = new RNG(99);
    const arr = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(r.pick(arr));
    }
  });

  it("chance returns true roughly at the given probability", () => {
    const r = new RNG(123);
    let hits = 0;
    for (let i = 0; i < 10000; i++) {
      if (r.chance(0.3)) hits++;
    }
    expect(hits).toBeGreaterThan(2500);
    expect(hits).toBeLessThan(3500);
  });

  it("derives a child RNG with a distinct but reproducible sequence", () => {
    const parent1 = new RNG(100);
    const parent2 = new RNG(100);
    const childA = parent1.derive("dungeon");
    const childB = parent2.derive("dungeon");
    for (let i = 0; i < 10; i++) {
      expect(childA.next()).toBe(childB.next());
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- RNG`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `RNG` using Mulberry32**

Create `src/engine/RNG.ts`:
```ts
/**
 * Seeded PRNG using Mulberry32.
 * Deterministic: same seed + same call sequence → same output.
 */
export class RNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  range(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("RNG.pick on empty array");
    const v = arr[this.int(0, arr.length - 1)];
    return v as T;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  derive(label: string): RNG {
    let hash = this.state;
    for (let i = 0; i < label.length; i++) {
      hash = (Math.imul(hash ^ label.charCodeAt(i), 0x85ebca6b) >>> 0);
    }
    return new RNG(hash);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- RNG`
Expected: PASS — all 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/engine/RNG.ts tests/engine/RNG.test.ts
git commit -m "feat(engine): add seeded RNG (Mulberry32) with derive()"
```

---

## Task 4: Input system

Input is stateful and coupled to browser APIs; we smoke-test manually rather than unit-test.

**Files:**
- Create: `src/engine/Input.ts`

- [ ] **Step 1: Implement `Input`**

Create `src/engine/Input.ts`:
```ts
export class Input {
  private keysDown = new Set<string>();
  private keysPressedThisFrame = new Set<string>();
  private keysReleasedThisFrame = new Set<string>();
  private mouseDown = new Set<number>();
  private mousePressedThisFrame = new Set<number>();
  private mouseReleasedThisFrame = new Set<number>();
  public mouseX = 0;
  public mouseY = 0;

  constructor(private target: HTMLElement | Window = window) {
    target.addEventListener("keydown", this.onKeyDown as EventListener);
    target.addEventListener("keyup", this.onKeyUp as EventListener);
    target.addEventListener("mousedown", this.onMouseDown as EventListener);
    target.addEventListener("mouseup", this.onMouseUp as EventListener);
    target.addEventListener("mousemove", this.onMouseMove as EventListener);
    target.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.keysDown.has(e.code)) this.keysPressedThisFrame.add(e.code);
    this.keysDown.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysDown.delete(e.code);
    this.keysReleasedThisFrame.add(e.code);
  };

  private onMouseDown = (e: MouseEvent) => {
    if (!this.mouseDown.has(e.button)) this.mousePressedThisFrame.add(e.button);
    this.mouseDown.add(e.button);
  };

  private onMouseUp = (e: MouseEvent) => {
    this.mouseDown.delete(e.button);
    this.mouseReleasedThisFrame.add(e.button);
  };

  private onMouseMove = (e: MouseEvent) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  };

  isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  wasKeyPressed(code: string): boolean {
    return this.keysPressedThisFrame.has(code);
  }

  wasKeyReleased(code: string): boolean {
    return this.keysReleasedThisFrame.has(code);
  }

  isMouseDown(button = 0): boolean {
    return this.mouseDown.has(button);
  }

  wasMousePressed(button = 0): boolean {
    return this.mousePressedThisFrame.has(button);
  }

  wasMouseReleased(button = 0): boolean {
    return this.mouseReleasedThisFrame.has(button);
  }

  /** Clear per-frame pressed/released tracking. Call at the end of each frame. */
  endFrame(): void {
    this.keysPressedThisFrame.clear();
    this.keysReleasedThisFrame.clear();
    this.mousePressedThisFrame.clear();
    this.mouseReleasedThisFrame.clear();
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/engine/Input.ts
git commit -m "feat(engine): add Input (keyboard + mouse) with per-frame edge tracking"
```

---

## Task 5: Renderer

**Files:**
- Create: `src/engine/Renderer.ts`

- [ ] **Step 1: Implement `Renderer`**

Create `src/engine/Renderer.ts`:
```ts
export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  readonly canvas: HTMLCanvasElement;
  readonly internalWidth: number;
  readonly internalHeight: number;

  constructor(canvas: HTMLCanvasElement, internalWidth = 640, internalHeight = 360) {
    this.canvas = canvas;
    this.internalWidth = internalWidth;
    this.internalHeight = internalHeight;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  clear(color = "#000000"): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  beginWorld(): void {
    const sx = this.canvas.width / this.internalWidth;
    const sy = this.canvas.height / this.internalHeight;
    this.ctx.save();
    this.ctx.scale(sx, sy);
  }

  endWorld(): void {
    this.ctx.restore();
  }

  drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  drawText(text: string, x: number, y: number, color = "#e8b060", size = 12): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.textBaseline = "top";
    this.ctx.fillText(text, x, y);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/engine/Renderer.ts
git commit -m "feat(engine): add Renderer wrapping Canvas 2D with world/screen split"
```

---

## Task 6: Scene base class

**Files:**
- Create: `src/engine/Scene.ts`

- [ ] **Step 1: Implement `Scene`**

Create `src/engine/Scene.ts`:
```ts
import type { Renderer } from "./Renderer";
import type { Input } from "./Input";

export interface SceneContext {
  input: Input;
  renderer: Renderer;
  deltaTime: number;
  now: number;
}

export abstract class Scene {
  abstract update(ctx: SceneContext): void;
  abstract render(renderer: Renderer, interpolation: number): void;

  onEnter(): void {}
  onExit(): void {}
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/engine/Scene.ts
git commit -m "feat(engine): add Scene base class and SceneContext"
```

---

## Task 7: Game loop

**Files:**
- Create: `src/engine/Game.ts`

- [ ] **Step 1: Implement `Game`**

Create `src/engine/Game.ts`:
```ts
import { Renderer } from "./Renderer";
import { Input } from "./Input";
import type { Scene, SceneContext } from "./Scene";

const FIXED_STEP = 1 / 60;
const MAX_STEPS_PER_FRAME = 10;

export class Game {
  readonly renderer: Renderer;
  readonly input: Input;
  private currentScene: Scene | null = null;
  private accumulator = 0;
  private lastTime = 0;
  private running = false;
  private _fps = 0;
  private _frameTimeMs = 0;
  private _frameCount = 0;
  private _fpsAccum = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.input = new Input();
  }

  get fps(): number {
    return this._fps;
  }

  get frameTimeMs(): number {
    return this._frameTimeMs;
  }

  switchScene(scene: Scene): void {
    if (this.currentScene) this.currentScene.onExit();
    this.currentScene = scene;
    scene.onEnter();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
  }

  private frame = (now: number): void => {
    if (!this.running) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.25);
    this.lastTime = now;
    this.accumulator += dt;

    this._frameTimeMs = dt * 1000;
    this._fpsAccum += dt;
    this._frameCount++;
    if (this._fpsAccum >= 0.5) {
      this._fps = Math.round(this._frameCount / this._fpsAccum);
      this._frameCount = 0;
      this._fpsAccum = 0;
    }

    let steps = 0;
    while (this.accumulator >= FIXED_STEP && steps < MAX_STEPS_PER_FRAME) {
      if (this.currentScene) {
        const ctx: SceneContext = {
          input: this.input,
          renderer: this.renderer,
          deltaTime: FIXED_STEP,
          now: now / 1000,
        };
        this.currentScene.update(ctx);
      }
      this.input.endFrame();
      this.accumulator -= FIXED_STEP;
      steps++;
    }
    if (steps >= MAX_STEPS_PER_FRAME) this.accumulator = 0;

    this.renderer.clear("#000000");
    if (this.currentScene) {
      this.currentScene.render(this.renderer, this.accumulator / FIXED_STEP);
    }

    requestAnimationFrame(this.frame);
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/engine/Game.ts
git commit -m "feat(engine): add Game main loop with fixed-step simulation"
```

---

## Task 8: EventBus (TDD)

**Files:**
- Create: `src/engine/EventBus.ts`
- Test: `tests/engine/EventBus.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/engine/EventBus.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@engine/EventBus";

describe("EventBus", () => {
  it("calls listeners when an event is emitted", () => {
    const bus = new EventBus<{ foo: { value: number } }>();
    const listener = vi.fn();
    bus.on("foo", listener);
    bus.emit("foo", { value: 42 });
    expect(listener).toHaveBeenCalledWith({ value: 42 });
  });

  it("calls multiple listeners for the same event", () => {
    const bus = new EventBus<{ foo: number }>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on("foo", a);
    bus.on("foo", b);
    bus.emit("foo", 1);
    expect(a).toHaveBeenCalledWith(1);
    expect(b).toHaveBeenCalledWith(1);
  });

  it("removes a specific listener with off()", () => {
    const bus = new EventBus<{ foo: number }>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on("foo", a);
    bus.on("foo", b);
    bus.off("foo", a);
    bus.emit("foo", 1);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });

  it("does not call listeners for unrelated events", () => {
    const bus = new EventBus<{ foo: number; bar: string }>();
    const listener = vi.fn();
    bus.on("foo", listener);
    bus.emit("bar", "hello");
    expect(listener).not.toHaveBeenCalled();
  });

  it("returns an unsubscribe function from on()", () => {
    const bus = new EventBus<{ foo: number }>();
    const listener = vi.fn();
    const unsubscribe = bus.on("foo", listener);
    unsubscribe();
    bus.emit("foo", 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it("clear() removes all listeners", () => {
    const bus = new EventBus<{ foo: number }>();
    const a = vi.fn();
    bus.on("foo", a);
    bus.clear();
    bus.emit("foo", 1);
    expect(a).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- EventBus`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `EventBus`**

Create `src/engine/EventBus.ts`:
```ts
type Listener<T> = (payload: T) => void;
type EventMap = Record<string, unknown>;

export class EventBus<Events extends EventMap> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const set = this.listeners[event] ?? new Set();
    set.add(listener);
    this.listeners[event] = set;
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners[event]?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.listeners[event];
    if (!set) return;
    for (const listener of set) listener(payload);
  }

  clear(): void {
    this.listeners = {};
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- EventBus`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/engine/EventBus.ts tests/engine/EventBus.test.ts
git commit -m "feat(engine): add typed EventBus with on/off/emit/clear"
```

---

## Task 9: Debug overlay

**Files:**
- Create: `src/engine/DebugOverlay.ts`

- [ ] **Step 1: Implement `DebugOverlay`**

Create `src/engine/DebugOverlay.ts`:
```ts
import type { Renderer } from "./Renderer";
import type { Game } from "./Game";

export class DebugOverlay {
  visible = true;
  private entries: string[] = [];

  addEntry(text: string): void {
    this.entries.push(text);
  }

  clear(): void {
    this.entries = [];
  }

  render(renderer: Renderer, game: Game): void {
    if (!this.visible) return;
    const ctx = renderer.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(4, 4, 220, 20 + this.entries.length * 16);
    renderer.drawText(`FPS ${game.fps}  FT ${game.frameTimeMs.toFixed(1)}ms`, 10, 8, "#e8b060", 14);
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (entry !== undefined) {
        renderer.drawText(entry, 10, 26 + i * 16, "#b8a060", 12);
      }
    }
    ctx.restore();
    this.entries = [];
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/engine/DebugOverlay.ts
git commit -m "feat(engine): add DebugOverlay (FPS, frame time, per-frame entries)"
```

---

## Task 10: Wire it all together with a TitleScene

**Files:**
- Create: `src/main.ts`
- Create: `src/scenes/TitleScene.ts`

- [ ] **Step 1: Create `src/scenes/TitleScene.ts`**

```ts
import { Scene, type SceneContext } from "@engine/Scene";
import type { Renderer } from "@engine/Renderer";

export class TitleScene extends Scene {
  private elapsed = 0;

  update(ctx: SceneContext): void {
    this.elapsed += ctx.deltaTime;
  }

  render(renderer: Renderer, _interpolation: number): void {
    renderer.beginWorld();
    const title = "BLACK STAR";
    const subtitle = "pre-alpha build";
    const prompt = this.elapsed % 1 < 0.5 ? "press any key" : "";
    renderer.drawText(title, 240, 140, "#e8b060", 32);
    renderer.drawText(subtitle, 264, 190, "#8a6a40", 12);
    renderer.drawText(prompt, 268, 240, "#b89050", 14);
    renderer.endWorld();
  }
}
```

- [ ] **Step 2: Create `src/main.ts`**

```ts
import { Game } from "@engine/Game";
import { DebugOverlay } from "@engine/DebugOverlay";
import { TitleScene } from "./scenes/TitleScene";

const canvas = document.getElementById("game") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas element #game not found");

const game = new Game(canvas);
const debug = new DebugOverlay();

game.switchScene(new TitleScene());

const originalFrame = (game as unknown as { frame: (n: number) => void }).frame;
void originalFrame;

(function installDebugRender() {
  const originalRender = (game.renderer as { render?: () => void }).render;
  void originalRender;
})();

game.start();

const render = () => {
  debug.render(game.renderer, game);
  requestAnimationFrame(render);
};
requestAnimationFrame(render);

window.addEventListener("keydown", (e) => {
  if (e.code === "F3") debug.visible = !debug.visible;
});
```

- [ ] **Step 3: Run dev server and smoke-test**

Run: `npm run dev`
Open http://localhost:5173 in a browser.
Expected: black canvas with "BLACK STAR" text in amber, blinking "press any key" prompt, FPS counter in the top-left showing ~60.

- [ ] **Step 4: Verify full test suite still passes**

Run: `npm run test:run`
Expected: all Vec2, RNG, EventBus tests pass.

- [ ] **Step 5: Verify typecheck and lint**

Run:
```bash
npm run typecheck
npm run lint
```
Expected: both pass with zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/main.ts src/scenes/TitleScene.ts
git commit -m "feat: wire up TitleScene + debug overlay, M1 foundation complete"
```

---

## Done criteria (M1 gate)

All of the following must be true:

- [ ] `npm run dev` starts the game, renders the title scene at 60 FPS
- [ ] `npm run test:run` passes with at least 23 tests green (10 Vec2 + 7 RNG + 6 EventBus)
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] F3 toggles the debug overlay
- [ ] The codebase follows the layering rule from TDD §2 (nothing in `engine/` imports from `scenes/` or higher)
- [ ] All commits are atomic and have conventional-commit messages

Once all boxes are checked, M1 (Engine Foundation) is complete and the project is ready for M2 (Combat Prototype).

---

## What comes next

The foundation plan only covers M1 (through week 6 of the roadmap). The follow-up plans will be written **after** this one is complete and the foundation is validated:

- **Plan 2: Combat Prototype (M2)** — player movement, one weapon, one enemy type, collision, health, loot drop
- **Plan 3: Dungeon Generator Prototype (M3)** — room templates, graph generator, spawn population
- **Plan 4: Space & Station Prototype (M4)** — ship flight, space scene, station shop, scene transitions
- **Plan 5: Prototype Integration (M5)** — save/load, full loop, prototype retrospective

Each follow-up plan will be ~similar length, written against this same skill, executed task-by-task with commits.

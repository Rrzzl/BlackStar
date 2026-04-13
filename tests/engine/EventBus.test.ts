import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@engine/EventBus";

interface TestEvents {
  "player:damaged": { amount: number };
  "enemy:killed": { id: string };
}

describe("EventBus", () => {
  it("calls subscribers when an event is emitted", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    bus.on("player:damaged", handler);
    bus.emit("player:damaged", { amount: 5 });
    expect(handler).toHaveBeenCalledWith({ amount: 5 });
  });

  it("supports multiple subscribers for the same event", () => {
    const bus = new EventBus<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on("enemy:killed", a);
    bus.on("enemy:killed", b);
    bus.emit("enemy:killed", { id: "x" });
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  it("off() removes a subscriber", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    bus.on("player:damaged", handler);
    bus.off("player:damaged", handler);
    bus.emit("player:damaged", { amount: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it("on() returns an unsubscribe function", () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    const unsub = bus.on("player:damaged", handler);
    unsub();
    bus.emit("player:damaged", { amount: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not throw when emitting with no subscribers", () => {
    const bus = new EventBus<TestEvents>();
    expect(() => bus.emit("player:damaged", { amount: 1 })).not.toThrow();
  });

  it("isolates errors in one handler from other handlers", () => {
    const bus = new EventBus<TestEvents>();
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();
    bus.on("player:damaged", bad);
    bus.on("player:damaged", good);
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    bus.emit("player:damaged", { amount: 1 });
    expect(good).toHaveBeenCalledOnce();
    err.mockRestore();
  });
});

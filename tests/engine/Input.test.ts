import { describe, expect, it } from "vitest";
import { localMousePoint } from "@engine/Input";

describe("localMousePoint", () => {
  it("converts client mouse coordinates into CSS-local canvas coordinates", () => {
    expect(localMousePoint(430, 260, { left: 110, top: 80 })).toEqual({
      x: 320,
      y: 180,
    });
  });
});

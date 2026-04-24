import { describe, expect, it } from "vitest";
import { applyWitnessNameInput } from "@scenes/WitnessCreationScene";

describe("applyWitnessNameInput", () => {
  it("appends supported key-code characters", () => {
    expect(applyWitnessNameInput("R", "KeyI")).toBe("RI");
    expect(applyWitnessNameInput("RICKY", "Digit7")).toBe("RICKY7");
  });

  it("removes the last character with Backspace", () => {
    expect(applyWitnessNameInput("RICKY", "Backspace")).toBe("RICK");
  });

  it("ignores unsupported edit keys", () => {
    expect(applyWitnessNameInput("RICKY", "ArrowDown")).toBeNull();
  });
});

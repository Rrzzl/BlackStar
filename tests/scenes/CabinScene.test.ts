import { describe, expect, it } from "vitest";
import { nextPauseSelection } from "@scenes/CabinScene";

describe("nextPauseSelection", () => {
  it("wraps upward from first pause option", () => {
    expect(nextPauseSelection(0, -1)).toBe(1);
  });

  it("wraps downward from last pause option", () => {
    expect(nextPauseSelection(1, 1)).toBe(0);
  });
});

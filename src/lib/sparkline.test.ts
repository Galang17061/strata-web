import { describe, expect, it } from "vitest";
import { sparklinePath } from "./sparkline";

describe("sparklinePath", () => {
  it("draws nothing for no values", () => {
    expect(sparklinePath([], 80, 24)).toBe("");
  });

  it("spreads points across the width and scales to the height", () => {
    expect(sparklinePath([1, 0.5, 0], 82, 26)).toBe("M1.00 1.00 L41.00 13.00 L81.00 25.00");
  });

  it("keeps a flat line in the middle when every value is the same", () => {
    expect(sparklinePath([0.9, 0.9], 12, 12)).toBe("M1.00 11.00 L11.00 11.00");
  });
});

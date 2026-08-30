import { describe, expect, it } from "vitest";
import { reliabilityBand, reliabilityThresholds } from "./reliability";

describe("reliabilityThresholds", () => {
  it("covers zero to one without a gap or an overlap", () => {
    const ordered = [...reliabilityThresholds].sort((a, b) => a.from - b.from);
    expect(ordered[0].from).toBe(0);
    expect(ordered[ordered.length - 1].to).toBe(1);
    for (let index = 1; index < ordered.length; index += 1) {
      expect(ordered[index].from).toBe(ordered[index - 1].to);
    }
  });

  it("agrees with the band a single value is given", () => {
    for (const threshold of reliabilityThresholds) {
      const inside = (threshold.from + threshold.to) / 2;
      expect(reliabilityBand(inside)).toBe(threshold.band);
      if (threshold.band !== "none") expect(reliabilityBand(threshold.from)).toBe(threshold.band);
    }
  });
});

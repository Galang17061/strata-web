import { describe, expect, it } from "vitest";
import { reliabilityBand, reliabilityLabel } from "./reliability";

describe("reliabilityBand", () => {
  it("places a value in the same band at every threshold", () => {
    expect(reliabilityBand(1)).toBe("high");
    expect(reliabilityBand(0.86)).toBe("high");
    expect(reliabilityBand(0.8599)).toBe("good");
    expect(reliabilityBand(0.76)).toBe("good");
    expect(reliabilityBand(0.7599)).toBe("moderate");
    expect(reliabilityBand(0.5)).toBe("moderate");
    expect(reliabilityBand(0.4999)).toBe("low");
    expect(reliabilityBand(0.1)).toBe("low");
    expect(reliabilityBand(0.0999)).toBe("none");
  });

  it("treats missing or impossible values as not available", () => {
    expect(reliabilityBand(null)).toBe("none");
    expect(reliabilityBand(undefined)).toBe("none");
    expect(reliabilityBand("")).toBe("none");
    expect(reliabilityBand("abc")).toBe("none");
    expect(reliabilityBand(1.2)).toBe("none");
  });

  it("accepts numbers written as strings", () => {
    expect(reliabilityBand("0.9421")).toBe("high");
    expect(reliabilityLabel("0.9421")).toBe("High");
    expect(reliabilityLabel(0.8)).toBe("Moderate to High");
    expect(reliabilityLabel(null)).toBe("N/A");
  });
});

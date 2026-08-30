import { describe, expect, it } from "vitest";
import {
  curvePoints,
  exponentialReliability,
  parallelReliability,
  seriesReliability,
  weibullReliability,
} from "./reliability-math";

describe("reliability math", () => {
  it("starts every curve at one and decays with time", () => {
    expect(weibullReliability(0, 1.8, 12000)).toBe(1);
    expect(exponentialReliability(0, 0.0001)).toBe(1);
    expect(weibullReliability(12000, 1.8, 12000)).toBeCloseTo(Math.exp(-1), 10);
    expect(exponentialReliability(10000, 0.0001)).toBeCloseTo(Math.exp(-1), 10);
  });

  it("combines blocks in series and in parallel", () => {
    expect(seriesReliability([0.9, 0.8])).toBeCloseTo(0.72, 10);
    expect(parallelReliability([0.9, 0.8])).toBeCloseTo(0.98, 10);
    expect(parallelReliability([0.5, 0.5, 0.5])).toBeCloseTo(0.875, 10);
  });

  it("draws a curve with the requested number of points", () => {
    const points = curvePoints("weibull", 20000, 40, { shape: 1.8, scale: 12000, failureRate: 0 });
    expect(points).toHaveLength(41);
    expect(points[0]).toEqual({ hours: 0, reliability: 1 });
    expect(points[40].hours).toBe(20000);
    expect(points[40].reliability).toBeLessThan(points[20].reliability);
  });
});

import { describe, expect, it } from "vitest";
import {
  curvePoints,
  exponentialReliability,
  parallelReliability,
  poissonReliability,
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

  it("matches the exponential score when no fault is tolerated", () => {
    expect(poissonReliability(8000, 0.00000851, 0)).toBeCloseTo(exponentialReliability(8000, 0.00000851), 15);
    expect(poissonReliability(8000, 0.00000851, 0)).toBeCloseTo(0.93418573572888, 14);
  });

  it("lifts the score with every tolerated fault", () => {
    expect(poissonReliability(8000, 0.00000851, 1)).toBeCloseTo(0.99778510061730, 14);
    expect(poissonReliability(8000, 0.00000851, 2)).toBeCloseTo(0.99995002299810, 13);
    expect(poissonReliability(10000, 0.0005, 3)).toBeCloseTo(0.26502591529736, 14);
    expect(poissonReliability(0, 0.0005, 3)).toBe(1);
  });

  it("draws a poisson curve through the same maths", () => {
    const points = curvePoints("poisson", 16000, 4, { shape: 0, scale: 0, failureRate: 0.00000851, allowedFailures: 2 });
    expect(points[0].reliability).toBe(1);
    expect(points[2]).toEqual({ hours: 8000, reliability: poissonReliability(8000, 0.00000851, 2) });
  });

  it("draws a curve with the requested number of points", () => {
    const points = curvePoints("weibull", 20000, 40, { shape: 1.8, scale: 12000, failureRate: 0 });
    expect(points).toHaveLength(41);
    expect(points[0]).toEqual({ hours: 0, reliability: 1 });
    expect(points[40].hours).toBe(20000);
    expect(points[40].reliability).toBeLessThan(points[20].reliability);
  });
});

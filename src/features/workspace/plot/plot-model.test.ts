import { describe, expect, it } from "vitest";
import type { PlotComponentParameters } from "@/features/workspace/types";
import { adjustBlock, componentReliabilityAt, evaluateFormula, kOutOfN, plotTimes } from "./plot-model";

const plotPart = (over: Partial<PlotComponentParameters>): PlotComponentParameters => ({
  systemComponentId: "SCP-00001",
  componentName: "Pump",
  vendorName: null,
  failureRate: null,
  runningHours: null,
  formulaCode: null,
  cost: null,
  activeComponent: null,
  totalComponent: null,
  serialNumber: null,
  distributionType: null,
  shapeParameter: null,
  scaleParameter: null,
  componentReliability: null,
  mtbf: null,
  allowedFailures: null,
  ...over,
});

describe("evaluateFormula", () => {
  it("reads the formulas the service writes", () => {
    expect(evaluateFormula("(CR1*CHPZ1)", { CR1: 0.9, CHPZ1: 0.8 })).toBeCloseTo(0.72, 12);
    expect(evaluateFormula("1-(1-RA)*(1-RB)", { RA: 0.9, RB: 0.8 })).toBeCloseTo(0.98, 12);
    expect(evaluateFormula("(1-(1-R1)*(1-R3))*R2*R4", { R1: 0.5, R3: 0.5, R2: 0.9, R4: 0.9 })).toBeCloseTo(0.6075, 12);
  });

  it("copes with codes that carry dashes and digits", () => {
    expect(evaluateFormula("HS-1*C2_1", { "HS-1": 0.5, C2_1: 0.5 })).toBeCloseTo(0.25, 12);
  });

  it("refuses a formula with a code it does not know", () => {
    expect(() => evaluateFormula("A*B", { A: 1 })).toThrow(/No value for B/);
    expect(() => evaluateFormula("(A", { A: 1 })).toThrow();
  });
});

describe("adjustBlock", () => {
  it("multiplies identical parts in series and survives on any one in parallel", () => {
    expect(adjustBlock(0.9, "Series", null, 2)).toBeCloseTo(0.81, 12);
    expect(adjustBlock(0.9, "Parallel", 1, 2)).toBeCloseTo(0.99, 12);
  });

  it("needs k of n when the block is partially redundant", () => {
    expect(kOutOfN(0.9, 2, 3)).toBeCloseTo(0.972, 12);
    expect(adjustBlock(0.9, "Partial", 2, 3)).toBeCloseTo(0.972, 12);
    expect(adjustBlock(0.9, "Parallel", 2, 3)).toBeCloseTo(0.972, 12);
    expect(adjustBlock(0.9, "Partial", 3, 3)).toBe(0.9);
  });
});

describe("componentReliabilityAt", () => {
  it("keeps a tolerant part above the plain one and equal to it at zero allowance", () => {
    const plain = componentReliabilityAt(plotPart({ distributionType: "Exponential", failureRate: 0.00000851 }), 8000);
    const zero = componentReliabilityAt(plotPart({ distributionType: "Poisson", failureRate: 0.00000851, allowedFailures: 0 }), 8000);
    const tolerant = componentReliabilityAt(plotPart({ distributionType: "Poisson", failureRate: 0.00000851, allowedFailures: 2 }), 8000);
    expect(zero).toBeCloseTo(plain, 12);
    expect(tolerant).toBeCloseTo(0.9999500229981053, 12);
    expect(tolerant).toBeGreaterThan(plain);
    expect(componentReliabilityAt(plotPart({ distributionType: "Poisson", failureRate: null }), 8000)).toBe(0);
  });
});

describe("plotTimes", () => {
  it("spreads twenty points from zero to the horizon", () => {
    const times = plotTimes(8000);
    expect(times).toHaveLength(20);
    expect(times[0]).toBe(0);
    expect(times[19]).toBe(8000);
    expect(plotTimes(0)[19]).toBe(1000);
  });
});

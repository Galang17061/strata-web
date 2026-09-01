import { describe, expect, it } from "vitest";
import { defaultSettings, settingsProblem, toPreviewInput } from "./optimization-studio";
import { choicesOf, hasManualChanges, locksOf, selectedCandidateId } from "./selection";
import type { OptimizationSlot } from "./types";

const slot = (id: string, proposed: number): OptimizationSlot => ({
  systemComponentId: id,
  componentName: "Pump",
  formulaCode: "C1",
  units: 2,
  connectionType: "Series",
  currentIndex: 0,
  proposedIndex: proposed,
  locked: false,
  candidates: [
    { componentId: `${id}-a`, vendorId: "V1", vendorName: "One", failureRate: 1e-6, unitCost: 10, reliability: 0.9 },
    { componentId: `${id}-b`, vendorId: "V2", vendorName: "Two", failureRate: 2e-6, unitCost: 5, reliability: 0.8 },
  ],
});

describe("picking and pinning vendors", () => {
  it("falls back to the proposal until the engineer picks by hand", () => {
    const first = slot("SCP-1", 1);
    expect(selectedCandidateId(first, {})).toBe("SCP-1-b");
    expect(selectedCandidateId(first, { "SCP-1": "SCP-1-a" })).toBe("SCP-1-a");
    expect(selectedCandidateId(first, { "SCP-1": "missing" })).toBe("SCP-1-b");
  });

  it("collects one choice per slot and only pinned slots as locks", () => {
    const slots = [slot("SCP-1", 1), slot("SCP-2", 0)];
    const selections = { "SCP-2": "SCP-2-b" };
    expect(choicesOf(slots, selections)).toEqual([
      { systemComponentId: "SCP-1", componentId: "SCP-1-b" },
      { systemComponentId: "SCP-2", componentId: "SCP-2-b" },
    ]);
    expect(locksOf(slots, selections, new Set(["SCP-2"]))).toEqual([{ systemComponentId: "SCP-2", componentId: "SCP-2-b" }]);
    expect(hasManualChanges(slots, selections)).toBe(true);
    expect(hasManualChanges(slots, {})).toBe(false);
  });
});

describe("settings guard and request shape", () => {
  it("only demands the limits the mode uses", () => {
    const settings = defaultSettings();
    expect(settingsProblem(settings)).toBeNull();
    expect(settingsProblem({ ...settings, mode: 2 })).toMatch(/budget/);
    expect(settingsProblem({ ...settings, mode: 2, maxBudget: "1000" })).toBeNull();
    expect(settingsProblem({ ...settings, mode: 3, maxBudget: "1000", targetReliability: "1.5" })).toMatch(/floor/);
  });

  it("sends the research weights as a pair that adds to one", () => {
    const settings = { ...defaultSettings(), mode: 3 as const, maxBudget: "2666000000", targetReliability: "0.844", weightCost: 0.85 };
    const input = toPreviewInput("RS-1", settings, []);
    expect(input.maxBudget).toBe(2666000000);
    expect(input.weightCost).toBe(0.85);
    expect(input.weightReliability).toBeCloseTo(0.15, 10);
    expect(input.locks).toBeUndefined();
    const modeOne = toPreviewInput("RS-1", defaultSettings(), []);
    expect(modeOne.maxBudget).toBeUndefined();
    expect(modeOne.targetReliability).toBeUndefined();
  });
});

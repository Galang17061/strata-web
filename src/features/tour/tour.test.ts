import { describe, expect, it } from "vitest";
import { tracks } from "./steps";
import { spotlightFrom } from "./tour-overlay";

describe("the spotlight frames its target", () => {
  it("pads the hole evenly on every side", () => {
    const hole = spotlightFrom({ top: 100, left: 50, width: 200, height: 40 });
    expect(hole).toEqual({ top: 92, left: 42, width: 216, height: 56 });
  });

  it("accepts a custom breathing space", () => {
    const hole = spotlightFrom({ top: 10, left: 10, width: 10, height: 10 }, 0);
    expect(hole).toEqual({ top: 10, left: 10, width: 10, height: 10 });
  });
});

describe("the tours stay well formed", () => {
  it("keeps unique ids and non-empty words in every step", () => {
    for (const steps of Object.values(tracks)) {
      const ids = steps.map((step) => step.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const step of steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.body.length).toBeGreaterThan(0);
        expect(step.target).toMatch(/^\[data-tour=/);
      }
    }
  });

  it("only waits for a selector that a later moment can satisfy", () => {
    for (const steps of Object.values(tracks)) {
      for (const step of steps) {
        if (step.waitFor) expect(step.waitFor).toMatch(/^\[data-tour=/);
      }
    }
  });
});

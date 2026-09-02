import { describe, expect, it } from "vitest";
import type { TreeNode } from "./types";
import { reliabilityOf, reportRows } from "./report-screen";

const tree: TreeNode[] = [
  {
    hierarchyId: "h1",
    name: "Cooling",
    connectionType: "Series",
    formulaCode: "RA",
    level: 1,
    components: [
      {
        systemComponentId: "c1",
        formulaCode: "RB",
        componentName: "Compressor",
        vendorName: "Arjuna",
        totalComponent: 2,
        activeComponent: 1,
        connectionType: "Parallel",
        targetEdges: null,
      },
    ],
    hierarchy: [
      {
        hierarchyId: "h2",
        name: "Fans",
        connectionType: "Partial",
        formulaCode: "RC",
        level: 2,
        components: null,
        hierarchy: null,
      },
    ],
  },
];

const figures = {
  rbdSystemId: "s",
  systemName: "Fridge",
  reliabilityTotal: 0.9,
  formula: null,
  level: null,
  hierarchyLookup: { RA: 0.95, RC: 0.91 },
  componentLookup: { RB: 0.97 },
};

describe("the report flattens the tree without losing anyone", () => {
  it("lists every layer with its figure and wording", () => {
    const { layers } = reportRows(tree, figures);
    expect(layers).toEqual([
      { Level: 1, Block: "Cooling", Wiring: "series", Reliability: 0.95 },
      { Level: 2, Block: "Fans", Wiring: "k out of n", Reliability: 0.91 },
    ]);
  });

  it("keeps components under their block with units and vendor", () => {
    const { components } = reportRows(tree, figures);
    expect(components).toEqual([
      {
        Level: 1,
        Block: "Cooling",
        Component: "Compressor",
        Vendor: "Arjuna",
        Wiring: "parallel",
        Units: "1/2",
        Reliability: 0.97,
      },
    ]);
  });

  it("leaves the figure blank when the lookup has nothing to say", () => {
    expect(reliabilityOf(null, "RA")).toBeNull();
    expect(reliabilityOf({ RA: 0.5 }, null)).toBeNull();
    expect(reliabilityOf({ RA: 0.5 }, "RB")).toBeNull();
    const { layers } = reportRows(tree, null);
    expect(layers[0].Reliability).toBe("");
  });
});

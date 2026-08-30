import { describe, expect, it } from "vitest";
import type { SystemTree } from "@/features/projects/types";
import { ancestorsOf, buildCanvas, disconnectedBlocks, levelContent, toEdgePayload, toNodePayload } from "./model";

const tree: SystemTree = {
  rbdSystemId: "00000001",
  projectId: "PJ-00001",
  projectName: "Plant A",
  systemName: "Cooling loop",
  hierarchy: [
    {
      hierarchyId: "H-1",
      name: "Pump station",
      connectionType: "series",
      formulaCode: "HS1",
      level: 1,
      hierarchy: null,
      components: [
        {
          systemComponentId: "SCP-1",
          formulaCode: "C1",
          componentName: "Pump",
          vendorName: "Northwind",
          totalComponent: 2,
          activeComponent: 1,
          connectionType: "Parallel",
          targetEdges: [],
        },
      ],
    },
    {
      hierarchyId: "H-2",
      name: "Drive rack",
      connectionType: "series",
      formulaCode: "HS2",
      level: 1,
      hierarchy: [
        { hierarchyId: "H-3", name: "Inverters", connectionType: "series", formulaCode: "HS3", level: 2, hierarchy: null, components: [] },
      ],
      components: null,
    },
  ],
};

describe("levelContent", () => {
  it("lists the first layer at system level and the parts inside a layer", () => {
    const system = levelContent(tree, { scope: "system", id: "00000001" });
    expect(system.subsystems.map((node) => node.name)).toEqual(["Pump station", "Drive rack"]);
    const pumps = levelContent(tree, { scope: "hierarchy", id: "H-1" });
    expect(pumps.components).toHaveLength(1);
    expect(pumps.level).toBe(1);
  });

  it("walks back up to every ancestor", () => {
    expect(ancestorsOf(tree, "H-3").map((node) => node.hierarchyId)).toEqual(["H-2", "H-3"]);
  });
});

describe("buildCanvas", () => {
  it("turns tree parts, saved positions, and values into blocks and links", () => {
    const content = levelContent(tree, { scope: "hierarchy", id: "H-1" });
    const { nodes, edges } = buildCanvas(
      content,
      [
        { systemComponentId: "SCP-1", connectionType: "Parallel", positionX: "120.00", positionY: "40.00", idNode: "C1", componentName: "Pump", vendorName: "Northwind", activeComponent: 1 },
        { systemComponentId: "SCP-9", connectionType: "virtual", positionX: "-100.00", positionY: "0.00", idNode: "INH-1", componentName: "IN", vendorName: null, activeComponent: 1 },
        { systemComponentId: "SCP-10", connectionType: "virtual", positionX: null, positionY: null, idNode: "OUTH-1", componentName: "OUT", vendorName: null, activeComponent: 1 },
      ],
      [
        { idEdge: "IEH-11", sourceId: "INH-1", targetId: "C1" },
        { idEdge: "IEH-12", sourceId: "C1", targetId: "OUTH-1" },
        { idEdge: "IEH-13", sourceId: "C1", targetId: "GHOST" },
      ],
      { C1: 0.9421 },
    );
    expect(nodes.map((node) => node.id)).toEqual(["C1", "INH-1", "OUTH-1"]);
    expect(nodes[0].position).toEqual({ x: 120, y: 40 });
    expect(nodes[0].data.value).toBe(0.9421);
    expect(nodes[1].data.virtualRole).toBe("in");
    expect(nodes[2].position.x).toBeGreaterThan(120);
    expect(edges.map((edge) => edge.id)).toEqual(["IEH-11", "IEH-12"]);
  });

  it("writes positions with two decimals and numbers links per layer", () => {
    const content = levelContent(tree, { scope: "system", id: "00000001" });
    const { nodes } = buildCanvas(content, [], [], null);
    const payload = toNodePayload(nodes, "system");
    expect(payload[0]).toEqual({ idNode: "HS1", connectionType: "series", positionX: "240.00", positionY: "0.00" });
    expect(toEdgePayload([{ id: "x", source: "HS1", target: "HS2" }], "00000001")).toEqual([
      { idEdge: "IE000000011", sourceId: "HS1", targetId: "HS2" },
    ]);
  });

  it("names the blocks that are not wired on both sides", () => {
    const content = levelContent(tree, { scope: "system", id: "00000001" });
    const { nodes } = buildCanvas(content, [], [], null);
    expect(disconnectedBlocks(nodes, [{ id: "e", source: "HS1", target: "HS2" }])).toEqual(["Pump station", "Drive rack"]);
    expect(
      disconnectedBlocks(nodes, [
        { id: "a", source: "IN", target: "HS1" },
        { id: "b", source: "HS1", target: "HS2" },
        { id: "c", source: "HS2", target: "OUT" },
      ]),
    ).toEqual([]);
  });
});

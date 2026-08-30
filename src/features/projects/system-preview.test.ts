import { describe, expect, it } from "vitest";
import type { DrawingNodeView } from "@/features/workspace/types";
import { previewLayout } from "./system-preview";

function node(idNode: string, x: string | null, y: string | null, connectionType: string | null = null): DrawingNodeView {
  return { idNode, connectionType, positionX: x, positionY: y, componentName: null, vendorName: null, activeComponent: null };
}

describe("the card sketch lays out what the drawing stores", () => {
  it("places blocks at their saved spots and marks virtual pills", () => {
    const layout = previewLayout([node("C1", "50", "0"), node("INH-1", "-100", "0", "virtual")]);
    expect(layout.boxes).toHaveLength(2);
    expect(layout.boxes[0]).toMatchObject({ id: "C1", x: 50, y: 0, virtual: false });
    expect(layout.boxes[1].virtual).toBe(true);
  });

  it("wires a link from the source edge to the target edge", () => {
    const layout = previewLayout(
      [node("C1", "0", "0"), node("C2", "300", "0")],
      [{ idEdge: "E1", sourceId: "C1", targetId: "C2" }],
    );
    expect(layout.links).toHaveLength(1);
    expect(layout.links[0].x1).toBeGreaterThan(0);
    expect(layout.links[0].x2).toBe(300);
  });

  it("drops links whose ends are not on the sheet", () => {
    const layout = previewLayout([node("C1", "0", "0")], [{ idEdge: "E1", sourceId: "C1", targetId: "GONE" }]);
    expect(layout.links).toHaveLength(0);
  });

  it("still lines up blocks that never stored a position", () => {
    const layout = previewLayout([node("C1", null, null), node("C2", null, null)]);
    expect(layout.boxes[0].x).not.toBe(layout.boxes[1].x);
  });
});

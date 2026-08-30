import { render, screen } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SystemTree } from "@/features/projects/types";
import { TreePanel } from "./tree-panel";

function treeOfDepth(hierarchyDepth: number): SystemTree {
  return {
    rbdSystemId: "00000001",
    projectId: "PJ-00001",
    projectName: "Plant A",
    hierarchyDepth,
    systemName: "Cooling loop",
    hierarchy: [
      { hierarchyId: "H-1", name: "Pump station", connectionType: "series", formulaCode: "HS1", level: 1, hierarchy: null, components: null },
    ],
  };
}

function renderPanel(tree: SystemTree) {
  return render(
    <TreePanel
      tree={tree}
      level={{ scope: "system", id: tree.rbdSystemId }}
      values={null}
      selectedCode={null}
      canEdit
      onOpenLevel={vi.fn()}
      onSelectComponent={vi.fn()}
      onAction={vi.fn()}
    />,
  );
}

class QuietObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", QuietObserver);
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});

describe("the layer tree honours the project depth", () => {
  it("offers a deeper subsystem while the project allows more levels", async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    renderPanel(treeOfDepth(5));
    await user.click(screen.getByRole("button", { name: /actions for pump station/i }));
    expect(await screen.findByText(/add subsystem inside/i)).toBeInTheDocument();
  });

  it("stops offering subsystems at the deepest allowed level", async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    renderPanel(treeOfDepth(1));
    await user.click(screen.getByRole("button", { name: /actions for pump station/i }));
    expect(await screen.findByText(/add component/i)).toBeInTheDocument();
    expect(screen.queryByText(/add subsystem inside/i)).not.toBeInTheDocument();
  });
});

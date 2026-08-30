import type { Edge, Node } from "@xyflow/react";
import type { SystemTree, TreeComponent, TreeNode } from "@/features/projects/types";
import type {
  DrawingEdgeInput,
  DrawingEdgeView,
  DrawingNodeInput,
  DrawingNodeView,
  DrawingScope,
} from "@/features/workspace/types";

export type BlockKind = "component" | "subsystem" | "virtual";

export type BlockData = {
  code: string;
  name: string;
  kind: BlockKind;
  entityId: string;
  vendor: string | null;
  value: number | null;
  connectionType: string | null;
  active: number | null;
  total: number | null;
  distribution: string | null;
  virtualRole: "in" | "out" | null;
  level: number | null;
};

export type EdgeData = {
  fresh?: boolean;
};

export type CanvasNode = Node<BlockData, "block" | "virtual">;
export type CanvasEdge = Edge<EdgeData>;

export type Level = { scope: DrawingScope; id: string };

export type LevelContent = {
  name: string;
  level: number;
  node: TreeNode | null;
  subsystems: TreeNode[];
  components: TreeComponent[];
};

export function findTreeNode(nodes: TreeNode[] | null | undefined, hierarchyId: string): TreeNode | null {
  for (const node of nodes ?? []) {
    if (node.hierarchyId === hierarchyId) return node;
    const nested = findTreeNode(node.hierarchy, hierarchyId);
    if (nested) return nested;
  }
  return null;
}

export function ancestorsOf(tree: SystemTree, hierarchyId: string): TreeNode[] {
  const path: TreeNode[] = [];
  const walk = (nodes: TreeNode[] | null | undefined): boolean => {
    for (const node of nodes ?? []) {
      path.push(node);
      if (node.hierarchyId === hierarchyId || walk(node.hierarchy)) return true;
      path.pop();
    }
    return false;
  };
  walk(tree.hierarchy);
  return path;
}

export function parentLevelOfComponent(tree: SystemTree, systemComponentId: string): TreeNode | null {
  const walk = (nodes: TreeNode[] | null | undefined): TreeNode | null => {
    for (const node of nodes ?? []) {
      if ((node.components ?? []).some((component) => component.systemComponentId === systemComponentId)) return node;
      const nested = walk(node.hierarchy);
      if (nested) return nested;
    }
    return null;
  };
  return walk(tree.hierarchy);
}

export function levelContent(tree: SystemTree, level: Level): LevelContent {
  if (level.scope === "system") {
    return { name: tree.systemName, level: 0, node: null, subsystems: tree.hierarchy ?? [], components: [] };
  }
  const node = findTreeNode(tree.hierarchy, level.id);
  return {
    name: node?.name ?? "Layer",
    level: node?.level ?? 0,
    node,
    subsystems: node?.hierarchy ?? [],
    components: node?.components ?? [],
  };
}

export function isVirtualCode(code: string | null | undefined): boolean {
  return Boolean(code && (code.startsWith("IN") || code.startsWith("OUT")));
}

export function virtualRoleOf(code: string): "in" | "out" {
  return code.startsWith("OUT") ? "out" : "in";
}

export function parsePosition(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const columnGap = 240;
const rowGap = 120;

export function buildCanvas(
  content: LevelContent,
  drawingNodes: DrawingNodeView[],
  drawingEdges: DrawingEdgeView[],
  values: Record<string, number> | null | undefined,
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const positions = new Map<string, { x: number | null; y: number | null; entityId: string; connectionType: string | null }>();
  for (const node of drawingNodes) {
    if (!node.idNode) continue;
    positions.set(node.idNode, {
      x: parsePosition(node.positionX),
      y: parsePosition(node.positionY),
      entityId: node.hierarchyId ?? node.systemComponentId ?? node.idNode,
      connectionType: node.connectionType,
    });
  }

  const blocks: CanvasNode[] = [];
  let column = 1;
  const place = (code: string, fallbackIndex: number) => {
    const saved = positions.get(code);
    if (saved && saved.x !== null && saved.y !== null) return { x: saved.x, y: saved.y };
    return { x: column * columnGap, y: (fallbackIndex % 3) * rowGap };
  };

  content.subsystems.forEach((subsystem, index) => {
    const code = subsystem.formulaCode ?? subsystem.hierarchyId;
    blocks.push({
      id: code,
      type: "block",
      position: place(code, index),
      deletable: false,
      data: {
        code,
        name: subsystem.name,
        kind: "subsystem",
        entityId: subsystem.hierarchyId,
        vendor: null,
        value: values?.[code] ?? null,
        connectionType: positions.get(code)?.connectionType ?? subsystem.connectionType,
        active: null,
        total: null,
        distribution: null,
        virtualRole: null,
        level: subsystem.level,
      },
    });
    column += 1;
  });

  content.components.forEach((component, index) => {
    const code = component.formulaCode ?? component.systemComponentId;
    blocks.push({
      id: code,
      type: "block",
      position: place(code, index),
      deletable: false,
      data: {
        code,
        name: component.componentName ?? "Component",
        kind: "component",
        entityId: component.systemComponentId,
        vendor: component.vendorName,
        value: values?.[code] ?? null,
        connectionType: positions.get(code)?.connectionType ?? component.connectionType,
        active: component.activeComponent,
        total: component.totalComponent,
        distribution: null,
        virtualRole: null,
        level: null,
      },
    });
    column += 1;
  });

  const lastX = blocks.reduce((max, block) => Math.max(max, block.position.x), 0);
  for (const node of drawingNodes) {
    const code = node.idNode;
    if (!code || !(node.connectionType === "virtual" || isVirtualCode(code))) continue;
    const role = virtualRoleOf(code);
    const saved = positions.get(code);
    const fallback = role === "in" ? { x: 0, y: 0 } : { x: lastX + columnGap, y: 0 };
    blocks.push({
      id: code,
      type: "virtual",
      position: saved && saved.x !== null && saved.y !== null ? { x: saved.x, y: saved.y } : fallback,
      deletable: false,
      data: {
        code,
        name: role === "in" ? "IN" : "OUT",
        kind: "virtual",
        entityId: saved?.entityId ?? code,
        vendor: null,
        value: null,
        connectionType: "virtual",
        active: null,
        total: null,
        distribution: null,
        virtualRole: role,
        level: null,
      },
    });
  }

  const known = new Set(blocks.map((block) => block.id));
  const edges: CanvasEdge[] = drawingEdges
    .filter((edge) => edge.sourceId && edge.targetId && known.has(edge.sourceId) && known.has(edge.targetId))
    .map((edge, index) => ({
      id: edge.idEdge ?? `edge-${index}`,
      source: edge.sourceId as string,
      target: edge.targetId as string,
      type: "flow",
      data: { fresh: false },
    }));

  return { nodes: blocks, edges };
}

export function toNodePayload(nodes: CanvasNode[], scope: DrawingScope): DrawingNodeInput[] {
  return nodes
    .filter((node) => scope === "system" || node.data.kind !== "virtual" || true)
    .map((node) => ({
      idNode: node.data.code,
      connectionType: node.data.kind === "virtual" ? "virtual" : (node.data.connectionType ?? "series"),
      positionX: node.position.x.toFixed(2),
      positionY: node.position.y.toFixed(2),
    }));
}

export function toEdgePayload(edges: CanvasEdge[], levelId: string): DrawingEdgeInput[] {
  return edges.map((edge, index) => ({
    idEdge: `IE${levelId}${index + 1}`,
    sourceId: edge.source,
    targetId: edge.target,
  }));
}

export function disconnectedBlocks(nodes: CanvasNode[], edges: CanvasEdge[]): string[] {
  return nodes
    .filter((node) => node.data.kind !== "virtual")
    .filter(
      (node) =>
        !edges.some((edge) => edge.target === node.id) || !edges.some((edge) => edge.source === node.id),
    )
    .map((node) => node.data.name);
}

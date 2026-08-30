"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { listDrawingEdges, listDrawingNodes } from "@/features/workspace/api";
import type { DrawingEdgeView, DrawingNodeView } from "@/features/workspace/types";
import { queryKeys } from "@/lib/query-keys";

const blockWidth = 190;
const blockHeight = 60;
const virtualWidth = 90;
const virtualHeight = 40;
const padding = 30;

export type PreviewBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  virtual: boolean;
};

export type PreviewLink = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type PreviewLayout = {
  boxes: PreviewBox[];
  links: PreviewLink[];
  viewBox: string;
};

export function previewLayout(nodes: DrawingNodeView[], edges: DrawingEdgeView[] = []): PreviewLayout {
  const boxes: PreviewBox[] = [];
  let fallback = 0;
  for (const node of nodes) {
    const id = node.idNode ?? node.hierarchyId ?? node.systemComponentId;
    if (!id) continue;
    const virtual = node.connectionType === "virtual";
    const parsedX = Number(node.positionX);
    const parsedY = Number(node.positionY);
    const x = Number.isFinite(parsedX) ? parsedX : fallback * (blockWidth + 60);
    const y = Number.isFinite(parsedY) ? parsedY : 0;
    fallback += 1;
    boxes.push({
      id,
      x,
      y,
      width: virtual ? virtualWidth : blockWidth,
      height: virtual ? virtualHeight : blockHeight,
      virtual,
    });
  }
  if (boxes.length === 0) return { boxes, links: [], viewBox: "0 0 100 100" };
  const byId = new Map(boxes.map((box) => [box.id, box]));
  const links: PreviewLink[] = [];
  for (const edge of edges) {
    const source = edge.sourceId ? byId.get(edge.sourceId) : undefined;
    const target = edge.targetId ? byId.get(edge.targetId) : undefined;
    if (!source || !target) continue;
    links.push({
      id: edge.idEdge ?? `${edge.sourceId}-${edge.targetId}`,
      x1: source.x + source.width,
      y1: source.y + source.height / 2,
      x2: target.x,
      y2: target.y + target.height / 2,
    });
  }
  const minX = Math.min(...boxes.map((box) => box.x)) - padding;
  const minY = Math.min(...boxes.map((box) => box.y)) - padding;
  const maxX = Math.max(...boxes.map((box) => box.x + box.width)) + padding;
  const maxY = Math.max(...boxes.map((box) => box.y + box.height)) + padding;
  return { boxes, links, viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}` };
}

export function SystemPreview({ rbdSystemId }: { rbdSystemId: string }) {
  const nodes = useQuery({
    queryKey: queryKeys.drawing.nodes("system", rbdSystemId),
    queryFn: () => listDrawingNodes("system", rbdSystemId),
  });
  const edges = useQuery({
    queryKey: queryKeys.drawing.edges("system", rbdSystemId),
    queryFn: () => listDrawingEdges("system", rbdSystemId),
  });

  if (nodes.isPending || edges.isPending) return <Skeleton className="h-24 w-full" />;

  const layout = previewLayout(nodes.data?.data ?? [], edges.data?.data ?? []);
  if (layout.boxes.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-sm border border-dashed border-border text-caption text-foreground-subtle">
        Nothing drawn yet
      </div>
    );
  }

  return (
    <svg viewBox={layout.viewBox} preserveAspectRatio="xMidYMid meet" className="h-24 w-full rounded-sm bg-surface-sunken" aria-hidden="true">
      {layout.links.map((link) => (
        <line key={link.id} x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} className="stroke-border-strong" strokeWidth={2} />
      ))}
      {layout.boxes.map((box) => (
        <rect
          key={box.id}
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}
          rx={box.virtual ? box.height / 2 : 8}
          className={box.virtual ? "fill-surface stroke-border" : "fill-surface stroke-border-strong"}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

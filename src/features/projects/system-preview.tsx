"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { listDrawingNodes } from "@/features/workspace/api";
import type { DrawingNodeView } from "@/features/workspace/types";
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

export type PreviewLayout = {
  boxes: PreviewBox[];
  viewBox: string;
};

export function previewLayout(nodes: DrawingNodeView[]): PreviewLayout {
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
  if (boxes.length === 0) return { boxes, viewBox: "0 0 100 100" };
  const minX = Math.min(...boxes.map((box) => box.x)) - padding;
  const minY = Math.min(...boxes.map((box) => box.y)) - padding;
  const maxX = Math.max(...boxes.map((box) => box.x + box.width)) + padding;
  const maxY = Math.max(...boxes.map((box) => box.y + box.height)) + padding;
  return { boxes, viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}` };
}

export function SystemPreview({ rbdSystemId }: { rbdSystemId: string }) {
  const nodes = useQuery({
    queryKey: queryKeys.drawing.nodes("system", rbdSystemId),
    queryFn: () => listDrawingNodes("system", rbdSystemId),
  });

  if (nodes.isPending) return <Skeleton className="h-24 w-full" />;

  const layout = previewLayout(nodes.data?.data ?? []);
  if (layout.boxes.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-sm border border-dashed border-border text-caption text-foreground-subtle">
        Nothing drawn yet
      </div>
    );
  }

  return (
    <svg viewBox={layout.viewBox} preserveAspectRatio="xMidYMid meet" className="h-24 w-full rounded-sm bg-surface-sunken" aria-hidden="true">
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

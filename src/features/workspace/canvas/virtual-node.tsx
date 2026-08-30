"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import type { CanvasNode } from "@/features/workspace/model";
import { cn } from "@/lib/utils";

function VirtualNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const isIn = data.virtualRole !== "out";
  return (
    <div
      className={cn(
        "flex h-9 min-w-16 items-center justify-center rounded-pill border bg-surface-sunken px-4 font-mono text-caption font-medium tracking-normal text-foreground-muted shadow-sm",
        selected ? "border-primary ring-2 ring-ring" : "border-border-strong",
      )}
      aria-label={isIn ? "Input" : "Output"}
    >
      {isIn ? null : <Handle type="target" position={Position.Left} className="!size-2.5 !rounded-pill !border-2" />}
      {data.name}
      {isIn ? <Handle type="source" position={Position.Right} className="!size-2.5 !rounded-pill !border-2" /> : null}
    </div>
  );
}

export const VirtualNode = memo(VirtualNodeComponent);

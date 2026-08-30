"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Layers } from "lucide-react";
import { memo } from "react";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import type { CanvasNode } from "@/features/workspace/model";
import { cn } from "@/lib/utils";

export function connectionLabel(connectionType: string | null, active: number | null, total: number | null): string | null {
  if (!connectionType) return null;
  const upper = connectionType.toUpperCase();
  const count = total ?? 1;
  const alive = active ?? count;
  if (upper.includes("PARTIAL") || upper.includes("REDUNDAN")) return `${alive} of ${count}`;
  if (upper.includes("PARALLEL")) return count > 1 ? `parallel · ${count}` : "parallel";
  if (upper.includes("SERIES") || upper.includes("SERIAL")) return count > 1 ? `series · ${count}` : "series";
  return connectionType.toLowerCase();
}

function distributionGlyph(distribution: string | null): string | null {
  if (!distribution) return null;
  const lower = distribution.toLowerCase();
  if (lower.startsWith("weibull")) return "β η";
  if (lower.startsWith("exponential")) return "λ";
  return null;
}

function BlockNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const wiring = connectionLabel(data.connectionType, data.active, data.total);
  const glyph = distributionGlyph(data.distribution);

  return (
    <div
      className={cn(
        "group/block flex w-48 flex-col gap-2 rounded-md border bg-surface p-3 text-left shadow-sm transition-[border-color,box-shadow] duration-(--dur-fast)",
        selected ? "border-primary ring-2 ring-ring" : "border-border-strong hover:border-primary/60",
      )}
    >
      <Handle type="target" position={Position.Left} className="!size-2.5 !rounded-pill !border-2" />
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-body-sm font-semibold text-foreground">{data.name}</span>
        {data.kind === "subsystem" ? (
          <Layers className="size-4 shrink-0 text-foreground-subtle" aria-label="Subsystem" />
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-caption tracking-normal text-foreground-muted">{data.code}</span>
        {glyph ? <span className="font-mono text-caption tracking-normal text-foreground-subtle">{glyph}</span> : null}
      </div>
      <div className="flex items-center justify-between gap-2">
        <ReliabilityBadge value={data.value} size="sm" showLabel={false} />
        {wiring ? <span className="text-caption text-foreground-subtle normal-case tracking-normal">{wiring}</span> : null}
      </div>
      <Handle type="source" position={Position.Right} className="!size-2.5 !rounded-pill !border-2" />
    </div>
  );
}

export const BlockNode = memo(BlockNodeComponent);

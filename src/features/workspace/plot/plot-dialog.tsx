"use client";

import { useEffect, useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SystemTree } from "@/features/projects/types";
import type { Level } from "@/features/workspace/model";
import { useLevelPlot } from "@/features/workspace/plot/use-level-plot";
import { formatCount, formatHours, formatReliability } from "@/lib/format";

type PlotDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tree: SystemTree;
  level: Level;
};

const axisTick = { fill: "var(--foreground-muted)", fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" };

export function PlotDialog({ open, onOpenChange, tree, level }: PlotDialogProps) {
  const gradientId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { plot, loading, error } = useLevelPlot(tree, level, open);
  const rows = plot ? plot.times.map((hours, index) => ({ hours, total: plot.total.values[index] })) : [];
  const horizon = plot ? plot.times[plot.times.length - 1] : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{plot?.total.name ?? "Reliability over time"}</DialogTitle>
          <DialogDescription>How the chance of this {level.scope === "system" ? "system" : "layer"} still working falls as the hours pass.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : error || !plot ? (
          <p className="rounded-sm border border-border bg-surface-sunken px-3 py-4 text-body-sm text-foreground-muted">
            {error ?? "Nothing to plot yet. Wire the blocks and save the drawing first."}
          </p>
        ) : (
          <div className="h-80 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rows} margin={{ top: 8, right: 20, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="hours"
                    type="number"
                    domain={[0, horizon]}
                    tickFormatter={(tick: number) => formatCount(tick)}
                    stroke="var(--border-strong)"
                    tick={axisTick}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} stroke="var(--border-strong)" tick={axisTick} tickLine={false} />
                  <Tooltip
                    cursor={{ stroke: "var(--border-strong)" }}
                    contentStyle={{
                      background: "var(--surface-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 12,
                      color: "var(--foreground)",
                    }}
                    labelFormatter={(label) => formatHours(label)}
                    formatter={(item) => [formatReliability(item, 4), plot.total.name]}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

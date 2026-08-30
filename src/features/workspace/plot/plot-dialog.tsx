"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { SystemTree } from "@/features/projects/types";
import type { Level } from "@/features/workspace/model";
import type { PlotSeries } from "@/features/workspace/plot/plot-model";
import { PlotTooltip } from "@/features/workspace/plot/plot-tooltip";
import { useLevelPlot } from "@/features/workspace/plot/use-level-plot";
import { formatCount } from "@/lib/format";
import { reliabilityLabels, reliabilityThresholds } from "@/lib/reliability";
import { cn } from "@/lib/utils";

type PlotDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tree: SystemTree;
  level: Level;
};

const axisTick = { fill: "var(--foreground-muted)", fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" };
const seriesColors = ["var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function colorForSeries(index: number): string {
  return seriesColors[index % seriesColors.length];
}

function SeriesChip({ series, color, active, onToggle }: { series: PlotSeries; color: string; active: boolean; onToggle: () => void }) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      role="checkbox"
      aria-checked={active}
      onClick={onToggle}
      className={cn("h-7 gap-1.5 rounded-pill px-2.5", !active && "text-foreground-muted")}
    >
      <span aria-hidden="true" className={cn("size-2 rounded-pill", !active && "opacity-40")} style={{ background: color }} />
      <span className="max-w-32 truncate">{series.name}</span>
      <span className="font-mono text-caption tracking-normal text-foreground-subtle">{series.code}</span>
    </Button>
  );
}

export function PlotDialog({ open, onOpenChange, tree, level }: PlotDialogProps) {
  const gradientId = useId();
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (open) setShown([]);
  }, [open, level]);

  const { plot, loading, error } = useLevelPlot(tree, level, open);
  const rows = plot
    ? plot.times.map((hours, index) => {
        const row: Record<string, number> = { hours, total: plot.total.values[index] };
        for (const series of plot.children) row[series.code] = series.values[index];
        return row;
      })
    : [];
  const horizon = plot ? plot.times[plot.times.length - 1] : 0;
  const colorOf = (code: string) => colorForSeries(plot ? plot.children.findIndex((series) => series.code === code) : 0);
  const nameOf = (code: string) => (code === "total" ? (plot?.total.name ?? "") : (plot?.children.find((series) => series.code === code)?.name ?? code));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "transition-[width,height,max-width] duration-(--dur-slow) ease-emphasized",
          expanded ? "h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none" : "max-w-3xl",
        )}
      >
        <DialogHeader>
          <DialogTitle>{plot?.total.name ?? "Reliability over time"}</DialogTitle>
          <DialogDescription>How the chance of this {level.scope === "system" ? "system" : "layer"} still working falls as the hours pass.</DialogDescription>
        </DialogHeader>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-4 right-14"
          aria-label={expanded ? "Shrink the plot" : "Full preview"}
          aria-pressed={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <Minimize2 /> : <Maximize2 />}
        </Button>
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : error || !plot ? (
          <p className="rounded-sm border border-border bg-surface-sunken px-3 py-4 text-body-sm text-foreground-muted">
            {error ?? "Nothing to plot yet. Wire the blocks and save the drawing first."}
          </p>
        ) : (
          <div className={cn("flex flex-col gap-4", expanded && "min-h-0 flex-1")}>
            <div className={cn("w-full", expanded ? "min-h-0 flex-1" : "h-80")}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={rows} margin={{ top: 8, right: 20, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    {reliabilityThresholds.map((threshold) => (
                      <ReferenceArea
                        key={threshold.band}
                        y1={threshold.from}
                        y2={threshold.to}
                        fill={`var(--rel-${threshold.band})`}
                        fillOpacity={0.07}
                        stroke="none"
                        label={{
                          value: reliabilityLabels[threshold.band],
                          position: "insideTopRight",
                          fill: `var(--rel-${threshold.band})`,
                          fontSize: 11,
                          fontFamily: "var(--font-manrope)",
                        }}
                      />
                    ))}
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
                      content={({ active, label, payload }) => (
                        <PlotTooltip
                          active={active}
                          label={label}
                          entries={(payload ?? []).map((item) => ({
                            name: nameOf(String(item.dataKey)),
                            value: typeof item.value === "number" ? item.value : null,
                            color: item.dataKey === "total" ? "var(--chart-1)" : colorOf(String(item.dataKey)),
                          }))}
                        />
                      )}
                    />
                    <Area type="monotone" dataKey="total" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false} />
                    {shown.map((code) => (
                      <Line key={code} type="monotone" dataKey={code} stroke={colorOf(code)} strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : null}
            </div>
            {plot.children.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-caption uppercase text-foreground-muted">Compare with what sits inside</span>
                <div className="flex flex-wrap gap-2">
                  {plot.children.map((series, index) => (
                    <SeriesChip
                      key={series.code}
                      series={series}
                      color={colorForSeries(index)}
                      active={shown.includes(series.code)}
                      onToggle={() =>
                        setShown((current) => (current.includes(series.code) ? current.filter((code) => code !== series.code) : [...current, series.code]))
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SimulationDiagram } from "@/features/simulation/types";
import { formatHours, formatReliability } from "@/lib/format";

const axisTick = { fill: "var(--foreground-muted)", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" };
const strokes = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function survivalSeries(diagrams: SimulationDiagram[]): Record<string, number>[] {
  const hours = new Set<number>();
  for (const diagram of diagrams) {
    for (const point of diagram.curve) hours.add(point.hours);
  }
  return [...hours]
    .sort((left, right) => left - right)
    .map((hour) => {
      const row: Record<string, number> = { hours: hour };
      for (const diagram of diagrams) {
        const point = diagram.curve.find((entry) => entry.hours === hour);
        if (point) row[diagram.hierarchyId] = point.reliability;
      }
      return row;
    });
}

export function SurvivalChart({ diagrams }: { diagrams: SimulationDiagram[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const rows = survivalSeries(diagrams);
  if (rows.length < 2) return null;
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-border bg-surface-sunken p-3">
      <p className="text-caption uppercase text-foreground-muted">How many were still standing</p>
      <div className="h-44 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="hours" stroke="var(--border-strong)" tick={axisTick} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 1]} stroke="var(--border-strong)" tick={axisTick} tickLine={false} width={70} />
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
                formatter={(value, name) => {
                  const diagram = diagrams.find((entry) => entry.hierarchyId === name);
                  return [formatReliability(value, 4), diagram?.hierarchyName || String(name)];
                }}
              />
              {diagrams.map((diagram, index) => (
                <Line
                  key={diagram.hierarchyId}
                  type="monotone"
                  dataKey={diagram.hierarchyId}
                  stroke={strokes[index % strokes.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}

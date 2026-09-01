"use client";

import { useEffect, useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GenerationPoint } from "@/features/optimization/types";
import { formatCount, formatReliability } from "@/lib/format";

const axisTick = { fill: "var(--foreground-muted)", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" };

export function ConvergenceChart({ history }: { history: GenerationPoint[] }) {
  const gradientId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (history.length < 2) return null;
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-border bg-surface-sunken p-3">
      <p className="text-caption uppercase text-foreground-muted">How the search settled</p>
      <div className="h-36 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="generation" stroke="var(--border-strong)" tick={axisTick} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={["auto", "auto"]} stroke="var(--border-strong)" tick={axisTick} tickLine={false} width={70} />
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
                labelFormatter={(label) => `Generation ${formatCount(label)}`}
                formatter={(item) => [formatReliability(item, 8), "best fitness"]}
              />
              <Area type="stepAfter" dataKey="bestFitness" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}

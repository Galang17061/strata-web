"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getComponent } from "@/features/workspace/api";
import { distributionOf } from "@/features/workspace/sheet/properties-tab";
import type { ComponentDetail } from "@/features/workspace/types";
import { formatCount, formatHours, formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { curvePoints } from "@/lib/reliability-math";

type CurveTabProps = {
  systemComponentId: string;
  canEdit: boolean;
};

export function curveHorizon(runningHours: number | null): number {
  const base = runningHours && runningHours > 0 ? runningHours : 1000;
  return base * 2;
}

export function curveParameters(detail: ComponentDetail): { shape: number; scale: number; failureRate: number } | null {
  if (distributionOf(detail) === "weibull") {
    if (!detail.shapeParameter || !detail.scaleParameter) return null;
    return { shape: detail.shapeParameter, scale: detail.scaleParameter, failureRate: 0 };
  }
  if (detail.failureRate === null) return null;
  return { shape: 0, scale: 0, failureRate: detail.failureRate };
}

const axisTick = { fill: "var(--foreground-muted)", fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" };

export function CurveTab({ systemComponentId }: CurveTabProps) {
  const gradientId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const detail = useQuery({
    queryKey: queryKeys.components.detail(systemComponentId),
    queryFn: () => getComponent(systemComponentId),
  });
  const data = detail.data?.data ?? null;
  const horizon = curveHorizon(data?.runningHours ?? null);
  const parameters = data ? curveParameters(data) : null;
  const distribution = distributionOf(data);
  const points = useMemo(
    () => (parameters ? curvePoints(distribution, horizon, 60, parameters) : []),
    [parameters, distribution, horizon],
  );

  if (detail.isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-body-sm text-danger">{detail.error?.message ?? "This part could not be loaded."}</p>;
  }

  if (!parameters) {
    return (
      <p className="rounded-sm border border-border bg-surface-sunken px-3 py-4 text-body-sm text-foreground-muted">
        {distribution === "weibull"
          ? "No Weibull shape and scale yet. Record failures and fit the distribution to draw the curve."
          : "No failure rate yet. Set one in the master data or record failures to draw the curve."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-caption uppercase text-foreground-muted">At {formatHours(data.runningHours)}</span>
          <span className="font-mono text-numeric-lg text-foreground">{formatReliability(data.reliabilityValue, 4)}</span>
        </div>
        <ReliabilityBadge value={data.reliabilityValue} size="sm" />
      </div>
      <div className="h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 20, left: -12, bottom: 0 }}>
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
                formatter={(item) => [formatReliability(item, 8), "R(t)"]}
              />
              <ReferenceLine x={data.runningHours ?? 0} stroke="var(--primary)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="reliability" stroke="var(--chart-1)" strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <p className="text-caption text-foreground-muted normal-case tracking-normal">
        {distribution === "weibull"
          ? `Weibull with β ${formatReliability(parameters.shape, 4)} and η ${formatHours(parameters.scale)}, drawn to twice the running hours.`
          : `Exponential with λ ${parameters.failureRate.toExponential(4)}, drawn to twice the running hours.`}
      </p>
    </div>
  );
}

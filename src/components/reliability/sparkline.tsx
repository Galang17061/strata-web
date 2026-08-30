"use client";

import { sparklinePath } from "@/lib/sparkline";
import { cn } from "@/lib/utils";

type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  label?: string;
};

export function Sparkline({ values, width = 80, height = 24, className, label }: SparklineProps) {
  if (values.length < 2) {
    return (
      <span className={cn("inline-block font-mono text-numeric text-foreground-subtle", className)} aria-label={label}>
        —
      </span>
    );
  }
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label ?? "Reliability over time"}
      className={cn("shrink-0 text-chart-1", className)}
    >
      <path d={sparklinePath(values, width, height, 2)} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

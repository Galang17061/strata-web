"use client";

import { useEffect, useRef, useState } from "react";
import { formatReliability, type ReliabilityPrecision } from "@/lib/format";
import { durationMs } from "@/lib/motion";
import { reliabilityBand, reliabilityLabels, type ReliabilityBand } from "@/lib/reliability";
import { cn } from "@/lib/utils";

const bandClasses: Record<ReliabilityBand, string> = {
  high: "bg-rel-high-bg text-rel-high",
  good: "bg-rel-good-bg text-rel-good",
  moderate: "bg-rel-moderate-bg text-rel-moderate",
  low: "bg-rel-low-bg text-rel-low",
  none: "bg-rel-none-bg text-rel-none",
};

type ReliabilityBadgeProps = {
  value: unknown;
  size?: "sm" | "md";
  decimals?: ReliabilityPrecision;
  showLabel?: boolean;
  className?: string;
};

export function useValuePulse(value: unknown) {
  const [pulse, setPulse] = useState(false);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), durationMs("--dur-pulse"));
    return () => window.clearTimeout(timer);
  }, [value]);

  return pulse;
}

export function ReliabilityBadge({
  value,
  size = "md",
  decimals = 4,
  showLabel = true,
  className,
}: ReliabilityBadgeProps) {
  const band = reliabilityBand(value);
  const pulse = useValuePulse(value);
  const label = reliabilityLabels[band];

  return (
    <span
      data-band={band}
      data-pulse={pulse ? "true" : undefined}
      title={`${formatReliability(value, 8)} · ${label}`}
      className={cn(
        "reliability-badge inline-flex items-center gap-1.5 rounded-pill font-medium whitespace-nowrap",
        size === "sm" ? "h-5 px-2 text-caption" : "h-6 px-2.5 text-body-sm",
        bandClasses[band],
        className,
      )}
    >
      <span className="font-mono tabular-nums">{formatReliability(value, decimals)}</span>
      {showLabel ? (
        <>
          <span aria-hidden="true" className="opacity-60">
            ·
          </span>
          <span>{label}</span>
        </>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}

"use client";

import { formatHours, formatReliability } from "@/lib/format";
import { reliabilityBand, reliabilityLabels } from "@/lib/reliability";

export type PlotTooltipEntry = {
  name: string;
  value: number | null;
  color: string;
};

export function describePlotValue(value: unknown): { text: string; label: string; band: string } {
  const band = reliabilityBand(value);
  return { text: formatReliability(value, 8), label: reliabilityLabels[band], band };
}

type PlotTooltipProps = {
  active?: boolean;
  label?: unknown;
  entries: PlotTooltipEntry[];
};

export function PlotTooltip({ active, label, entries }: PlotTooltipProps) {
  if (!active || entries.length === 0) return null;
  return (
    <div className="min-w-48 rounded-sm border border-border bg-surface-elevated px-3 py-2 shadow-md">
      <p className="text-caption text-foreground-muted normal-case tracking-normal">{formatHours(label)}</p>
      <ul className="mt-1 flex flex-col gap-1">
        {entries.map((entry) => {
          const described = describePlotValue(entry.value);
          return (
            <li key={entry.name} className="flex items-center justify-between gap-4 text-body-sm">
              <span className="flex min-w-0 items-center gap-1.5">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-pill" style={{ background: entry.color }} />
                <span className="truncate text-foreground-muted">{entry.name}</span>
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-mono text-numeric text-foreground">{described.text}</span>
                <span className="text-caption normal-case tracking-normal" style={{ color: `var(--rel-${described.band})` }}>
                  {described.label}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

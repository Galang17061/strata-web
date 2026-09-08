"use client";

import type { SimulationDiagram } from "@/features/simulation/types";
import { formatPercent } from "@/lib/format";

export function CulpritList({ diagrams }: { diagrams: SimulationDiagram[] }) {
  const guilty = diagrams.filter((diagram) => diagram.culprits.length > 0);
  if (guilty.length === 0) return null;
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border p-3">
      <p className="text-caption uppercase text-foreground-muted">What brought it down</p>
      {guilty.map((diagram) => (
        <div key={diagram.hierarchyId} className="flex flex-col gap-1.5">
          <p className="text-body-sm">{diagram.hierarchyName || diagram.hierarchyId}</p>
          {diagram.culprits.slice(0, 4).map((culprit) => (
            <div key={culprit.code} className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                <div className="h-full rounded-full bg-(--chart-1)" style={{ width: `${Math.max(culprit.share * 100, 1)}%` }} />
              </div>
              <span className="w-40 shrink-0 truncate text-caption">{culprit.componentName || culprit.code}</span>
              <span className="w-14 shrink-0 text-right text-caption tabular-nums text-foreground-muted">
                {formatPercent(culprit.share)}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

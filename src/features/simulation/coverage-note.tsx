"use client";

import { TriangleAlert } from "lucide-react";
import type { SimulationCoverage } from "@/features/simulation/types";
import { countOf } from "@/lib/format";

type CoverageNoteProps = {
  coverage: SimulationCoverage;
  warnings: string[];
};

export function CoverageNote({ coverage, warnings }: CoverageNoteProps) {
  const whole =
    coverage.diagramsRehearsed >= coverage.diagramsInSystem &&
    coverage.componentsRehearsed >= coverage.componentsInSystem;
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-border p-3">
      <p className="text-caption uppercase text-foreground-muted">What this rehearsal covered</p>
      <p className="text-body-sm">
        {countOf(coverage.diagramsRehearsed, "diagram")} of {coverage.diagramsInSystem}, holding{" "}
        {countOf(coverage.componentsRehearsed, "part")} of {coverage.componentsInSystem}.
        {whole ? " Nothing in this system was left out." : null}
      </p>
      {coverage.componentsLeftOut.length > 0 ? (
        <p className="text-caption text-foreground-muted">
          Left out: {coverage.componentsLeftOut.join(", ")}
        </p>
      ) : null}
      {warnings.map((warning) => (
        <p key={warning} className="flex items-start gap-2 text-caption text-warning">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{warning}</span>
        </p>
      ))}
    </div>
  );
}

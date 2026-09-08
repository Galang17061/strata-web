"use client";

import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLifeSpan } from "@/features/simulation/life-span";
import type { SimulationDiagram } from "@/features/simulation/types";
import { formatCount, formatReliability } from "@/lib/format";

export function DiagramTable({ diagrams, missionHours }: { diagrams: SimulationDiagram[]; missionHours: number }) {
  return (
    <Table>
      <caption className="sr-only">What each diagram scored across the rehearsal</caption>
      <TableHeader>
        <TableRow>
          <TableHead>Diagram</TableHead>
          <TableHead className="text-right">Survived</TableHead>
          <TableHead className="text-right">Reliability</TableHead>
          <TableHead className="text-right">Typical life</TableHead>
          <TableHead className="text-right">First tenth gone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {diagrams.map((diagram) => (
          <TableRow key={diagram.hierarchyId}>
            <TableCell>
              <span className="block">{diagram.hierarchyName || diagram.hierarchyId}</span>
              <span className="text-caption text-foreground-muted">{formatCount(diagram.components)} part(s)</span>
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatCount(diagram.survivors)}</TableCell>
            <TableCell className="text-right">
              <div className="flex flex-col items-end gap-0.5">
                <ReliabilityBadge value={diagram.reliability} size="sm" />
                <span className="text-caption text-foreground-muted tabular-nums">
                  {formatReliability(diagram.lowerBound, 4)} to {formatReliability(diagram.upperBound, 4)}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatLifeSpan(diagram.medianLife, missionHours)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatLifeSpan(diagram.b10Life, missionHours)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

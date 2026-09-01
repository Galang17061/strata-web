"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OptimizationFixedSlot, OptimizationSlot } from "@/features/optimization/types";
import { formatFailureRate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function slotSelectionIndex(slot: OptimizationSlot, selection: string | undefined): number {
  if (selection) {
    const index = slot.candidates.findIndex((candidate) => candidate.componentId === selection);
    if (index >= 0) return index;
  }
  return slot.proposedIndex;
}

type PreviewTableProps = {
  slots: OptimizationSlot[];
  fixedSlots: OptimizationFixedSlot[];
  selections: Record<string, string>;
};

export function PreviewTable({ slots, fixedSlots, selections }: PreviewTableProps) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <Table dense>
        <TableCaption className="sr-only">Vendor picked for every part, now and proposed</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Part</TableHead>
            <TableHead>Now</TableHead>
            <TableHead>Proposed</TableHead>
            <TableHead numeric className="normal-case">
              λ
            </TableHead>
            <TableHead numeric>Bill</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((slot) => {
            const index = slotSelectionIndex(slot, selections[slot.systemComponentId]);
            const now = slot.candidates[slot.currentIndex];
            const picked = slot.candidates[index];
            const changed = index !== slot.currentIndex;
            return (
              <TableRow key={slot.systemComponentId}>
                <TableCell className="whitespace-normal">
                  <span className="text-foreground">{slot.componentName}</span>{" "}
                  <span className="font-mono text-caption tracking-normal text-foreground-subtle">
                    {slot.formulaCode} · ×{slot.units}
                  </span>
                </TableCell>
                <TableCell className="whitespace-normal text-foreground-muted">{now.vendorName}</TableCell>
                <TableCell className={cn("whitespace-normal", changed ? "font-semibold text-primary" : "text-foreground-muted")}>
                  {picked.vendorName}
                </TableCell>
                <TableCell numeric>{formatFailureRate(picked.failureRate)}</TableCell>
                <TableCell numeric>{formatMoney(picked.unitCost * slot.units)}</TableCell>
              </TableRow>
            );
          })}
          {fixedSlots.map((fixed) => (
            <TableRow key={fixed.systemComponentId} className="opacity-60 hover:bg-transparent">
              <TableCell className="whitespace-normal">
                <span className="text-foreground">{fixed.componentName}</span>
              </TableCell>
              <TableCell className="whitespace-normal text-foreground-muted">{fixed.vendorName ?? "—"}</TableCell>
              <TableCell className="whitespace-normal text-caption normal-case tracking-normal text-foreground-subtle" colSpan={2}>
                {fixed.reason}
              </TableCell>
              <TableCell numeric>{fixed.cost > 0 ? formatMoney(fixed.cost) : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  locked?: ReadonlySet<string>;
  onSelect?: (systemComponentId: string, componentId: string) => void;
  onToggleLock?: (systemComponentId: string) => void;
};

export function PreviewTable({ slots, fixedSlots, selections, locked, onSelect, onToggleLock }: PreviewTableProps) {
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
            {onToggleLock ? <TableHead className="w-10 text-right">Pin</TableHead> : null}
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
                <TableCell className="whitespace-normal">
                  {onSelect ? (
                    <Select value={picked.componentId} onValueChange={(next) => onSelect(slot.systemComponentId, next)}>
                      <SelectTrigger
                        size="sm"
                        aria-label={`Vendor for ${slot.componentName}`}
                        className={cn("w-full min-w-36", changed && "font-semibold text-primary")}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {slot.candidates.map((candidate) => (
                          <SelectItem key={candidate.componentId} value={candidate.componentId}>
                            {candidate.vendorName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={cn(changed ? "font-semibold text-primary" : "text-foreground-muted")}>{picked.vendorName}</span>
                  )}
                </TableCell>
                <TableCell numeric>{formatFailureRate(picked.failureRate)}</TableCell>
                <TableCell numeric>{formatMoney(picked.unitCost * slot.units)}</TableCell>
                {onToggleLock ? (
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-pressed={locked?.has(slot.systemComponentId) ?? false}
                      aria-label={
                        locked?.has(slot.systemComponentId)
                          ? `Unpin the vendor for ${slot.componentName}`
                          : `Pin the vendor for ${slot.componentName}`
                      }
                      onClick={() => onToggleLock(slot.systemComponentId)}
                      className={cn(locked?.has(slot.systemComponentId) && "text-primary")}
                    >
                      {locked?.has(slot.systemComponentId) ? <Lock /> : <LockOpen />}
                    </Button>
                  </TableCell>
                ) : null}
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
              {onToggleLock ? <TableCell /> : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

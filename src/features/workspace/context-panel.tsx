"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Boxes, ChartArea, FunctionSquare, Layers, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Formula, plainFormulaToTex } from "@/components/formula/formula";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateHierarchy, updateSystemFormula } from "@/features/workspace/api";
import { HistoryTimeline } from "@/features/workspace/history-timeline";
import { connectionLabel } from "@/features/workspace/canvas/block-node";
import type { CanvasNode, Level } from "@/features/workspace/model";
import type { ComponentInputParameters } from "@/features/workspace/types";
import { formatCount, formatFailureRate, formatHours, formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

type LevelSummary = {
  name: string;
  depth: number;
  formula: string | null;
  value: number | null;
  blocks: number;
  loading: boolean;
};

type ContextPanelProps = {
  level: Level;
  summary: LevelSummary;
  selected: CanvasNode | null;
  parameters: ComponentInputParameters[];
  canEdit: boolean;
  onOpenLayer: (node: CanvasNode) => void;
  onOpenComponent: (node: CanvasNode) => void;
  onPickCode?: (code: string) => void;
  onPlot?: () => void;
  onBack?: () => void;
};

function InputParameters({ parameters, onPickCode }: { parameters: ComponentInputParameters[]; onPickCode?: (code: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption uppercase text-foreground-muted">Input parameters</span>
      <Table dense containerClassName="rounded-sm">
        <TableCaption className="sr-only">Part figures that feed the selected layer</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Part</TableHead>
            <TableHead numeric className="normal-case">
              λ
            </TableHead>
            <TableHead numeric className="normal-case">
              R
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parameters.map((parameter) => (
            <TableRow
              key={parameter.formulaCode ?? parameter.componentName}
              className={cn(onPickCode && "cursor-pointer")}
              onClick={() => parameter.formulaCode && onPickCode?.(parameter.formulaCode)}
            >
              <TableCell className="max-w-0 w-full">
                <span className="block truncate">{parameter.componentName}</span>
                <span className="block truncate font-mono text-caption tracking-normal text-foreground-subtle">
                  {parameter.formulaCode} · {formatCount(parameter.runningHours)} h
                </span>
              </TableCell>
              <TableCell numeric>{formatFailureRate(parameter.failureRate)}</TableCell>
              <TableCell numeric>{formatReliability(parameter.componentReliability)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-caption uppercase text-foreground-muted">{label}</span>
      <span className="text-right font-mono text-numeric text-foreground">{children}</span>
    </div>
  );
}

function FormulaDialog({ level, formula, open, onOpenChange }: { level: Level; formula: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(formula);
  useEffect(() => {
    if (open) setDraft(formula);
  }, [open, formula]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (level.scope === "system") {
        await updateSystemFormula(level.id, draft.trim());
        return;
      }
      await updateHierarchy(level.id, { formula: draft.trim() });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.reliability(level.id) });
      toast.success("Formula updated");
      onOpenChange(false);
    },
    onError: (error) => toast.error("Could not update the formula", { description: error.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom formula</DialogTitle>
          <DialogDescription>
            Write the formula with the block codes shown on the canvas, for example 1-(1-CR1)*(1-CHPZ1).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="formula-draft">Formula</Label>
          <Input id="formula-draft" numeric value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus />
        </div>
        {draft.trim() ? (
          <div className="overflow-x-auto rounded-sm bg-surface-sunken px-3 py-2">
            <Formula tex={plainFormulaToTex(draft)} block />
          </div>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" loading={mutation.isPending} disabled={!draft.trim()} onClick={() => mutation.mutate()}>
            Apply formula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ContextPanel({ level, summary, selected, parameters, canEdit, onOpenLayer, onOpenComponent, onPickCode, onPlot, onBack }: ContextPanelProps) {
  const [formulaOpen, setFormulaOpen] = useState(false);

  if (selected) {
    const data = selected.data;
    const parameter = parameters.find((item) => item.formulaCode === data.code);
    return (
      <div className="flex h-full flex-col">
        {onBack ? (
          <div className="border-b border-border px-2 py-1.5">
            <Button variant="ghost" size="sm" className="h-7 text-foreground-muted" onClick={onBack}>
              <ArrowLeft /> {summary.name}
            </Button>
          </div>
        ) : null}
        <div className="flex items-start gap-3 border-b border-border px-4 py-4">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-foreground">
            {data.kind === "subsystem" ? <Layers className="size-4" /> : <Boxes className="size-4" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-body font-semibold">{data.name}</p>
            <p className="font-mono text-caption tracking-normal text-foreground-muted">
              {data.code} · {data.kind === "virtual" ? "virtual point" : data.kind}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {data.kind === "virtual" ? (
            <p className="py-2 text-body-sm text-foreground-muted">
              The {data.virtualRole === "in" ? "input" : "output"} of this layer. Every path must start at IN and end at OUT.
            </p>
          ) : (
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between gap-3 py-2">
                <span className="text-caption uppercase text-foreground-muted">Reliability</span>
                <ReliabilityBadge value={data.value} decimals={8} size="sm" />
              </div>
              <Row label="Wiring">{connectionLabel(data.connectionType, data.active, data.total) ?? "—"}</Row>
              {data.kind === "component" ? (
                <>
                  <Row label="Vendor">{data.vendor ?? "—"}</Row>
                  <Row label="Failure rate">{formatFailureRate(parameter?.failureRate)}</Row>
                  <Row label="Running hours">{formatHours(parameter?.runningHours)}</Row>
                </>
              ) : null}
              {data.kind === "subsystem" ? <Row label="Depth">Level {data.level ?? "—"}</Row> : null}
            </div>
          )}
        </div>
        {data.kind === "subsystem" ? (
          <div className="border-t border-border p-4">
            <Button variant="secondary" className="w-full" onClick={() => onOpenLayer(selected)}>
              Open this layer <ArrowRight />
            </Button>
          </div>
        ) : null}
        {data.kind === "component" ? (
          <div className="border-t border-border p-4">
            <Button variant="secondary" className="w-full" onClick={() => onOpenComponent(selected)}>
              Open component <ArrowRight />
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3 border-b border-border px-4 py-4">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-foreground">
          <Layers className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-body font-semibold">{summary.name}</p>
          <p className="text-caption text-foreground-muted normal-case tracking-normal">
            {summary.depth === 0 ? "System level" : `Level ${summary.depth}`} · {summary.blocks} block{summary.blocks === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-caption uppercase text-foreground-muted">Reliability</span>
          {summary.loading ? <Skeleton className="h-5 w-28 rounded-pill" /> : <ReliabilityBadge value={summary.value} decimals={8} size="sm" />}
        </div>
        {onPlot ? (
          <Button variant="secondary" size="sm" className="w-full" onClick={onPlot}>
            <ChartArea /> Plot over time
          </Button>
        ) : null}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-caption uppercase text-foreground-muted">
              <FunctionSquare className="size-3.5" aria-hidden="true" /> Formula
            </span>
            {canEdit ? (
              <Button variant="ghost" size="sm" className="h-7" onClick={() => setFormulaOpen(true)}>
                <Pencil /> Edit
              </Button>
            ) : null}
          </div>
          {summary.loading ? (
            <Skeleton className="h-12 w-full" />
          ) : summary.formula ? (
            <>
              <div className="overflow-x-auto rounded-sm bg-surface-sunken px-3 py-3">
                <Formula tex={plainFormulaToTex(summary.formula)} block className="text-body-sm" />
              </div>
              <p className="font-mono text-caption tracking-normal break-all text-foreground-muted">{summary.formula}</p>
            </>
          ) : (
            <p className="text-body-sm text-foreground-muted">
              No formula yet. Wire the blocks from IN to OUT and save the drawing to generate one.
            </p>
          )}
        </div>
        <p className="text-caption text-foreground-subtle normal-case tracking-normal">
          Full value: {formatReliability(summary.value, 8)}
        </p>
        {level.scope === "hierarchy" && parameters.length > 0 ? <InputParameters parameters={parameters} onPickCode={onPickCode} /> : null}
        {level.scope === "hierarchy" ? <HistoryTimeline hierarchyId={level.id} canDelete={canEdit} /> : null}
      </div>
      <FormulaDialog level={level} formula={summary.formula ?? ""} open={formulaOpen} onOpenChange={setFormulaOpen} />
    </div>
  );
}

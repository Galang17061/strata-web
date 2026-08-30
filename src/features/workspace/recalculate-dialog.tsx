"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import type { SystemTree } from "@/features/projects/types";
import {
  childHierarchies,
  fitDistribution,
  getComponent,
  hierarchyReliability,
  listDrawingEdges,
  saveDrawingEdges,
  updateComponent,
  updateRunningHours,
} from "@/features/workspace/api";
import { allComponents } from "@/features/workspace/model";
import { distributionOf, formFromDetail, toUpdateInput } from "@/features/workspace/sheet/properties-tab";
import { ApiError } from "@/lib/api/client";
import { formatHours } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

type RecalculateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rbdSystemId: string;
  tree: SystemTree;
  onStarted: () => void;
  onSettled: () => void;
};

async function rescoreEveryPart(tree: SystemTree, runningHours: number): Promise<string[]> {
  const unfitted: string[] = [];
  for (const component of allComponents(tree)) {
    const detail = (await getComponent(component.systemComponentId)).data;
    await updateComponent(component.systemComponentId, { ...toUpdateInput(detail, formFromDetail(detail)), runningHours });
    await fitDistribution(component.systemComponentId, distributionOf(detail)).catch(() => unfitted.push(detail.componentName));
  }
  for (const level of tree.hierarchy ?? []) {
    await hierarchyReliability(level.hierarchyId);
  }
  const edges = (await listDrawingEdges("system", tree.rbdSystemId)).data ?? [];
  const links = edges.flatMap((edge) =>
    edge.idEdge && edge.sourceId && edge.targetId ? [{ idEdge: edge.idEdge, sourceId: edge.sourceId, targetId: edge.targetId }] : [],
  );
  if (links.length > 0) await saveDrawingEdges("system", tree.rbdSystemId, links);
  return unfitted;
}

export function refusesLayeredSystem(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const body = error.body as { message?: unknown } | undefined;
  const message = typeof body?.message === "string" ? body.message : error.message;
  return /component-level/i.test(message);
}

export async function recalculateSystem(tree: SystemTree, runningHours: number): Promise<string[]> {
  try {
    await updateRunningHours(tree.rbdSystemId, runningHours);
    return [];
  } catch (error) {
    if (!refusesLayeredSystem(error)) throw error;
    return rescoreEveryPart(tree, runningHours);
  }
}

export function RecalculateDialog({ open, onOpenChange, rbdSystemId, tree, onStarted, onSettled }: RecalculateDialogProps) {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const levels = useQuery({
    queryKey: queryKeys.hierarchy.children(rbdSystemId),
    queryFn: () => childHierarchies(rbdSystemId),
    enabled: open,
  });
  const currentHours = levels.data?.data?.find((level) => level.runningHours !== null)?.runningHours ?? null;

  useEffect(() => {
    if (open) {
      setHours(currentHours === null ? "1000" : String(currentHours));
      setProblem(null);
    }
  }, [open, currentHours]);

  const recalculate = useMutation({
    mutationFn: () => recalculateSystem(tree, Number(hours)),
    onMutate: () => {
      onOpenChange(false);
      onStarted();
    },
    onSuccess: async (unfitted) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.components.all });
      await queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
      await queryClient.invalidateQueries({ queryKey: ["drawing"] });
      if (unfitted.length > 0) {
        toast.warning("Recalculated, with gaps", {
          description: `${unfitted.join(", ")} kept the old score because the distribution could not be fitted.`,
        });
        return;
      }
      toast.success("System recalculated", { description: `Every block was scored again at ${formatHours(Number(hours))}.` });
    },
    onError: (error) => toast.error("Could not recalculate", { description: error.message }),
    onSettled,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = Number(hours);
            if (!hours || !Number.isFinite(parsed) || parsed < 0) {
              setProblem("Running hours must be zero or more.");
              return;
            }
            recalculate.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>Recalculate {tree.systemName}</DialogTitle>
            <DialogDescription>
              Every part, layer and the system itself will be scored again at the running hours you give.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="recalculate-hours">Running hours</Label>
            <div className="relative">
              <Input
                id="recalculate-hours"
                numeric
                autoFocus
                value={hours}
                onChange={(event) => {
                  setProblem(null);
                  setHours(event.target.value.replace(/[^\d.]/g, ""));
                }}
                aria-invalid={problem ? true : undefined}
                className="pr-10"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center font-mono text-caption tracking-normal text-foreground-subtle">
                h
              </span>
            </div>
            {problem ? (
              <p role="alert" className="text-body-sm text-danger">
                {problem}
              </p>
            ) : (
              <p className="text-caption text-foreground-muted normal-case tracking-normal">
                {currentHours === null ? "No hours have been set for this system yet." : `Last scored at ${formatHours(currentHours)}.`}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={recalculate.isPending}>
              Recalculate system
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

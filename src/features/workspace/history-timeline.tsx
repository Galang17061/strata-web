"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteHistory, listHistory } from "@/features/workspace/api";
import type { HistoryEntry } from "@/features/workspace/types";
import { formatDateTime, formatHours } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

const pageStep = 5;

type HistoryTimelineProps = {
  hierarchyId: string;
  canDelete: boolean;
};

export function HistoryTimeline({ hierarchyId, canDelete }: HistoryTimelineProps) {
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(pageStep);
  const [pending, setPending] = useState<HistoryEntry | null>(null);
  const history = useQuery({
    queryKey: queryKeys.hierarchy.history(hierarchyId, { page: 1, pageSize }),
    queryFn: () => listHistory(hierarchyId, { page: 1, pageSize }),
  });
  const entries = history.data?.data ?? [];
  const meta = history.data?.meta ?? null;

  const removal = useMutation({
    mutationFn: (entry: HistoryEntry) => deleteHistory(entry.historyId),
    onSuccess: async (_, entry) => {
      setPending(null);
      await queryClient.invalidateQueries({ queryKey: ["hierarchy", "history", hierarchyId] });
      toast.success("History entry removed", { description: formatDateTime(entry.calculationTimestamp) });
    },
    onError: (error) => toast.error("Could not remove the entry", { description: error.message }),
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-caption uppercase text-foreground-muted">
        <History className="size-3.5" aria-hidden="true" /> History
        {meta ? <span className="font-mono normal-case tracking-normal text-foreground-subtle">{meta.totalData}</span> : null}
      </span>
      {history.isPending ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-body-sm text-foreground-muted">Nothing scored yet. Saving a drawing writes the first entry.</p>
      ) : (
        <ol className="relative flex flex-col gap-3 border-l border-border pl-4">
          {entries.map((entry) => (
            <li key={entry.historyId} className="group/entry relative flex flex-col gap-1">
              <span aria-hidden="true" className="absolute top-1.5 -left-[21px] size-2.5 rounded-pill border-2 border-surface bg-primary" />
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption text-foreground-muted normal-case tracking-normal">{formatDateTime(entry.calculationTimestamp)}</span>
                <span className="flex items-center gap-1">
                  <ReliabilityBadge value={entry.calculatedReliability} size="sm" showLabel={false} />
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-6 opacity-0 group-hover/entry:opacity-100 focus-visible:opacity-100"
                      aria-label={`Remove the entry from ${formatDateTime(entry.calculationTimestamp)}`}
                      onClick={() => setPending(entry)}
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                </span>
              </div>
              <p className="truncate font-mono text-caption tracking-normal text-foreground" title={entry.formula ?? undefined}>
                {entry.formula ?? "—"}
              </p>
              <p className="text-caption text-foreground-subtle normal-case tracking-normal">
                {entry.calculatedBy ?? "Unknown"}
                {entry.runningHours ? ` · at ${formatHours(entry.runningHours)}` : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
      {meta?.hasNextPage ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setPageSize((value) => value + pageStep)}>
          Show older
        </Button>
      ) : null}
      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="Remove this history entry?"
        description={`The score of ${formatDateTime(pending?.calculationTimestamp)} will be gone for good.`}
        confirmLabel="Remove entry"
        destructive
        loading={removal.isPending}
        onConfirm={() => pending && removal.mutate(pending)}
      />
    </div>
  );
}

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Dices } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StrataLoader } from "@/components/brand/loader";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchJob, startRehearsal } from "@/features/simulation/api";
import type { Job } from "@/features/simulation/types";

function settled(job: Job | null | undefined): boolean {
  if (!job) return false;
  return job.status === "done" || job.status === "failed" || job.status === "cancelled";
}

type RehearsalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rbdSystemId: string;
  systemName: string | null;
};

export function RehearsalDialog({ open, onOpenChange, rbdSystemId, systemName }: RehearsalDialogProps) {
  const [jobId, setJobId] = useState<string | null>(null);

  const start = useMutation({
    mutationFn: () => startRehearsal(rbdSystemId, { missionHours: 1000, trials: 20000, curvePoints: 40 }),
    onSuccess: (envelope) => setJobId(envelope.data.jobId),
    onError: (error: Error) => toast.error("The rehearsal did not start", { description: error.message }),
  });

  const job = useQuery({
    queryKey: ["rehearsal", jobId],
    queryFn: () => fetchJob(jobId ?? ""),
    enabled: Boolean(jobId),
    refetchInterval: (query) => (settled(query.state.data?.data) ? false : 1500),
  });

  const current = job.data?.data ?? null;
  const summary = current?.result ?? null;
  const working = Boolean(jobId) && !settled(current);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="size-4" /> Rehearse {systemName ?? "this system"}
          </DialogTitle>
          <DialogDescription>
            Run the plant thousands of times over and see how often it survives the mission, how long it
            tends to last, and which part usually brings it down.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button onClick={() => start.mutate()} loading={start.isPending || working} className="self-start">
            <Dices /> {summary ? "Rehearse again" : "Start the rehearsal"}
          </Button>
          {working ? (
            <div className="flex items-center gap-3 rounded-sm border border-border bg-surface-sunken p-3">
              <StrataLoader className="size-5" />
              <p className="text-caption text-foreground-muted">
                {current?.status === "running" ? "The plant is being run over and over." : "Waiting for a free hand to pick this up."}
              </p>
            </div>
          ) : null}
          {current?.status === "failed" ? (
            <p className="text-caption text-danger">{current.errorMessage ?? "The rehearsal stopped without an answer."}</p>
          ) : null}
          {summary ? (
            <div className="flex flex-col gap-2 rounded-sm border border-border bg-surface-sunken p-3">
              <p className="text-caption uppercase text-foreground-muted">
                {summary.diagrams.length} diagram(s) over {summary.missionHours} hours, {summary.trials} runs each
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {summary.diagrams.map((diagram) => (
                  <div key={diagram.hierarchyId} className="flex items-center gap-2">
                    <span className="text-body-sm">{diagram.hierarchyName || diagram.hierarchyId}</span>
                    <ReliabilityBadge value={diagram.reliability} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

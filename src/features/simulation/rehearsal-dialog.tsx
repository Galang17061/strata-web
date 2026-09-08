"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dices } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { StrataLoader } from "@/components/brand/loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchJob, startRehearsal } from "@/features/simulation/api";
import { CoverageNote } from "@/features/simulation/coverage-note";
import { CulpritList } from "@/features/simulation/culprit-list";
import { DiagramTable } from "@/features/simulation/diagram-table";
import { SurvivalChart } from "@/features/simulation/survival-chart";
import { useJobStream, type JobAnnouncement } from "@/features/simulation/use-job-stream";
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
  const [missionHours, setMissionHours] = useState("1000");
  const [trials, setTrials] = useState("20000");
  const [seed, setSeed] = useState("");

  const start = useMutation({
    mutationFn: () =>
      startRehearsal(rbdSystemId, {
        missionHours: Number(missionHours) || 0,
        trials: Number(trials) || 0,
        seed: seed.trim() === "" ? undefined : Number(seed),
        curvePoints: 40,
      }),
    onSuccess: (envelope) => setJobId(envelope.data.jobId),
    onError: (error: Error) => toast.error("The rehearsal did not start", { description: error.message }),
  });

  const queryClient = useQueryClient();
  const job = useQuery({
    queryKey: ["rehearsal", jobId],
    queryFn: () => fetchJob(jobId ?? ""),
    enabled: Boolean(jobId),
    refetchInterval: (query) => (settled(query.state.data?.data) ? false : 6000),
  });

  const current = job.data?.data ?? null;
  const heard = useCallback(
    (announcement: JobAnnouncement) => {
      if (announcement.jobId !== jobId) return;
      void queryClient.invalidateQueries({ queryKey: ["rehearsal", jobId] });
    },
    [jobId, queryClient],
  );
  useJobStream(Boolean(jobId) && !settled(current), heard);
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
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rehearsal-hours">Mission hours</Label>
              <Input id="rehearsal-hours" inputMode="numeric" value={missionHours} onChange={(event) => setMissionHours(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rehearsal-trials">Runs</Label>
              <Input id="rehearsal-trials" inputMode="numeric" value={trials} onChange={(event) => setTrials(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rehearsal-seed">Seed</Label>
              <Input id="rehearsal-seed" inputMode="numeric" placeholder="Any" value={seed} onChange={(event) => setSeed(event.target.value)} />
            </div>
          </div>
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
              <DiagramTable diagrams={summary.diagrams} />
            </div>
          ) : null}
          {summary ? <SurvivalChart diagrams={summary.diagrams} /> : null}
          {summary ? <CulpritList diagrams={summary.diagrams} /> : null}
          {summary ? <CoverageNote coverage={summary.coverage} warnings={summary.warnings} /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

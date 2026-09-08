"use client";

import { useMutation } from "@tanstack/react-query";
import { Dices } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { startRehearsal } from "@/features/simulation/api";

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
          <Button onClick={() => start.mutate()} loading={start.isPending} className="self-start">
            <Dices /> Start the rehearsal
          </Button>
          {jobId ? <p className="text-caption text-foreground-muted">Waiting on job {jobId}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

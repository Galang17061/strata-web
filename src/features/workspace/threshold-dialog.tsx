"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getThreshold, setThreshold } from "@/features/workspace/api";

type ThresholdDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rbdSystemId: string;
};

export function ThresholdDialog({ open, onOpenChange, rbdSystemId }: ThresholdDialogProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const current = useQuery({
    queryKey: ["threshold", rbdSystemId],
    queryFn: () => getThreshold(rbdSystemId),
    enabled: open && Boolean(rbdSystemId),
  });
  const stored = current.data?.data?.threshold ?? null;

  useEffect(() => {
    if (open) setValue(stored === null ? "" : String(stored));
  }, [open, stored]);

  const save = useMutation({
    mutationFn: (next: number | null) => setThreshold(rbdSystemId, next),
    onSuccess: async (envelope, next) => {
      await queryClient.invalidateQueries({ queryKey: ["threshold", rbdSystemId] });
      onOpenChange(false);
      toast.success(next === null ? "Floor cleared" : "Floor set", { description: envelope.message });
    },
    onError: (error) => toast.error("The floor could not be saved", { description: error.message }),
  });

  const parsed = Number(value);
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed > 0 && parsed < 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reliability floor</DialogTitle>
          <DialogDescription>
            When a recalculation drops this system below the floor, an alert rings the bell
            for everyone.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (valid) save.mutate(parsed);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="threshold-value">Floor, between 0 and 1</Label>
            <Input
              id="threshold-value"
              numeric
              placeholder="0.95"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoFocus
            />
            <p className="text-caption text-foreground-muted">
              {stored === null ? "No floor is set right now." : `Current floor: ${stored}.`}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            {stored !== null ? (
              <Button type="button" variant="ghost" loading={save.isPending} onClick={() => save.mutate(null)}>
                Clear the floor
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={save.isPending} disabled={!valid}>
                <BellRing /> Set the floor
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

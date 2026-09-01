"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type OptimizationStudioProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rbdSystemId: string;
  systemName: string | null;
};

export function OptimizationStudio({ open, onOpenChange, rbdSystemId, systemName }: OptimizationStudioProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-full flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Optimize {systemName ?? rbdSystemId}</DialogTitle>
          <DialogDescription>
            Let an evolving search shop the master data for a better vendor behind every part, without touching this drawing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <p className="rounded-sm border border-border bg-surface-sunken px-3 py-6 text-center text-body-sm text-foreground-muted">
            Pick a goal to start searching.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

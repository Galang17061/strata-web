"use client";

import { Coins, Gauge, Scale } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { OptimizationMode, OptimizationSettings } from "@/features/optimization/types";
import { cn } from "@/lib/utils";

type OptimizationStudioProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rbdSystemId: string;
  systemName: string | null;
};

const modeCopy: Record<OptimizationMode, { title: string; body: string; icon: React.ComponentType<{ className?: string }> }> = {
  1: { title: "Reliability first", body: "Chase the highest chance of working, whatever it costs.", icon: Gauge },
  2: { title: "Reliability under a budget", body: "Chase the highest chance of working while the bill stays under a ceiling.", icon: Coins },
  3: { title: "Budget and floor", body: "Balance cost against reliability, keeping both inside the limits you set.", icon: Scale },
};

export function defaultSettings(): OptimizationSettings {
  return {
    mode: 1,
    maxBudget: "",
    targetReliability: "0.9",
    weightCost: 0.9,
    populationSize: "700",
    maxGenerations: "1500",
    crossoverProbability: "0.9",
    mutationProbability: "0.4",
    seed: "",
  };
}

function ModeCards({ value, onChange }: { value: OptimizationMode; onChange: (mode: OptimizationMode) => void }) {
  return (
    <div role="radiogroup" aria-label="Optimization goal" className="grid gap-3 sm:grid-cols-3">
      {([1, 2, 3] as const).map((mode) => {
        const copy = modeCopy[mode];
        const Icon = copy.icon;
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(mode)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-md border bg-surface p-4 text-left outline-none transition-[border-color,box-shadow] duration-(--dur-fast) focus-visible:ring-2 focus-visible:ring-ring",
              active ? "border-primary ring-2 ring-ring" : "border-border hover:border-primary/60",
            )}
          >
            <Icon className={cn("size-5", active ? "text-primary" : "text-foreground-muted")} />
            <span className="text-body-sm font-semibold text-foreground">{copy.title}</span>
            <span className="text-caption text-foreground-muted normal-case tracking-normal">{copy.body}</span>
          </button>
        );
      })}
    </div>
  );
}

export function OptimizationStudio({ open, onOpenChange, rbdSystemId, systemName }: OptimizationStudioProps) {
  const [settings, setSettings] = useState<OptimizationSettings>(defaultSettings);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-full flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Optimize {systemName ?? rbdSystemId}</DialogTitle>
          <DialogDescription>
            Let an evolving search shop the master data for a better vendor behind every part, without touching this drawing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
          <ModeCards value={settings.mode} onChange={(mode) => setSettings((current) => ({ ...current, mode }))} />
          <p className="rounded-sm border border-border bg-surface-sunken px-3 py-6 text-center text-body-sm text-foreground-muted">
            Set the limits for this goal, then run the search.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

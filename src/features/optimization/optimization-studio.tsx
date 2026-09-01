"use client";

import { Coins, Gauge, Scale } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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

export function settingsProblem(settings: OptimizationSettings): string | null {
  const budget = Number(settings.maxBudget);
  const target = Number(settings.targetReliability);
  if (settings.mode !== 1) {
    if (!settings.maxBudget || !Number.isFinite(budget) || budget <= 0) return "Give the search a budget ceiling above zero.";
  }
  if (settings.mode === 3) {
    if (!settings.targetReliability || !Number.isFinite(target) || target <= 0 || target > 1) {
      return "The reliability floor must sit between 0 and 1.";
    }
  }
  return null;
}

function ConstraintFields({
  settings,
  onChange,
}: {
  settings: OptimizationSettings;
  onChange: (patch: Partial<OptimizationSettings>) => void;
}) {
  if (settings.mode === 1) {
    return (
      <p className="text-caption text-foreground-muted normal-case tracking-normal">
        No limits: the search only chases the chance of working. The bill is reported, never enforced.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="optimize-budget">Budget ceiling</Label>
          <div className="relative">
            <Input
              id="optimize-budget"
              numeric
              value={settings.maxBudget}
              onChange={(event) => onChange({ maxBudget: event.target.value.replace(/[^\d.]/g, "") })}
              className="pr-12"
              placeholder="2666000000"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center font-mono text-caption tracking-normal text-foreground-subtle">
              B
            </span>
          </div>
        </div>
        {settings.mode === 3 ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="optimize-target">Reliability floor</Label>
            <div className="relative">
              <Input
                id="optimize-target"
                numeric
                value={settings.targetReliability}
                onChange={(event) => onChange({ targetReliability: event.target.value.replace(/[^\d.]/g, "") })}
                className="pr-12"
                placeholder="0.844"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center font-mono text-caption tracking-normal text-foreground-subtle">
                RT
              </span>
            </div>
          </div>
        ) : null}
      </div>
      {settings.mode === 3 ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="optimize-weights">Cost against reliability</Label>
            <span className="font-mono text-numeric text-foreground">
              w1 {settings.weightCost.toFixed(2)} · w2 {(1 - settings.weightCost).toFixed(2)}
            </span>
          </div>
          <Slider
            id="optimize-weights"
            min={0.05}
            max={0.95}
            step={0.05}
            value={[settings.weightCost]}
            onValueChange={(next) => onChange({ weightCost: next[0] ?? 0.9 })}
            aria-label="Weight given to cost"
          />
          <p className="text-caption text-foreground-muted normal-case tracking-normal">
            The two weights always add up to one. The research default leans on cost at 0.90.
          </p>
        </div>
      ) : null}
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
          <ConstraintFields settings={settings} onChange={(patch) => setSettings((current) => ({ ...current, ...patch }))} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

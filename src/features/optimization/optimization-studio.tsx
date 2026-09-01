"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, Coins, Gauge, Play, Scale } from "lucide-react";
import { useState } from "react";
import { StrataLoader } from "@/components/brand/loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { runOptimizationPreview, scoreOptimizationChoices } from "@/features/optimization/api";
import { PreviewTable } from "@/features/optimization/preview-table";
import { choicesOf, hasManualChanges, locksOf } from "@/features/optimization/selection";
import type {
  OptimizationChoice,
  OptimizationMode,
  OptimizationPreview,
  OptimizationPreviewInput,
  OptimizationSettings,
} from "@/features/optimization/types";
import { formatMoney, formatReliability } from "@/lib/format";
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

export function toPreviewInput(rbdSystemId: string, settings: OptimizationSettings, locks: OptimizationChoice[]): OptimizationPreviewInput {
  const numberOr = (text: string) => {
    const value = Number(text);
    return text !== "" && Number.isFinite(value) && value > 0 ? value : undefined;
  };
  return {
    rbdSystemId,
    mode: settings.mode,
    maxBudget: settings.mode === 1 ? undefined : numberOr(settings.maxBudget),
    targetReliability: settings.mode === 3 ? numberOr(settings.targetReliability) : undefined,
    weightCost: settings.mode === 3 ? settings.weightCost : undefined,
    weightReliability: settings.mode === 3 ? Number((1 - settings.weightCost).toFixed(4)) : undefined,
    populationSize: numberOr(settings.populationSize),
    maxGenerations: numberOr(settings.maxGenerations),
    crossoverProbability: numberOr(settings.crossoverProbability),
    mutationProbability: numberOr(settings.mutationProbability),
    seed: numberOr(settings.seed),
    locks: locks.length > 0 ? locks : undefined,
  };
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

function AdvancedField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} numeric value={value} onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))} placeholder={hint} />
    </div>
  );
}

function AdvancedSettings({
  settings,
  onChange,
}: {
  settings: OptimizationSettings;
  onChange: (patch: Partial<OptimizationSettings>) => void;
}) {
  const [openAdvanced, setOpenAdvanced] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-surface-sunken p-3">
      <button
        type="button"
        aria-expanded={openAdvanced}
        onClick={() => setOpenAdvanced((current) => !current)}
        className="flex items-center justify-between gap-2 rounded-sm text-left text-caption uppercase text-foreground-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        How the search breeds its answers
        <ChevronDown className={cn("size-4 transition-transform duration-(--dur-fast)", openAdvanced && "rotate-180")} aria-hidden="true" />
      </button>
      {openAdvanced ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AdvancedField id="optimize-population" label="Population" value={settings.populationSize} onChange={(value) => onChange({ populationSize: value })} hint="700" />
            <AdvancedField id="optimize-generations" label="Generations" value={settings.maxGenerations} onChange={(value) => onChange({ maxGenerations: value })} hint="1500" />
            <AdvancedField id="optimize-crossover" label="Crossover" value={settings.crossoverProbability} onChange={(value) => onChange({ crossoverProbability: value })} hint="0.9" />
            <AdvancedField id="optimize-mutation" label="Mutation" value={settings.mutationProbability} onChange={(value) => onChange({ mutationProbability: value })} hint="0.4" />
          </div>
          <AdvancedField id="optimize-seed" label="Seed (repeat a run exactly)" value={settings.seed} onChange={(value) => onChange({ seed: value })} hint="leave empty for a fresh roll" />
        </>
      ) : null}
    </div>
  );
}

export function OptimizationStudio({ open, onOpenChange, rbdSystemId, systemName }: OptimizationStudioProps) {
  const [settings, setSettings] = useState<OptimizationSettings>(defaultSettings);
  const [preview, setPreview] = useState<OptimizationPreview | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<ReadonlySet<string>>(new Set());
  const [scoredTotals, setScoredTotals] = useState<OptimizationPreview["totals"] | null>(null);

  const run = useMutation({
    mutationFn: (locks: OptimizationChoice[]) => runOptimizationPreview(toPreviewInput(rbdSystemId, settings, locks)),
    onSuccess: (envelope) => {
      setPreview(envelope.data);
      setSelections({});
      setScoredTotals(null);
      setProblem(null);
    },
    onError: (error) => setProblem(error.message),
  });

  const score = useMutation({
    mutationFn: (choices: OptimizationChoice[]) => scoreOptimizationChoices(rbdSystemId, choices),
    onSuccess: (envelope) => setScoredTotals(envelope.data.totals),
    onError: (error) => setProblem(error.message),
  });

  const selectVendor = (systemComponentId: string, componentId: string) => {
    if (!preview) return;
    const next = { ...selections, [systemComponentId]: componentId };
    setSelections(next);
    if (hasManualChanges(preview.slots, next)) {
      score.mutate(choicesOf(preview.slots, next));
    } else {
      setScoredTotals(null);
    }
  };

  const toggleLock = (systemComponentId: string) => {
    setLocked((current) => {
      const next = new Set(current);
      if (next.has(systemComponentId)) next.delete(systemComponentId);
      else next.add(systemComponentId);
      return next;
    });
  };

  const startRun = (locks: OptimizationChoice[]) => {
    const message = settingsProblem(settings);
    if (message) {
      setProblem(message);
      return;
    }
    setProblem(null);
    run.mutate(locks);
  };

  const reset = () => {
    setPreview(null);
    setProblem(null);
    setSelections({});
    setLocked(new Set());
    setScoredTotals(null);
  };

  const totals = scoredTotals ?? preview?.totals ?? null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="flex max-h-[90dvh] w-full flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Optimize {systemName ?? rbdSystemId}</DialogTitle>
          <DialogDescription>
            Let an evolving search shop the master data for a better vendor behind every part, without touching this drawing.
          </DialogDescription>
        </DialogHeader>
        {run.isPending ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
            <StrataLoader size="md" label="Breeding vendor line-ups" />
            <p className="text-body-sm text-foreground-muted">Breeding vendor line-ups against your limits…</p>
          </div>
        ) : preview ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" size="sm" onClick={reset}>
                <ArrowLeft /> Change the goal
              </Button>
              <span className="text-caption text-foreground-muted normal-case tracking-normal">
                {preview.generations} generations · {preview.executionMs} ms · seed {preview.seed}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-surface-sunken px-4 py-3">
                <p className="text-caption uppercase text-foreground-muted">Chance it works</p>
                <p className="font-mono text-numeric-lg text-foreground">{formatReliability(totals?.reliability, 8)}</p>
                <p className="text-caption text-foreground-muted normal-case tracking-normal">
                  now {formatReliability(totals?.baselineReliability, 8)}
                </p>
              </div>
              <div className="rounded-sm border border-border bg-surface-sunken px-4 py-3">
                <p className="text-caption uppercase text-foreground-muted">Bill for the parts</p>
                <p className="font-mono text-numeric-lg text-foreground">{formatMoney(totals?.cost)}</p>
                <p className="text-caption text-foreground-muted normal-case tracking-normal">now {formatMoney(totals?.baselineCost)}</p>
              </div>
            </div>
            <PreviewTable
              slots={preview.slots}
              fixedSlots={preview.fixedSlots}
              selections={selections}
              locked={locked}
              onSelect={selectVendor}
              onToggleLock={toggleLock}
            />
            {problem ? (
              <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
                {problem}
              </p>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" loading={run.isPending} onClick={() => startRun(locksOf(preview.slots, selections, locked))}>
                <Play /> Run again{locked.size > 0 ? ` with ${locked.size} pinned` : ""}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
            <ModeCards value={settings.mode} onChange={(mode) => setSettings((current) => ({ ...current, mode }))} />
            <ConstraintFields settings={settings} onChange={(patch) => setSettings((current) => ({ ...current, ...patch }))} />
            <AdvancedSettings settings={settings} onChange={(patch) => setSettings((current) => ({ ...current, ...patch }))} />
            {problem ? (
              <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
                {problem}
              </p>
            ) : null}
            <div className="flex items-center justify-end">
              <Button onClick={() => startRun([])} loading={run.isPending}>
                <Play /> Run the search
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

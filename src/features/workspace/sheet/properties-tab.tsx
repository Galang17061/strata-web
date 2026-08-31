"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PulseValue } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fitDistribution, getComponent, updateComponent } from "@/features/workspace/api";
import type { ComponentDetail, ComponentUpdateInput } from "@/features/workspace/types";
import { formatFailureRate, formatHours, formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

export type Distribution = "exponential" | "weibull" | "poisson";
export type Wiring = "series" | "parallel" | "partial";

export type PropertiesForm = {
  distribution: Distribution;
  runningHours: string;
  wiring: Wiring;
  total: string;
  active: string;
  allowedFailures: string;
};

const distributionCopy: Record<Distribution, { label: string; hint: string }> = {
  exponential: { label: "Exponential", hint: "A constant failure rate λ. R(t) = e^(-λt)." },
  weibull: { label: "Weibull", hint: "Shape β and scale η fitted from the failure log. R(t) = e^(-(t/η)^β)." },
  poisson: { label: "Poisson", hint: "Counts faults at rate λ and tolerates up to c of them. R(t) = Σ e^(-λt)(λt)^k/k!." },
};

const wiringCopy: Record<Wiring, { label: string; hint: string }> = {
  series: { label: "Series", hint: "All identical units must work. Active always equals identical." },
  parallel: { label: "Parallel", hint: "Any one unit keeps the block alive." },
  partial: { label: "k out of n", hint: "At least k of the n identical units must work." },
};

export function distributionOf(detail: ComponentDetail | null | undefined): Distribution {
  const lower = detail?.distributionType?.toLowerCase();
  if (lower === "weibull") return "weibull";
  if (lower === "poisson") return "poisson";
  return "exponential";
}

export function wiringOf(connectionType: string | null | undefined): Wiring {
  const lower = (connectionType ?? "").toLowerCase();
  if (lower.includes("parsial") || lower.includes("partial") || lower.includes("redundan")) return "partial";
  if (lower.includes("parallel")) return "parallel";
  return "series";
}

export function formFromDetail(detail: ComponentDetail): PropertiesForm {
  const total = String(detail.totalComponent ?? 1);
  const active = String(detail.activeComponent ?? 1);
  return {
    distribution: distributionOf(detail),
    runningHours: detail.runningHours === null ? "1000" : String(detail.runningHours),
    wiring: wiringOf(detail.connectionType),
    total,
    active,
    allowedFailures: String(detail.allowedFailures ?? 0),
  };
}

export function applyWiringRules(form: PropertiesForm): PropertiesForm {
  if (form.wiring === "series") return { ...form, active: form.total };
  if (form.wiring === "parallel") return { ...form, active: "1" };
  return form;
}

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

const connectionTypeOf: Record<Wiring, string> = { series: "Series", parallel: "Parallel", partial: "Partial" };

export function formProblem(form: PropertiesForm): string | null {
  const total = Number(form.total);
  const active = Number(form.active);
  const hours = Number(form.runningHours);
  if (!form.runningHours || !Number.isFinite(hours) || hours < 0) return "Running hours must be zero or more.";
  if (!Number.isInteger(total) || total < 1) return "There must be at least one identical unit.";
  if (!Number.isInteger(active) || active < 1) return "At least one unit must work.";
  if (active > total) return "More units cannot be required than exist.";
  if (form.wiring === "partial" && total < 3) return "k out of n needs at least three identical units.";
  if (form.wiring === "partial" && (active < 2 || active === total)) return "For k out of n, k must be at least 2 and less than n.";
  if (form.distribution === "poisson") {
    const allowed = Number(form.allowedFailures);
    if (form.allowedFailures === "" || !Number.isInteger(allowed) || allowed < 0) return "Allowed failures must be zero or a whole number.";
  }
  return null;
}

export function toUpdateInput(detail: ComponentDetail, form: PropertiesForm): ComponentUpdateInput {
  return {
    rbdSystemId: detail.rbdSystemId ?? "",
    componentTagNumber: detail.componentTagNumber ?? "",
    vendor: detail.vendor ?? "",
    formulaCode: detail.formulaCode ?? "",
    distributionType: form.distribution,
    failureRate: detail.failureRate ?? 0,
    runningHours: Number(form.runningHours),
    scaleParameter: detail.scaleParameter ?? 0,
    shapeParameter: detail.shapeParameter ?? 0,
    connectionType: connectionTypeOf[form.wiring],
    activeComponent: Number(form.active),
    totalComponent: Number(form.total),
    mtbf: detail.mtbf ?? 0,
    allowedFailures: Number(form.allowedFailures || 0),
  };
}

function UnitField({
  id,
  label,
  unit,
  value,
  onChange,
  disabled,
  hint,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} numeric value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={cn("pr-14")} />
        <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center font-mono text-caption tracking-normal text-foreground-subtle">
          {unit}
        </span>
      </div>
      {hint ? <p className="text-caption text-foreground-muted normal-case tracking-normal">{hint}</p> : null}
    </div>
  );
}

function ReadOnlyRow({ label, symbol, value, children }: { label: string; symbol: string; value: unknown; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-caption uppercase text-foreground-muted">
        {label}
        <span className="font-mono text-foreground-subtle normal-case">{symbol}</span>
      </span>
      <PulseValue value={value} className="shrink-0 font-mono text-numeric whitespace-nowrap text-foreground">
        {children}
      </PulseValue>
    </div>
  );
}

export function FittedFigures({ detail }: { detail: ComponentDetail }) {
  const weibull = distributionOf(detail) === "weibull";
  return (
    <div className="flex flex-col gap-1">
      <p className="text-caption uppercase text-foreground-muted">Fitted from the failure log</p>
      <div className="divide-y divide-border rounded-sm border border-border bg-surface-sunken px-3">
        <ReadOnlyRow label="Failure rate" symbol="λ" value={detail.failureRate}>
          {formatFailureRate(detail.failureRate)}
        </ReadOnlyRow>
        <ReadOnlyRow label="Mean time between failures" symbol="MTBF" value={detail.mtbf}>
          {formatHours(detail.mtbf)}
        </ReadOnlyRow>
        {weibull ? (
          <>
            <ReadOnlyRow label="Shape" symbol="β" value={detail.shapeParameter}>
              {formatReliability(detail.shapeParameter, 4)}
            </ReadOnlyRow>
            <ReadOnlyRow label="Scale" symbol="η" value={detail.scaleParameter}>
              {formatHours(detail.scaleParameter)}
            </ReadOnlyRow>
            <ReadOnlyRow label="Fit" symbol="R²" value={detail.regresi}>
              {formatReliability(detail.regresi, 4)}
            </ReadOnlyRow>
          </>
        ) : null}
      </div>
      <p className="text-caption text-foreground-muted normal-case tracking-normal">
        These are worked out by Strata from the recorded failures and cannot be typed in.
      </p>
    </div>
  );
}

type PropertiesTabProps = {
  systemComponentId: string;
  canEdit: boolean;
};

export function PropertiesTab({ systemComponentId, canEdit }: PropertiesTabProps) {
  const queryClient = useQueryClient();
  const detail = useQuery({
    queryKey: queryKeys.components.detail(systemComponentId),
    queryFn: () => getComponent(systemComponentId),
  });
  const data = detail.data?.data ?? null;
  const [form, setForm] = useState<PropertiesForm | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(formFromDetail(data));
  }, [data]);

  const update = (patch: Partial<PropertiesForm>) => {
    setProblem(null);
    setForm((current) => (current ? applyWiringRules({ ...current, ...patch }) : current));
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!data || !form) return null;
      await updateComponent(systemComponentId, toUpdateInput(data, form));
      try {
        await fitDistribution(systemComponentId, form.distribution);
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : "The distribution could not be fitted.";
      }
    },
    onSuccess: async (fitProblem) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.components.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all });
      await queryClient.invalidateQueries({ queryKey: ["drawing"] });
      await queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
      if (fitProblem) {
        toast.warning("Saved, but the fit did not go through", { description: fitProblem });
        return;
      }
      toast.success("Properties saved", { description: data?.componentName });
    },
    onError: (error) => setProblem(error.message),
  });

  const dirty = data && form ? JSON.stringify(form) !== JSON.stringify(formFromDetail(data)) : false;

  if (detail.isPending || !form) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-body-sm text-danger">{detail.error?.message ?? "This part could not be loaded."}</p>;
  }

  const activeLocked = form.wiring !== "partial";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="component-distribution">Distribution</Label>
        <Select value={form.distribution} onValueChange={(value) => update({ distribution: value as Distribution })} disabled={!canEdit}>
          <SelectTrigger id="component-distribution" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(distributionCopy) as Distribution[]).map((key) => (
              <SelectItem key={key} value={key}>
                {distributionCopy[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-caption text-foreground-muted normal-case tracking-normal">{distributionCopy[form.distribution].hint}</p>
      </div>

      {form.distribution === "poisson" ? (
        <UnitField
          id="component-allowed-failures"
          label="Allowed failures"
          unit="c"
          value={form.allowedFailures}
          disabled={!canEdit}
          onChange={(value) => update({ allowedFailures: digitsOnly(value) })}
          hint="How many faults this part may take before it counts as down."
        />
      ) : null}

      <UnitField
        id="component-running-hours"
        label="Running hours"
        unit="h"
        value={form.runningHours}
        disabled={!canEdit}
        onChange={(value) => update({ runningHours: value.replace(/[^\d.]/g, "") })}
        hint="The time t the score is read at."
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="component-wiring">Wiring of identical units</Label>
        <Select value={form.wiring} onValueChange={(value) => update({ wiring: value as Wiring })} disabled={!canEdit}>
          <SelectTrigger id="component-wiring" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(wiringCopy) as Wiring[]).map((key) => (
              <SelectItem key={key} value={key}>
                {wiringCopy[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-caption text-foreground-muted normal-case tracking-normal">{wiringCopy[form.wiring].hint}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <UnitField
          id="component-total"
          label="Identical units"
          unit="n"
          value={form.total}
          disabled={!canEdit}
          onChange={(value) => update({ total: digitsOnly(value) })}
        />
        <UnitField
          id="component-active"
          label="Must work"
          unit="k"
          value={form.active}
          disabled={!canEdit || activeLocked}
          onChange={(value) => update({ active: digitsOnly(value) })}
        />
      </div>

      <FittedFigures detail={{ ...data, distributionType: form.distribution }} />

      {canEdit ? (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          {problem ? (
            <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
              {problem}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!dirty || save.isPending}
              onClick={() => {
                setForm(formFromDetail(data));
                setProblem(null);
              }}
            >
              Reset
            </Button>
            <Button
              type="button"
              loading={save.isPending}
              disabled={!dirty}
              onClick={() => {
                const message = formProblem(form);
                if (message) {
                  setProblem(message);
                  return;
                }
                save.mutate();
              }}
            >
              <Save /> Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

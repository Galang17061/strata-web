"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getComponent } from "@/features/workspace/api";
import type { ComponentDetail } from "@/features/workspace/types";
import { formatFailureRate, formatHours, formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

export type Distribution = "exponential" | "weibull";
export type Wiring = "series" | "parallel" | "partial";

export type PropertiesForm = {
  distribution: Distribution;
  runningHours: string;
  wiring: Wiring;
  total: string;
  active: string;
};

const distributionCopy: Record<Distribution, { label: string; hint: string }> = {
  exponential: { label: "Exponential", hint: "A constant failure rate λ. R(t) = e^(-λt)." },
  weibull: { label: "Weibull", hint: "Shape β and scale η fitted from the failure log. R(t) = e^(-(t/η)^β)." },
};

const wiringCopy: Record<Wiring, { label: string; hint: string }> = {
  series: { label: "Series", hint: "All identical units must work. Active always equals identical." },
  parallel: { label: "Parallel", hint: "Any one unit keeps the block alive." },
  partial: { label: "k out of n", hint: "At least k of the n identical units must work." },
};

export function distributionOf(detail: ComponentDetail | null | undefined): Distribution {
  return detail?.distributionType?.toLowerCase() === "weibull" ? "weibull" : "exponential";
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

function ReadOnlyRow({ label, symbol, children }: { label: string; symbol: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-baseline gap-2 text-caption uppercase text-foreground-muted">
        {label}
        <span className="font-mono text-foreground-subtle normal-case">{symbol}</span>
      </span>
      <span className="font-mono text-numeric text-foreground">{children}</span>
    </div>
  );
}

export function FittedFigures({ detail }: { detail: ComponentDetail }) {
  const weibull = distributionOf(detail) === "weibull";
  return (
    <div className="flex flex-col gap-1">
      <p className="text-caption uppercase text-foreground-muted">Fitted from the failure log</p>
      <div className="divide-y divide-border rounded-sm border border-border bg-surface-sunken px-3">
        <ReadOnlyRow label="Failure rate" symbol="λ">
          {formatFailureRate(detail.failureRate)}
        </ReadOnlyRow>
        <ReadOnlyRow label="Mean time between failures" symbol="MTBF">
          {formatHours(detail.mtbf)}
        </ReadOnlyRow>
        {weibull ? (
          <>
            <ReadOnlyRow label="Shape" symbol="β">
              {formatReliability(detail.shapeParameter, 4)}
            </ReadOnlyRow>
            <ReadOnlyRow label="Scale" symbol="η">
              {formatHours(detail.scaleParameter)}
            </ReadOnlyRow>
            <ReadOnlyRow label="Fit" symbol="R²">
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
  const detail = useQuery({
    queryKey: queryKeys.components.detail(systemComponentId),
    queryFn: () => getComponent(systemComponentId),
  });
  const data = detail.data?.data ?? null;
  const [form, setForm] = useState<PropertiesForm | null>(null);

  useEffect(() => {
    if (data) setForm(formFromDetail(data));
  }, [data]);

  const update = (patch: Partial<PropertiesForm>) => setForm((current) => (current ? applyWiringRules({ ...current, ...patch }) : current));

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
    </div>
  );
}

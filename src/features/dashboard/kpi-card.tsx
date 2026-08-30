"use client";

import type { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type KpiCardProps = {
  label: string;
  value: number | null | undefined;
  icon: LucideIcon;
  format?: (value: number) => string;
  hint?: string;
  loading?: boolean;
};

export function KpiCard({ label, value, icon: Icon, format, hint, loading = false }: KpiCardProps) {
  return (
    <Card size="sm" className="gap-3">
      <div className="flex items-center justify-between">
        <span className="text-caption uppercase text-foreground-muted">{label}</span>
        <span className="inline-flex size-8 items-center justify-center rounded-sm bg-accent text-accent-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : value === null || value === undefined ? (
        <span className="font-mono text-numeric-lg text-foreground-subtle">—</span>
      ) : (
        <CountUp value={value} format={format} className="text-numeric-lg text-foreground" />
      )}
      {hint ? <span className="text-caption text-foreground-subtle normal-case tracking-normal">{hint}</span> : null}
    </Card>
  );
}

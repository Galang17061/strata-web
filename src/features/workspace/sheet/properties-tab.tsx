"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getComponent } from "@/features/workspace/api";
import type { ComponentDetail } from "@/features/workspace/types";
import { queryKeys } from "@/lib/query-keys";

export type Distribution = "exponential" | "weibull";

const distributionCopy: Record<Distribution, { label: string; hint: string }> = {
  exponential: { label: "Exponential", hint: "A constant failure rate λ. R(t) = e^(-λt)." },
  weibull: { label: "Weibull", hint: "Shape β and scale η fitted from the failure log. R(t) = e^(-(t/η)^β)." },
};

export function distributionOf(detail: ComponentDetail | null | undefined): Distribution {
  return detail?.distributionType?.toLowerCase() === "weibull" ? "weibull" : "exponential";
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
  const [distribution, setDistribution] = useState<Distribution>("exponential");

  useEffect(() => {
    if (data) setDistribution(distributionOf(data));
  }, [data]);

  if (detail.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-body-sm text-danger">{detail.error?.message ?? "This part could not be loaded."}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="component-distribution">Distribution</Label>
        <Select value={distribution} onValueChange={(value) => setDistribution(value as Distribution)} disabled={!canEdit}>
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
        <p className="text-caption text-foreground-muted normal-case tracking-normal">{distributionCopy[distribution].hint}</p>
      </div>
    </div>
  );
}

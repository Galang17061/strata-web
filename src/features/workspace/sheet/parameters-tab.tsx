"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Sigma, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fitDistribution, getComponent, listWeibullParameters } from "@/features/workspace/api";
import { distributionOf, type Distribution } from "@/features/workspace/sheet/properties-tab";
import { formatCount, formatDate, formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

type ParametersTabProps = {
  systemComponentId: string;
  canEdit: boolean;
};

export function ParametersTab({ systemComponentId, canEdit }: ParametersTabProps) {
  const queryClient = useQueryClient();
  const detail = useQuery({
    queryKey: queryKeys.components.detail(systemComponentId),
    queryFn: () => getComponent(systemComponentId),
  });
  const weibull = useQuery({
    queryKey: queryKeys.components.weibull(systemComponentId),
    queryFn: () => listWeibullParameters(systemComponentId),
  });
  const rows = weibull.data?.data ?? [];
  const current = distributionOf(detail.data?.data);

  const fit = useMutation({
    mutationFn: (distribution: Distribution) => fitDistribution(systemComponentId, distribution),
    onSuccess: async (_, distribution) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.components.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all });
      await queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
      toast.success(distribution === "weibull" ? "Weibull fitted" : distribution === "poisson" ? "Poisson refreshed" : "Failure rate refreshed", {
        description: "The figures were worked out again from the failure log.",
      });
    },
    onError: (error, distribution) =>
      toast.error(
        distribution === "weibull" ? "Could not fit Weibull" : distribution === "poisson" ? "Could not refresh Poisson" : "Could not refresh the rate",
        { description: error.message },
      ),
  });

  if (weibull.isPending || detail.isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {canEdit ? (
        <div className="flex flex-col gap-2 rounded-sm border border-border bg-surface-sunken p-3">
          <p className="text-caption uppercase text-foreground-muted">Fit again from the failure log</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={current === "weibull" ? "default" : "secondary"}
              size="sm"
              loading={fit.isPending && fit.variables === "weibull"}
              disabled={fit.isPending}
              onClick={() => fit.mutate("weibull")}
            >
              <TrendingDown /> Fit Weibull
            </Button>
            <Button
              variant={current === "exponential" ? "default" : "secondary"}
              size="sm"
              loading={fit.isPending && fit.variables === "exponential"}
              disabled={fit.isPending}
              onClick={() => fit.mutate("exponential")}
            >
              <Sigma /> Refresh failure rate
            </Button>
            <Button
              variant={current === "poisson" ? "default" : "secondary"}
              size="sm"
              loading={fit.isPending && fit.variables === "poisson"}
              disabled={fit.isPending}
              onClick={() => fit.mutate("poisson")}
            >
              <ShieldCheck /> Fit Poisson
            </Button>
          </div>
          <p className="text-caption text-foreground-muted normal-case tracking-normal">
            Weibull needs at least two recorded failures. The exponential and Poisson rates fall back to the stored figure when the log is empty.
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <p className="text-caption uppercase text-foreground-muted">Median-rank regression points</p>
        <Table dense>
          <TableCaption className="sr-only">Weibull fits this part has been given</TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Fitted</TableHead>
              <TableHead numeric className="normal-case">
                t
              </TableHead>
              <TableHead numeric className="normal-case">
                x = ln t
              </TableHead>
              <TableHead numeric className="normal-case">
                y
              </TableHead>
              <TableHead numeric className="normal-case">
                R(t)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-6 text-center whitespace-normal text-foreground-muted">
                  No regression points yet. Record at least two failures, then fit Weibull.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.weibullParameterId}>
                  <TableCell className="text-foreground-muted">{formatDate(row.updatedAt ?? row.createdAt)}</TableCell>
                  <TableCell numeric>{formatCount(row.failureTime)}</TableCell>
                  <TableCell numeric>{formatReliability(row.scaleParameter, 4)}</TableCell>
                  <TableCell numeric>{formatReliability(row.shapeParameter, 4)}</TableCell>
                  <TableCell numeric>{formatReliability(row.totalReliability, 4)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

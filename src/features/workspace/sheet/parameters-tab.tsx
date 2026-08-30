"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listWeibullParameters } from "@/features/workspace/api";
import { formatCount, formatDate, formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

type ParametersTabProps = {
  systemComponentId: string;
  canEdit: boolean;
};

export function ParametersTab({ systemComponentId }: ParametersTabProps) {
  const weibull = useQuery({
    queryKey: queryKeys.components.weibull(systemComponentId),
    queryFn: () => listWeibullParameters(systemComponentId),
  });
  const rows = weibull.data?.data ?? [];

  if (weibull.isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption uppercase text-foreground-muted">Weibull fits</p>
      <Table dense>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Fitted</TableHead>
            <TableHead numeric className="normal-case">t</TableHead>
            <TableHead numeric className="normal-case">β</TableHead>
            <TableHead numeric className="normal-case">η</TableHead>
            <TableHead numeric className="normal-case">R(t)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="py-6 text-center whitespace-normal text-foreground-muted">
                No Weibull fit yet. Record at least two failures, then fit the distribution.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.weibullParameterId}>
                <TableCell className="text-foreground-muted">{formatDate(row.updatedAt ?? row.createdAt)}</TableCell>
                <TableCell numeric>{formatCount(row.failureTime)}</TableCell>
                <TableCell numeric>{formatReliability(row.shapeParameter, 4)}</TableCell>
                <TableCell numeric>{formatCount(row.scaleParameter)}</TableCell>
                <TableCell numeric>{formatReliability(row.totalReliability, 4)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listFailureEvents } from "@/features/workspace/api";
import { formatCount, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

const pageSize = 10;

type FailuresTabProps = {
  systemComponentId: string;
  canEdit: boolean;
};

export function FailuresTab({ systemComponentId }: FailuresTabProps) {
  const [page, setPage] = useState(1);
  const events = useQuery({
    queryKey: queryKeys.components.failures(systemComponentId, { page, pageSize }),
    queryFn: () => listFailureEvents(systemComponentId, { page, pageSize }),
  });
  const rows = events.data?.data ?? [];
  const meta = events.data?.meta ?? null;

  if (events.isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption uppercase text-foreground-muted">
        {meta ? `${formatCount(meta.totalData)} recorded failure${meta.totalData === 1 ? "" : "s"}` : "Failure log"}
      </p>
      <Table dense>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead numeric>#</TableHead>
            <TableHead>Date</TableHead>
            <TableHead numeric>At hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="py-6 text-center whitespace-normal text-foreground-muted">
                No failures recorded yet. The distribution stays at its master figures until some are.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((event, index) => (
              <TableRow key={event.failureEventId}>
                <TableCell numeric>{event.failureNumber ?? (page - 1) * pageSize + index + 1}</TableCell>
                <TableCell>{formatDate(event.failureDate)}</TableCell>
                <TableCell numeric>{formatCount(event.runningHours)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {meta && meta.totalPage > 1 ? (
        <div className="flex items-center justify-between">
          <span className="text-caption text-foreground-muted normal-case tracking-normal">
            Page {meta.currentPage} of {meta.totalPage}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Previous page" disabled={!meta.hasPreviousPage} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Next page" disabled={!meta.hasNextPage} onClick={() => setPage((value) => value + 1)}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

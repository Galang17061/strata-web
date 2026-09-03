"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { listAudit } from "@/features/account/api";

function auditMoment(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditCard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const audit = useQuery({
    queryKey: ["audit", { page, pageSize }],
    queryFn: () => listAudit({ page, pageSize }),
    placeholderData: (previous) => previous,
  });
  const rows = audit.data?.data ?? [];
  const meta = audit.data?.meta ?? null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-h3">Audit trail</h2>
        <p className="text-body-sm text-foreground-muted">
          Every change that reached the service: who, what, and when.
        </p>
      </div>
      {audit.isPending ? (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-border bg-surface p-4 text-body-sm text-foreground-muted">
          Nothing recorded yet. The trail starts with the next change anyone makes.
        </p>
      ) : (
        <>
          <Table>
            <TableCaption className="sr-only">Recorded changes</TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-full">Where</TableHead>
                <TableHead className="text-right">Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry) => (
                <TableRow key={entry.auditTrailId}>
                  <TableCell className="whitespace-nowrap text-foreground-muted">
                    {auditMoment(entry.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{entry.userName}</TableCell>
                  <TableCell className="font-mono text-caption">{entry.method}</TableCell>
                  <TableCell className="max-w-0 truncate font-mono text-caption text-foreground-muted">
                    {entry.path}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={entry.statusCode < 400 ? "secondary" : "danger"}>
                      {entry.statusCode}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            meta={meta}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            singular="entry"
            plural="entries"
          />
        </>
      )}
    </section>
  );
}

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
import { listFeedback, type FeedbackEntry } from "@/features/account/api";

const kindLabel: Record<FeedbackEntry["category"], string> = {
  bug: "broken",
  idea: "idea",
  question: "question",
};

const kindTone: Record<FeedbackEntry["category"], "danger" | "info" | "secondary"> = {
  bug: "danger",
  idea: "info",
  question: "secondary",
};

function noteMoment(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function FeedbackCard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const notes = useQuery({
    queryKey: ["feedback", { page, pageSize }],
    queryFn: () => listFeedback({ page, pageSize }),
    placeholderData: (previous) => previous,
  });
  const rows = notes.data?.data ?? [];
  const meta = notes.data?.meta ?? null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-h3">Notes to the builders</h2>
        <p className="text-body-sm text-foreground-muted">
          What people wrote in through the note button, newest first.
        </p>
      </div>
      {notes.isPending ? (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-border bg-surface p-4 text-body-sm text-foreground-muted">
          Nothing yet. Notes people send with the pencil button in the topbar gather here.
        </p>
      ) : (
        <>
          <Table>
            <TableCaption className="sr-only">Notes sent to the builders</TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead className="w-full">Note</TableHead>
                <TableHead>Page</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry) => (
                <TableRow key={entry.feedbackId}>
                  <TableCell className="whitespace-nowrap text-foreground-muted">{noteMoment(entry.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap">{entry.userName}</TableCell>
                  <TableCell>
                    <Badge variant={kindTone[entry.category]}>{kindLabel[entry.category]}</Badge>
                  </TableCell>
                  <TableCell className="max-w-0 truncate" title={entry.message}>
                    {entry.message}
                  </TableCell>
                  <TableCell className="max-w-40 truncate font-mono text-caption text-foreground-muted">
                    {entry.page ?? "—"}
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
            singular="note"
          />
        </>
      )}
    </section>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createFailureEvents, listFailureEvents } from "@/features/workspace/api";
import { formatCount, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

const pageSize = 10;

type FailuresTabProps = {
  systemComponentId: string;
  canEdit: boolean;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FailuresTab({ systemComponentId, canEdit }: FailuresTabProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(todayIso);
  const [hours, setHours] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const events = useQuery({
    queryKey: queryKeys.components.failures(systemComponentId, { page, pageSize }),
    queryFn: () => listFailureEvents(systemComponentId, { page, pageSize }),
  });
  const rows = events.data?.data ?? [];
  const meta = events.data?.meta ?? null;

  const add = useMutation({
    mutationFn: () =>
      createFailureEvents([
        {
          systemComponentId,
          failureDate: new Date(date).toISOString(),
          failureNumber: (meta?.totalData ?? 0) + 1,
          runningHours: Number(hours),
        },
      ]),
    onSuccess: async () => {
      setAdding(false);
      setHours("");
      setDate(todayIso());
      await queryClient.invalidateQueries({ queryKey: queryKeys.components.all });
      toast.success("Failure recorded", { description: `At ${formatCount(Number(hours))} hours on ${formatDate(date)}` });
    },
    onError: (error) => setProblem(error.message),
  });

  const submit = () => {
    const parsed = Number(hours);
    if (!date) {
      setProblem("Pick the day it failed.");
      return;
    }
    if (!hours || !Number.isFinite(parsed) || parsed < 0) {
      setProblem("Enter the running hours at which it failed.");
      return;
    }
    setProblem(null);
    add.mutate();
  };

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
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption uppercase text-foreground-muted">
          {meta ? `${formatCount(meta.totalData)} recorded failure${meta.totalData === 1 ? "" : "s"}` : "Failure log"}
        </p>
        {canEdit && !adding ? (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
            <Plus /> Add failure
          </Button>
        ) : null}
      </div>
      {adding ? (
        <form
          noValidate
          className="flex flex-col gap-3 rounded-sm border border-border bg-surface-sunken p-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="failure-date">Failed on</Label>
              <Input id="failure-date" type="date" value={date} max={todayIso()} onChange={(event) => setDate(event.target.value)} className="bg-surface" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="failure-hours">At running hours</Label>
              <Input
                id="failure-hours"
                numeric
                autoFocus
                value={hours}
                placeholder="e.g. 4200"
                onChange={(event) => setHours(event.target.value.replace(/[^\d]/g, ""))}
                className="bg-surface"
              />
            </div>
          </div>
          {problem ? (
            <p role="alert" className="text-body-sm text-danger">
              {problem}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setProblem(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={add.isPending}>
              Record failure
            </Button>
          </div>
        </form>
      ) : null}
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

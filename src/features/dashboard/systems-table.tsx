"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Sparkline } from "@/components/reliability/sparkline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { plotTotals, systemPlot } from "@/features/projects/api";
import type { ProjectSystem } from "@/features/projects/types";
import { formatDate, formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

export function workspaceHref(system: Pick<ProjectSystem, "projectId" | "rbdSystemId">): string {
  return `/workspace/?project=${encodeURIComponent(system.projectId)}&system=${encodeURIComponent(system.rbdSystemId)}`;
}

function SystemSparkline({ rbdSystemId }: { rbdSystemId: string }) {
  const query = useQuery({
    queryKey: queryKeys.systems.plot(rbdSystemId),
    queryFn: () => systemPlot(rbdSystemId),
    staleTime: 5 * 60_000,
    retry: false,
  });
  if (query.isPending) return <Skeleton className="h-6 w-20" />;
  return <Sparkline values={plotTotals(query.data?.data)} label={`Reliability over time for this system`} />;
}

const columnHelper = createColumnHelper<ProjectSystem>();

type SystemsTableProps = {
  systems: ProjectSystem[];
  loading?: boolean;
  emptyAction?: React.ReactNode;
};

export function SystemsTable({ systems, loading = false, emptyAction }: SystemsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.systemName ?? "", {
        id: "systemName",
        header: "System",
        cell: (info) => (
          <Link href={workspaceHref(info.row.original)} className="font-medium text-foreground underline-offset-4 hover:underline">
            {info.getValue() || "Untitled system"}
          </Link>
        ),
      }),
      columnHelper.accessor("projectName", {
        header: "Project",
        cell: (info) => <span className="text-foreground-muted">{info.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.reliabilityTotal ?? -1, {
        id: "reliabilityTotal",
        header: "R(t)",
        meta: { numeric: true },
        cell: (info) => (
          <span title={formatReliability(info.row.original.reliabilityTotal, 8)}>
            {formatReliability(info.row.original.reliabilityTotal)}
          </span>
        ),
      }),
      columnHelper.display({
        id: "band",
        header: "Band",
        cell: (info) => <ReliabilityBadge value={info.row.original.reliabilityTotal} size="sm" />,
      }),
      columnHelper.display({
        id: "trend",
        header: "Trend",
        cell: (info) => <SystemSparkline rbdSystemId={info.row.original.rbdSystemId} />,
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated",
        cell: (info) => <span className="text-foreground-muted">{formatDate(info.getValue())}</span>,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: systems,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="h-5 w-24 rounded-pill" />
          </div>
        ))}
      </div>
    );
  }

  if (systems.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface">
        <EmptyState
          compact
          illustration={<EmptyBlocksIllustration />}
          title="No systems yet"
          description="Create a project and model a system to see it scored here."
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => {
              const numeric = Boolean((header.column.columnDef.meta as { numeric?: boolean } | undefined)?.numeric);
              const sortable = header.column.getCanSort();
              const direction = header.column.getIsSorted();
              return (
                <TableHead key={header.id} numeric={numeric}>
                  {sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("-mx-2 h-7 gap-1 px-2 text-caption uppercase", numeric && "flex-row-reverse")}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {direction === "asc" ? <ArrowUp /> : direction === "desc" ? <ArrowDown /> : <ArrowUpDown className="opacity-50" />}
                    </Button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const numeric = Boolean((cell.column.columnDef.meta as { numeric?: boolean } | undefined)?.numeric);
              return (
                <TableCell key={cell.id} numeric={numeric}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

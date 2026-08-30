"use client";

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MasterComponent } from "@/features/master-data/types";

const columnHelper = createColumnHelper<MasterComponent>();

type ComponentsTableProps = {
  rows: MasterComponent[];
  loading?: boolean;
};

export function ComponentsTable({ rows, loading = false }: ComponentsTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("componentName", {
        header: "Component",
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{info.getValue()}</span>
            {info.row.original.serialNumber ? (
              <span className="font-mono text-caption text-foreground-muted">{info.row.original.serialNumber}</span>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("manufacturerName", {
        header: "Vendor",
        cell: (info) => <span className="text-foreground-muted">{info.getValue()}</span>,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4" aria-busy="true" aria-label="Loading components">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface">
        <EmptyState
          compact
          illustration={<EmptyBlocksIllustration />}
          title="No components yet"
          description="Add a part to the catalogue so systems have something to be built from."
        />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

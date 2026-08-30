"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type OnChangeFn,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { splitCompatibility } from "@/features/master-data/compatibility-picker";
import type { MasterComponent } from "@/features/master-data/types";
import { formatCount, formatFailureRate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<MasterComponent>();

type ColumnMeta = { numeric?: boolean };

function metaOf(column: { columnDef: { meta?: unknown } }): ColumnMeta {
  return (column.columnDef.meta as ColumnMeta | undefined) ?? {};
}

type ComponentsTableProps = {
  rows: MasterComponent[];
  loading?: boolean;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  searching?: boolean;
  emptyAction?: ReactNode;
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
  dense?: boolean;
  canEdit?: boolean;
  onEdit?: (component: MasterComponent) => void;
  canDelete?: boolean;
  onDelete?: (component: MasterComponent) => void;
};

export const hideableColumns = [
  { id: "manufacturerName", label: "Vendor" },
  { id: "failureRate", label: "Failure rate" },
  { id: "cost", label: "Cost" },
  { id: "compatibility", label: "Compatible with" },
];

export function ComponentsTable({
  rows,
  loading = false,
  sorting,
  onSortingChange,
  searching = false,
  emptyAction,
  columnVisibility,
  onColumnVisibilityChange,
  dense = false,
  canEdit = false,
  onEdit,
  canDelete = false,
  onDelete,
}: ComponentsTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("componentName", {
        header: "Component",
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{info.getValue()}</span>
            {info.row.original.serialNumber && !dense ? (
              <span className="font-mono text-caption text-foreground-muted">{info.row.original.serialNumber}</span>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("manufacturerName", {
        header: "Vendor",
        cell: (info) => <span className="text-foreground-muted">{info.getValue()}</span>,
      }),
      columnHelper.accessor("failureRate", {
        header: "Failure rate",
        meta: { numeric: true },
        cell: (info) => <span title="Failures per running hour">{formatFailureRate(info.getValue())}</span>,
      }),
      columnHelper.accessor("cost", {
        header: "Cost",
        meta: { numeric: true },
        enableSorting: false,
        cell: (info) => formatMoney(info.getValue()),
      }),
      columnHelper.accessor("compatibility", {
        header: "Compatible with",
        enableSorting: false,
        cell: (info) => {
          const count = splitCompatibility(info.getValue()).length;
          return count === 0 ? (
            <span className="text-foreground-subtle">None listed</span>
          ) : (
            <Badge variant="secondary">
              {formatCount(count)} {count === 1 ? "part" : "parts"}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        meta: { numeric: true },
        cell: (info) => (
          <span className="inline-flex items-center gap-1">
            {canEdit ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${info.row.original.componentName}`}
                onClick={() => onEdit?.(info.row.original)}
              >
                <Pencil />
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${info.row.original.componentName}`}
                onClick={() => onDelete?.(info.row.original)}
                className="hover:text-danger"
              >
                <Trash2 />
              </Button>
            ) : null}
          </span>
        ),
      }),
    ],
    [dense, canEdit, onEdit, canDelete, onDelete],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange,
    onColumnVisibilityChange,
    manualSorting: true,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4" aria-busy="true" aria-label="Loading components">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="h-4 w-24" />
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
          title={searching ? "Nothing matches that" : "No components yet"}
          description={searching ? "Try another word, or clear the search." : "Add a part to the catalogue so systems have something to be built from."}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <Table dense={dense}>
      <TableCaption className="sr-only">Parts in the catalogue</TableCaption>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => {
              const numeric = Boolean(metaOf(header.column).numeric);
              const direction = header.column.getIsSorted();
              return (
                <TableHead key={header.id} numeric={numeric}>
                  {header.column.getCanSort() ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("-mx-2 h-7 gap-1 px-2 text-caption uppercase", numeric && "flex-row-reverse")}
                      onClick={header.column.getToggleSortingHandler()}
                      aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
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
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} numeric={Boolean(metaOf(cell.column).numeric)}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

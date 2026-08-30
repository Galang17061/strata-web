"use client";

import { useQuery } from "@tanstack/react-query";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { Columns3, Plus, Rows2, Rows3, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { PermissionGate } from "@/features/auth/permission-gate";
import { MODULES } from "@/features/auth/roles";
import { usePermissions } from "@/features/auth/session";
import { listMasterComponents } from "@/features/master-data/api";
import { ComponentDialog } from "@/features/master-data/component-dialog";
import { ComponentsTable, hideableColumns } from "@/features/master-data/components-table";
import type { MasterComponent } from "@/features/master-data/types";
import { MasterDataTabs } from "@/features/master-data/master-data-tabs";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { formatCount } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { useDebounce } from "@/lib/use-debounce";

export function ComponentsScreen() {
  useBreadcrumbs([{ label: "Master data" }, { label: "Components" }]);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search.trim(), 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSortingState] = useState<SortingState>([{ id: "componentName", desc: false }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [dense, setDense] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MasterComponent | null>(null);
  const permissions = usePermissions(MODULES.MASTER_DATA);
  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (component: MasterComponent) => {
    setEditing(component);
    setDialogOpen(true);
  };
  const sort = sorting[0];

  const [lastSearch, setLastSearch] = useState(debounced);
  if (lastSearch !== debounced) {
    setLastSearch(debounced);
    setPage(1);
  }

  const listParams = {
    page,
    pageSize,
    search: debounced || undefined,
    sortBy: sort?.id ?? "componentName",
    sortOrder: sort?.desc ? ("desc" as const) : ("asc" as const),
  };
  const components = useQuery({
    queryKey: queryKeys.masterComponents.list(listParams),
    queryFn: () => listMasterComponents(listParams),
    placeholderData: (previous) => previous,
  });
  const rows = components.data?.data ?? [];
  const meta = components.data?.meta ?? null;
  const total = meta?.totalData ?? rows.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Components"
        description={components.data ? `${formatCount(total)} parts a system can be built from.` : "The catalogue of parts a system can be built from."}
        actions={
          <PermissionGate moduleName={MODULES.MASTER_DATA} permission="create">
            <Button onClick={openCreate}>
              <Plus /> New component
            </Button>
          </PermissionGate>
        }
      />
      <MasterDataTabs />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
          <Input
            aria-label="Search components"
            placeholder="Search by name, serial or vendor"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                <Columns3 /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={columnVisibility[column.id] !== false}
                  onCheckedChange={(checked) => setColumnVisibility((current) => ({ ...current, [column.id]: checked }))}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={dense}
            aria-label={dense ? "Loosen the rows" : "Tighten the rows"}
            onClick={() => setDense((current) => !current)}
          >
            {dense ? <Rows3 /> : <Rows2 />} {dense ? "Compact" : "Comfortable"}
          </Button>
        </div>
      </div>
      <ComponentsTable
        rows={rows}
        loading={components.isPending}
        sorting={sorting}
        onSortingChange={(updater) => {
          setSortingState(updater);
          setPage(1);
        }}
        emptyAction={
          debounced ? (
            <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
              Clear search
            </Button>
          ) : undefined
        }
        searching={Boolean(debounced)}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        dense={dense}
        canEdit={permissions.canUpdate}
        onEdit={openEdit}
      />
      {rows.length > 0 || page > 1 ? (
        <TablePagination
          meta={meta}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          noun="parts"
        />
      ) : null}
      <ComponentDialog open={dialogOpen} onOpenChange={setDialogOpen} component={editing} />
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { listMasterComponents } from "@/features/master-data/api";
import { ComponentsTable } from "@/features/master-data/components-table";
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
    </div>
  );
}

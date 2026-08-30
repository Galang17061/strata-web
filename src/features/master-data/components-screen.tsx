"use client";

import { useQuery } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { listMasterComponents } from "@/features/master-data/api";
import { ComponentsTable } from "@/features/master-data/components-table";
import { MasterDataTabs } from "@/features/master-data/master-data-tabs";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { formatCount } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export function ComponentsScreen() {
  useBreadcrumbs([{ label: "Master data" }, { label: "Components" }]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "componentName", desc: false }]);
  const sort = sorting[0];
  const listParams = {
    page: 1,
    pageSize: 20,
    sortBy: sort?.id ?? "componentName",
    sortOrder: sort?.desc ? ("desc" as const) : ("asc" as const),
  };
  const components = useQuery({
    queryKey: queryKeys.masterComponents.list(listParams),
    queryFn: () => listMasterComponents(listParams),
    placeholderData: (previous) => previous,
  });
  const rows = components.data?.data ?? [];
  const total = components.data?.meta?.totalData ?? rows.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Components"
        description={components.data ? `${formatCount(total)} parts a system can be built from.` : "The catalogue of parts a system can be built from."}
      />
      <MasterDataTabs />
      <ComponentsTable rows={rows} loading={components.isPending} sorting={sorting} onSortingChange={setSorting} />
    </div>
  );
}

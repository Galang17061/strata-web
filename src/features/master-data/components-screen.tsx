"use client";

import { useQuery } from "@tanstack/react-query";
import { listMasterComponents } from "@/features/master-data/api";
import { ComponentsTable } from "@/features/master-data/components-table";
import { MasterDataTabs } from "@/features/master-data/master-data-tabs";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { formatCount } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

const listParams = { page: 1, pageSize: 20 };

export function ComponentsScreen() {
  useBreadcrumbs([{ label: "Master data" }, { label: "Components" }]);
  const components = useQuery({
    queryKey: queryKeys.masterComponents.list(listParams),
    queryFn: () => listMasterComponents(listParams),
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
      <ComponentsTable rows={rows} loading={components.isPending} />
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/brand/empty-state";
import { LayersIllustration } from "@/components/brand/illustrations";
import { Skeleton } from "@/components/ui/skeleton";
import { listVendors } from "@/features/master-data/api";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { formatCount } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

const listParams = { page: 1, pageSize: 100 };

function VendorSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading vendors">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
          <Skeleton className="h-16 w-16 rounded-sm" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function VendorsScreen() {
  useBreadcrumbs([{ label: "Master data" }, { label: "Vendors" }]);
  const vendors = useQuery({
    queryKey: queryKeys.vendors.list(listParams),
    queryFn: () => listVendors(listParams),
  });
  const rows = vendors.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendors"
        description={vendors.data ? `${formatCount(vendors.data.meta?.totalData ?? rows.length)} manufacturers your parts come from.` : "The manufacturers your parts come from."}
      />
      {vendors.isPending ? (
        <VendorSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          illustration={<LayersIllustration />}
          title="No vendors yet"
          description="Add the first manufacturer so parts can be tied to who made them."
          className="rounded-md border border-dashed border-border"
        />
      ) : (
        <p className="text-body-sm text-foreground-muted">{formatCount(rows.length)} vendors loaded. Their cards are on the way.</p>
      )}
    </div>
  );
}

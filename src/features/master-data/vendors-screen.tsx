"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { EmptyState } from "@/components/brand/empty-state";
import { LayersIllustration } from "@/components/brand/illustrations";
import { Plus } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionGate } from "@/features/auth/permission-gate";
import { MODULES } from "@/features/auth/roles";
import { listVendors } from "@/features/master-data/api";
import type { Vendor } from "@/features/master-data/types";
import { VendorDialog } from "@/features/master-data/vendor-dialog";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { filesUrl } from "@/lib/files-url";
import { formatCount, formatDate } from "@/lib/format";
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

export function vendorInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function VendorLogo({ vendor }: { vendor: Vendor }) {
  const src = filesUrl(vendor.logoImage);
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      <span className="inline-flex size-16 items-center justify-center overflow-hidden rounded-sm bg-surface-sunken p-1.5">
        <Image
          src={src}
          alt={`${vendor.manufacturerName} logo`}
          width={64}
          height={64}
          unoptimized
          className="size-full object-contain"
          onError={() => setBroken(true)}
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-16 items-center justify-center rounded-sm bg-surface-sunken font-mono text-h3 text-foreground-muted"
    >
      {vendorInitials(vendor.manufacturerName)}
    </span>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Card className="h-full gap-4 transition-colors hover:border-border-strong">
      <VendorLogo vendor={vendor} />
      <div className="min-w-0">
        <CardTitle className="truncate">{vendor.manufacturerName}</CardTitle>
        <CardDescription>
          {vendor.validUntil ? `Valid until ${formatDate(vendor.validUntil)}` : `Added ${formatDate(vendor.createdAt)}`}
        </CardDescription>
      </div>
    </Card>
  );
}

export function VendorsScreen() {
  useBreadcrumbs([{ label: "Master data" }, { label: "Vendors" }]);
  const vendors = useQuery({
    queryKey: queryKeys.vendors.list(listParams),
    queryFn: () => listVendors(listParams),
  });
  const rows = vendors.data?.data ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);

  const newVendorButton = (
    <PermissionGate moduleName={MODULES.MASTER_DATA} permission="create">
      <Button onClick={() => setDialogOpen(true)}>
        <Plus /> New vendor
      </Button>
    </PermissionGate>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendors"
        description={vendors.data ? `${formatCount(vendors.data.meta?.totalData ?? rows.length)} manufacturers your parts come from.` : "The manufacturers your parts come from."}
        actions={newVendorButton}
      />
      {vendors.isPending ? (
        <VendorSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          illustration={<LayersIllustration />}
          title="No vendors yet"
          description="Add the first manufacturer so parts can be tied to who made them."
          action={newVendorButton}
          className="rounded-md border border-dashed border-border"
        />
      ) : (
        <Stagger inView={false} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((vendor) => (
            <StaggerItem key={vendor.vendorId}>
              <VendorCard vendor={vendor} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
      <VendorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/brand/empty-state";
import { LayersIllustration } from "@/components/brand/illustrations";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionGate } from "@/features/auth/permission-gate";
import { MODULES } from "@/features/auth/roles";
import { usePermissions } from "@/features/auth/session";
import { deleteVendor, listVendors } from "@/features/master-data/api";
import type { Vendor } from "@/features/master-data/types";
import { VendorDialog } from "@/features/master-data/vendor-dialog";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { ApiError } from "@/lib/api/client";
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

type VendorCardProps = {
  vendor: Vendor;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function VendorCard({ vendor, canEdit, canDelete, onEdit, onDelete }: VendorCardProps) {
  return (
    <Card className="group h-full gap-4 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <VendorLogo vendor={vendor} />
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 has-focus-visible:opacity-100">
          {canEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${vendor.manufacturerName}`} onClick={onEdit}>
              <Pencil />
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${vendor.manufacturerName}`}
              onClick={onDelete}
              className="hover:text-danger"
            >
              <Trash2 />
            </Button>
          ) : null}
        </div>
      </div>
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
  const permissions = usePermissions(MODULES.MASTER_DATA);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (vendor: Vendor) => {
    setEditing(vendor);
    setDialogOpen(true);
  };
  const [removing, setRemoving] = useState<Vendor | null>(null);
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: (vendor: Vendor) => deleteVendor(vendor.vendorId),
    onSuccess: async (_, vendor) => {
      setRemoving(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast.success("Vendor removed", { description: vendor.manufacturerName });
    },
    onError: (error, vendor) =>
      toast.error("Could not remove the vendor", {
        description:
          error instanceof ApiError && error.status >= 500
            ? `${vendor.manufacturerName} is still named by parts in the catalogue. Change those parts first.`
            : error.message,
      }),
  });

  const newVendorButton = (
    <PermissionGate moduleName={MODULES.MASTER_DATA} permission="create">
      <Button onClick={openCreate}>
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
              <VendorCard
                vendor={vendor}
                canEdit={permissions.canUpdate}
                canDelete={permissions.canDelete}
                onEdit={() => openEdit(vendor)}
                onDelete={() => setRemoving(vendor)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}
      <VendorDialog open={dialogOpen} onOpenChange={setDialogOpen} vendor={editing} />
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
        title="Remove this vendor?"
        description={
          removing
            ? `${removing.manufacturerName} will be gone from the catalogue. This only works while no part names it.`
            : ""
        }
        confirmLabel="Remove vendor"
        destructive
        loading={remove.isPending}
        onConfirm={() => {
          if (removing) remove.mutate(removing);
        }}
      />
    </div>
  );
}

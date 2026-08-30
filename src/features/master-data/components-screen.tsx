"use client";

import { EmptyState } from "@/components/brand/empty-state";
import { LayersIllustration } from "@/components/brand/illustrations";
import { MasterDataTabs } from "@/features/master-data/master-data-tabs";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";

export function ComponentsScreen() {
  useBreadcrumbs([{ label: "Master data" }, { label: "Components" }]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Components" description="The catalogue of parts a system can be built from." />
      <MasterDataTabs />
      <EmptyState
        illustration={<LayersIllustration />}
        title="The catalogue is on its way"
        description="Parts and their makers will be listed here shortly."
        className="rounded-md border border-dashed border-border"
      />
    </div>
  );
}

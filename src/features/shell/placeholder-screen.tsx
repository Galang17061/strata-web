"use client";

import { EmptyState } from "@/components/brand/empty-state";
import { LayersIllustration } from "@/components/brand/illustrations";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import type { Crumb } from "@/features/shell/ui-store";

type PlaceholderScreenProps = {
  title: string;
  description: string;
  crumbs: Crumb[];
};

export function PlaceholderScreen({ title, description, crumbs }: PlaceholderScreenProps) {
  useBreadcrumbs(crumbs);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        illustration={<LayersIllustration />}
        title="This part is being built"
        description="It will open here as soon as it is ready."
        className="rounded-md border border-dashed border-border"
      />
    </div>
  );
}

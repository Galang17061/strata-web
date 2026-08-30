"use client";

import { Badge } from "@/components/ui/badge";
import { useSession } from "@/features/auth/session";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";

export function DashboardScreen() {
  const { user } = useSession();
  useBreadcrumbs([{ label: "Dashboard" }]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Signed in as ${user?.fullName ?? ""}`}
        actions={<Badge className="capitalize">{user?.roleName}</Badge>}
      />
    </div>
  );
}

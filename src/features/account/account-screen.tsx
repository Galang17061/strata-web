"use client";

import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { listUsers } from "@/features/account/api";
import { RoleBadge } from "@/features/account/role-badge";
import { UserSheet } from "@/features/account/user-sheet";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { countOf } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

function UsersSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4" aria-busy="true" aria-label="Loading users">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
      ))}
    </div>
  );
}

export function AccountScreen() {
  useBreadcrumbs([{ label: "Account management" }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const listParams = { page, pageSize };
  const users = useQuery({
    queryKey: queryKeys.users.list(listParams),
    queryFn: () => listUsers(listParams),
    placeholderData: (previous) => previous,
  });
  const rows = users.data?.data ?? [];
  const meta = users.data?.meta ?? null;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Account management"
        description={users.data ? `${countOf(meta?.totalData ?? rows.length, "person", "people")} can sign in.` : "Who can sign in, and what each of them may do."}
        actions={
          <Button onClick={() => setSheetOpen(true)}>
            <UserPlus /> New person
          </Button>
        }
      />
      {users.isPending ? (
        <UsersSkeleton />
      ) : rows.length === 0 ? (
        <div className="rounded-md border border-border bg-surface">
          <EmptyState compact illustration={<EmptyBlocksIllustration />} title="Nobody yet" description="Add the first person so they can sign in." />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-foreground">{user.fullName}</TableCell>
                <TableCell className="font-mono text-foreground-muted">{user.userName}</TableCell>
                <TableCell className="text-foreground-muted">{user.email}</TableCell>
                <TableCell>
                  <RoleBadge roleName={user.roleName} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {rows.length > 0 ? (
        <TablePagination
          meta={meta}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          singular="person"
          plural="people"
        />
      ) : null}
      <UserSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

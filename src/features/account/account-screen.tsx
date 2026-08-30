"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { AccessSheet } from "@/features/account/access-sheet";
import { deleteUser, listUsers } from "@/features/account/api";
import { ResetPasswordDialog } from "@/features/account/reset-password-dialog";
import { RoleBadge } from "@/features/account/role-badge";
import { RolesCard } from "@/features/account/roles-card";
import type { User } from "@/features/account/types";
import { UserSheet } from "@/features/account/user-sheet";
import { useSession } from "@/features/auth/session";
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
  const [editing, setEditing] = useState<User | null>(null);
  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (user: User) => {
    setEditing(user);
    setSheetOpen(true);
  };
  const session = useSession();
  const queryClient = useQueryClient();
  const [removing, setRemoving] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);
  const [accessFor, setAccessFor] = useState<User | null>(null);
  const remove = useMutation({
    mutationFn: (user: User) => deleteUser(user.id),
    onSuccess: async (_, user) => {
      setRemoving(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Person removed", { description: `${user.fullName} can no longer sign in.` });
    },
    onError: (error) => toast.error("Could not remove the person", { description: error.message }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Account management"
        description={users.data ? `${countOf(meta?.totalData ?? rows.length, "person", "people")} can sign in.` : "Who can sign in, and what each of them may do."}
        actions={
          <Button onClick={openCreate}>
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
          <TableCaption className="sr-only">People who can sign in and their roles</TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-40 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
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
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" aria-label={`Access for ${user.fullName}`} onClick={() => setAccessFor(user)}>
                      <ShieldCheck />
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Edit ${user.fullName}`} onClick={() => openEdit(user)}>
                      <Pencil />
                    </Button>
                    {user.id !== session.user?.id ? (
                      <Button variant="ghost" size="icon-sm" aria-label={`Reset password for ${user.fullName}`} onClick={() => setResetting(user)}>
                        <KeyRound />
                      </Button>
                    ) : null}
                    {user.id !== session.user?.id ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${user.fullName}`}
                        onClick={() => setRemoving(user)}
                        className="hover:text-danger"
                      >
                        <Trash2 />
                      </Button>
                    ) : null}
                  </span>
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
      <RolesCard />
      <UserSheet open={sheetOpen} onOpenChange={setSheetOpen} user={editing} />
      <AccessSheet
        user={accessFor}
        onOpenChange={(open) => {
          if (!open) setAccessFor(null);
        }}
      />
      <ResetPasswordDialog
        user={resetting}
        onOpenChange={(open) => {
          if (!open) setResetting(null);
        }}
      />
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
        title="Remove this person?"
        description={removing ? `${removing.fullName} will lose their seat and cannot sign in again.` : ""}
        confirmLabel="Remove person"
        destructive
        loading={remove.isPending}
        onConfirm={() => {
          if (removing) remove.mutate(removing);
        }}
      />
    </div>
  );
}

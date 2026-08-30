"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { listRoles, updateRole } from "@/features/account/api";
import { RoleBadge } from "@/features/account/role-badge";
import type { Role } from "@/features/account/types";
import { queryKeys } from "@/lib/query-keys";

function RoleRow({ role }: { role: Role }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(role.roleName);
  const rename = useMutation({
    mutationFn: (roleName: string) => updateRole(role.id, { roleName }),
    onSuccess: async (_, roleName) => {
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Role renamed", { description: `${role.roleName} is now ${roleName}.` });
    },
    onError: (error) => toast.error("Could not rename the role", { description: error.message }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === role.roleName) {
      setEditing(false);
      setName(role.roleName);
      return;
    }
    rename.mutate(trimmed);
  };

  return (
    <li className="flex min-h-11 items-center gap-3 border-b border-border py-2 last:border-0">
      <RoleBadge roleName={role.roleName} />
      {editing ? (
        <form onSubmit={submit} className="flex flex-1 items-center gap-2">
          <Input
            aria-label={`New name for ${role.roleName}`}
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setEditing(false);
                setName(role.roleName);
              }
            }}
            className="h-8 max-w-xs"
          />
          <Button type="submit" size="icon-sm" variant="ghost" aria-label="Save name" loading={rename.isPending}>
            <Check />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Keep the old name"
            onClick={() => {
              setEditing(false);
              setName(role.roleName);
            }}
          >
            <X />
          </Button>
        </form>
      ) : (
        <>
          <span className="flex-1 font-mono text-body-sm text-foreground-muted">{role.roleName}</span>
          <Button size="icon-sm" variant="ghost" aria-label={`Rename ${role.roleName}`} onClick={() => setEditing(true)}>
            <Pencil />
          </Button>
        </>
      )}
    </li>
  );
}

export function RolesCard() {
  const roles = useQuery({ queryKey: queryKeys.users.roles, queryFn: listRoles });
  const rows = roles.data?.data ?? [];

  return (
    <Card>
      <div>
        <CardTitle>Roles</CardTitle>
        <CardDescription>The names drive what each role may do, so rename them with care.</CardDescription>
      </div>
      {roles.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading roles">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-1/2" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col">
          {rows.map((role) => (
            <RoleRow key={role.id} role={role} />
          ))}
        </ul>
      )}
    </Card>
  );
}

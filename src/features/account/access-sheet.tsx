"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { accessOfUser, saveAccess } from "@/features/account/api";
import type { User, UserAccessEntry } from "@/features/account/types";
import { MODULES, permissionsFor, type ModuleName } from "@/features/auth/roles";
import { queryKeys } from "@/lib/query-keys";

const moduleLabels: Record<ModuleName, string> = {
  [MODULES.DASHBOARD]: "Dashboard",
  [MODULES.DESIGN_FOR_RELIABILITY]: "Projects and canvas",
  [MODULES.MASTER_DATA]: "Master data",
  [MODULES.SETTINGS]: "Account management",
  [MODULES.PROFILE]: "Own profile",
};

const rights = [
  { key: "is_view", label: "View" },
  { key: "is_add", label: "Add" },
  { key: "is_edit", label: "Edit" },
  { key: "is_delete", label: "Delete" },
  { key: "is_download", label: "Download" },
] as const;

type RightKey = (typeof rights)[number]["key"];

export function matrixFor(user: User, saved: UserAccessEntry[]): UserAccessEntry[] {
  return Object.values(MODULES).map((moduleName) => {
    const found = saved.find((entry) => entry.modul.toLowerCase() === moduleName);
    if (found) return { ...found, userId: user.id, modul: moduleName };
    const implied = permissionsFor({ roleName: user.roleName ?? "", accessData: [] }, moduleName);
    return {
      userId: user.id,
      modul: moduleName,
      is_view: implied.canView,
      is_add: implied.canCreate,
      is_edit: implied.canUpdate,
      is_delete: implied.canDelete,
      is_download: implied.canDownload,
    };
  });
}

type AccessSheetProps = {
  user: User | null;
  onOpenChange: (open: boolean) => void;
};

export function AccessSheet({ user, onOpenChange }: AccessSheetProps) {
  const open = user !== null;
  const queryClient = useQueryClient();
  const saved = useQuery({
    queryKey: queryKeys.users.access(user?.id ?? ""),
    queryFn: () => accessOfUser(user?.id ?? ""),
    enabled: open,
  });
  const [rows, setRows] = useState<UserAccessEntry[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && saved.data) setRows(matrixFor(user, saved.data));
  }, [user, saved.data]);

  useEffect(() => {
    if (rows.length === 0) return;
    const first = gridRef.current?.querySelector<HTMLButtonElement>("[role=switch]");
    first?.focus();
  }, [rows.length]);

  const toggle = (moduleName: string, key: RightKey, value: boolean) => {
    setRows((current) => current.map((row) => (row.modul === moduleName ? { ...row, [key]: value } : row)));
  };

  const save = useMutation({
    mutationFn: () => saveAccess(rows),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Rights saved", { description: `${user?.fullName} gets them at their next sign-in.` });
      onOpenChange(false);
    },
    onError: (error) => toast.error("Could not save the rights", { description: error.message }),
  });

  const nothingSaved = saved.data !== undefined && saved.data.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{user ? `What ${user.fullName} may do` : "Access"}</SheetTitle>
          <SheetDescription>
            {nothingSaved ? "Nothing saved yet, so this is what the role implies." : "Saved rights for this person, module by module."}
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {saved.isPending ? (
            <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading access">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <div ref={gridRef} className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <caption className="sr-only">Rights per module</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2 text-left text-caption uppercase text-foreground-muted">
                      Module
                    </th>
                    {rights.map((right) => (
                      <th key={right.key} scope="col" className="px-2 py-2 text-center text-caption uppercase text-foreground-muted">
                        {right.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.modul} className="border-b border-border last:border-0">
                      <th scope="row" className="py-3 pr-3 text-left font-medium text-foreground">
                        {moduleLabels[row.modul as ModuleName] ?? row.modul}
                      </th>
                      {rights.map((right) => (
                        <td key={right.key} className="px-2 py-3 text-center">
                          <Switch
                            checked={row[right.key]}
                            onCheckedChange={(value) => toggle(row.modul, right.key, value)}
                            aria-label={`${right.label} ${moduleLabels[row.modul as ModuleName] ?? row.modul}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </SheetClose>
          <Button type="button" loading={save.isPending} disabled={saved.isPending || rows.length === 0} onClick={() => save.mutate()}>
            Save rights
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

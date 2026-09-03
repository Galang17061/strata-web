"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { listVersions } from "@/features/workspace/api";

type VersionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rbdSystemId: string;
};

export function formatVersionMoment(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VersionsSheet({ open, onOpenChange, rbdSystemId }: VersionsSheetProps) {
  const versions = useQuery({
    queryKey: ["versions", rbdSystemId],
    queryFn: () => listVersions(rbdSystemId),
    enabled: open && Boolean(rbdSystemId),
  });
  const rows = versions.data?.data ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Versions</SheetTitle>
          <SheetDescription>
            Photographs of this system as it stood. Restore one and it comes back as a new
            system in the same project; the current drawing is never touched.
          </SheetDescription>
        </SheetHeader>
        {versions.isPending && open ? (
          <div className="flex flex-col gap-3 px-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="flex items-center gap-2 px-4 text-body-sm text-foreground-muted">
            <Camera className="size-4" aria-hidden="true" /> No versions yet. Save one and it
            will wait here.
          </p>
        ) : (
          <ol className="flex flex-col gap-2 px-4 pb-4">
            {rows.map((version) => (
              <li
                key={version.systemSnapshotId}
                className="flex flex-col gap-1 rounded-md border border-border px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-body-sm font-medium">{version.label}</p>
                  <Badge variant={version.kind === "manual" ? "default" : "secondary"}>
                    {version.kind === "manual" ? "saved" : "auto"}
                  </Badge>
                </div>
                <p className="text-caption text-foreground-muted">
                  {formatVersionMoment(version.createdAt)}
                  {version.createdBy ? ` · ${version.createdBy}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </SheetContent>
    </Sheet>
  );
}

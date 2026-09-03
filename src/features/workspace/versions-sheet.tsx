"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteVersion, listVersions, restoreVersion, saveVersion, type SystemVersion } from "@/features/workspace/api";

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
  const queryClient = useQueryClient();
  const [label, setLabel] = useState("");
  const versions = useQuery({
    queryKey: ["versions", rbdSystemId],
    queryFn: () => listVersions(rbdSystemId),
    enabled: open && Boolean(rbdSystemId),
  });
  const rows = versions.data?.data ?? [];
  const save = useMutation({
    mutationFn: () => saveVersion(rbdSystemId, label.trim()),
    onSuccess: async (envelope) => {
      setLabel("");
      await queryClient.invalidateQueries({ queryKey: ["versions", rbdSystemId] });
      toast.success("Version saved", { description: envelope.data.label });
    },
    onError: (error) => toast.error("The version could not be saved", { description: error.message }),
  });
  const router = useRouter();
  const [restoring, setRestoring] = useState<SystemVersion | null>(null);
  const restore = useMutation({
    mutationFn: (version: SystemVersion) => restoreVersion(version.systemSnapshotId),
    onSuccess: async (envelope, version) => {
      setRestoring(null);
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["systems"] });
      toast.success("Version restored", { description: `${version.label} lives again as a new system.` });
      router.push(`/workspace/?project=${envelope.data.projectId}&system=${envelope.data.rbdSystemId}`);
    },
    onError: (error) => toast.error("The version could not be restored", { description: error.message }),
  });
  const remove = useMutation({
    mutationFn: (version: SystemVersion) => deleteVersion(version.systemSnapshotId),
    onSuccess: async (_, version) => {
      await queryClient.invalidateQueries({ queryKey: ["versions", rbdSystemId] });
      toast.success("Version removed", { description: version.label });
    },
    onError: (error) => toast.error("The version could not be removed", { description: error.message }),
  });

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
        <form
          className="flex items-end gap-2 px-4"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Label htmlFor="version-label">Save the current state as</Label>
            <Input
              id="version-label"
              placeholder="Before the vendor experiment"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>
          <Button type="submit" loading={save.isPending} disabled={!label.trim()}>
            <Camera /> Save
          </Button>
        </form>
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
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => setRestoring(version)}>
                    <RotateCcw /> Restore
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove version ${version.label}`}
                    onClick={() => remove.mutate(version)}
                    loading={remove.isPending && remove.variables?.systemSnapshotId === version.systemSnapshotId}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
        <ConfirmDialog
          open={Boolean(restoring)}
          onOpenChange={(next) => {
            if (!next) setRestoring(null);
          }}
          title="Restore this version?"
          description={
            restoring
              ? `${restoring.label} will come back as a brand-new system in the same project. Nothing here is overwritten.`
              : ""
          }
          confirmLabel="Restore"
          loading={restore.isPending}
          onConfirm={() => {
            if (restoring) restore.mutate(restoring);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

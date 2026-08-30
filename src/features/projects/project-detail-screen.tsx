"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionGate } from "@/features/auth/permission-gate";
import { MODULES } from "@/features/auth/roles";
import { usePermissions } from "@/features/auth/session";
import { deleteSystem, getProject, listAllSystems, systemsByProject } from "@/features/projects/api";
import { CreateSystemDialog } from "@/features/projects/create-system-dialog";
import { workspaceHref } from "@/features/projects/links";
import { ProjectDialog } from "@/features/projects/project-dialog";
import type { SystemView } from "@/features/projects/types";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export function ProjectDetailScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.get("project") ?? "";
  const permissions = usePermissions(MODULES.DESIGN_FOR_RELIABILITY);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SystemView | null>(null);

  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });
  const systems = useQuery({
    queryKey: queryKeys.systems.byProject(projectId),
    queryFn: () => systemsByProject(projectId),
    enabled: Boolean(projectId),
  });
  const all = useQuery({ queryKey: queryKeys.systems.list({ all: true }), queryFn: () => listAllSystems() });

  const name = project.data?.data?.projectName ?? "";
  useBreadcrumbs([{ label: "Projects", href: "/projects/" }, { label: name || "Project" }]);

  const rows = useMemo(() => {
    const scored = new Map((all.data?.data ?? []).map((system) => [system.rbdSystemId, system]));
    return (systems.data?.data ?? [])
      .filter((system): system is SystemView & { rbdSystemId: string } => Boolean(system.rbdSystemId))
      .map((system) => ({ ...system, scored: scored.get(system.rbdSystemId) ?? null }));
  }, [systems.data, all.data]);

  const removal = useMutation({
    mutationFn: (rbdSystemId: string) => deleteSystem(rbdSystemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success("System deleted", { description: pendingDelete?.systemName ?? undefined });
      setPendingDelete(null);
    },
    onError: (error) => toast.error("Could not delete the system", { description: error.message }),
  });

  if (!projectId) {
    return (
      <Card>
        <EmptyState
          illustration={<EmptyBlocksIllustration />}
          title="Which project?"
          description="Open a project from the list to see its systems."
          action={
            <Button asChild size="sm">
              <Link href="/projects/">Go to projects</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={name || "Project"}
        description={project.data?.data ? `Created ${formatDate(project.data.data.createdAt)}` : undefined}
        actions={
          <>
            <PermissionGate moduleName={MODULES.DESIGN_FOR_RELIABILITY} permission="update">
              <Button variant="secondary" onClick={() => setEditOpen(true)}>
                <Pencil /> Rename
              </Button>
            </PermissionGate>
            <PermissionGate moduleName={MODULES.DESIGN_FOR_RELIABILITY} permission="create">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus /> New system
              </Button>
            </PermissionGate>
          </>
        }
      />

      {systems.isPending || project.isPending ? (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="ml-auto h-5 w-24 rounded-pill" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            illustration={<EmptyBlocksIllustration />}
            title="No systems yet"
            description="Create one to start wiring blocks."
            action={
              <PermissionGate moduleName={MODULES.DESIGN_FOR_RELIABILITY} permission="create">
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus /> New system
                </Button>
              </PermissionGate>
            }
          />
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>System</TableHead>
              <TableHead numeric>R(t)</TableHead>
              <TableHead>Band</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((system) => (
              <TableRow key={system.rbdSystemId}>
                <TableCell>
                  <Link href={workspaceHref(projectId, system.rbdSystemId)} className="font-medium underline-offset-4 hover:underline">
                    {system.systemName ?? "Untitled system"}
                  </Link>
                </TableCell>
                <TableCell numeric>{system.scored?.reliabilityTotal?.toFixed(4) ?? "—"}</TableCell>
                <TableCell>
                  <ReliabilityBadge value={system.scored?.reliabilityTotal ?? null} size="sm" />
                </TableCell>
                <TableCell className="text-foreground-muted">{formatDate(system.scored?.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={workspaceHref(projectId, system.rbdSystemId)}>
                        Open <ArrowRight />
                      </Link>
                    </Button>
                    {permissions.canDelete ? (
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${system.systemName}`} onClick={() => setPendingDelete(system)}>
                        <Trash2 />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ProjectDialog open={editOpen} onOpenChange={setEditOpen} project={project.data?.data ?? null} />
      <CreateSystemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        onCreated={(rbdSystemId) => router.push(workspaceHref(projectId, rbdSystemId))}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this system?"
        description={`"${pendingDelete?.systemName ?? ""}" and every layer, component, and history inside it will be removed. This cannot be undone.`}
        confirmLabel="Delete system"
        destructive
        loading={removal.isPending}
        onConfirm={() => pendingDelete?.rbdSystemId && removal.mutate(pendingDelete.rbdSystemId)}
      />
    </div>
  );
}

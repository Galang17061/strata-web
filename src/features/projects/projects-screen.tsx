"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, LayoutGrid, List, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { PermissionGate } from "@/features/auth/permission-gate";
import { MODULES } from "@/features/auth/roles";
import { usePermissions } from "@/features/auth/session";
import { listAllSystems, listProjects } from "@/features/projects/api";
import { projectHref } from "@/features/projects/links";
import { ProjectDialog } from "@/features/projects/project-dialog";
import { SystemPreview } from "@/features/projects/system-preview";
import type { Project, ProjectSystem } from "@/features/projects/types";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs, usePaletteScope } from "@/features/shell/use-breadcrumbs";
import { formatCount, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { useDebounce } from "@/lib/use-debounce";
import { cn } from "@/lib/utils";

type SortKey = "name" | "newest";
type ViewMode = "grid" | "table";

type ProjectStats = {
  systems: number;
  best: number | null;
  bestId: string | null;
  latestId: string | null;
  updatedAt: string | null;
};

function statsFor(systems: ProjectSystem[]): Map<string, ProjectStats> {
  const map = new Map<string, ProjectStats>();
  for (const system of systems) {
    const current = map.get(system.projectId) ?? { systems: 0, best: null, bestId: null, latestId: null, updatedAt: null };
    current.systems += 1;
    if (typeof system.reliabilityTotal === "number" && (current.best === null || system.reliabilityTotal > current.best)) {
      current.best = system.reliabilityTotal;
      current.bestId = system.rbdSystemId;
    }
    if (!current.updatedAt || system.updatedAt > current.updatedAt) {
      current.updatedAt = system.updatedAt;
      current.latestId = system.rbdSystemId;
    }
    map.set(system.projectId, current);
  }
  return map;
}

function ProjectCard({ project, stats, onEdit, canEdit }: { project: Project; stats?: ProjectStats; onEdit: () => void; canEdit: boolean }) {
  return (
    <Card className="group h-full gap-4 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate">
            <Link href={projectHref(project.projectId)} className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring">
              {project.projectName}
            </Link>
          </CardTitle>
          <CardDescription>Updated {formatDate(stats?.updatedAt ?? project.updatedAt)}</CardDescription>
        </div>
        {canEdit ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Rename ${project.projectName}`} onClick={onEdit} className="relative z-10">
            <Pencil />
          </Button>
        ) : null}
      </div>
      {stats?.bestId ?? stats?.latestId ? (
        <SystemPreview rbdSystemId={(stats?.bestId ?? stats?.latestId) as string} />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-sm border border-dashed border-border text-caption text-foreground-subtle">
          No systems yet
        </div>
      )}
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-caption uppercase text-foreground-muted">Systems</span>
          <span className="font-mono text-numeric-lg">{formatCount(stats?.systems ?? 0)}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-caption uppercase text-foreground-muted">Best</span>
          <ReliabilityBadge value={stats?.best ?? null} size="sm" />
        </div>
      </div>
      <Link
        href={projectHref(project.projectId)}
        className="relative z-10 inline-flex items-center gap-1 text-body-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Open project <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export function ProjectsScreen() {
  useBreadcrumbs([{ label: "Projects" }]);
  const router = useRouter();
  const permissions = usePermissions(MODULES.DESIGN_FOR_RELIABILITY);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search.trim(), 300);
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const listParams = {
    search: debounced || undefined,
    sortBy: sort === "newest" ? "createdAt" : "projectName",
    sortOrder: sort === "newest" ? ("desc" as const) : ("asc" as const),
  };
  const projects = useQuery({
    queryKey: queryKeys.projects.list(listParams),
    queryFn: () => listProjects(listParams),
    placeholderData: (previous) => previous,
  });
  const systems = useQuery({ queryKey: queryKeys.systems.list({ all: true }), queryFn: () => listAllSystems() });

  const list = useMemo(() => projects.data?.data ?? [], [projects.data]);
  const stats = useMemo(() => statsFor(systems.data?.data ?? []), [systems.data]);
  const paged = useMemo(() => list.slice((page - 1) * pageSize, page * pageSize), [list, page, pageSize]);
  const pageMeta = useMemo(
    () => ({
      totalData: list.length,
      totalPage: Math.max(1, Math.ceil(list.length / pageSize)),
      currentPage: page,
      pageSize,
      hasNextPage: page * pageSize < list.length,
      hasPreviousPage: page > 1,
    }),
    [list.length, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [debounced, sort, pageSize]);

  usePaletteScope(
    "Projects",
    useMemo(
      () => list.map((project) => ({ id: project.projectId, label: project.projectName, href: projectHref(project.projectId), hint: "project" })),
      [list],
    ),
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (project: Project) => {
    setEditing(project);
    setDialogOpen(true);
  };

  const isEmpty = !projects.isPending && list.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Every project and the systems modelled inside it."
        actions={
          <PermissionGate moduleName={MODULES.DESIGN_FOR_RELIABILITY} permission="create">
            <Button onClick={openCreate}>
              <Plus /> New project
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
          <Input
            aria-label="Search projects"
            placeholder="Search projects"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
          <SelectTrigger aria-label="Sort projects" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A to Z</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
          </SelectContent>
        </Select>
        <div role="radiogroup" aria-label="View" className="ml-auto inline-flex rounded-sm border border-border bg-surface-sunken p-0.5">
          <Button
            type="button"
            role="radio"
            aria-checked={view === "grid"}
            aria-label="Grid view"
            variant="ghost"
            size="icon-sm"
            onClick={() => setView("grid")}
            className={cn("h-7", view === "grid" && "bg-surface text-foreground shadow-sm hover:bg-surface")}
          >
            <LayoutGrid />
          </Button>
          <Button
            type="button"
            role="radio"
            aria-checked={view === "table"}
            aria-label="Table view"
            variant="ghost"
            size="icon-sm"
            onClick={() => setView("table")}
            className={cn("h-7", view === "table" && "bg-surface text-foreground shadow-sm hover:bg-surface")}
          >
            <List />
          </Button>
        </div>
      </div>

      {projects.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="gap-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
      ) : isEmpty ? (
        <Card>
          <EmptyState
            illustration={<EmptyBlocksIllustration />}
            title={debounced ? "Nothing matches that" : "No projects yet"}
            description={debounced ? "Try another word, or clear the search." : "Create one to start modelling systems."}
            action={
              debounced ? (
                <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              ) : (
                <PermissionGate moduleName={MODULES.DESIGN_FOR_RELIABILITY} permission="create">
                  <Button size="sm" onClick={openCreate}>
                    <Plus /> New project
                  </Button>
                </PermissionGate>
              )
            }
          />
        </Card>
      ) : view === "grid" ? (
        <Stagger inView={false} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paged.map((project) => (
            <StaggerItem key={project.projectId} className="relative">
              <ProjectCard project={project} stats={stats.get(project.projectId)} canEdit={permissions.canUpdate} onEdit={() => openEdit(project)} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Table>
          <TableCaption className="sr-only">Projects with how many systems each holds</TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Project</TableHead>
              <TableHead numeric>Systems</TableHead>
              <TableHead>Best reliability</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((project) => {
              const projectStats = stats.get(project.projectId);
              return (
                <TableRow key={project.projectId}>
                  <TableCell>
                    <Link href={projectHref(project.projectId)} className="font-medium underline-offset-4 hover:underline">
                      {project.projectName}
                    </Link>
                  </TableCell>
                  <TableCell numeric>{formatCount(projectStats?.systems ?? 0)}</TableCell>
                  <TableCell>
                    <ReliabilityBadge value={projectStats?.best ?? null} size="sm" />
                  </TableCell>
                  <TableCell className="text-foreground-muted">{formatDate(projectStats?.updatedAt ?? project.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    {permissions.canUpdate ? (
                      <Button variant="ghost" size="icon-sm" aria-label={`Rename ${project.projectName}`} onClick={() => openEdit(project)}>
                        <Pencil />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {!projects.isPending && !isEmpty ? (
        <TablePagination
          meta={pageMeta}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          singular="project"
        />
      ) : null}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editing}
        onSaved={(saved) => {
          if (!editing && saved) router.push(projectHref(saved.projectId));
        }}
      />
    </div>
  );
}

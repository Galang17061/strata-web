"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Boxes, FolderKanban, Layers, Sigma } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/session";
import { KpiCard } from "@/features/dashboard/kpi-card";
import { SystemsTable, workspaceHref } from "@/features/dashboard/systems-table";
import { listMasterComponents } from "@/features/master-data/api";
import { highReliabilitySystems, listAllSystems, listProjects, recentSystems } from "@/features/projects/api";
import type { ProjectSystem } from "@/features/projects/types";
import { PageHeader } from "@/features/shell/page-header";
import { useBreadcrumbs } from "@/features/shell/use-breadcrumbs";
import { formatDate, formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

type Period = "all" | "30" | "7";

const periods: { value: Period; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "30", label: "Last 30 days" },
  { value: "7", label: "Last 7 days" },
];

function withinPeriod(system: ProjectSystem, period: Period): boolean {
  if (period === "all") return true;
  const days = Number(period);
  const updated = new Date(system.updatedAt).getTime();
  return Number.isFinite(updated) && Date.now() - updated <= days * 24 * 60 * 60 * 1000;
}

function averageReliability(systems: ProjectSystem[]): number | null {
  const values = systems
    .map((system) => system.reliabilityTotal)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function RecentSystemCard({ system }: { system: ProjectSystem }) {
  return (
    <Link href={workspaceHref(system)} className="group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card size="sm" className="h-full gap-3 transition-colors group-hover:border-border-strong">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-body font-semibold">{system.systemName ?? "Untitled system"}</CardTitle>
            <CardDescription className="truncate">{system.projectName}</CardDescription>
          </div>
          <ArrowRight className="size-4 shrink-0 text-foreground-subtle transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <ReliabilityBadge value={system.reliabilityTotal} size="sm" />
          <span className="text-caption text-foreground-subtle">{formatDate(system.updatedAt)}</span>
        </div>
      </Card>
    </Link>
  );
}

export function DashboardScreen() {
  const { user } = useSession();
  useBreadcrumbs([{ label: "Dashboard" }]);
  const [period, setPeriod] = useState<Period>("all");

  const projects = useQuery({
    queryKey: queryKeys.projects.list({ page: 1, pageSize: 1 }),
    queryFn: () => listProjects({ page: 1, pageSize: 1 }),
  });
  const systems = useQuery({
    queryKey: queryKeys.systems.list({ all: true }),
    queryFn: () => listAllSystems(),
  });
  const components = useQuery({
    queryKey: queryKeys.masterComponents.list({ page: 1, pageSize: 1 }),
    queryFn: () => listMasterComponents({ page: 1, pageSize: 1 }),
  });
  const recent = useQuery({ queryKey: queryKeys.systems.recent, queryFn: recentSystems });
  const best = useQuery({
    queryKey: queryKeys.systems.highReliability(5),
    queryFn: () => highReliabilitySystems(5),
  });

  const allSystems = useMemo(() => systems.data?.data ?? [], [systems.data]);
  const visibleSystems = useMemo(() => allSystems.filter((system) => withinPeriod(system, period)), [allSystems, period]);
  const average = useMemo(() => averageReliability(allSystems), [allSystems]);
  const recentList = recent.data?.data ?? [];
  const bestList = (best.data?.data ?? []).filter((system) => system.reliabilityTotal !== null);
  const firstName = user?.fullName?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={firstName ? `Hello, ${firstName}` : "Dashboard"}
        description="How your systems are doing, from the parts up."
        actions={
          <Button asChild>
            <Link href="/projects/">
              Open projects <ArrowRight />
            </Link>
          </Button>
        }
      />

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Projects" icon={FolderKanban} loading={projects.isPending} value={projects.data?.meta?.totalData ?? 0} />
        <KpiCard label="Systems" icon={Layers} loading={systems.isPending} value={systems.data?.meta?.totalData ?? allSystems.length} />
        <KpiCard label="Components in catalogue" icon={Boxes} loading={components.isPending} value={components.data?.meta?.totalData ?? 0} />
        <KpiCard
          label="Average reliability"
          icon={Sigma}
          loading={systems.isPending}
          value={average}
          format={(value) => formatReliability(value, 4)}
          hint={average === null ? "No system has been scored yet" : `Across ${allSystems.filter((s) => s.reliabilityTotal !== null).length} scored systems`}
        />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="recent-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="recent-heading" className="text-h2">Recent systems</h2>
            <p className="text-body-sm text-foreground-muted">The last systems added or changed.</p>
          </div>
        </div>
        {recent.isPending ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} size="sm" className="gap-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-24 rounded-pill" />
              </Card>
            ))}
          </div>
        ) : recentList.length === 0 ? (
          <Card>
            <EmptyState
              compact
              illustration={<EmptyBlocksIllustration />}
              title="Nothing modelled yet"
              description="Start a project and its first system to see it here."
              action={
                <Button asChild size="sm">
                  <Link href="/projects/">Go to projects</Link>
                </Button>
              }
            />
          </Card>
        ) : (
          <Stagger inView={false} className="grid gap-4 md:grid-cols-3">
            {recentList.map((system) => (
              <StaggerItem key={system.rbdSystemId}>
                <RecentSystemCard system={system} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]" aria-labelledby="systems-heading">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="systems-heading" className="text-h2">All systems</h2>
              <p className="text-body-sm text-foreground-muted">Every system across every project, with its latest score.</p>
            </div>
            <div role="radiogroup" aria-label="Period" className="inline-flex rounded-sm border border-border bg-surface-sunken p-0.5">
              {periods.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={period === option.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPeriod(option.value)}
                  className={cn("h-7", period === option.value && "bg-surface text-foreground shadow-sm hover:bg-surface")}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <SystemsTable
            systems={visibleSystems}
            loading={systems.isPending}
            emptyAction={
              allSystems.length > 0 ? (
                <Button variant="secondary" size="sm" onClick={() => setPeriod("all")}>
                  Show all time
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link href="/projects/">Go to projects</Link>
                </Button>
              )
            }
          />
        </div>
        <Card className="h-fit gap-4">
          <div>
            <CardTitle>Highest reliability</CardTitle>
            <CardDescription>The systems most likely to still be working.</CardDescription>
          </div>
          {best.isPending ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </div>
          ) : bestList.length === 0 ? (
            <p className="text-body-sm text-foreground-muted">No system has been scored yet. Wire a system and recalculate it to rank it here.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-border">
              {bestList.map((system, index) => (
                <li key={system.rbdSystemId} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="w-5 font-mono text-numeric text-foreground-subtle">{index + 1}</span>
                  <Link href={workspaceHref(system)} className="min-w-0 flex-1 truncate text-body-sm font-medium hover:underline">
                    {system.systemName}
                  </Link>
                  <ReliabilityBadge value={system.reliabilityTotal} size="sm" showLabel={false} />
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>
    </div>
  );
}

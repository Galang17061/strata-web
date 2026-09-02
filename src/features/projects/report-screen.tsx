"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Wordmark } from "@/components/brand/wordmark";
import { getSystemTree } from "@/features/projects/api";
import { systemTotal } from "@/features/workspace/api";
import { formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export function ReportScreen() {
  const rbdSystemId = useSearchParams().get("system") ?? "";
  const tree = useQuery({
    queryKey: queryKeys.systems.tree(rbdSystemId),
    queryFn: () => getSystemTree(rbdSystemId),
    enabled: Boolean(rbdSystemId),
  });
  const totals = useQuery({
    queryKey: queryKeys.systems.total(rbdSystemId),
    queryFn: () => systemTotal(rbdSystemId),
    enabled: Boolean(rbdSystemId),
    retry: false,
  });

  if (!rbdSystemId) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
          No system was named. Open a system in the workspace and press Report there.
        </p>
      </main>
    );
  }

  const data = tree.data?.data ?? null;
  const figures = totals.data?.data ?? null;

  return (
    <main className="mx-auto w-full max-w-4xl px-8 py-12">
      <header className="flex items-start justify-between gap-6 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <Wordmark size={24} />
          <h1 className="mt-3 text-h1">Reliability report</h1>
          {tree.isPending ? (
            <Skeleton className="h-4 w-64" />
          ) : data ? (
            <p className="text-body text-foreground-muted">
              {data.projectName} · {data.systemName} · systems nest {data.hierarchyDepth}{" "}
              {data.hierarchyDepth === 1 ? "level" : "levels"} deep
            </p>
          ) : (
            <p className="text-body-sm text-danger">{tree.error?.message ?? "This system could not be loaded."}</p>
          )}
          <p className="text-caption text-foreground-muted">
            Drawn up on{" "}
            {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-caption uppercase text-foreground-muted">System reliability</p>
          <p className="font-mono text-h1 text-foreground">
            {figures?.reliabilityTotal !== null && figures?.reliabilityTotal !== undefined
              ? formatReliability(figures.reliabilityTotal, 8)
              : "—"}
          </p>
        </div>
      </header>
      <p className="mt-8 text-body-sm text-foreground-muted">
        <Link href="/dashboard/" className="rounded-sm underline underline-offset-4 hover:text-foreground">
          Back to the app
        </Link>
      </p>
    </main>
  );
}

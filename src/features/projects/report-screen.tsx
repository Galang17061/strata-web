"use client";

import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet, Printer } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { utils, writeFile } from "xlsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wordmark } from "@/components/brand/wordmark";
import { getSystemTree } from "@/features/projects/api";
import type { TreeNode } from "@/features/projects/types";
import { systemTotal } from "@/features/workspace/api";
import type { SystemTotal } from "@/features/workspace/types";
import { formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export function reliabilityOf(lookup: Record<string, number> | null | undefined, code: string | null): number | null {
  if (!lookup || !code) return null;
  const value = lookup[code];
  return typeof value === "number" ? value : null;
}

function figureText(value: number | null): string {
  return value === null ? "—" : formatReliability(value, 8);
}

function wiringText(connectionType: string | null): string {
  if (!connectionType) return "series";
  return connectionType.toLowerCase() === "partial" ? "k out of n" : connectionType.toLowerCase();
}

type LayerRow = {
  Level: number;
  Block: string;
  Wiring: string;
  Reliability: number | string;
};

type ComponentRow = {
  Level: number;
  Block: string;
  Component: string;
  Vendor: string;
  Wiring: string;
  Units: string;
  Reliability: number | string;
};

export function reportRows(
  nodes: TreeNode[],
  figures: SystemTotal | null,
): { layers: LayerRow[]; components: ComponentRow[] } {
  const layers: LayerRow[] = [];
  const components: ComponentRow[] = [];
  const walk = (node: TreeNode) => {
    layers.push({
      Level: node.level,
      Block: node.name,
      Wiring: wiringText(node.connectionType),
      Reliability: reliabilityOf(figures?.hierarchyLookup, node.formulaCode) ?? "",
    });
    for (const component of node.components ?? []) {
      components.push({
        Level: node.level,
        Block: node.name,
        Component: component.componentName ?? "",
        Vendor: component.vendorName ?? "",
        Wiring: wiringText(component.connectionType),
        Units: `${component.activeComponent ?? 1}/${component.totalComponent ?? 1}`,
        Reliability: reliabilityOf(figures?.componentLookup, component.formulaCode) ?? "",
      });
    }
    for (const child of node.hierarchy ?? []) walk(child);
  };
  for (const node of nodes) walk(node);
  return { layers, components };
}

function BlockSection({ node, figures }: { node: TreeNode; figures: SystemTotal | null }) {
  return (
    <section className="mt-6" style={{ marginLeft: `${Math.max(0, node.level - 1) * 20}px` }}>
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-1">
        <h2 className="text-h3">
          {node.name}
          <span className="ml-2 font-mono text-caption text-foreground-muted">
            level {node.level} · {wiringText(node.connectionType)}
          </span>
        </h2>
        <p className="font-mono text-body-sm">{figureText(reliabilityOf(figures?.hierarchyLookup, node.formulaCode))}</p>
      </div>
      {node.components && node.components.length > 0 ? (
        <table className="mt-2 w-full border-collapse text-body-sm">
          <thead>
            <tr className="text-left text-caption uppercase text-foreground-muted">
              <th className="py-1 pr-3 font-medium">Component</th>
              <th className="py-1 pr-3 font-medium">Vendor</th>
              <th className="py-1 pr-3 font-medium">Wiring</th>
              <th className="py-1 pr-3 text-right font-medium">Units</th>
              <th className="py-1 text-right font-medium">Reliability</th>
            </tr>
          </thead>
          <tbody>
            {node.components.map((component) => (
              <tr key={component.systemComponentId} className="border-t border-border/60">
                <td className="py-1 pr-3">{component.componentName ?? "—"}</td>
                <td className="py-1 pr-3 text-foreground-muted">{component.vendorName ?? "—"}</td>
                <td className="py-1 pr-3 text-foreground-muted">{wiringText(component.connectionType)}</td>
                <td className="py-1 pr-3 text-right font-mono">
                  {component.activeComponent ?? 1}/{component.totalComponent ?? 1}
                </td>
                <td className="py-1 text-right font-mono">
                  {figureText(reliabilityOf(figures?.componentLookup, component.formulaCode))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {(node.hierarchy ?? []).map((child) => (
        <BlockSection key={child.hierarchyId} node={child} figures={figures} />
      ))}
    </section>
  );
}

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

  const downloadExcel = () => {
    if (!data) return;
    const { layers, components } = reportRows(data.hierarchy ?? [], figures);
    const book = utils.book_new();
    const summary = [
      { Field: "Project", Value: data.projectName },
      { Field: "System", Value: data.systemName },
      { Field: "System reliability", Value: figures?.reliabilityTotal ?? "" },
      { Field: "Hierarchy depth", Value: data.hierarchyDepth },
      { Field: "Drawn up", Value: new Date().toISOString().slice(0, 10) },
    ];
    utils.book_append_sheet(book, utils.json_to_sheet(summary), "Summary");
    utils.book_append_sheet(book, utils.json_to_sheet(layers), "Layers");
    utils.book_append_sheet(book, utils.json_to_sheet(components), "Components");
    writeFile(book, `${data.systemName} reliability report.xlsx`);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-8 py-12">
      <div className="mb-6 flex items-center justify-end gap-2 print:hidden">
        <Button variant="secondary" size="sm" onClick={downloadExcel} disabled={!data}>
          <FileSpreadsheet /> Download Excel
        </Button>
        <Button size="sm" onClick={() => window.print()} disabled={!data}>
          <Printer /> Print or save as PDF
        </Button>
      </div>
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
      {data ? (
        (data.hierarchy ?? []).length > 0 ? (
          (data.hierarchy ?? []).map((node) => <BlockSection key={node.hierarchyId} node={node} figures={figures} />)
        ) : (
          <p className="mt-8 text-body-sm text-foreground-muted">This system has no layers drawn yet.</p>
        )
      ) : null}
      <p className="mt-10 border-t border-border pt-4 text-caption text-foreground-muted">
        Figures are the stored results of the latest recalculation, to eight decimal places.
      </p>
      <p className="mt-4 text-body-sm text-foreground-muted print:hidden">
        <Link href="/dashboard/" className="rounded-sm underline underline-offset-4 hover:text-foreground">
          Back to the app
        </Link>
      </p>
    </main>
  );
}

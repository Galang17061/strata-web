"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { SystemTree } from "@/features/projects/types";
import { hierarchyPlotParameters, hierarchyReliability, systemTotal } from "@/features/workspace/api";
import { findTreeNode, type Level } from "@/features/workspace/model";
import { buildLevelPlot, leafNodesUnder, type LevelPlot } from "@/features/workspace/plot/plot-model";
import type { HierarchyCalculation } from "@/features/workspace/types";
import { queryKeys } from "@/lib/query-keys";

function collectLeafFormulas(calculations: HierarchyCalculation[], into: Record<string, string | null>): void {
  for (const calculation of calculations) {
    if ((calculation.children ?? []).length === 0) into[calculation.hierarchyId] = calculation.formula;
    collectLeafFormulas(calculation.children ?? [], into);
  }
}

export function useLevelPlot(tree: SystemTree, level: Level, enabled: boolean): { plot: LevelPlot | null; loading: boolean; error: string | null } {
  const node = level.scope === "hierarchy" ? findTreeNode(tree.hierarchy, level.id) : null;
  const leaves = useMemo(() => leafNodesUnder(node, tree), [node, tree]);
  const roots = level.scope === "system" ? (tree.hierarchy ?? []) : [];

  const system = useQuery({
    queryKey: queryKeys.systems.total(tree.rbdSystemId),
    queryFn: () => systemTotal(tree.rbdSystemId),
    enabled: enabled && level.scope === "system",
    retry: false,
  });
  const own = useQuery({
    queryKey: queryKeys.hierarchy.reliability(level.id),
    queryFn: () => hierarchyReliability(level.id),
    enabled: enabled && level.scope === "hierarchy",
    retry: false,
  });
  const rootCalculations = useQueries({
    queries: roots.map((root) => ({
      queryKey: queryKeys.hierarchy.reliability(root.hierarchyId),
      queryFn: () => hierarchyReliability(root.hierarchyId),
      enabled,
      retry: false,
    })),
  });
  const parameterQueries = useQueries({
    queries: leaves.map((leaf) => ({
      queryKey: queryKeys.hierarchy.plotParameters(leaf.hierarchyId),
      queryFn: () => hierarchyPlotParameters(leaf.hierarchyId),
      enabled,
    })),
  });

  const loading =
    (level.scope === "system" ? system.isPending || rootCalculations.some((query) => query.isPending) : own.isPending) ||
    parameterQueries.some((query) => query.isPending);
  const failed = [system, own, ...rootCalculations, ...parameterQueries].find((query) => query.isError && query.error);
  const error = failed?.error instanceof Error ? failed.error.message : null;

  const rootData = rootCalculations.map((query) => query.data?.data ?? null);
  const parameterData = parameterQueries.map((query) => query.data?.data ?? null);
  const systemData = system.data?.data ?? null;
  const ownData = own.data?.data ?? null;

  const plot = useMemo(() => {
    if (!enabled || loading) return null;
    if (parameterData.some((data) => data === null)) return null;
    const parametersByLeaf: Record<string, string[]> = {};
    const parameters = leaves.flatMap((leaf, index) => {
      const rows = parameterData[index] ?? [];
      parametersByLeaf[leaf.hierarchyId] = rows.flatMap((row) => (row.formulaCode ? [row.formulaCode] : []));
      return rows;
    });
    const horizon = parameters.reduce((max, row) => Math.max(max, row.runningHours ?? 0), 0);
    const leafFormulas: Record<string, string | null> = {};
    if (level.scope === "system") {
      if (!systemData || rootData.some((data) => data === null)) return null;
      const calculations = rootData.flatMap((data) => (data ? [data] : []));
      collectLeafFormulas(calculations, leafFormulas);
      return buildLevelPlot(
        { tree, formula: systemData.formula, name: tree.systemName, code: "SYSTEM", calculations, parameters, leafFormulas },
        parametersByLeaf,
        horizon,
      );
    }
    if (!ownData) return null;
    collectLeafFormulas([ownData], leafFormulas);
    return buildLevelPlot(
      {
        tree,
        formula: ownData.formula,
        name: ownData.hierarchyName ?? node?.name ?? "Layer",
        code: ownData.formulaCode ?? level.id,
        calculations: ownData.children ?? [],
        parameters,
        leafFormulas,
      },
      parametersByLeaf,
      horizon,
    );
  }, [enabled, loading, parameterData, leaves, level, systemData, rootData, ownData, tree, node]);

  return { plot, loading: enabled && loading, error };
}

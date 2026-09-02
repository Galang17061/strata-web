"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Info, PanelLeft, PanelRight, RefreshCw, Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/brand/empty-state";
import { EmptyBlocksIllustration } from "@/components/brand/illustrations";
import { PageLoader } from "@/components/brand/loader";
import { LayerCrumbs } from "@/components/layers/layer-crumbs";
import { CountUp } from "@/components/motion/count-up";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { PermissionGate } from "@/features/auth/permission-gate";
import { MODULES } from "@/features/auth/roles";
import { usePermissions } from "@/features/auth/session";
import { getSystemTree } from "@/features/projects/api";
import { projectHref } from "@/features/projects/links";
import type { TreeComponent, TreeNode } from "@/features/projects/types";
import { useBreadcrumbs, useFullBleed } from "@/features/shell/use-breadcrumbs";
import {
  deleteComponent,
  deleteHierarchy,
  hierarchyInputParameters,
  hierarchyReliability,
  listDrawingEdges,
  listDrawingNodes,
  saveDrawingEdges,
  saveDrawingNodes,
  systemTotal,
} from "@/features/workspace/api";
import { RbdCanvas } from "@/features/workspace/canvas/canvas";
import { ComponentSheet } from "@/features/workspace/component-sheet";
import { ContextPanel } from "@/features/workspace/context-panel";
import { AddComponentDialog, HierarchyDialog } from "@/features/workspace/dialogs";
import { OptimizationStudio } from "@/features/optimization/optimization-studio";
import { PlotDialog } from "@/features/workspace/plot/plot-dialog";
import { RecalculateDialog } from "@/features/workspace/recalculate-dialog";
import {
  ancestorsOf,
  buildCanvas,
  disconnectedBlocks,
  levelContent,
  toEdgePayload,
  toNodePayload,
  type CanvasEdge,
  type CanvasNode,
  type Level,
} from "@/features/workspace/model";
import { TreePanel, type TreeAction } from "@/features/workspace/tree-panel";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { formatReliability } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { reliabilityBand } from "@/lib/reliability";
import { cn } from "@/lib/utils";

const emptyNodes: CanvasNode[] = [];

const panelWidthKeys = { tree: "strata.workspace.tree-width", details: "strata.workspace.details-width" } as const;

function storedPanelWidth(key: string, min: number, max: number): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    const value = raw === null ? NaN : Number(raw);
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null;
  } catch {
    return null;
  }
}

function rememberPanelWidth(key: string, value: number) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {}
}

const fourDecimals = (value: number) => formatReliability(value, 4);

function SystemTotalChip({ value }: { value: number | null }) {
  const band = reliabilityBand(value);
  return (
    <span
      data-band={band}
      className="inline-flex h-6 items-center gap-1.5 rounded-pill border border-border bg-surface-sunken px-2.5 text-caption text-foreground-muted"
      title={`Whole system: ${formatReliability(value, 8)}`}
    >
      System
      {value === null ? (
        <span className="font-mono normal-case tracking-normal">—</span>
      ) : (
        <CountUp key={value} value={value} format={fourDecimals} immediate className="text-foreground" />
      )}
    </span>
  );
}
const emptyEdges: CanvasEdge[] = [];

export function WorkspaceScreen() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const projectId = params.get("project") ?? "";
  const rbdSystemId = params.get("system") ?? "";
  const permissions = usePermissions(MODULES.DESIGN_FOR_RELIABILITY);
  useFullBleed();

  const level = useWorkspaceStore((state) => state.level);
  const setLevel = useWorkspaceStore((state) => state.setLevel);
  const selectedCode = useWorkspaceStore((state) => state.selectedCode);
  const setSelectedCode = useWorkspaceStore((state) => state.setSelectedCode);
  const sheetCode = useWorkspaceStore((state) => state.sheetCode);
  const openSheet = useWorkspaceStore((state) => state.openSheet);
  const closeSheet = useWorkspaceStore((state) => state.closeSheet);
  const dirty = useWorkspaceStore((state) => state.dirty);
  const setDirty = useWorkspaceStore((state) => state.setDirty);
  const treeOpen = useWorkspaceStore((state) => state.treeOpen);
  const setTreeOpen = useWorkspaceStore((state) => state.setTreeOpen);
  const detailsOpen = useWorkspaceStore((state) => state.detailsOpen);
  const setDetailsOpen = useWorkspaceStore((state) => state.setDetailsOpen);

  const [pendingLevel, setPendingLevel] = useState<Level | null>(null);
  const [hierarchyDialog, setHierarchyDialog] = useState<{ parent: TreeNode | null; node: TreeNode | null } | null>(null);
  const [componentDialog, setComponentDialog] = useState<TreeNode | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TreeAction | null>(null);
  const [recalculateOpen, setRecalculateOpen] = useState(false);
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [plotOpen, setPlotOpen] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [treeWidth, setTreeWidth] = useState(280);
  const [detailsWidth, setDetailsWidth] = useState(340);
  const canvasState = useRef<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>({ nodes: [], edges: [] });

  useEffect(() => {
    const tree = storedPanelWidth(panelWidthKeys.tree, 220, 460);
    const details = storedPanelWidth(panelWidthKeys.details, 280, 560);
    if (tree !== null) setTreeWidth(tree);
    if (details !== null) setDetailsWidth(details);
  }, []);

  useEffect(() => {
    rememberPanelWidth(panelWidthKeys.tree, treeWidth);
  }, [treeWidth]);

  useEffect(() => {
    rememberPanelWidth(panelWidthKeys.details, detailsWidth);
  }, [detailsWidth]);

  const startPanelDrag = (side: "tree" | "details") => (event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = side === "tree" ? treeWidth : detailsWidth;
    const onMove = (move: PointerEvent) => {
      const delta = move.clientX - startX;
      if (side === "tree") setTreeWidth(Math.min(460, Math.max(220, startWidth + delta)));
      else setDetailsWidth(Math.min(560, Math.max(280, startWidth - delta)));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  useEffect(() => {
    if (rbdSystemId) setLevel({ scope: "system", id: rbdSystemId });
    return () => setLevel(null);
  }, [rbdSystemId, setLevel]);

  const tree = useQuery({
    queryKey: queryKeys.systems.tree(rbdSystemId),
    queryFn: () => getSystemTree(rbdSystemId),
    enabled: Boolean(rbdSystemId),
  });
  const treeData = tree.data?.data ?? null;

  const activeLevel = useMemo<Level>(() => level ?? { scope: "system", id: rbdSystemId }, [level, rbdSystemId]);
  const nodesQuery = useQuery({
    queryKey: queryKeys.drawing.nodes(activeLevel.scope, activeLevel.id),
    queryFn: () => listDrawingNodes(activeLevel.scope, activeLevel.id),
    enabled: Boolean(activeLevel.id),
  });
  const edgesQuery = useQuery({
    queryKey: queryKeys.drawing.edges(activeLevel.scope, activeLevel.id),
    queryFn: () => listDrawingEdges(activeLevel.scope, activeLevel.id),
    enabled: Boolean(activeLevel.id),
  });
  const systemValues = useQuery({
    queryKey: queryKeys.systems.total(rbdSystemId),
    queryFn: () => systemTotal(rbdSystemId),
    enabled: Boolean(rbdSystemId),
    retry: false,
  });
  const hierarchyValues = useQuery({
    queryKey: queryKeys.hierarchy.reliability(activeLevel.id),
    queryFn: () => hierarchyReliability(activeLevel.id),
    enabled: activeLevel.scope === "hierarchy",
    retry: false,
  });
  const parameters = useQuery({
    queryKey: queryKeys.hierarchy.inputParameters(activeLevel.id),
    queryFn: () => hierarchyInputParameters(activeLevel.id),
    enabled: activeLevel.scope === "hierarchy",
  });

  const content = useMemo(() => (treeData ? levelContent(treeData, activeLevel) : null), [treeData, activeLevel]);
  const values = useMemo(() => {
    if (activeLevel.scope === "system") return systemValues.data?.data?.hierarchyLookup ?? null;
    return hierarchyValues.data?.data?.reliabilityLookup ?? null;
  }, [activeLevel.scope, systemValues.data, hierarchyValues.data]);

  const canvas = useMemo(() => {
    if (!content || !nodesQuery.data || !edgesQuery.data) return null;
    return buildCanvas(content, nodesQuery.data.data ?? [], edgesQuery.data.data ?? [], values);
  }, [content, nodesQuery.data, edgesQuery.data, values]);

  const crumbs = useMemo(() => {
    if (!treeData) return [];
    const items = [{ id: `system:${treeData.rbdSystemId}`, name: treeData.systemName }];
    if (activeLevel.scope === "hierarchy") {
      for (const ancestor of ancestorsOf(treeData, activeLevel.id)) items.push({ id: `hierarchy:${ancestor.hierarchyId}`, name: ancestor.name });
    }
    return items;
  }, [treeData, activeLevel]);

  useBreadcrumbs(
    useMemo(
      () => [
        { label: "Projects", href: "/projects/" },
        { label: treeData?.projectName ?? "Project", href: projectId ? projectHref(projectId) : undefined },
        { label: treeData?.systemName ?? "System" },
      ],
      [treeData, projectId],
    ),
  );

  const requestLevel = useCallback(
    (next: Level) => {
      if (next.scope === activeLevel.scope && next.id === activeLevel.id) return;
      if (dirty) {
        setPendingLevel(next);
        return;
      }
      setLevel(next);
      setTreeOpen(false);
    },
    [activeLevel, dirty, setLevel, setTreeOpen],
  );

  const refreshAll = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all });
    await queryClient.invalidateQueries({ queryKey: ["drawing"] });
    await queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
  }, [queryClient]);

  const save = useMutation({
    mutationFn: async () => {
      const { nodes, edges } = canvasState.current;
      const unwired = disconnectedBlocks(nodes, edges);
      if (unwired.length > 0 && edges.length > 0) {
        throw new Error(`Every block needs a link in and a link out. Still loose: ${unwired.join(", ")}.`);
      }
      await saveDrawingNodes(activeLevel.scope, activeLevel.id, toNodePayload(nodes, activeLevel.scope));
      if (edges.length > 0) await saveDrawingEdges(activeLevel.scope, activeLevel.id, toEdgePayload(edges, activeLevel.id));
    },
    onSuccess: async () => {
      setDirty(false);
      await refreshAll();
      toast.success("Drawing saved", { description: "Formulas were regenerated up the tree." });
    },
    onError: (error) => toast.error("Could not save the drawing", { description: error.message }),
  });

  const removal = useMutation({
    mutationFn: async (action: TreeAction) => {
      if (action.type === "delete-subsystem") await deleteHierarchy(action.node.hierarchyId);
      if (action.type === "delete-component") await deleteComponent(action.component.systemComponentId);
    },
    onSuccess: async (_, action) => {
      toast.success(action.type === "delete-subsystem" ? "Subsystem deleted" : "Component removed");
      setPendingDelete(null);
      await refreshAll();
    },
    onError: (error) => toast.error("Could not delete", { description: error.message }),
  });

  const handleTreeAction = (action: TreeAction) => {
    if (action.type === "add-subsystem") setHierarchyDialog({ parent: action.parent, node: null });
    if (action.type === "rename") setHierarchyDialog({ parent: null, node: action.node });
    if (action.type === "add-component") setComponentDialog(action.parent);
    if (action.type === "delete-subsystem" || action.type === "delete-component") setPendingDelete(action);
  };

  const selectComponent = (parent: TreeNode, component: TreeComponent) => {
    const target: Level = { scope: "hierarchy", id: parent.hierarchyId };
    if (target.id !== activeLevel.id || activeLevel.scope !== "hierarchy") requestLevel(target);
    setSelectedCode(component.formulaCode ?? component.systemComponentId);
    setTreeOpen(false);
  };

  const openLayer = useCallback(
    (node: CanvasNode) => {
      if (node.data.kind === "subsystem") requestLevel({ scope: "hierarchy", id: node.data.entityId });
    },
    [requestLevel],
  );

  const selectedNode = canvas?.nodes.find((node) => node.data.code === selectedCode) ?? null;
  const sheetNode = canvas?.nodes.find((node) => node.data.code === sheetCode) ?? null;
  const openComponent = useCallback(
    (node: CanvasNode) => {
      if (node.data.kind === "component") openSheet(node.data.code);
    },
    [openSheet],
  );
  const summary = {
    name: content?.name ?? "",
    depth: content?.level ?? 0,
    formula: activeLevel.scope === "system" ? (systemValues.data?.data?.formula ?? null) : (hierarchyValues.data?.data?.formula ?? null),
    value:
      activeLevel.scope === "system"
        ? (systemValues.data?.data?.reliabilityTotal ?? null)
        : (hierarchyValues.data?.data?.calculatedReliability ?? null),
    blocks: canvas ? canvas.nodes.filter((node) => node.data.kind !== "virtual").length : 0,
    loading: activeLevel.scope === "system" ? systemValues.isPending : hierarchyValues.isPending,
  };

  const onStateChange = useCallback((state: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => {
    canvasState.current = state;
  }, []);

  if (!projectId || !rbdSystemId) {
    return (
      <div className="p-6">
        <EmptyState
          illustration={<EmptyBlocksIllustration />}
          title="Which system?"
          description="Open a system from a project to draw its layers."
          action={
            <Button asChild size="sm">
              <Link href="/projects/">Go to projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (tree.isPending) return <PageLoader label="Opening the workspace" />;
  if (!treeData) {
    return (
      <div className="p-6">
        <EmptyState
          illustration={<EmptyBlocksIllustration />}
          title="This system could not be opened"
          description={tree.error?.message ?? "It may have been deleted."}
          action={
            <Button asChild size="sm" variant="secondary">
              <Link href={projectHref(projectId)}>Back to the project</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const panels = (
    <>
      <TreePanel
        tree={treeData}
        level={activeLevel}
        values={systemValues.data?.data?.hierarchyLookup ?? null}
        selectedCode={selectedCode}
        canEdit={permissions.canUpdate}
        onOpenLevel={requestLevel}
        onSelectComponent={selectComponent}
        onAction={handleTreeAction}
      />
    </>
  );

  const details = (
    <ContextPanel
      level={activeLevel}
      summary={summary}
      selected={selectedNode}
      parameters={parameters.data?.data ?? []}
      canEdit={permissions.canUpdate}
      onOpenLayer={openLayer}
      onOpenComponent={openComponent}
      onPickCode={setSelectedCode}
      onPlot={() => setPlotOpen(true)}
      onBack={() => setSelectedCode(null)}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-height))] min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-2">
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Show layers" onClick={() => setTreeOpen(true)}>
          <PanelLeft />
        </Button>
        <LayerCrumbs
          items={crumbs}
          onSelect={(item) => {
            const [scope, id] = item.id.split(":");
            requestLevel({ scope: scope as Level["scope"], id });
          }}
          className="min-w-0 flex-1"
        />
        <ReliabilityBadge value={summary.value} size="sm" />
        {activeLevel.scope === "hierarchy" ? <SystemTotalChip value={systemValues.data?.data?.reliabilityTotal ?? null} /> : null}
        <div className="ml-auto flex items-center gap-2">
          {dirty ? <span className="text-caption text-warning normal-case tracking-normal">Unsaved changes</span> : null}
          <PermissionGate moduleName={MODULES.DESIGN_FOR_RELIABILITY} permission="update">
            <Button size="sm" variant="secondary" asChild>
              <a href={`/report/?system=${rbdSystemId}`} target="_blank" rel="noreferrer">
                <FileText /> Report
              </a>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOptimizeOpen(true)} disabled={dirty} data-tour="optimize">
              <Sparkles /> Optimize
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRecalculateOpen(true)}
              loading={recalculating}
              disabled={dirty}
              data-tour="recalculate"
            >
              <RefreshCw /> Recalculate
            </Button>
            <Button size="sm" onClick={() => save.mutate()} loading={save.isPending} disabled={!dirty || !canvas}>
              <Save /> Save drawing
            </Button>
          </PermissionGate>
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Show details" onClick={() => setDetailsOpen(true)}>
            <PanelRight />
          </Button>
        </div>
      </div>
      <p className="flex items-center gap-2 border-b border-border bg-surface-sunken px-4 py-1 text-caption text-foreground-muted normal-case tracking-normal lg:hidden">
        <Info className="size-3.5" aria-hidden="true" /> The canvas works best on a wider screen.
      </p>
      <div
        className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[var(--tree-width)_minmax(0,1fr)_var(--details-width)]"
        style={{ "--tree-width": `${treeWidth}px`, "--details-width": `${detailsWidth}px` } as React.CSSProperties}
      >
        <aside data-tour="tree" className="relative hidden min-h-0 border-r border-border bg-surface lg:block">
          {panels}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize the layers panel"
            title="Drag to resize, double-click to reset"
            onPointerDown={startPanelDrag("tree")}
            onDoubleClick={() => setTreeWidth(280)}
            className="absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize transition-colors duration-(--dur-fast) hover:bg-primary/20 active:bg-primary/30 lg:block"
          />
        </aside>
        <section data-tour="canvas" className={cn("relative min-h-0", !canvas && "flex items-center justify-center")} aria-label="Canvas">
          {canvas ? (
            canvas.nodes.length === 0 ? (
              <EmptyState
                illustration={<EmptyBlocksIllustration />}
                title="Nothing in this layer yet"
                description="Add a subsystem or a component from the layers panel to start wiring."
                className="h-full"
              />
            ) : (
              <RbdCanvas
                key={`${activeLevel.scope}:${activeLevel.id}`}
                nodes={canvas.nodes}
                edges={canvas.edges}
                editable={permissions.canUpdate}
                busy={save.isPending || recalculating}
                onDirty={setDirty}
                onSelect={setSelectedCode}
                onOpenLayer={openLayer}
                onOpenComponent={openComponent}
                onStateChange={onStateChange}
              />
            )
          ) : (
            <RbdCanvas key="loading" nodes={emptyNodes} edges={emptyEdges} editable={false} onDirty={() => undefined} onSelect={() => undefined} onOpenLayer={() => undefined} onOpenComponent={() => undefined} onStateChange={onStateChange} />
          )}
        </section>
        <aside data-tour="details" className="relative hidden min-h-0 border-l border-border bg-surface lg:block">
          {details}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize the details panel"
            title="Drag to resize, double-click to reset"
            onPointerDown={startPanelDrag("details")}
            onDoubleClick={() => setDetailsWidth(340)}
            className="absolute inset-y-0 -left-1 z-10 hidden w-2 cursor-col-resize transition-colors duration-(--dur-fast) hover:bg-primary/20 active:bg-primary/30 lg:block"
          />
        </aside>
      </div>

      <Sheet open={treeOpen} onOpenChange={setTreeOpen}>
        <SheetContent side="left" className="max-w-sm p-0">
          <SheetTitle className="sr-only">Layers</SheetTitle>
          <SheetDescription className="sr-only">Move between the layers of this system</SheetDescription>
          {panels}
        </SheetContent>
      </Sheet>
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="p-0">
          <SheetTitle className="sr-only">Details</SheetTitle>
          <SheetDescription className="sr-only">The selected block or the current layer</SheetDescription>
          {details}
        </SheetContent>
      </Sheet>

      <PlotDialog open={plotOpen} onOpenChange={setPlotOpen} tree={treeData} level={activeLevel} />
      <OptimizationStudio open={optimizeOpen} onOpenChange={setOptimizeOpen} rbdSystemId={rbdSystemId} systemName={treeData?.systemName ?? null} />
      <RecalculateDialog
        open={recalculateOpen}
        onOpenChange={setRecalculateOpen}
        rbdSystemId={rbdSystemId}
        tree={treeData}
        onStarted={() => setRecalculating(true)}
        onSettled={() => setRecalculating(false)}
      />
      <ComponentSheet
        node={sheetNode}
        open={Boolean(sheetNode)}
        canEdit={permissions.canUpdate}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingLevel)}
        onOpenChange={(open) => {
          if (!open) setPendingLevel(null);
        }}
        title="Leave without saving?"
        description="The links and positions you changed on this layer will be lost."
        confirmLabel="Discard changes"
        destructive
        onConfirm={() => {
          if (pendingLevel) setLevel(pendingLevel);
          setPendingLevel(null);
          setTreeOpen(false);
        }}
      />
      <HierarchyDialog
        open={Boolean(hierarchyDialog)}
        onOpenChange={(open) => {
          if (!open) setHierarchyDialog(null);
        }}
        rbdSystemId={rbdSystemId}
        parent={hierarchyDialog?.parent ?? null}
        node={hierarchyDialog?.node ?? null}
        onDone={() => void refreshAll()}
      />
      <AddComponentDialog
        open={Boolean(componentDialog)}
        onOpenChange={(open) => {
          if (!open) setComponentDialog(null);
        }}
        parent={componentDialog}
        onDone={() => void refreshAll()}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={pendingDelete?.type === "delete-component" ? "Remove this component?" : "Delete this subsystem?"}
        description={
          pendingDelete?.type === "delete-component"
            ? `${pendingDelete.component.componentName} will be removed from ${pendingDelete.parent.name}, along with its failure history.`
            : `${pendingDelete?.type === "delete-subsystem" ? pendingDelete.node.name : "This layer"} will be deleted. It must be empty first.`
        }
        confirmLabel={pendingDelete?.type === "delete-component" ? "Remove component" : "Delete subsystem"}
        destructive
        loading={removal.isPending}
        onConfirm={() => pendingDelete && removal.mutate(pendingDelete)}
      />
    </div>
  );
}

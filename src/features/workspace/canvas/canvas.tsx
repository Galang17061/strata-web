"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Maximize2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlockNode } from "@/features/workspace/canvas/block-node";
import { FlowEdge } from "@/features/workspace/canvas/flow-edge";
import { VirtualNode } from "@/features/workspace/canvas/virtual-node";
import type { CanvasEdge, CanvasNode } from "@/features/workspace/model";
import { durationMs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Snapshot = { nodes: CanvasNode[]; edges: CanvasEdge[] };

export type CanvasHandle = {
  getState: () => Snapshot;
};

type RbdCanvasProps = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  editable: boolean;
  busy?: boolean;
  onDirty: (dirty: boolean) => void;
  onSelect: (code: string | null) => void;
  onOpenLayer: (node: CanvasNode) => void;
  onStateChange: (state: Snapshot) => void;
};

const nodeTypes = { block: BlockNode, virtual: VirtualNode };
const edgeTypes = { flow: FlowEdge };

function CanvasInner({ nodes: initialNodes, edges: initialEdges, editable, busy = false, onDirty, onSelect, onOpenLayer, onStateChange }: RbdCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasEdge>(initialEdges);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const { fitView } = useReactFlow();

  nodesRef.current = nodes;
  edgesRef.current = edges;

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setHistory([]);
    onDirty(false);
    const timer = window.setTimeout(() => fitView({ padding: 0.2, duration: durationMs("--dur-slow") }), 50);
    return () => window.clearTimeout(timer);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView, onDirty]);

  useEffect(() => {
    onStateChange({ nodes, edges });
  }, [nodes, edges, onStateChange]);

  const snapshot = useCallback(() => {
    setHistory((stack) => [...stack.slice(-19), { nodes: nodesRef.current, edges: edgesRef.current }]);
  }, []);

  const markDirty = useCallback(() => onDirty(true), [onDirty]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<CanvasNode>[]) => {
      onNodesChange(changes);
      const selection = changes.find((change) => change.type === "select" && change.selected);
      if (selection && "id" in selection) onSelect(selection.id);
      if (changes.some((change) => change.type === "select" && !change.selected) && !selection) {
        const stillSelected = nodesRef.current.some(
          (node) => node.selected && !changes.some((change) => change.type === "select" && "id" in change && change.id === node.id),
        );
        if (!stillSelected) onSelect(null);
      }
    },
    [onNodesChange, onSelect],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<CanvasEdge>[]) => {
      if (changes.some((change) => change.type === "remove")) {
        snapshot();
        markDirty();
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, snapshot, markDirty],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) return;
      snapshot();
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id: `local-${connection.source}-${connection.target}-${Date.now()}`,
            type: "flow",
            data: { fresh: true },
          },
          current,
        ),
      );
      markDirty();
    },
    [setEdges, snapshot, markDirty],
  );

  const undo = useCallback(() => {
    setHistory((stack) => {
      const previous = stack[stack.length - 1];
      if (!previous) return stack;
      setNodes(previous.nodes);
      setEdges(previous.edges);
      return stack.slice(0, -1);
    });
    markDirty();
  }, [setNodes, setEdges, markDirty]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && editable) {
        const target = event.target as HTMLElement | null;
        if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, editable]);

  const minimapColor = useMemo(() => (node: CanvasNode) => (node.data.kind === "virtual" ? "var(--foreground-subtle)" : "var(--primary)"), []);

  return (
    <div className="relative h-full w-full">
      {busy ? (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden" aria-hidden="true">
          <div className="strata-skeleton h-full w-full bg-primary/40" />
        </div>
      ) : null}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={editable ? onConnect : undefined}
        onNodeDragStart={editable ? snapshot : undefined}
        onNodeDragStop={editable ? markDirty : undefined}
        onNodeDoubleClick={(_, node) => {
          if (node.data.kind === "subsystem") onOpenLayer(node);
        }}
        onPaneClick={() => onSelect(null)}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable
        edgesFocusable
        deleteKeyCode={editable ? ["Delete", "Backspace"] : null}
        snapToGrid
        snapGrid={[16, 16]}
        fitView
        minZoom={0.2}
        maxZoom={2}
        className={cn("bg-background", !editable && "cursor-default")}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <MiniMap pannable zoomable nodeColor={minimapColor} position="bottom-right" />
        <Controls position="bottom-left" showInteractive={false} />
        <Panel position="top-right" className="flex items-center gap-2">
          {busy ? <Badge variant="info">Recalculating</Badge> : null}
          {editable ? (
            <Button variant="secondary" size="sm" onClick={undo} disabled={history.length === 0} aria-label="Undo">
              <Undo2 /> Undo
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => fitView({ padding: 0.2, duration: durationMs("--dur-slow") })} aria-label="Fit view">
            <Maximize2 /> Fit
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function RbdCanvas(props: RbdCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}

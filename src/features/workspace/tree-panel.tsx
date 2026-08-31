"use client";

import { Boxes, ChevronRight, Layers, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SystemTree, TreeComponent, TreeNode } from "@/features/projects/types";
import type { Level } from "@/features/workspace/model";
import { cn } from "@/lib/utils";

export type TreeAction =
  | { type: "add-subsystem"; parent: TreeNode | null }
  | { type: "add-component"; parent: TreeNode }
  | { type: "rename"; node: TreeNode }
  | { type: "delete-subsystem"; node: TreeNode }
  | { type: "delete-component"; component: TreeComponent; parent: TreeNode };

type TreePanelProps = {
  tree: SystemTree;
  level: Level;
  values: Record<string, number> | null;
  selectedCode: string | null;
  canEdit: boolean;
  onOpenLevel: (level: Level) => void;
  onSelectComponent: (parent: TreeNode, component: TreeComponent) => void;
  onAction: (action: TreeAction) => void;
};

function RowActions({ node, maxLevel, canEdit, onAction }: { node: TreeNode; maxLevel: number; canEdit: boolean; onAction: (action: TreeAction) => void }) {
  if (!canEdit) return null;
  const hasChildren = (node.hierarchy ?? []).length > 0;
  const hasComponents = (node.components ?? []).length > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${node.name}`}
          className="size-7 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {node.level < maxLevel && !hasComponents ? (
          <DropdownMenuItem onSelect={() => onAction({ type: "add-subsystem", parent: node })}>
            <Plus /> Add subsystem inside
          </DropdownMenuItem>
        ) : null}
        {!hasChildren ? (
          <DropdownMenuItem onSelect={() => onAction({ type: "add-component", parent: node })}>
            <Boxes /> Add component
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => onAction({ type: "rename", node })}>
          <Pencil /> Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={hasChildren || hasComponents} onSelect={() => onAction({ type: "delete-subsystem", node })}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ComponentRow({
  component,
  parent,
  depth,
  active,
  canEdit,
  onSelect,
  onAction,
}: {
  component: TreeComponent;
  parent: TreeNode;
  depth: number;
  active: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onAction: (action: TreeAction) => void;
}) {
  return (
    <div
      className={cn(
        "group/row flex h-8 items-center gap-1 rounded-sm pr-1 text-body-sm transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-foreground-muted hover:bg-surface-sunken hover:text-foreground",
      )}
      style={{ paddingLeft: depth * 16 + 8 }}
    >
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 rounded-sm py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Boxes className="size-3.5 shrink-0 text-foreground-subtle" aria-hidden="true" />
        <span className="truncate">{component.componentName}</span>
        <span className="ml-auto font-mono text-caption tracking-normal text-foreground-subtle">{component.formulaCode}</span>
      </button>
      {canEdit ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
          aria-label={`Delete ${component.componentName}`}
          onClick={() => onAction({ type: "delete-component", component, parent })}
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  );
}

function HierarchyRow({
  node,
  depth,
  maxLevel,
  level,
  values,
  selectedCode,
  canEdit,
  onOpenLevel,
  onSelectComponent,
  onAction,
}: {
  node: TreeNode;
  depth: number;
  maxLevel: number;
  level: Level;
  values: Record<string, number> | null;
  selectedCode: string | null;
  canEdit: boolean;
  onOpenLevel: (level: Level) => void;
  onSelectComponent: (parent: TreeNode, component: TreeComponent) => void;
  onAction: (action: TreeAction) => void;
}) {
  const [open, setOpen] = useState(true);
  const value = node.formulaCode ? (values?.[node.formulaCode] ?? null) : null;
  const children = node.hierarchy ?? [];
  const components = node.components ?? [];
  const hasChildren = children.length > 0 || components.length > 0;
  const active = level.scope === "hierarchy" && level.id === node.hierarchyId;

  return (
    <div>
      <div
        className={cn(
          "group/row flex h-8 items-center gap-1 rounded-sm pr-1 text-body-sm transition-colors",
          active ? "bg-accent font-medium text-accent-foreground" : "text-foreground hover:bg-surface-sunken",
        )}
        style={{ paddingLeft: depth * 16 + 4 }}
      >
        <button
          type="button"
          aria-label={open ? "Collapse" : "Expand"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={cn("flex size-6 shrink-0 items-center justify-center rounded-sm text-foreground-subtle", !hasChildren && "invisible")}
        >
          <ChevronRight className={cn("size-3.5 transition-transform duration-(--dur-fast)", open && "rotate-90")} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-current={active ? "location" : undefined}
          onClick={() => onOpenLevel({ scope: "hierarchy", id: node.hierarchyId })}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-sm py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Layers className="size-3.5 shrink-0 text-foreground-subtle" aria-hidden="true" />
          <span className="truncate" title={node.formulaCode ?? undefined}>
            {node.name}
          </span>
          {value === null ? (
            <span className="ml-auto font-mono text-caption tracking-normal text-foreground-subtle">{node.formulaCode}</span>
          ) : (
            <ReliabilityBadge value={value} size="sm" showLabel={false} className="ml-auto" />
          )}
        </button>
        <RowActions node={node} maxLevel={maxLevel} canEdit={canEdit} onAction={onAction} />
      </div>
      {open ? (
        <div>
          {children.map((child) => (
            <HierarchyRow
              key={child.hierarchyId}
              node={child}
              depth={depth + 1}
              maxLevel={maxLevel}
              level={level}
              values={values}
              selectedCode={selectedCode}
              canEdit={canEdit}
              onOpenLevel={onOpenLevel}
              onSelectComponent={onSelectComponent}
              onAction={onAction}
            />
          ))}
          {components.map((component) => (
            <ComponentRow
              key={component.systemComponentId}
              component={component}
              parent={node}
              depth={depth + 1}
              active={level.scope === "hierarchy" && level.id === node.hierarchyId && selectedCode === component.formulaCode}
              canEdit={canEdit}
              onSelect={() => onSelectComponent(node, component)}
              onAction={onAction}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TreePanel({ tree, level, values, selectedCode, canEdit, onOpenLevel, onSelectComponent, onAction }: TreePanelProps) {
  const systemActive = level.scope === "system";
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-caption uppercase text-foreground-muted">Layers</span>
        {canEdit ? (
          <Button variant="ghost" size="sm" className="h-7" onClick={() => onAction({ type: "add-subsystem", parent: null })}>
            <Plus /> Level 1
          </Button>
        ) : null}
      </div>
      <nav aria-label="System layers" className="relative flex-1 overflow-y-auto p-2">
        <button
          type="button"
          aria-current={systemActive ? "location" : undefined}
          onClick={() => onOpenLevel({ scope: "system", id: tree.rbdSystemId })}
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-body-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
            systemActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-surface-sunken",
          )}
        >
          <Layers className="size-4 text-primary" aria-hidden="true" />
          <span className="truncate">{tree.systemName}</span>
          <span className="ml-auto font-mono text-caption tracking-normal text-foreground-subtle">system</span>
        </button>
        {(tree.hierarchy ?? []).map((node) => (
          <HierarchyRow
            key={node.hierarchyId}
            node={node}
            depth={1}
            maxLevel={tree.hierarchyDepth}
            level={level}
            values={values}
            selectedCode={selectedCode}
            canEdit={canEdit}
            onOpenLevel={onOpenLevel}
            onSelectComponent={onSelectComponent}
            onAction={onAction}
          />
        ))}
      </nav>
    </div>
  );
}

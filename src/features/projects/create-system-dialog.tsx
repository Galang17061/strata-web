"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listMasterComponents } from "@/features/master-data/api";
import type { MasterComponent } from "@/features/master-data/types";
import { createSystem } from "@/features/projects/api";
import type { ConnectionType, SystemTreeInput } from "@/features/projects/types";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

type BuilderComponent = {
  id: string;
  componentId: string;
  componentName: string;
  vendor: string;
  totalComponent: number;
  activeComponent: number;
  connectionType: ConnectionType;
};

type BuilderNode = {
  id: string;
  name: string;
  children: BuilderNode[];
  components: BuilderComponent[];
};

let sequence = 0;
const nextId = () => `n${(sequence += 1)}`;

const emptyNode = (): BuilderNode => ({ id: nextId(), name: "", children: [], components: [] });

function updateNode(nodes: BuilderNode[], id: string, update: (node: BuilderNode) => BuilderNode): BuilderNode[] {
  return nodes.map((node) =>
    node.id === id ? update(node) : { ...node, children: updateNode(node.children, id, update) },
  );
}

function removeNode(nodes: BuilderNode[], id: string): BuilderNode[] {
  return nodes.filter((node) => node.id !== id).map((node) => ({ ...node, children: removeNode(node.children, id) }));
}

export function toTreeInput(nodes: BuilderNode[]): SystemTreeInput[] {
  return nodes.map((node) => ({
    name: node.name.trim(),
    connectionType: "Series",
    formulaCode: "",
    hierarchy: toTreeInput(node.children),
    components: node.components.map((component) => ({
      componentName: component.componentName,
      vendor: component.vendor,
      totalComponent: component.totalComponent,
      activeComponent: component.activeComponent,
      connectionType: component.connectionType,
      formulaCode: null,
    })),
  }));
}

export function firstProblem(name: string, nodes: BuilderNode[]): string | null {
  if (!name.trim()) return "Give the system a name.";
  if (nodes.length === 0) return "Add at least one subsystem.";
  const walk = (list: BuilderNode[], depth: number): string | null => {
    for (const node of list) {
      if (!node.name.trim()) return `Every subsystem at level ${depth} needs a name.`;
      for (const component of node.components) {
        if (component.activeComponent < 1 || component.totalComponent < 1) return `${component.componentName}: counts must be at least 1.`;
        if (component.activeComponent > component.totalComponent) return `${component.componentName}: active parts cannot exceed identical parts.`;
      }
      const nested = walk(node.children, depth + 1);
      if (nested) return nested;
    }
    return null;
  };
  return walk(nodes, 1);
}

function ComponentPicker({ components, onPick }: { components: MasterComponent[]; onPick: (component: MasterComponent) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Add component"
          className="justify-between gap-2"
        >
          <Plus /> Add component <ChevronsUpDown className="opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search the catalogue" />
          <CommandList>
            <CommandEmpty>No component matches.</CommandEmpty>
            <CommandGroup heading="Catalogue">
              {components.map((component) => (
                <CommandItem
                  key={component.componentId}
                  value={`${component.componentName} ${component.manufacturerName}`}
                  onSelect={() => {
                    onPick(component);
                    setOpen(false);
                  }}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{component.componentName}</span>
                    <span className="truncate text-caption text-foreground-muted">{component.manufacturerName}</span>
                  </span>
                  <Check className="ml-auto opacity-0" />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ComponentRow({ component, onChange, onRemove }: { component: BuilderComponent; onChange: (next: BuilderComponent) => void; onRemove: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 rounded-sm border border-border bg-surface-sunken/50 p-2 sm:grid-cols-[minmax(0,1fr)_7rem_4.5rem_4.5rem_auto]">
      <div className="min-w-0">
        <p className="truncate text-body-sm font-medium">{component.componentName}</p>
        <p className="truncate text-caption text-foreground-muted">{component.vendor}</p>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${component.id}-type`}>Wiring</Label>
        <Select value={component.connectionType} onValueChange={(value) => onChange({ ...component, connectionType: value as ConnectionType })}>
          <SelectTrigger id={`${component.id}-type`} size="sm" aria-label="Wiring">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Series">Series</SelectItem>
            <SelectItem value="Parallel">Parallel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${component.id}-total`}>Identical</Label>
        <Input
          id={`${component.id}-total`}
          numeric
          type="number"
          min={1}
          className="h-8"
          value={component.totalComponent}
          onChange={(event) => onChange({ ...component, totalComponent: Number(event.target.value) || 0 })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${component.id}-active`}>Active</Label>
        <Input
          id={`${component.id}-active`}
          numeric
          type="number"
          min={1}
          className="h-8"
          value={component.activeComponent}
          onChange={(event) => onChange({ ...component, activeComponent: Number(event.target.value) || 0 })}
        />
      </div>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${component.componentName}`} onClick={onRemove}>
        <Trash2 />
      </Button>
    </div>
  );
}

function NodeEditor({
  node,
  depth,
  catalogue,
  onChange,
  onRemove,
}: {
  node: BuilderNode;
  depth: number;
  catalogue: MasterComponent[];
  onChange: (next: BuilderNode) => void;
  onRemove: () => void;
}) {
  const canNest = depth < 3 && node.components.length === 0;
  const canHoldComponents = node.children.length === 0;
  return (
    <div className={cn("flex flex-col gap-3 rounded-md border border-border bg-surface p-3", depth > 1 && "ml-4")}>
      <div className="flex items-end gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label htmlFor={`${node.id}-name`}>Level {depth} subsystem</Label>
          <Input
            id={`${node.id}-name`}
            value={node.name}
            placeholder={depth === 1 ? "Pump station" : "Pump A"}
            onChange={(event) => onChange({ ...node, name: event.target.value })}
          />
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Remove subsystem" onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
      {node.components.length > 0 ? (
        <div className="flex flex-col gap-2">
          {node.components.map((component) => (
            <ComponentRow
              key={component.id}
              component={component}
              onChange={(next) => onChange({ ...node, components: node.components.map((item) => (item.id === next.id ? next : item)) })}
              onRemove={() => onChange({ ...node, components: node.components.filter((item) => item.id !== component.id) })}
            />
          ))}
        </div>
      ) : null}
      {node.children.length > 0 ? (
        <div className="flex flex-col gap-3">
          {node.children.map((child) => (
            <NodeEditor
              key={child.id}
              node={child}
              depth={depth + 1}
              catalogue={catalogue}
              onChange={(next) => onChange({ ...node, children: node.children.map((item) => (item.id === next.id ? next : item)) })}
              onRemove={() => onChange({ ...node, children: node.children.filter((item) => item.id !== child.id) })}
            />
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canHoldComponents ? (
          <ComponentPicker
            components={catalogue}
            onPick={(component) =>
              onChange({
                ...node,
                components: [
                  ...node.components,
                  {
                    id: nextId(),
                    componentId: component.componentId,
                    componentName: component.componentName,
                    vendor: component.manufacturerName,
                    totalComponent: 1,
                    activeComponent: 1,
                    connectionType: "Series",
                  },
                ],
              })
            }
          />
        ) : null}
        {canNest ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...node, children: [...node.children, emptyNode()] })}>
            <Plus /> Add level {depth + 1}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

type CreateSystemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreated?: (rbdSystemId: string) => void;
};

export function CreateSystemDialog({ open, onOpenChange, projectId, onCreated }: CreateSystemDialogProps) {
  const queryClient = useQueryClient();
  const [systemName, setSystemName] = useState("");
  const [nodes, setNodes] = useState<BuilderNode[]>([]);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSystemName("");
      setNodes([emptyNode()]);
      setProblem(null);
    }
  }, [open]);

  const catalogue = useQuery({
    queryKey: queryKeys.masterComponents.list({ page: 1, pageSize: 100 }),
    queryFn: () => listMasterComponents({ page: 1, pageSize: 100 }),
    enabled: open,
  });
  const components = useMemo(() => catalogue.data?.data ?? [], [catalogue.data]);

  const mutation = useMutation({
    mutationFn: () => createSystem({ projectId, systemName: systemName.trim(), hierarchy: toTreeInput(nodes) }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success("System created", { description: systemName.trim() });
      onOpenChange(false);
      onCreated?.(response.data.rbdSystemId);
    },
    onError: (error) => setProblem(error.message),
  });

  const submit = () => {
    const found = firstProblem(systemName, nodes);
    setProblem(found);
    if (!found) mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New system</DialogTitle>
          <DialogDescription>
            Name the system and lay out its layers. A subsystem holds either components or deeper subsystems, never both.
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="system-name">System name</Label>
            <Input id="system-name" value={systemName} placeholder="Cooling loop" autoFocus onChange={(event) => setSystemName(event.target.value)} />
          </div>
          <div className="flex flex-col gap-3">
            {nodes.map((node) => (
              <NodeEditor
                key={node.id}
                node={node}
                depth={1}
                catalogue={components}
                onChange={(next) => setNodes((current) => updateNode(current, next.id, () => next))}
                onRemove={() => setNodes((current) => removeNode(current, node.id))}
              />
            ))}
            <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => setNodes((current) => [...current, emptyNode()])}>
              <Plus /> Add level 1 subsystem
            </Button>
          </div>
          {problem ? (
            <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
              {problem}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" loading={mutation.isPending} onClick={submit}>
            Create system
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

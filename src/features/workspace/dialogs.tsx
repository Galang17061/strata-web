"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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
import { listMasterComponents } from "@/features/master-data/api";
import type { MasterComponent } from "@/features/master-data/types";
import type { TreeNode } from "@/features/projects/types";
import { createComponent, createHierarchy, updateHierarchy } from "@/features/workspace/api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

type HierarchyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rbdSystemId: string;
  parent: TreeNode | null;
  node: TreeNode | null;
  onDone: () => void;
};

export function HierarchyDialog({ open, onOpenChange, rbdSystemId, parent, node, onDone }: HierarchyDialogProps) {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const renaming = Boolean(node);
  const level = renaming ? (node?.level ?? 1) : (parent?.level ?? 0) + 1;

  useEffect(() => {
    if (open) {
      setName(node?.name ?? "");
      setProblem(null);
    }
  }, [open, node]);

  const mutation = useMutation({
    mutationFn: () =>
      renaming && node
        ? updateHierarchy(node.hierarchyId, { subSystemName: name.trim() })
        : createHierarchy({
            rbdSystemId,
            parentId: parent?.hierarchyId ?? rbdSystemId,
            level,
            subSystemName: name.trim(),
            connectionType: "series",
            formula: "",
            formulaCode: "",
            runningHours: 0,
          }),
    onSuccess: () => {
      toast.success(renaming ? "Subsystem renamed" : "Subsystem added", { description: name.trim() });
      onOpenChange(false);
      onDone();
    },
    onError: (error) => setProblem(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) {
              setProblem("Give the subsystem a name.");
              return;
            }
            mutation.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{renaming ? "Rename subsystem" : `New level ${level} subsystem`}</DialogTitle>
            <DialogDescription>
              {renaming ? "Change how this layer is called." : parent ? `It will sit inside ${parent.name}.` : "It will sit directly under the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subsystem-name">Subsystem name</Label>
            <Input id="subsystem-name" value={name} autoFocus onChange={(event) => setName(event.target.value)} aria-invalid={problem ? true : undefined} />
            {problem ? (
              <p role="alert" className="text-body-sm text-danger">
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
            <Button type="submit" loading={mutation.isPending}>
              {renaming ? "Save name" : "Add subsystem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type AddComponentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent: TreeNode | null;
  onDone: () => void;
};

export function AddComponentDialog({ open, onOpenChange, parent, onDone }: AddComponentDialogProps) {
  const [picked, setPicked] = useState<MasterComponent | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPicked(null);
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
    mutationFn: () =>
      createComponent({
        parentId: parent?.hierarchyId ?? "",
        componentName: picked?.componentName ?? "",
        componentTagNumber: picked?.componentId ?? "",
        vendor: picked?.manufacturerName ?? "",
      }),
    onSuccess: () => {
      toast.success("Component added", { description: picked?.componentName });
      onOpenChange(false);
      onDone();
    },
    onError: (error) => setProblem(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a component</DialogTitle>
          <DialogDescription>Pick a part from the catalogue to place inside {parent?.name ?? "this layer"}.</DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-sm border border-border">
          <Command>
            <CommandInput placeholder="Search the catalogue" autoFocus />
            <CommandList className="max-h-64">
              <CommandEmpty>{catalogue.isPending ? "Loading the catalogue" : "No component matches."}</CommandEmpty>
              <CommandGroup heading="Catalogue">
                {components.map((component) => (
                  <CommandItem
                    key={component.componentId}
                    value={`${component.componentName} ${component.manufacturerName}`}
                    onSelect={() => setPicked(component)}
                    aria-selected={picked?.componentId === component.componentId}
                    className={cn(picked?.componentId === component.componentId && "bg-accent text-accent-foreground")}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{component.componentName}</span>
                      <span className="truncate text-caption text-foreground-muted">{component.manufacturerName}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        {problem ? (
          <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
            {problem}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" loading={mutation.isPending} disabled={!picked} onClick={() => mutation.mutate()}>
            Add {picked ? picked.componentName : "component"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

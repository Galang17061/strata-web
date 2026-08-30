"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { listMasterComponents } from "@/features/master-data/api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const allParams = { page: 1, pageSize: 500, sortBy: "componentName", sortOrder: "asc" as const };

export function splitCompatibility(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

type CompatibilityPickerProps = {
  value: string[];
  onChange: (value: string[]) => void;
  excludeId?: string | null;
  id?: string;
};

export function CompatibilityPicker({ value, onChange, excludeId = null, id }: CompatibilityPickerProps) {
  const [open, setOpen] = useState(false);
  const parts = useQuery({
    queryKey: queryKeys.masterComponents.list(allParams),
    queryFn: () => listMasterComponents(allParams),
  });
  const options = useMemo(
    () => (parts.data?.data ?? []).filter((part) => part.componentId !== excludeId),
    [parts.data, excludeId],
  );
  const byId = useMemo(() => new Map(options.map((part) => [part.componentId, part])), [options]);

  const toggle = (componentId: string) => {
    onChange(value.includes(componentId) ? value.filter((entry) => entry !== componentId) : [...value, componentId]);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-foreground-muted">
              {value.length === 0 ? "Pick the parts it works with" : `${value.length} part${value.length === 1 ? "" : "s"} picked`}
            </span>
            <ChevronsUpDown className="text-foreground-subtle" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput placeholder="Search parts" />
            <CommandList>
              <CommandEmpty>{parts.isPending ? "Loading parts" : "No part by that name."}</CommandEmpty>
              <CommandGroup>
                {options.map((part) => {
                  const picked = value.includes(part.componentId);
                  return (
                    <CommandItem
                      key={part.componentId}
                      value={`${part.componentName} ${part.serialNumber ?? ""} ${part.manufacturerName}`}
                      onSelect={() => toggle(part.componentId)}
                      aria-selected={picked}
                    >
                      <span className={cn("flex size-4 items-center justify-center rounded-sm border border-border", picked && "border-primary bg-primary text-primary-foreground")}>
                        {picked ? <Check className="size-3" /> : null}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{part.componentName}</span>
                        <span className="truncate text-caption text-foreground-muted">{part.manufacturerName}</span>
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Compatible parts">
          {value.map((componentId) => (
            <li key={componentId}>
              <Badge variant="outline" className="gap-1 pr-1">
                {byId.get(componentId)?.componentName ?? componentId}
                <button
                  type="button"
                  aria-label={`Remove ${byId.get(componentId)?.componentName ?? componentId}`}
                  onClick={() => toggle(componentId)}
                  className="rounded-pill p-0.5 text-foreground-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

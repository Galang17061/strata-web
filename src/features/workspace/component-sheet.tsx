"use client";

import { Boxes } from "lucide-react";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CanvasNode } from "@/features/workspace/model";

type ComponentSheetProps = {
  node: CanvasNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ComponentSheet({ node, open, onOpenChange }: ComponentSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0">
        <SheetHeader>
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-foreground">
              <Boxes className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate">{node?.data.name ?? "Component"}</SheetTitle>
              <SheetDescription className="font-mono tracking-normal">
                {node?.data.code}
                {node?.data.vendor ? ` · ${node.data.vendor}` : ""}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <SheetBody>
          <p className="text-body-sm text-foreground-muted">Everything about this part will live here.</p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

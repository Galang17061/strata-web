"use client";

import { Boxes } from "lucide-react";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CanvasNode } from "@/features/workspace/model";
import { CurveTab } from "@/features/workspace/sheet/curve-tab";
import { FailuresTab } from "@/features/workspace/sheet/failures-tab";
import { ParametersTab } from "@/features/workspace/sheet/parameters-tab";
import { PropertiesTab } from "@/features/workspace/sheet/properties-tab";

type ComponentSheetProps = {
  node: CanvasNode | null;
  open: boolean;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
};

const tabs = [
  { value: "properties", label: "Properties", hint: "How this part is wired and scored." },
  { value: "failures", label: "Failures", hint: "Every time this part stopped working." },
  { value: "parameters", label: "Parameters", hint: "The distribution figures behind its score." },
  { value: "curve", label: "Curve", hint: "How its chance of working falls over time." },
] as const;

export function ComponentSheet({ node, open, canEdit, onOpenChange }: ComponentSheetProps) {
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
        <Tabs defaultValue="properties" className="min-h-0 flex-1 gap-0">
          <TabsList className="px-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="min-h-0">
              <SheetBody>
                {tab.value === "properties" && node ? (
                  <PropertiesTab key={node.data.entityId} systemComponentId={node.data.entityId} canEdit={canEdit} />
                ) : tab.value === "failures" && node ? (
                  <FailuresTab key={node.data.entityId} systemComponentId={node.data.entityId} canEdit={canEdit} />
                ) : tab.value === "parameters" && node ? (
                  <ParametersTab key={node.data.entityId} systemComponentId={node.data.entityId} canEdit={canEdit} />
                ) : tab.value === "curve" && node ? (
                  <CurveTab key={node.data.entityId} systemComponentId={node.data.entityId} canEdit={canEdit} />
                ) : (
                  <p className="text-body-sm text-foreground-muted">{tab.hint}</p>
                )}
              </SheetBody>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

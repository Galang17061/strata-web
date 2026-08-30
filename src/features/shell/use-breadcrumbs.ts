"use client";

import { useEffect } from "react";
import { useUiStore, type Crumb, type PaletteItem } from "@/features/shell/ui-store";

export function useBreadcrumbs(crumbs: Crumb[]): void {
  const setBreadcrumbs = useUiStore((state) => state.setBreadcrumbs);
  const key = JSON.stringify(crumbs);
  useEffect(() => {
    setBreadcrumbs(JSON.parse(key) as Crumb[]);
    return () => setBreadcrumbs([]);
  }, [key, setBreadcrumbs]);
}

export function usePaletteScope(scope: string, items: PaletteItem[]): void {
  const setPaletteScope = useUiStore((state) => state.setPaletteScope);
  const key = JSON.stringify(items.map((item) => [item.id, item.label, item.hint, item.href, item.keywords]));
  useEffect(() => {
    setPaletteScope(scope, items);
    return () => setPaletteScope(scope, []);
  }, [scope, key, setPaletteScope, items]);
}

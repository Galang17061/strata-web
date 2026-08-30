import { create } from "zustand";
import type { Level } from "@/features/workspace/model";

type WorkspaceState = {
  level: Level | null;
  selectedCode: string | null;
  sheetCode: string | null;
  sheetTab: string;
  dirty: boolean;
  treeOpen: boolean;
  detailsOpen: boolean;
  setLevel: (level: Level | null) => void;
  setSelectedCode: (code: string | null) => void;
  openSheet: (code: string) => void;
  closeSheet: () => void;
  setSheetTab: (tab: string) => void;
  setDirty: (dirty: boolean) => void;
  setTreeOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  level: null,
  selectedCode: null,
  sheetCode: null,
  sheetTab: "properties",
  dirty: false,
  treeOpen: false,
  detailsOpen: false,
  setLevel: (level) => set({ level, selectedCode: null, sheetCode: null, dirty: false }),
  setSelectedCode: (selectedCode) => set({ selectedCode }),
  openSheet: (sheetCode) => set({ sheetCode, selectedCode: sheetCode, detailsOpen: false }),
  closeSheet: () => set({ sheetCode: null }),
  setSheetTab: (sheetTab) => set({ sheetTab }),
  setDirty: (dirty) => set({ dirty }),
  setTreeOpen: (treeOpen) => set({ treeOpen }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
}));

import { create } from "zustand";
import type { Level } from "@/features/workspace/model";

type WorkspaceState = {
  level: Level | null;
  selectedCode: string | null;
  dirty: boolean;
  treeOpen: boolean;
  detailsOpen: boolean;
  setLevel: (level: Level | null) => void;
  setSelectedCode: (code: string | null) => void;
  setDirty: (dirty: boolean) => void;
  setTreeOpen: (open: boolean) => void;
  setDetailsOpen: (open: boolean) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  level: null,
  selectedCode: null,
  dirty: false,
  treeOpen: false,
  detailsOpen: false,
  setLevel: (level) => set({ level, selectedCode: null, dirty: false }),
  setSelectedCode: (selectedCode) => set({ selectedCode }),
  setDirty: (dirty) => set({ dirty }),
  setTreeOpen: (treeOpen) => set({ treeOpen }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
}));

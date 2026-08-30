import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Crumb = {
  label: string;
  href?: string;
};

export type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  href?: string;
  run?: () => void;
  keywords?: string[];
};

type UiState = {
  sidebarCollapsed: boolean;
  hydrated: boolean;
  mobileNavOpen: boolean;
  paletteOpen: boolean;
  changePasswordOpen: boolean;
  breadcrumbs: Crumb[];
  paletteScopes: Record<string, PaletteItem[]>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setHydrated: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
  setChangePasswordOpen: (open: boolean) => void;
  setBreadcrumbs: (crumbs: Crumb[]) => void;
  setPaletteScope: (scope: string, items: PaletteItem[]) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      hydrated: false,
      mobileNavOpen: false,
      paletteOpen: false,
      changePasswordOpen: false,
      breadcrumbs: [],
      paletteScopes: {},
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setHydrated: () => set({ hydrated: true }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      setChangePasswordOpen: (changePasswordOpen) => set({ changePasswordOpen }),
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      setPaletteScope: (scope, items) =>
        set((state) => ({ paletteScopes: { ...state.paletteScopes, [scope]: items } })),
    }),
    {
      name: "strata-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      skipHydration: true,
    },
  ),
);

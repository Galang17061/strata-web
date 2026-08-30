import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types";

export type SignOutReason = "expired" | null;

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  signOutReason: SignOutReason;
  setUser: (user: AuthUser | null) => void;
  setHydrated: () => void;
  setSignOutReason: (reason: SignOutReason) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      signOutReason: null,
      setUser: (user) => set({ user }),
      setHydrated: () => set({ hydrated: true }),
      setSignOutReason: (signOutReason) => set({ signOutReason }),
    }),
    {
      name: "strata-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      skipHydration: true,
    },
  ),
);

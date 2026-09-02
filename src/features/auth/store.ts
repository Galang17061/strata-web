import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types";

export type SignOutReason = "expired" | null;

const REMEMBER_KEY = "strata-remember";

export function setRememberMe(remember: boolean): void {
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

export function rememberMe(): boolean {
  return localStorage.getItem(REMEMBER_KEY) !== "0";
}

export const scopedStorage = {
  getItem: (name: string) => localStorage.getItem(name) ?? sessionStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (rememberMe()) {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    } else {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

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
      storage: createJSONStorage(() => scopedStorage),
      partialize: (state) => ({ user: state.user }),
      skipHydration: true,
    },
  ),
);

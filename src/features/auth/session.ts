"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { currentUser, login, logout } from "@/features/auth/api";
import {
  MODULES,
  hasRole,
  permissionsFor,
  type ModuleName,
  type Permission,
  type UserRole,
} from "@/features/auth/roles";
import { useAuthStore, type SignOutReason } from "@/features/auth/store";
import type { AuthUser, Credentials } from "@/features/auth/types";
import { readCookie, removeCookie, writeCookie } from "@/lib/cookies";
import { tokenCookieName } from "@/lib/env";

export const DASHBOARD_PATH = "/dashboard/";
export const SIGN_IN_PATH = "/sign-in/";

export function storeSession(user: AuthUser): void {
  writeCookie(tokenCookieName(), user.token);
  const state = useAuthStore.getState();
  state.setSignOutReason(null);
  state.setUser(user);
}

export const EXPIRED_SIGN_IN_PATH = `${SIGN_IN_PATH}?code=401`;

export function clearSession(reason: SignOutReason = null): void {
  removeCookie(tokenCookieName());
  const state = useAuthStore.getState();
  state.setSignOutReason(reason);
  state.setUser(null);
}

export function hasStoredToken(): boolean {
  return Boolean(readCookie(tokenCookieName()));
}

export function useSession() {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  return {
    user,
    hydrated,
    isAuthenticated: Boolean(user?.token),
    role: user?.roleName ?? null,
  };
}

export function usePermissions(moduleName: ModuleName = MODULES.DASHBOARD): Permission {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => permissionsFor(user, moduleName), [user, moduleName]);
}

export function useRole() {
  const user = useAuthStore((state) => state.user);
  return useMemo(
    () => ({
      isAdmin: hasRole(user, "admin"),
      hasRole: (roles: UserRole | UserRole[]) => hasRole(user, roles),
    }),
    [user],
  );
}

export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: Credentials) => login(credentials),
    onSuccess: (user, _credentials, _context, mutation) => {
      void mutation;
      queryClient.clear();
      storeSession(user);
      router.replace(DASHBOARD_PATH);
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useCallback(
    async (reason?: "expired") => {
      try {
        await logout();
      } catch {
        void 0;
      }
      clearSession(reason ?? null);
      queryClient.clear();
      router.replace(reason === "expired" ? EXPIRED_SIGN_IN_PATH : SIGN_IN_PATH);
    },
    [router, queryClient],
  );
}

export async function refreshCurrentUser(): Promise<void> {
  const me = await currentUser();
  const state = useAuthStore.getState();
  const user = state.user;
  if (!user) return;
  state.setUser({
    ...user,
    id: me.id,
    userName: me.username,
    fullName: me.fullname,
    email: me.email,
    roleName: me.role || user.roleName,
  });
}

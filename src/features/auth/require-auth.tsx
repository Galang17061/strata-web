"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { PageLoader } from "@/components/brand/loader";
import type { ModuleName } from "@/features/auth/roles";
import { useAuthStore } from "@/features/auth/store";
import {
  DASHBOARD_PATH,
  EXPIRED_SIGN_IN_PATH,
  SIGN_IN_PATH,
  hasStoredToken,
  refreshCurrentUser,
  usePermissions,
  useSession,
} from "@/features/auth/session";

type RequireAuthProps = {
  children: ReactNode;
  moduleName?: ModuleName;
};

export function RequireAuth({ children, moduleName }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, isAuthenticated } = useSession();
  const permissions = usePermissions(moduleName);
  const verified = useRef(false);

  const signedIn = hydrated && isAuthenticated && hasStoredToken();
  const allowed = !moduleName || permissions.canView;

  useEffect(() => {
    if (!hydrated) return;
    if (!signedIn) {
      if (useAuthStore.getState().signOutReason === "expired") {
        router.replace(EXPIRED_SIGN_IN_PATH);
        return;
      }
      const next = pathname && pathname !== DASHBOARD_PATH ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`${SIGN_IN_PATH}${next}`);
      return;
    }
    if (!allowed) {
      router.replace(DASHBOARD_PATH);
      return;
    }
    if (!verified.current) {
      verified.current = true;
      refreshCurrentUser().catch(() => undefined);
    }
  }, [hydrated, signedIn, allowed, pathname, router]);

  if (!hydrated || !signedIn || !allowed) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

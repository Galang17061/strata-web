"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSignOut } from "@/features/auth/session";
import { useAuthStore } from "@/features/auth/store";
import { setUnauthorizedHandler } from "@/lib/api/client";

export function AuthBridge() {
  const signOut = useSignOut();

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useAuthStore.getState().setHydrated();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!useAuthStore.getState().user) return;
      toast.error("Your session has ended", { description: "Sign in again to continue." });
      void signOut("expired");
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  return null;
}

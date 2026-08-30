import type { ReactNode } from "react";
import { RequireAuth } from "@/features/auth/require-auth";
import { AppShell } from "@/features/shell/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

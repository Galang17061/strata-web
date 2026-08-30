"use client";

import { LogOut } from "lucide-react";
import { PageEnter } from "@/components/motion/page-enter";
import { Wordmark } from "@/components/brand/wordmark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession, useSignOut } from "@/features/auth/session";

export function DashboardScreen() {
  const { user } = useSession();
  const signOut = useSignOut();

  return (
    <PageEnter className="mx-auto flex min-h-screen w-full max-w-content flex-col gap-8 px-6 py-8">
      <header className="flex items-center justify-between">
        <Wordmark size={28} />
        <Button variant="secondary" onClick={() => void signOut()}>
          <LogOut /> Sign out
        </Button>
      </header>
      <section className="flex flex-col gap-2">
        <h1 className="text-h1">Dashboard</h1>
        <p className="text-body text-foreground-muted">
          Signed in as <span className="font-medium text-foreground">{user?.fullName}</span>
        </p>
        <Badge className="w-fit capitalize">{user?.roleName}</Badge>
      </section>
    </PageEnter>
  );
}

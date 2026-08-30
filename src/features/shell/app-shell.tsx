"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageEnter } from "@/components/motion/page-enter";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChangePasswordDialog } from "@/features/auth/change-password-dialog";
import { CommandPalette } from "@/features/shell/command-palette";
import { Sidebar, SidebarContent } from "@/features/shell/sidebar";
import { Topbar } from "@/features/shell/topbar";
import { useUiStore } from "@/features/shell/ui-store";
import { cn } from "@/lib/utils";

function MobileNav() {
  const open = useUiStore((state) => state.mobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" showCloseButton={false} className="bg-sidebar text-sidebar-foreground">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">Move between the parts of Strata</SheetDescription>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const fullBleed = useUiStore((state) => state.fullBleed);

  useEffect(() => {
    useUiStore.persist.rehydrate();
    useUiStore.getState().setHydrated();
  }, []);

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className={cn("flex-1", fullBleed ? "flex min-h-0 flex-col" : "mx-auto w-full max-w-content px-4 py-6 lg:px-6")}>
            <PageEnter key={pathname} className={cn(fullBleed && "flex min-h-0 flex-1 flex-col")}>
              {children}
            </PageEnter>
          </main>
        </div>
      </div>
      <MobileNav />
      <CommandPalette />
      <ChangePasswordDialog />
    </TooltipProvider>
  );
}

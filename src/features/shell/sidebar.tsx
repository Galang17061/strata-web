"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion } from "motion/react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAllowed } from "@/features/auth/permission-gate";
import { isNavItemActive, navGroups, type NavItem } from "@/features/shell/nav-config";
import { useUiStore } from "@/features/shell/ui-store";
import { UserMenu } from "@/features/shell/user-menu";
import { useMotionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const tokens = useMotionTokens();
  const active = isNavItemActive(item, pathname ?? "");
  const allowed = useAllowed({ moduleName: item.moduleName, permission: "view", requireRole: item.requireRole });
  if (!allowed) return null;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-10 items-center gap-3 rounded-sm px-3 text-body-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-sidebar-active text-sidebar-active-foreground"
          : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
        collapsed && "justify-center px-0",
      )}
    >
      {active ? (
        <motion.span
          layoutId="sidebar-active-indicator"
          transition={{ duration: tokens.base, ease: tokens.easeEmphasized }}
          className="absolute top-2 bottom-2 -left-2 w-0.75 rounded-r-pill bg-primary"
          aria-hidden="true"
        />
      ) : null}
      <item.icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      {!collapsed ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function SidebarContent({
  collapsed = false,
  onNavigate,
  showCollapse = false,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  showCollapse?: boolean;
}) {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-3", collapsed ? "justify-center" : "justify-between pl-4")}>
        <Link href="/dashboard/" aria-label="Strata dashboard" onClick={onNavigate} className="rounded-sm">
          <Wordmark size={26} markOnly={collapsed} className="text-white" />
        </Link>
        {showCollapse && !collapsed ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="text-sidebar-foreground hover:bg-white/5 hover:text-white"
          >
            <PanelLeftClose />
          </Button>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-2 py-4" aria-label="Main">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            {!collapsed ? (
              <p className="px-3 pb-1 text-caption uppercase text-sidebar-foreground/70">{group.label}</p>
            ) : null}
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>
      {showCollapse && collapsed ? (
        <div className="flex justify-center px-2 pb-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="text-sidebar-foreground hover:bg-white/5 hover:text-white"
          >
            <PanelLeftOpen />
          </Button>
        </div>
      ) : null}
      <div className={cn("border-t border-sidebar-border p-2", collapsed && "flex justify-center")}>
        <UserMenu compact={collapsed} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  return (
    <aside
      data-collapsed={collapsed ? "true" : undefined}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-(--dur-base) ease-standard lg:block",
        collapsed ? "w-(--sidebar-width-icon)" : "w-(--sidebar-width)",
      )}
    >
      <SidebarContent collapsed={collapsed} showCollapse />
    </aside>
  );
}

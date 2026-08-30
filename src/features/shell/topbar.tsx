"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Fragment } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { RouteProgress } from "@/features/shell/route-progress";
import { useUiStore } from "@/features/shell/ui-store";
import { UserMenu } from "@/features/shell/user-menu";

export function Topbar() {
  const breadcrumbs = useUiStore((state) => state.breadcrumbs);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const setPaletteOpen = useUiStore((state) => state.setPaletteOpen);
  const last = breadcrumbs[breadcrumbs.length - 1];

  return (
    <header className="sticky top-0 z-30 flex h-(--topbar-height) shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu />
      </Button>
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="hidden flex-nowrap sm:flex">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem className="min-w-0">
                  {isLast || !crumb.href ? (
                    <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="truncate">
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
        {last ? <p className="truncate text-body-sm font-medium text-foreground sm:hidden">{last.label}</p> : null}
      </Breadcrumb>
      <Button
        variant="secondary"
        size="sm"
        className="gap-2 text-foreground-muted"
        onClick={() => setPaletteOpen(true)}
        aria-label="Open command palette"
      >
        <Search />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden rounded-sm border border-border bg-surface-sunken px-1.5 font-mono text-caption tracking-normal text-foreground-subtle md:inline">
          Ctrl K
        </kbd>
      </Button>
      <ThemeToggle className="hidden md:inline-flex" />
      <div className="lg:hidden">
        <UserMenu compact tone="surface" />
      </div>
      <RouteProgress />
    </header>
  );
}

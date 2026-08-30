"use client";

import { ChevronsUpDown, KeyRound, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useThemeSwitch } from "@/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, useSignOut } from "@/features/auth/session";
import { useUiStore } from "@/features/shell/ui-store";
import { cn } from "@/lib/utils";

export function initialsOf(name: string | undefined | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function Avatar({ name, className }: { name: string | undefined | null; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-primary/20 font-mono text-caption font-medium tracking-normal text-primary",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

type UserMenuProps = {
  compact?: boolean;
  tone?: "sidebar" | "surface";
};

export function UserMenu({ compact = false, tone = "sidebar" }: UserMenuProps) {
  const { user } = useSession();
  const signOut = useSignOut();
  const setChangePasswordOpen = useUiStore((state) => state.setChangePasswordOpen);
  const { theme, switchTheme } = useThemeSwitch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={compact ? `Account menu for ${user?.fullName ?? "user"}` : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-sm text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            compact ? "size-9 justify-center" : "px-2 py-2",
            tone === "sidebar"
              ? "text-sidebar-foreground hover:bg-white/5 aria-expanded:bg-white/5"
              : "text-foreground hover:bg-surface-sunken aria-expanded:bg-surface-sunken",
          )}
        >
          <Avatar name={user?.fullName} className={tone === "sidebar" ? "bg-brand-400/20 text-brand-300" : undefined} />
          {!compact ? (
            <>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body-sm font-medium">{user?.fullName}</span>
                <span className="truncate text-caption capitalize text-foreground-subtle">{user?.roleName}</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={compact ? "bottom" : "top"} className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-body-sm font-medium text-foreground">{user?.fullName}</span>
          <span className="text-caption text-foreground-muted">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setChangePasswordOpen(true)}>
          <KeyRound /> Change password
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === "dark" ? <Moon /> : theme === "light" ? <Sun /> : <Monitor />}
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => switchTheme(value as "light" | "dark" | "system")}>
              <DropdownMenuRadioItem value="light">
                <Sun /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => void signOut()}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

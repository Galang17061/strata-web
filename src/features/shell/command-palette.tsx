"use client";

import { useRouter } from "next/navigation";
import { LogOut, Palette, SunMoon } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useThemeSwitch } from "@/components/theme/theme-toggle";
import { useAllowed } from "@/features/auth/permission-gate";
import { useSignOut } from "@/features/auth/session";
import { navGroups, type NavItem } from "@/features/shell/nav-config";
import { useUiStore } from "@/features/shell/ui-store";

function PageItem({ item, onPick }: { item: NavItem; onPick: (href: string) => void }) {
  const allowed = useAllowed({ moduleName: item.moduleName, permission: "view", requireRole: item.requireRole });
  if (!allowed) return null;
  return (
    <CommandItem value={`page ${item.label}`} onSelect={() => onPick(item.href)}>
      <item.icon /> {item.label}
    </CommandItem>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((state) => state.paletteOpen);
  const setOpen = useUiStore((state) => state.setPaletteOpen);
  const scopes = useUiStore((state) => state.paletteScopes);
  const signOut = useSignOut();
  const { theme, resolvedTheme, switchTheme } = useThemeSwitch();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!useUiStore.getState().paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const scoped = useMemo(
    () => Object.entries(scopes).filter(([, items]) => items.length > 0),
    [scopes],
  );

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const toggleTheme = () => {
    setOpen(false);
    switchTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a page or run an action" />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>
        <CommandGroup heading="Pages">
          {navGroups.flatMap((group) => group.items).map((item) => (
            <PageItem key={item.href} item={item} onPick={go} />
          ))}
        </CommandGroup>
        {scoped.map(([scope, items]) => (
          <CommandGroup key={scope} heading={scope}>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${scope} ${item.label} ${(item.keywords ?? []).join(" ")}`}
                onSelect={() => {
                  setOpen(false);
                  if (item.href) router.push(item.href);
                  item.run?.();
                }}
              >
                <Palette />
                <span className="truncate">{item.label}</span>
                {item.hint ? <CommandShortcut>{item.hint}</CommandShortcut> : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="action toggle theme dark light" onSelect={toggleTheme}>
            <SunMoon /> Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
            <CommandShortcut>{theme}</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="action sign out"
            onSelect={() => {
              setOpen(false);
              void signOut();
            }}
          >
            <LogOut /> Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { durationMs, easingValue, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ThemeChoice = "light" | "dark" | "system";

const choices: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

export function useThemeSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchTheme = (next: ThemeChoice, origin?: { x: number; y: number }) => {
    const doc = document as TransitionDocument;
    if (!doc.startViewTransition || prefersReducedMotion() || !origin) {
      const root = document.documentElement;
      root.classList.add("theme-fading");
      setTheme(next);
      window.setTimeout(() => root.classList.remove("theme-fading"), durationMs("--dur-base"));
      return;
    }
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: durationMs("--dur-slow"),
          easing: easingValue("--ease-emphasized"),
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return {
    mounted,
    theme: (mounted ? (theme as ThemeChoice | undefined) ?? "system" : "system") as ThemeChoice,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    switchTheme,
  };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, switchTheme } = useThemeSwitch();

  const handleChoice = (value: ThemeChoice) => (event: MouseEvent<HTMLButtonElement>) => {
    switchTheme(value, { x: event.clientX, y: event.clientY });
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-pill border border-border bg-surface-sunken p-0.5",
        className,
      )}
    >
      {choices.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <Button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            variant="ghost"
            size="icon-sm"
            onClick={handleChoice(value)}
            className={cn(
              "rounded-pill text-foreground-muted hover:text-foreground",
              active && "bg-surface text-foreground shadow-sm hover:bg-surface",
            )}
          >
            <Icon aria-hidden="true" />
          </Button>
        );
      })}
    </div>
  );
}

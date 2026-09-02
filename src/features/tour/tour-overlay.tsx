"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { tracks } from "@/features/tour/steps";
import { useTourStore } from "@/features/tour/store";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;

export function spotlightFrom(rect: Rect, pad = PAD): Rect {
  return {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
}

export function TourOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { track, step, next, back, stop } = useTourStore();
  const steps = track ? tracks[track] : null;
  const current = steps ? steps[step] : null;
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!current) return;
    if (current.route && !pathname.startsWith(current.route.replace(/\/$/, ""))) {
      router.push(current.route);
    }
  }, [current, pathname, router]);

  useEffect(() => {
    if (!current) {
      setRect(null);
      return;
    }
    let seen = false;
    const measure = () => {
      const element = document.querySelector(current.target);
      if (!element) {
        setRect(null);
        return;
      }
      if (!seen) {
        seen = true;
        element.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      const box = element.getBoundingClientRect();
      setRect((previous) => {
        const value = { top: box.top, left: box.left, width: box.width, height: box.height };
        if (
          previous &&
          Math.abs(previous.top - value.top) < 1 &&
          Math.abs(previous.left - value.left) < 1 &&
          Math.abs(previous.width - value.width) < 1 &&
          Math.abs(previous.height - value.height) < 1
        ) {
          return previous;
        }
        return value;
      });
    };
    measure();
    const timer = window.setInterval(measure, 150);
    return () => window.clearInterval(timer);
  }, [current]);

  useEffect(() => {
    if (!track) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [track, stop]);

  if (!track || !steps || !current) return null;

  const hole = rect ? spotlightFrom(rect) : null;
  const last = step === steps.length - 1;
  const shade = "absolute bg-brand-950/60 backdrop-blur-[2px]";
  const cardTop = hole
    ? hole.top + hole.height + 12 + 220 < window.innerHeight
      ? hole.top + hole.height + 12
      : Math.max(12, hole.top - 232)
    : window.innerHeight / 2 - 110;
  const cardLeft = hole ? Math.min(Math.max(12, hole.left), window.innerWidth - 340) : window.innerWidth / 2 - 164;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Product tour">
      {hole ? (
        <>
          <div className={shade} style={{ top: 0, left: 0, right: 0, height: Math.max(0, hole.top) }} />
          <div className={shade} style={{ top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height }} />
          <div
            className={shade}
            style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }}
          />
          <div className={shade} style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
          <div
            className="pointer-events-none absolute rounded-md ring-2 ring-primary"
            style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
          />
        </>
      ) : (
        <div className={shade} style={{ inset: 0 }} />
      )}
      <div
        className="absolute flex w-80 flex-col gap-3 rounded-md border border-border bg-surface p-4 shadow-lg"
        style={{ top: cardTop, left: cardLeft }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-h3">{current.title}</p>
          <p className="shrink-0 font-mono text-caption text-foreground-muted">
            {step + 1}/{steps.length}
          </p>
        </div>
        <p className="text-body-sm text-foreground-muted">{current.body}</p>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={stop}>
            Skip tour
          </Button>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="secondary" size="sm" onClick={back}>
                Back
              </Button>
            ) : null}
            <Button size="sm" onClick={last ? stop : next}>
              {last ? "Done" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

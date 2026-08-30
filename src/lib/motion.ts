import { useState } from "react";

export type DurationToken =
  | "--dur-fast"
  | "--dur-base"
  | "--dur-slow"
  | "--dur-reveal"
  | "--dur-count"
  | "--dur-pulse"
  | "--dur-scene-loop";

export function durationMs(token: DurationToken): number {
  if (typeof window === "undefined") return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (raw.endsWith("ms")) return Number.parseFloat(raw);
  if (raw.endsWith("s")) return Number.parseFloat(raw) * 1000;
  return 0;
}

export function durationSeconds(token: DurationToken): number {
  return durationMs(token) / 1000;
}

export function easingValue(token: "--ease-standard" | "--ease-emphasized" | "--ease-exit"): string {
  if (typeof window === "undefined") return "ease";
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "ease";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const easeStandard = [0.2, 0, 0, 1] as const;
export const easeEmphasized = [0.05, 0.7, 0.1, 1] as const;
export const easeExit = [0.3, 0, 0.8, 0.15] as const;

export type MotionTokens = {
  fast: number;
  base: number;
  slow: number;
  reveal: number;
  count: number;
  pulse: number;
  stagger: number;
  layerStagger: number;
  easeStandard: typeof easeStandard;
  easeEmphasized: typeof easeEmphasized;
  easeExit: typeof easeExit;
};

function readSeconds(token: string): number {
  if (typeof window === "undefined") return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (raw.endsWith("ms")) return Number.parseFloat(raw) / 1000;
  if (raw.endsWith("s")) return Number.parseFloat(raw);
  return 0;
}

export function readMotionTokens(): MotionTokens {
  return {
    fast: readSeconds("--dur-fast"),
    base: readSeconds("--dur-base"),
    slow: readSeconds("--dur-slow"),
    reveal: readSeconds("--dur-reveal"),
    count: readSeconds("--dur-count"),
    pulse: readSeconds("--dur-pulse"),
    stagger: readSeconds("--stagger"),
    layerStagger: readSeconds("--stagger-layer"),
    easeStandard,
    easeEmphasized,
    easeExit,
  };
}

export function useMotionTokens(): MotionTokens {
  const [tokens] = useState(readMotionTokens);
  return tokens;
}

"use client";

import { Mark } from "@/components/brand/mark";
import { markLayerHeight } from "@/components/brand/mark-geometry";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  size?: number;
  animate?: boolean;
  className?: string;
  textClassName?: string;
  markOnly?: boolean;
};

export function Wordmark({
  size = 28,
  animate = false,
  className,
  textClassName,
  markOnly = false,
}: WordmarkProps) {
  const gap = (size * markLayerHeight) / 32;
  const fontSize = size * 0.78;

  return (
    <span
      className={cn("inline-flex items-center font-bold tracking-tight text-foreground", className)}
      style={{ gap }}
    >
      <Mark size={size} animate={animate} title="Strata" />
      {!markOnly && (
        <span className={cn("leading-none", textClassName)} style={{ fontSize }} aria-hidden="true">
          Strata
        </span>
      )}
    </span>
  );
}

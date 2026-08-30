"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type LayerCrumb = {
  id: string;
  name: string;
};

type LayerCrumbsProps = {
  items: LayerCrumb[];
  onSelect?: (item: LayerCrumb, index: number) => void;
  className?: string;
};

function DepthGlyph({ depth }: { depth: number }) {
  const bars = Math.min(Math.max(depth, 1), 4);
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
      {Array.from({ length: bars }).map((_, index) => {
        const width = 12 - (bars - 1 - index) * 3;
        const y = 10 - index * 3;
        return <rect key={index} x="0" y={y} width={width} height="2" rx="0.5" />;
      })}
    </svg>
  );
}

export function LayerCrumbs({ items, onSelect, className }: LayerCrumbsProps) {
  return (
    <nav aria-label="Layer path" className={cn("flex items-center gap-1 overflow-x-auto", className)}>
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.id} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-foreground-subtle" />
              ) : null}
              <motion.button
                type="button"
                layout
                disabled={isLast || !onSelect}
                aria-current={isLast ? "location" : undefined}
                onClick={() => onSelect?.(item, index)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-sm border px-2 text-body-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isLast
                    ? "border-primary/40 bg-accent font-medium text-accent-foreground"
                    : "border-border bg-surface text-foreground-muted hover:bg-surface-sunken hover:text-foreground",
                )}
              >
                <DepthGlyph depth={index + 1} />
                {item.name}
              </motion.button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

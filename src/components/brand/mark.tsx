"use client";

import { motion } from "motion/react";
import {
  markLayerHeight,
  markLayerRadius,
  markLayerX,
  markLayers,
} from "@/components/brand/mark-geometry";
import { useMotionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MarkProps = {
  size?: number;
  animate?: boolean;
  className?: string;
  title?: string;
};

export function Mark({ size = 32, animate = false, className, title = "Strata" }: MarkProps) {
  const tokens = useMotionTokens();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={title}
      fill="currentColor"
      className={cn("shrink-0 text-primary", className)}
    >
      {markLayers.map((layer, index) =>
        animate ? (
          <motion.rect
            key={layer.y}
            x={markLayerX}
            y={layer.y}
            width={layer.width}
            height={markLayerHeight}
            rx={markLayerRadius}
            initial={{ opacity: 0, y: markLayerHeight }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: tokens.slow,
              delay: index * tokens.layerStagger,
              ease: tokens.easeEmphasized,
            }}
          />
        ) : (
          <rect
            key={layer.y}
            x={markLayerX}
            y={layer.y}
            width={layer.width}
            height={markLayerHeight}
            rx={markLayerRadius}
          />
        ),
      )}
    </svg>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";
import { useMotionTokens } from "@/lib/motion";

type PathDrawProps = Omit<ComponentProps<typeof motion.path>, "d"> & {
  d: string;
  delay?: number;
  duration?: number;
  active?: boolean;
};

export function PathDraw({ d, delay = 0, duration, active = true, ...props }: PathDrawProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const drawn = reduced || !active;

  return (
    <motion.path
      d={d}
      fill="none"
      initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      animate={
        drawn
          ? { pathLength: 1, opacity: 1 }
          : { pathLength: [0, 1], opacity: [0, 1, 1] }
      }
      transition={
        reduced
          ? { duration: 0 }
          : { duration: duration ?? tokens.reveal, delay, ease: tokens.easeStandard }
      }
      {...props}
    />
  );
}

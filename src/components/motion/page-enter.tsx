"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMotionTokens } from "@/lib/motion";

type PageEnterProps = {
  children: ReactNode;
  className?: string;
};

export function PageEnter({ children, className }: PageEnterProps) {
  const tokens = useMotionTokens();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: tokens.slow, ease: tokens.easeEmphasized }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

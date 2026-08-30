"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useMotionTokens } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
};

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const tokens = useMotionTokens();
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: tokens.reveal, delay, ease: tokens.easeEmphasized }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function useStaggerVariants(): { parent: Variants; child: Variants } {
  const tokens = useMotionTokens();
  return {
    parent: {
      hidden: {},
      visible: { transition: { staggerChildren: tokens.stagger, delayChildren: tokens.fast } },
    },
    child: {
      hidden: { opacity: 0, y: 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: tokens.reveal, ease: tokens.easeEmphasized },
      },
    },
  };
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
  inView?: boolean;
};

export function Stagger({ children, className, as = "div", inView = true }: StaggerProps) {
  const { parent } = useStaggerVariants();
  const Component = motion[as];
  return (
    <Component
      variants={parent}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-20% 0px" } }
        : { animate: "visible" })}
      className={className}
    >
      {children}
    </Component>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
};

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const { child } = useStaggerVariants();
  const Component = motion[as];
  return (
    <Component variants={child} className={className}>
      {children}
    </Component>
  );
}

"use client";

import { motion } from "motion/react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useMotionTokens } from "@/lib/motion";

function ModelIcon() {
  const tokens = useMotionTokens();
  const layers = [
    { y: 26, width: 32 },
    { y: 17, width: 24 },
    { y: 8, width: 16 },
  ];
  return (
    <svg viewBox="0 0 40 40" className="size-10 text-primary" fill="currentColor" aria-hidden="true">
      {layers.map((layer, index) => (
        <motion.rect
          key={layer.y}
          x={4}
          y={layer.y}
          width={layer.width}
          height={6}
          rx={1}
          variants={{ rest: { x: 0 }, hover: { x: index * 3 } }}
          transition={{ duration: tokens.base, ease: tokens.easeEmphasized }}
        />
      ))}
    </svg>
  );
}

function WireIcon() {
  const tokens = useMotionTokens();
  return (
    <svg viewBox="0 0 40 40" className="size-10 text-primary" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="15" width="10" height="10" rx="2" />
      <rect x="27" y="5" width="10" height="10" rx="2" />
      <rect x="27" y="25" width="10" height="10" rx="2" />
      <motion.path
        d="M13 20c6 0 8-10 14-10M13 20c6 0 8 10 14 10"
        variants={{ rest: { pathLength: 1, opacity: 0.6 }, hover: { pathLength: [0, 1], opacity: 1 } }}
        transition={{ duration: tokens.reveal, ease: tokens.easeStandard }}
      />
    </svg>
  );
}

function ScoreIcon() {
  const tokens = useMotionTokens();
  return (
    <svg viewBox="0 0 40 40" className="size-10 text-primary" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M5 5v30h30" className="opacity-60" />
      <motion.path
        d="M8 9c8 2 12 12 16 18s6 6 8 6"
        variants={{ rest: { pathLength: 1 }, hover: { pathLength: [0, 1] } }}
        transition={{ duration: tokens.reveal, ease: tokens.easeStandard }}
      />
      <motion.circle
        cx="24"
        cy="27"
        r="3"
        fill="currentColor"
        variants={{ rest: { scale: 1 }, hover: { scale: [1, 1.4, 1] } }}
        transition={{ duration: tokens.reveal, ease: tokens.easeStandard }}
      />
    </svg>
  );
}

const pillars = [
  {
    title: "Model",
    description:
      "Describe a system as a tree: system, subsystems, groups, and the physical components underneath.",
    icon: ModelIcon,
  },
  {
    title: "Wire",
    description:
      "Draw how blocks really connect on a canvas: series, parallel, mixed, or k-out-of-n redundancy.",
    icon: WireIcon,
  },
  {
    title: "Score",
    description:
      "Fit Weibull or Exponential curves from failure history and roll every layer up to one number.",
    icon: ScoreIcon,
  },
];

export function LandingPillars() {
  return (
    <section className="mx-auto w-full max-w-content px-6 py-16">
      <Stagger className="grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <StaggerItem key={pillar.title}>
            <motion.div initial="rest" whileHover="hover" animate="rest" className="h-full">
              <Card className="h-full gap-5">
                <pillar.icon />
                <div>
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription className="mt-2 text-body">{pillar.description}</CardDescription>
                </div>
              </Card>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { formatReliability } from "@/lib/format";
import { useMotionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Components",
    text: "Each physical part gets a distribution, running hours, and its failure history.",
    value: 0.9612,
  },
  {
    title: "Level 3",
    text: "Groups of components are wired on the canvas and scored from their parts.",
    value: 0.9418,
  },
  {
    title: "Level 2",
    text: "Minor subsystems combine their groups; nothing is typed in by hand.",
    value: 0.9204,
  },
  {
    title: "Level 1",
    text: "Major subsystems inherit the numbers from below and pass them upward.",
    value: 0.9031,
  },
  {
    title: "System",
    text: "The whole system reads as one figure, with the path back to every part.",
    value: 0.8877,
  },
];

export function LandingHowItWorks() {
  const tokens = useMotionTokens();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.5"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(steps.length - 1, Math.floor(progress * steps.length));
    setActive(next);
  });

  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-surface">
      <div className="mx-auto grid w-full max-w-content gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
        <div className="flex flex-col gap-10">
          <Reveal>
            <p className="text-caption uppercase text-primary">How it works</p>
            <h2 className="mt-2 text-h1">Every layer is scored from the layer below.</h2>
          </Reveal>
          <div ref={ref} className="relative pl-8">
            <div className="absolute top-2 bottom-2 left-2 w-px bg-border" aria-hidden="true" />
            <motion.div
              className="absolute top-2 bottom-2 left-2 w-px origin-top bg-primary"
              style={{ scaleY: lineScale }}
              aria-hidden="true"
            />
            <ol className="flex flex-col gap-12">
              {steps.map((step, index) => (
                <li key={step.title} className="relative">
                  <span
                    className={cn(
                      "absolute top-1.5 -left-8 size-[13px] -translate-x-[6px] rounded-pill border-2 bg-surface transition-colors duration-(--dur-base)",
                      index <= active ? "border-primary" : "border-border-strong",
                    )}
                    aria-hidden="true"
                  />
                  <h3 className={cn("text-h3 transition-colors duration-(--dur-base)", index === active ? "text-foreground" : "text-foreground-muted")}>
                    {step.title}
                  </h3>
                  <p className="mt-1 max-w-md text-body text-foreground-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="lg:sticky lg:top-32 lg:self-start">
          <svg viewBox="0 0 360 360" className="mx-auto w-full max-w-md" role="img" aria-label="Five stacked layers lighting up from the bottom as their values pass upward">
            {steps.map((step, index) => {
              const level = steps.length - 1 - index;
              const width = 200 + level * 30;
              const x = (360 - width) / 2;
              const y = 36 + level * 60;
              const lit = index <= active;
              return (
                <motion.g
                  key={step.title}
                  animate={{ opacity: lit ? 1 : 0.7, y: lit ? 0 : 4 }}
                  transition={{ duration: tokens.base, ease: tokens.easeEmphasized }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={44}
                    rx={10}
                    strokeWidth={1.5}
                    className={cn(
                      "transition-colors duration-(--dur-base)",
                      lit ? "fill-accent stroke-primary" : "fill-surface-sunken stroke-border",
                    )}
                  />
                  <text x={x + 16} y={y + 27} className={cn("text-[13px] font-semibold", lit ? "fill-accent-foreground" : "fill-foreground-muted")}>
                    {step.title}
                  </text>
                  <motion.text
                    x={x + width - 16}
                    y={y + 27}
                    textAnchor="end"
                    className="fill-foreground font-mono text-[13px] font-medium tabular-nums"
                    animate={{ opacity: lit ? 1 : 0 }}
                    transition={{ duration: tokens.base }}
                  >
                    {formatReliability(step.value, 4)}
                  </motion.text>
                  {index < steps.length - 1 ? (
                    <motion.path
                      d={`M180 ${y - 2} v-12`}
                      className="stroke-primary"
                      strokeWidth={2}
                      strokeLinecap="round"
                      animate={{ opacity: index < active ? 1 : 0, pathLength: index < active ? 1 : 0 }}
                      transition={{ duration: tokens.base }}
                    />
                  ) : null}
                </motion.g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}

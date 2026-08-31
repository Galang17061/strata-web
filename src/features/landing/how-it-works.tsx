"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { formatReliability } from "@/lib/format";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Components",
    text: "Each physical part gets a distribution, running hours, and its failure history.",
  },
  {
    title: "Groups",
    text: "Parts are wired on the canvas into groups and scored straight from their parts.",
  },
  {
    title: "Sub-systems",
    text: "Groups fold into sub-systems, as many layers deep as the system really goes.",
  },
  {
    title: "Layers upward",
    text: "Each layer inherits the numbers from below and passes them on; nothing is typed by hand.",
  },
  {
    title: "System",
    text: "The whole system reads as one figure, with the path back to every part.",
  },
];

const BASE_RELIABILITY = 0.9612;
const LAYER_FACTOR = 0.98;

type BuiltLayer = {
  id: string;
  kind: "base" | "sub" | "system";
  value: number;
};

export function buildLayers(subIds: string[]): BuiltLayer[] {
  const bottomUp: Omit<BuiltLayer, "value">[] = [
    { id: "components", kind: "base" },
    ...subIds.map((id) => ({ id, kind: "sub" as const })),
    { id: "system", kind: "system" as const },
  ];
  return bottomUp.map((layer, height) => ({ ...layer, value: BASE_RELIABILITY * LAYER_FACTOR ** height }));
}

function LayerBuilder() {
  const layers = buildLayers(["sub-a", "sub-b", "sub-c"]);
  const topDown = [...layers].reverse();

  let subLabel = 0;

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2.5">
        {topDown.map((layer) => {
          if (layer.kind === "sub") subLabel += 1;
          const isSystem = layer.kind === "system";
          const isBase = layer.kind === "base";
          const label = isSystem ? "System" : isBase ? "Components" : `Sub-system ${subLabel}`;
          return (
            <li
              key={layer.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-4 py-3",
                (isSystem || isBase) && "border-primary bg-accent",
                layer.kind === "sub" && "border-border-strong bg-surface",
              )}
            >
              <span className={cn("text-body-sm font-semibold", isSystem || isBase ? "text-accent-foreground" : "text-foreground")}>{label}</span>
              <span className="font-mono text-body-sm font-medium tabular-nums text-foreground">{formatReliability(layer.value, 4)}</span>
            </li>
          );
        })}
      </ol>
      <p className="text-body-sm text-foreground-muted">
        Each sub-system sits in series, so the figure at the top settles a little lower than the parts beneath it.
      </p>
    </div>
  );
}

export function LandingHowItWorks() {
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
          <div className="rounded-xl border border-border bg-surface-sunken/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-caption uppercase text-primary">Live model</p>
              <p className="text-caption text-foreground-muted">Scored bottom to top</p>
            </div>
            <LayerBuilder />
          </div>
        </div>
      </div>
    </section>
  );
}

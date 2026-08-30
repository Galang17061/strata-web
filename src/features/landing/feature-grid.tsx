"use client";

import {
  Activity,
  FileSpreadsheet,
  GitFork,
  History,
  ShieldCheck,
  Sigma,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const features = [
  {
    icon: Sigma,
    title: "Automatic formulas",
    text: "Every wiring on the canvas becomes a formula, regenerated up the tree when a link changes.",
  },
  {
    icon: GitFork,
    title: "k-out-of-n redundancy",
    text: "Series, parallel, and partial redundancy per block, with identical components expanded for you.",
  },
  {
    icon: Activity,
    title: "Failure log to λ and MTBF",
    text: "Record failure events; failure rate, MTBF, and Weibull parameters follow from the history.",
  },
  {
    icon: History,
    title: "Reliability history",
    text: "Each calculation is kept with its formula and inputs, so any figure can be traced back.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel import and export",
    text: "Bring the component catalogue in from a sheet, preview the rows, and take it out again.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    text: "Administrators, engineers, and viewers each see and touch only what their role allows.",
  },
];

export function LandingFeatureGrid() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-content px-6 py-20 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-caption uppercase text-primary">Features</p>
          <h2 className="mt-2 text-h1">Built for the way reliability work actually goes.</h2>
        </Reveal>
        <Stagger as="ul" className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem as="li" key={feature.title} className="flex flex-col gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-h3">{feature.title}</h3>
              <p className="text-body-sm text-foreground-muted">{feature.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

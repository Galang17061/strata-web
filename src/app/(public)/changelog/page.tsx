import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "Changelog",
  description: "The major milestones of Strata, dated and real.",
};

const entries = [
  {
    date: "3 September 2026",
    title: "Sign-in remembers you, and the tour goes public",
    text: "A public demo page with the guided three-minute film and clickable chapters, plain-language terms and privacy pages, and a remember-me choice on sign-in that decides whether the session outlives the browser.",
  },
  {
    date: "1 September 2026",
    title: "Optimization studio",
    text: "A genetic search over vendor combinations: pick a goal (pure reliability, a budget cap, or a balance), watch candidate line-ups being scored against your real diagram, re-pick and pin any row, and keep the winner as a brand-new project.",
  },
  {
    date: "31 August 2026",
    title: "Poisson joins Weibull and Exponential",
    text: "Components can now carry a Poisson model with an allowed-failures count, fitted from the failure log with one button; the curve, the plots and the landing playground all understand it.",
  },
  {
    date: "31 August 2026",
    title: "Hierarchies as deep as the machine",
    text: "Each project chooses how many levels its systems nest, from one to ten, instead of a fixed three.",
  },
  {
    date: "30 August 2026",
    title: "Strata launches",
    text: "A rebuilt calculation engine and a new web app: reliability block diagrams, bottom-up scoring, k-out-of-n redundancy, Weibull fitting from failure history, and plots over time, verified against known results to eight decimal places.",
  },
];

export default function ChangelogPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24">
        <h1 className="text-h1 sm:text-display">Changelog</h1>
        <p className="mt-4 text-body text-foreground-muted">
          The big steps only, in the order they actually shipped.
        </p>
        <ol className="mt-12 flex flex-col gap-10 border-l border-border pl-6">
          {entries.map((entry) => (
            <li key={entry.title} className="relative">
              <span className="absolute top-1.5 -left-[27.5px] size-2 rounded-full bg-primary" />
              <p className="font-mono text-caption text-foreground-muted">{entry.date}</p>
              <h2 className="mt-1 text-h2">{entry.title}</h2>
              <p className="mt-2 text-body text-foreground-muted">{entry.text}</p>
            </li>
          ))}
        </ol>
      </main>
      <LandingFooter />
    </>
  );
}

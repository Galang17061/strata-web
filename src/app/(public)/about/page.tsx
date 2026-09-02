import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "About",
  description: "Who builds Strata, why it exists, and how to reach the maker.",
};

export default function AboutPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24">
        <h1 className="text-h1 sm:text-display">About Strata</h1>
        <p className="mt-4 text-body text-foreground-muted">
          Strata exists because reliability engineering deserves better tools than
          spreadsheets and wishful thinking.
        </p>
        <section className="mt-12">
          <h2 className="text-h2">What it is</h2>
          <p className="mt-3 text-body text-foreground-muted">
            Strata is a workbench for reliability block diagrams. You model an engineered
            system as layers of blocks — system, sub-systems, components — wire them the way
            they really connect, feed in the failure history, and Strata computes, from the
            parts up, how likely the whole thing still works after any number of running
            hours. On top of that sits an optimization studio that searches vendor
            combinations for the strongest line-up your budget allows.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">The idea behind it</h2>
          <p className="mt-3 text-body text-foreground-muted">
            The mathematics here is not new — Weibull analysis, exponential and Poisson
            models, k-out-of-n redundancy, genetic search. What is usually missing is a
            place where the mathematics lives next to the diagram, so the number on the
            screen always has a path back to the part that produced it. Strata is that
            place: pure, honest mathematics applied to your machine, with nothing typed by
            hand that the model can derive.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Who builds it</h2>
          <p className="mt-3 text-body text-foreground-muted">
            Strata is designed and built by Galang, an engineer who kept meeting the same
            gap between reliability theory and the tools on the desk. It is a small,
            deliberate product: every release is tested against known results to eight
            decimal places before it ships.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Reach the maker</h2>
          <p className="mt-3 text-body text-foreground-muted">
            Questions, ideas, or interest in running Strata for your organisation:
            write to{" "}
            <a
              href="mailto:reformantoko@gmail.com"
              className="rounded-sm underline underline-offset-4 hover:text-foreground"
            >
              reformantoko@gmail.com
            </a>
            . For a quick look at the product first, the{" "}
            <a href="/demo/" className="rounded-sm underline underline-offset-4 hover:text-foreground">
              three-minute demo
            </a>{" "}
            is the fastest tour.
          </p>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}

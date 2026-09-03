import { Check } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

const included = [
  "Reliability block diagrams with layers as deep as the machine",
  "Exponential, Weibull and Poisson models, fitted from your own failure log",
  "The optimization studio: vendor line-ups searched against your real diagram",
  "Versions of every system, restorable at any time",
  "Printable reports and Excel exports",
  "Invitations, roles, audit trail and reliability alerts",
];

export const metadata: Metadata = {
  title: "Pricing",
  description: "What Strata costs while it is in early access.",
};

export default function PricingPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-content px-6 pt-32 pb-24">
        <h1 className="max-w-2xl text-h1 sm:text-display">Pricing</h1>
        <p className="mt-4 max-w-xl text-body text-foreground-muted">
          Strata is in early access: simple terms, arranged personally, no card forms.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-5 rounded-lg border-2 border-primary bg-surface p-8">
            <div>
              <h2 className="text-h2">Early access</h2>
              <p className="mt-1 text-body text-foreground-muted">
                Everything Strata can do, for your whole team, while the product grows.
              </p>
            </div>
            <p className="text-display">
              Let&apos;s talk<span className="ml-2 text-body text-foreground-muted">— priced to fit, settled by invoice</span>
            </p>
            <ul className="flex flex-col gap-2">
              {included.map((line) => (
                <li key={line} className="flex items-start gap-2 text-body">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="self-start">
              <a href="mailto:reformantoko@gmail.com?subject=Strata%20early%20access">Write to the maker</a>
            </Button>
          </section>
          <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-8">
            <div>
              <h2 className="text-h2 text-foreground-muted">Self-serve plans</h2>
              <p className="mt-1 text-body text-foreground-muted">
                Monthly subscriptions with online payment arrive when Strata opens publicly.
                Early-access teams keep their arranged terms.
              </p>
            </div>
            <p className="text-body-sm text-foreground-muted">
              Until then the demo is open to everyone, and the terms and privacy pages say
              exactly how your data is treated — no surprises saved for the fine print.
            </p>
            <Button asChild variant="secondary" className="self-start">
              <a href="/demo/">Watch the demo first</a>
            </Button>
          </section>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}

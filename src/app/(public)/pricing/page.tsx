import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

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
      </main>
      <LandingFooter />
    </>
  );
}

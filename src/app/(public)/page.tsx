import type { Metadata } from "next";
import { LandingCta } from "@/features/landing/cta";
import { LandingFeatureGrid } from "@/features/landing/feature-grid";
import { LandingFooter } from "@/features/landing/footer";
import { LandingHero } from "@/features/landing/hero";
import { LandingHowItWorks } from "@/features/landing/how-it-works";
import { LandingLiveCurve } from "@/features/landing/live-curve";
import { LandingNav } from "@/features/landing/nav";
import { LandingPillars } from "@/features/landing/pillars";

export const metadata: Metadata = {
  title: { absolute: "Strata — reliability, layer by layer" },
  description:
    "Model your system as layers of blocks, wire them the way they really connect, and let Strata score every layer from the parts up.",
};

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main className="flex flex-col">
        <LandingHero />
        <LandingPillars />
        <LandingHowItWorks />
        <LandingLiveCurve />
        <LandingFeatureGrid />
        <LandingCta />
      </main>
      <LandingFooter />
    </>
  );
}

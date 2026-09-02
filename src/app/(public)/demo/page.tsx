import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "Demo",
  description: "Watch a guided tour of Strata, from the master data to a scored system.",
};

export default function DemoPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-content px-6 pt-32 pb-24">
        <h1 className="max-w-2xl text-h1 sm:text-display">See Strata at work</h1>
        <p className="mt-4 max-w-xl text-body text-foreground-muted">
          A guided tour in just over three minutes: from the parts catalogue to a wired
          diagram, a fitted curve, and a vendor line-up picked by the search.
        </p>
        <video
          controls
          preload="metadata"
          playsInline
          className="mt-10 w-full"
          src="/media/strata-tutorial.mp4"
        />
      </main>
      <LandingFooter />
    </>
  );
}

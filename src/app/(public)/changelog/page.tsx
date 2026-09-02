import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "Changelog",
  description: "The major milestones of Strata, dated and real.",
};

export default function ChangelogPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24">
        <h1 className="text-h1 sm:text-display">Changelog</h1>
        <p className="mt-4 text-body text-foreground-muted">
          The big steps only, in the order they actually shipped.
        </p>
      </main>
      <LandingFooter />
    </>
  );
}

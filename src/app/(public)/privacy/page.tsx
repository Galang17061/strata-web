import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Strata stores, why it stores it, and what it will never do with it.",
};

export default function PrivacyPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24">
        <h1 className="text-h1 sm:text-display">Privacy policy</h1>
        <p className="mt-4 text-body text-foreground-muted">
          Strata holds engineering data on your behalf. This page says plainly what is
          stored, why, and what will never happen to it.
        </p>
      </main>
      <LandingFooter />
    </>
  );
}

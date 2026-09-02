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
      </main>
      <LandingFooter />
    </>
  );
}

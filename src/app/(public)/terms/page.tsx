import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The plain-language rules for using Strata.",
};

export default function TermsPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24">
        <h1 className="text-h1 sm:text-display">Terms of service</h1>
        <p className="mt-4 text-body text-foreground-muted">
          Strata is an engineering tool, and these terms are written the way the app is
          built: plainly. By signing in and using Strata you agree to what follows.
        </p>
      </main>
      <LandingFooter />
    </>
  );
}

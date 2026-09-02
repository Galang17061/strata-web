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
        <section className="mt-12">
          <h2 className="text-h2">Accounts and roles</h2>
          <p className="mt-3 text-body text-foreground-muted">
            Accounts are created by an administrator, and each account carries a role that
            decides what it may see and change. Keep your password to yourself; whatever
            happens under your sign-in counts as yours. If you believe an account has been
            compromised, tell your administrator so the password can be reset.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Your data stays yours</h2>
          <p className="mt-3 text-body text-foreground-muted">
            The projects, systems, diagrams, failure histories and vendor records you enter
            belong to you and your organisation. Strata stores them only to compute and show
            your results, and does not share them with anyone else. Administrators can
            export the data at any time, and removing it removes it.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Numbers support decisions, they do not make them</h2>
          <p className="mt-3 text-body text-foreground-muted">
            Every reliability figure is computed from the model and the history you provide.
            A prediction is only as good as its inputs, and no figure here replaces an
            engineering review, a safety case or a regulatory approval. Decisions taken on
            top of the numbers remain the responsibility of the people who take them.
          </p>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}

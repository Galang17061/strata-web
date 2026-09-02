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
        <section className="mt-10">
          <h2 className="text-h2">Fair use</h2>
          <p className="mt-3 text-body text-foreground-muted">
            Use Strata for the reliability work it was built for. Do not probe it for
            weaknesses, pull data you have no role for, flood it with automated traffic, or
            resell access to it. An account used that way can be closed without notice.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Availability, honestly</h2>
          <p className="mt-3 text-body text-foreground-muted">
            Strata is offered as it stands, without a promise of uninterrupted service.
            Maintenance windows, upgrades and faults happen; when they do, the aim is to be
            back quickly and to lose nothing. Keep exports of anything you cannot afford to
            retype.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Changes and questions</h2>
          <p className="mt-3 text-body text-foreground-muted">
            These terms may change as the product does; the date below always tells you
            which version you are reading, and meaningful changes will be visible here
            before they bind you. Questions about the terms go to your administrator or to
            the owner of your Strata deployment.
          </p>
        </section>
        <p className="mt-12 border-t border-border pt-6 text-body-sm text-foreground-muted">
          In force since 3 September 2026.
        </p>
      </main>
      <LandingFooter />
    </>
  );
}

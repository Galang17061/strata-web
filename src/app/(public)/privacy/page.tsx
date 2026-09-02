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
        <section className="mt-12">
          <h2 className="text-h2">What Strata stores</h2>
          <p className="mt-3 text-body text-foreground-muted">
            Three kinds of things: your account (name, username, email address, role, and a
            password that is stored encrypted, never in plain text); your engineering data
            (projects, systems, diagrams, component properties, failure histories, vendor
            records); and ordinary technical traces such as when an account last signed in.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Why it is stored</h2>
          <p className="mt-3 text-body text-foreground-muted">
            For exactly one purpose: computing and showing your reliability results. Nothing
            is collected for advertising, nothing is profiled, and no tracking follows you
            off this site. The public pages set no analytics cookies; signing in stores a
            token so the app knows it is you.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Who can see it</h2>
          <p className="mt-3 text-body text-foreground-muted">
            People in your own organisation, according to the roles your administrator set,
            and no one else. Your data is never sold, never shared with third parties, and
            never used to train anything. Whoever operates your Strata deployment can reach
            the database for maintenance and backups, and that access carries the same
            duty of confidentiality.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">How long it is kept</h2>
          <p className="mt-3 text-body text-foreground-muted">
            As long as your organisation uses Strata. Deleting a project, a component, or an
            account removes it from the working database; routine backups age out on their
            own schedule. When an organisation leaves, its data is exported on request and
            then removed.
          </p>
        </section>
        <section className="mt-10">
          <h2 className="text-h2">Your rights and questions</h2>
          <p className="mt-3 text-body text-foreground-muted">
            You may ask what is stored about you, ask for it to be corrected, or ask for
            your account to be removed — start with your administrator or the owner of your
            Strata deployment. Meaningful changes to this policy appear here, dated, before
            they apply.
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

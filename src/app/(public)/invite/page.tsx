import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageLoader } from "@/components/brand/loader";
import { Wordmark } from "@/components/brand/wordmark";
import { InviteForm } from "@/features/auth/invite-form";

export const metadata: Metadata = {
  title: "Accept invitation",
  description: "Create your Strata account from an invitation letter.",
};

export default function InvitePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Link href="/" aria-label="Strata home" className="rounded-sm">
        <Wordmark size={28} />
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <h1 className="text-h1">You are invited</h1>
        <p className="text-body text-foreground-muted">
          Pick your own username and password; the email and role are already set.
        </p>
      </div>
      <Suspense fallback={<PageLoader />}>
        <InviteForm />
      </Suspense>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageLoader } from "@/components/brand/loader";
import { Wordmark } from "@/components/brand/wordmark";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password with the link from your reset letter.",
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <Link href="/" aria-label="Strata home" className="rounded-sm">
        <Wordmark size={28} />
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <h1 className="text-h1">Set a new password</h1>
        <p className="text-body text-foreground-muted">
          You are here from a reset letter. Choose a new password and you are back in.
        </p>
      </div>
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

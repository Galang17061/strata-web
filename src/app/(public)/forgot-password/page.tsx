import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Ask for a reset letter by email.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <Link href="/" aria-label="Strata home" className="rounded-sm">
        <Wordmark size={28} />
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <h1 className="text-h1">Forgot your password?</h1>
        <p className="text-body text-foreground-muted">
          Tell us the email on your account and a reset letter will be on its way.
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content flex-col gap-6 px-6 py-16">
      <Link href="/" aria-label="Strata home" className="w-fit rounded-sm">
        <Wordmark size={28} />
      </Link>
      <h1 className="text-h1">Welcome back</h1>
      <p className="text-body text-foreground-muted">Signing in is on its way.</p>
    </main>
  );
}

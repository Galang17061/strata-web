import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { BrokenLinkIllustration } from "@/components/brand/illustrations";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content flex-col px-6 py-8">
      <Link href="/" aria-label="Strata home" className="w-fit rounded-sm">
        <Wordmark size={28} />
      </Link>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <BrokenLinkIllustration size={160} className="text-primary" />
        <div className="flex flex-col gap-2">
          <p className="text-caption uppercase text-foreground-muted">404</p>
          <h1 className="text-h1">This layer is not connected.</h1>
          <p className="max-w-md text-body text-foreground-muted">
            The address does not lead anywhere in Strata. It may have moved, or the link was mistyped.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft /> Back to the start
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/">
              <LayoutDashboard /> Go to the dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { swaggerUrl } from "@/lib/env";

export function LandingFooter() {
  const swagger = swaggerUrl();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-6 py-10 text-body-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
        <Wordmark size={24} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>Strata Web · Strata API</span>
          <Link
            href="/demo"
            className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            Demo
          </Link>
          <Link
            href="/about"
            className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            About
          </Link>
          <Link
            href="/changelog"
            className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            Changelog
          </Link>
          <Link
            href="/terms"
            className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            Privacy
          </Link>
          {swagger ? (
            <a
              href={swagger}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm underline-offset-4 hover:text-foreground hover:underline"
            >
              API reference
            </a>
          ) : null}
          <span>{year}</span>
        </div>
      </div>
    </footer>
  );
}

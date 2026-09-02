import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "Help",
  description: "How Strata works, topic by topic: from the catalogue to the optimization studio.",
};

const topics = [
  { id: "layers", title: "The idea: layers of blocks" },
  { id: "master-data", title: "The catalogue" },
  { id: "building", title: "Building a system" },
  { id: "predicting", title: "Predicting reliability" },
  { id: "failures", title: "Failures and fitting" },
  { id: "studio", title: "The optimization studio" },
];

export default function HelpPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-content px-6 pt-32 pb-24">
        <h1 className="text-h1 sm:text-display">Help</h1>
        <p className="mt-4 max-w-xl text-body text-foreground-muted">
          Everything the guided tour says, written down — plus the detail the film had no
          time for.
        </p>
        <div className="mt-12 flex flex-col gap-12 lg:flex-row">
          <nav aria-label="Help topics" className="lg:w-56 lg:shrink-0">
            <ol className="flex flex-col gap-1 lg:sticky lg:top-24">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <a
                    href={`#${topic.id}`}
                    className="block rounded-sm px-3 py-1.5 text-body-sm text-foreground-muted hover:bg-accent hover:text-foreground"
                  >
                    {topic.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="min-w-0 flex-1" />
        </div>
      </main>
      <LandingFooter />
    </>
  );
}

import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "Demo",
  description: "Watch a guided tour of Strata, from the master data to a scored system.",
};

const chapters = [
  { at: 0, title: "The idea: a machine as layers of blocks" },
  { at: 31, title: "The master data catalogue" },
  { at: 53, title: "Build the system on the canvas" },
  { at: 81, title: "Predict reliability bottom-up" },
  { at: 102, title: "Failures and the Weibull fit" },
  { at: 130, title: "How the vendor search thinks" },
  { at: 157, title: "The optimization studio" },
];

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DemoPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-content px-6 pt-32 pb-24">
        <h1 className="max-w-2xl text-h1 sm:text-display">See Strata at work</h1>
        <p className="mt-4 max-w-xl text-body text-foreground-muted">
          A guided tour in just over three minutes: from the parts catalogue to a wired
          diagram, a fitted curve, and a vendor line-up picked by the search.
        </p>
        <video
          controls
          preload="metadata"
          playsInline
          poster="/media/strata-tutorial-poster.jpg"
          className="mt-10 aspect-video w-full rounded-lg border border-border bg-black shadow-lg"
          src="/media/strata-tutorial.mp4"
        />
        <h2 className="mt-12 text-h2">What the tour covers</h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {chapters.map((chapter) => (
            <li
              key={chapter.at}
              className="flex items-baseline gap-3 rounded-md border border-border px-4 py-3"
            >
              <span className="font-mono text-caption text-foreground-muted">
                {clock(chapter.at)}
              </span>
              <span className="text-body">{chapter.title}</span>
            </li>
          ))}
        </ol>
      </main>
      <LandingFooter />
    </>
  );
}

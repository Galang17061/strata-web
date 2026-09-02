"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const chapters = [
  { at: 0, title: "The idea: a machine as layers of blocks" },
  { at: 31, title: "The master data catalogue" },
  { at: 53, title: "Build the system on the canvas" },
  { at: 81, title: "Predict reliability bottom-up" },
  { at: 102, title: "Failures and the Weibull fit" },
  { at: 130, title: "How the vendor search thinks" },
  { at: 157, title: "The optimization studio" },
];

export function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function chapterAt(seconds: number) {
  let index = 0;
  for (let i = 0; i < chapters.length; i += 1) {
    if (seconds >= chapters[i].at) index = i;
  }
  return index;
}

export function DemoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);

  const jumpTo = (index: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = chapters[index].at;
    void video.play();
    setActive(index);
  };

  return (
    <>
      <video
        ref={videoRef}
        controls
        preload="metadata"
        playsInline
        poster="/media/strata-tutorial-poster.jpg"
        onTimeUpdate={(event) => setActive(chapterAt(event.currentTarget.currentTime))}
        className="mt-10 aspect-video w-full rounded-lg border border-border bg-black shadow-lg"
        src="/media/strata-tutorial.mp4"
      />
      <h2 className="mt-12 text-h2">What the tour covers</h2>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {chapters.map((chapter, index) => (
          <li key={chapter.at}>
            <button
              type="button"
              onClick={() => jumpTo(index)}
              aria-current={index === active ? "true" : undefined}
              className={cn(
                "flex w-full items-baseline gap-3 rounded-md border px-4 py-3 text-left transition-colors duration-(--dur-base)",
                index === active
                  ? "border-primary/60 bg-primary/20"
                  : "border-border hover:border-primary/40",
              )}
            >
              <span className="font-mono text-caption text-foreground-muted">
                {clock(chapter.at)}
              </span>
              <span className="text-body">{chapter.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}

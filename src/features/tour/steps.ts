import type { TourTrack } from "@/features/tour/store";

export type TourStep = {
  id: string;
  target: string;
  title: string;
  body: string;
  route?: string;
  waitFor?: string;
};

export const tracks: Record<TourTrack, TourStep[]> = {
  product: [
    {
      id: "welcome",
      target: '[data-tour="/projects/"]',
      route: "/dashboard/",
      title: "Welcome to Strata",
      body: "Everything you model lives in a project. The sidebar is home base; Projects is where the work starts.",
    },
    {
      id: "to-projects",
      target: '[data-tour="/projects/"]',
      title: "Go to your projects",
      body: "Click Projects in the sidebar — the tour follows along.",
      waitFor: '[data-tour="new-project"]',
    },
    {
      id: "new-project",
      target: '[data-tour="new-project"]',
      title: "A project holds one machine",
      body: "Create a project here — name it and choose how many levels its systems may nest — or open one you already have. The tour continues on the project page.",
      waitFor: '[data-tour="new-system"]',
    },
    {
      id: "new-system",
      target: '[data-tour="new-system"]',
      title: "A system is the machine drawn out",
      body: "Create a system here, or open one from the list below. Either way you land on the canvas, where the tour picks up.",
      waitFor: '[data-tour="tree"]',
    },
    {
      id: "tree",
      target: '[data-tour="tree"]',
      title: "The layers panel",
      body: "Your system as a tree: sub-systems inside sub-systems, components at the leaves. Pick any layer to draw it; add deeper layers from here.",
    },
    {
      id: "canvas",
      target: '[data-tour="canvas"]',
      title: "The canvas",
      body: "Wire the blocks the way the machine really connects: series, parallel, or k-out-of-n. Every block wears its own chance of working, and the wiring becomes the formula.",
    },
    {
      id: "recalculate",
      target: '[data-tour="recalculate"]',
      title: "The first run",
      body: "When the drawing is saved, Recalculate walks the tree bottom-up — component, sub-system, system — and refreshes every figure at once.",
    },
    {
      id: "details",
      target: '[data-tour="details"]',
      title: "Where the numbers live",
      body: "The details panel follows your selection: reliability, MTBF, parameters and curves for whichever layer or part you are looking at. That is the whole loop — model, run, read.",
    },
  ],
  studio: [
    {
      id: "open",
      target: '[data-tour="optimize"]',
      title: "The optimization studio",
      body: "With a system open in the workspace, click Optimize. The studio searches vendor line-ups for the very diagram you are looking at.",
      waitFor: '[data-tour="ga-modes"]',
    },
    {
      id: "modes",
      target: '[data-tour="ga-modes"]',
      title: "Pick a goal",
      body: "Three ways to steer the search: the strongest system regardless of cost, the strongest within a budget, or a balance of budget and a reliability floor.",
    },
    {
      id: "run",
      target: '[data-tour="ga-run"]',
      title: "Let the search run",
      body: "Click Run the search: hundreds of candidate line-ups every round, bred and mutated like nature does it, each one scored on your real diagram. The tour waits for the results.",
      waitFor: '[data-tour="ga-table"]',
    },
    {
      id: "table",
      target: '[data-tour="ga-table"]',
      title: "Read the verdict",
      body: "Every part sits beside the vendor the search would give it, with the change in failure rate, cost and reliability. Disagree with a row? Re-pick it, pin it, and run again — pinned choices become fixed genes.",
    },
    {
      id: "apply",
      target: '[data-tour="ga-apply"]',
      title: "Keep what you like",
      body: "Use this line-up copies the whole system into a brand-new project with the chosen vendors in place. Your original drawing is never touched.",
    },
  ],
};

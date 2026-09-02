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
      body: "This button creates one. You give it a name and decide how many levels its systems may nest, from one to ten.",
    },
  ],
  studio: [],
};

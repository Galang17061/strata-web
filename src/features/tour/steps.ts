import type { TourTrack } from "@/features/tour/store";

export type TourStep = {
  id: string;
  target: string;
  title: string;
  body: string;
  route?: string;
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
  ],
  studio: [],
};

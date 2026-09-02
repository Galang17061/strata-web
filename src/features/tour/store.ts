import { create } from "zustand";

export type TourTrack = "product" | "studio";

type TourState = {
  track: TourTrack | null;
  step: number;
  start: (track: TourTrack) => void;
  next: () => void;
  back: () => void;
  stop: () => void;
};

export const useTourStore = create<TourState>((set) => ({
  track: null,
  step: 0,
  start: (track) => set({ track, step: 0 }),
  next: () => set((state) => ({ step: state.step + 1 })),
  back: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  stop: () => set({ track: null, step: 0 }),
}));

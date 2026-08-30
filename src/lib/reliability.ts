import { toNumber } from "@/lib/format";

export type ReliabilityBand = "high" | "good" | "moderate" | "low" | "none";

export const reliabilityBands: ReliabilityBand[] = ["high", "good", "moderate", "low", "none"];

export const reliabilityLabels: Record<ReliabilityBand, string> = {
  high: "High",
  good: "Moderate to High",
  moderate: "Moderate",
  low: "Low",
  none: "N/A",
};

export const reliabilityThresholds: { band: ReliabilityBand; from: number; to: number }[] = [
  { band: "high", from: 0.86, to: 1 },
  { band: "good", from: 0.76, to: 0.86 },
  { band: "moderate", from: 0.5, to: 0.76 },
  { band: "low", from: 0.1, to: 0.5 },
  { band: "none", from: 0, to: 0.1 },
];

export function reliabilityBand(value: unknown): ReliabilityBand {
  const parsed = toNumber(value);
  if (parsed === null) return "none";
  if (parsed >= 0.86 && parsed <= 1) return "high";
  if (parsed >= 0.76 && parsed < 0.86) return "good";
  if (parsed >= 0.5 && parsed < 0.76) return "moderate";
  if (parsed >= 0.1 && parsed < 0.5) return "low";
  return "none";
}

export function reliabilityLabel(value: unknown): string {
  return reliabilityLabels[reliabilityBand(value)];
}

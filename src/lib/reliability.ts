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

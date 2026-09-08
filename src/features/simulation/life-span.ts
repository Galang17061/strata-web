import { formatHours } from "@/lib/format";

const hoursInYear = 8760;

export function formatLifeSpan(hours: unknown, missionHours: number): string {
  const parsed = typeof hours === "number" ? hours : Number(hours);
  if (!Number.isFinite(parsed) || parsed <= 0) return formatHours(hours);
  if (parsed > missionHours * 1000) return "far beyond the mission";
  if (parsed < hoursInYear) return formatHours(parsed);
  const years = parsed / hoursInYear;
  const digits = years >= 100 ? 0 : 1;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(years)} years`;
}

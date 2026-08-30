export type ReliabilityPrecision = 4 | 8;

const EMPTY = "—";

export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function truncateDecimals(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  const truncated = Math.trunc(value * factor) / factor;
  return truncated.toFixed(decimals);
}

export function formatReliability(
  value: unknown,
  decimals: ReliabilityPrecision = 4,
): string {
  const parsed = toNumber(value);
  if (parsed === null) return EMPTY;
  return truncateDecimals(parsed, decimals);
}

export function formatPercent(value: unknown, decimals = 1): string {
  const parsed = toNumber(value);
  if (parsed === null) return EMPTY;
  return `${(parsed * 100).toFixed(decimals)}%`;
}

export function formatFailureRate(value: unknown): string {
  const parsed = toNumber(value);
  if (parsed === null) return EMPTY;
  if (parsed === 0) return "0";
  if (Math.abs(parsed) < 0.001) return parsed.toExponential(4);
  return parsed.toFixed(6);
}

export function formatHours(value: unknown): string {
  const parsed = toNumber(value);
  if (parsed === null) return EMPTY;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(parsed)} h`;
}

export function formatCount(value: unknown): string {
  const parsed = toNumber(value);
  if (parsed === null) return EMPTY;
  return new Intl.NumberFormat("en-US").format(parsed);
}

export function formatDate(value: unknown): string {
  if (typeof value !== "string" || value === "") return EMPTY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: unknown): string {
  if (typeof value !== "string" || value === "") return EMPTY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

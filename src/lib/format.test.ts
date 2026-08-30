import { describe, expect, it } from "vitest";
import {
  formatCount,
  formatDate,
  formatFailureRate,
  formatHours,
  formatPercent,
  formatReliability,
} from "./format";

describe("formatReliability", () => {
  it("shows four decimals in tables without rounding up", () => {
    expect(formatReliability(0.99999)).toBe("0.9999");
    expect(formatReliability("0.86")).toBe("0.8600");
  });

  it("shows eight decimals in detail panels", () => {
    expect(formatReliability(0.123456789, 8)).toBe("0.12345678");
    expect(formatReliability(1, 8)).toBe("1.00000000");
  });

  it("keeps a placeholder for missing values", () => {
    expect(formatReliability(null)).toBe("—");
    expect(formatReliability(undefined)).toBe("—");
    expect(formatReliability("not a number")).toBe("—");
  });
});

describe("other formats", () => {
  it("writes a failure rate readably at any scale", () => {
    expect(formatFailureRate(0)).toBe("0");
    expect(formatFailureRate(0.000012)).toBe("1.2000e-5");
    expect(formatFailureRate(0.25)).toBe("0.250000");
  });

  it("writes hours, counts, percents and dates", () => {
    expect(formatHours(12500)).toBe("12,500 h");
    expect(formatCount(1234567)).toBe("1,234,567");
    expect(formatPercent(0.875)).toBe("87.5%");
    expect(formatDate("2026-08-30T07:56:09Z")).toBe("30 Aug 2026");
    expect(formatDate("")).toBe("—");
  });
});

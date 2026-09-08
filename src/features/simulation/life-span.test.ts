import { describe, expect, it } from "vitest";
import { formatLifeSpan } from "@/features/simulation/life-span";
import { parseAnnouncements } from "@/features/simulation/use-job-stream";
import { survivalSeries } from "@/features/simulation/survival-chart";
import type { SimulationDiagram } from "@/features/simulation/types";

describe("formatLifeSpan", () => {
  it("keeps short lives in hours", () => {
    expect(formatLifeSpan(418.94, 1000)).toBe("418.94 h");
  });

  it("turns long lives into years", () => {
    expect(formatLifeSpan(44761.93, 1000)).toBe("5.1 years");
  });

  it("gives up on lives that dwarf the mission", () => {
    expect(formatLifeSpan(74654404451, 1000)).toBe("far beyond the mission");
  });

  it("falls back for nothing at all", () => {
    expect(formatLifeSpan(null, 1000)).toBe("—");
  });
});

describe("parseAnnouncements", () => {
  it("reads every data line in a chunk", () => {
    const chunk = `: listening\ndata: {"jobId":"a","status":"queued","kind":"simulation"}\ndata: {"jobId":"a","status":"done","kind":"simulation"}`;
    const found = parseAnnouncements(chunk);
    expect(found).toHaveLength(2);
    expect(found[1].status).toBe("done");
  });

  it("skips heartbeats and rubbish", () => {
    expect(parseAnnouncements(": still here\ndata: not json")).toHaveLength(0);
  });
});

describe("survivalSeries", () => {
  it("lines the diagrams up on shared hours", () => {
    const diagrams = [
      { hierarchyId: "H-1", curve: [{ hours: 0, reliability: 1 }, { hours: 10, reliability: 0.8 }] },
      { hierarchyId: "H-2", curve: [{ hours: 0, reliability: 1 }, { hours: 20, reliability: 0.5 }] },
    ] as SimulationDiagram[];
    const rows = survivalSeries(diagrams);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({ hours: 0, "H-1": 1, "H-2": 1 });
    expect(rows[1]).toEqual({ hours: 10, "H-1": 0.8 });
  });
});

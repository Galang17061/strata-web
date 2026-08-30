import { describe, expect, it } from "vitest";
import { describePlotValue } from "./plot-tooltip";

describe("describePlotValue", () => {
  it("gives the full eight decimals with the band it falls in", () => {
    expect(describePlotValue(0.855744371)).toEqual({ text: "0.85574437", label: "Moderate to High", band: "good" });
    expect(describePlotValue(1)).toEqual({ text: "1.00000000", label: "High", band: "high" });
    expect(describePlotValue(0.05)).toEqual({ text: "0.05000000", label: "N/A", band: "none" });
  });

  it("keeps a placeholder for a missing point", () => {
    expect(describePlotValue(null)).toEqual({ text: "—", label: "N/A", band: "none" });
  });
});

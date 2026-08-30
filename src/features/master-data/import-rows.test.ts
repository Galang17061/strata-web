import { describe, expect, it } from "vitest";
import { assessRow, rowsFromSheet, type ImportRow } from "./import-rows";

const vendors = new Set(["Northwind Pumps", "Helios Drives"]);

function row(overrides: Partial<ImportRow>): ImportRow {
  return { line: 3, componentName: "Lube pump", manufacturerName: "Northwind Pumps", failureRate: "0.000004", cost: "3200000", ...overrides };
}

describe("rowsFromSheet", () => {
  it("skips the title and heading rows and keeps the sheet line numbers", () => {
    const rows = rowsFromSheet([
      ["Master Component Import Template"],
      ["Component Name", "Vendor", "Failure Rate", "Cost"],
      ["Lube pump", "Northwind Pumps", 0.000004, "3200000"],
      ["", "", "", ""],
      ["Motor starter", "Helios Drives", 0.000009, 2100000],
    ]);
    expect(rows).toEqual([
      { line: 3, componentName: "Lube pump", manufacturerName: "Northwind Pumps", failureRate: "0.000004", cost: "3200000" },
      { line: 5, componentName: "Motor starter", manufacturerName: "Helios Drives", failureRate: "0.000009", cost: "2100000" },
    ]);
  });

  it("trims what people typed and treats missing cells as empty", () => {
    const rows = rowsFromSheet([[], [], ["  Fan ", " Helios Drives "]]);
    expect(rows[0]).toEqual({ line: 3, componentName: "Fan", manufacturerName: "Helios Drives", failureRate: "", cost: "" });
  });
});

describe("assessRow", () => {
  it("passes a complete row from a known vendor", () => {
    expect(assessRow(row({}), vendors)).toEqual({ problems: [], notes: [] });
  });

  it("stops a row without a name or vendor", () => {
    expect(assessRow(row({ componentName: "" }), vendors).problems).toEqual(["Needs a name."]);
    expect(assessRow(row({ manufacturerName: "" }), vendors).problems).toEqual(["Needs a vendor."]);
  });

  it("only notes a vendor the catalogue has not met yet", () => {
    const result = assessRow(row({ manufacturerName: "Atlas Bearings" }), vendors);
    expect(result.problems).toEqual([]);
    expect(result.notes).toEqual(["New vendor will be added."]);
  });

  it("refuses a failure rate or cost that is not a number", () => {
    expect(assessRow(row({ failureRate: "fast" }), vendors).problems).toEqual(["Failure rate is not a number."]);
    expect(assessRow(row({ failureRate: "-1" }), vendors).problems).toEqual(["Failure rate is not a number."]);
    expect(assessRow(row({ cost: "cheap" }), vendors).problems).toEqual(["Cost is not a number."]);
    expect(assessRow(row({ failureRate: "", cost: "" }), vendors).problems).toEqual([]);
  });
});

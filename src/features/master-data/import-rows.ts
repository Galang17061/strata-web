import { read, utils } from "xlsx";

export type ImportRow = {
  line: number;
  componentName: string;
  manufacturerName: string;
  failureRate: string;
  cost: string;
};

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function rowsFromSheet(cells: unknown[][]): ImportRow[] {
  return cells
    .map((line, index) => ({
      line: index + 1,
      componentName: cellText(line[0]),
      manufacturerName: cellText(line[1]),
      failureRate: cellText(line[2]),
      cost: cellText(line[3]),
    }))
    .filter((row) => row.line >= 3)
    .filter((row) => row.componentName || row.manufacturerName || row.failureRate || row.cost);
}

export type RowAssessment = {
  problems: string[];
  notes: string[];
};

export function assessRow(row: ImportRow, knownVendors: ReadonlySet<string>): RowAssessment {
  const problems: string[] = [];
  const notes: string[] = [];
  if (!row.componentName) problems.push("Needs a name.");
  if (!row.manufacturerName) problems.push("Needs a vendor.");
  else if (!knownVendors.has(row.manufacturerName)) notes.push("New vendor will be added.");
  if (row.failureRate) {
    const rate = Number(row.failureRate.replace(/,/g, ""));
    if (!Number.isFinite(rate) || rate < 0) problems.push("Failure rate is not a number.");
  }
  if (row.cost && !/^[\d.,\s]+$/.test(row.cost)) problems.push("Cost is not a number.");
  return { problems, notes };
}

export async function readImportRows(file: File): Promise<ImportRow[]> {
  const book = read(await file.arrayBuffer(), { type: "array" });
  const first = book.SheetNames[0];
  if (!first) return [];
  const cells = utils.sheet_to_json<unknown[]>(book.Sheets[first], { header: 1, raw: true, defval: "" });
  return rowsFromSheet(cells);
}

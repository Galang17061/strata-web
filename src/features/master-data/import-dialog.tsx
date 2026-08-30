"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, FileSpreadsheet, Info, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { importComponents, listVendors } from "@/features/master-data/api";
import { assessRow, readImportRows, type ImportRow } from "@/features/master-data/import-rows";
import type { ImportResult } from "@/features/master-data/types";
import { countOf } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const acceptedExtensions = [".xlsx", ".xls"];
const vendorParams = { page: 1, pageSize: 500 };

function isSpreadsheet(file: File): boolean {
  const name = file.name.toLowerCase();
  return acceptedExtensions.some((extension) => name.endsWith(extension));
}

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const vendors = useQuery({
    queryKey: queryKeys.vendors.list(vendorParams),
    queryFn: () => listVendors(vendorParams),
    enabled: open,
  });
  const knownVendors = useMemo(
    () => new Set((vendors.data?.data ?? []).map((vendor) => vendor.manufacturerName)),
    [vendors.data],
  );
  const assessed = useMemo(() => rows.map((row) => ({ row, ...assessRow(row, knownVendors) })), [rows, knownVendors]);
  const ready = assessed.filter((entry) => entry.problems.length === 0).length;
  const flagged = assessed.length - ready;

  useEffect(() => {
    if (open) {
      setFile(null);
      setRows([]);
      setProblem(null);
      setResult(null);
    }
  }, [open]);

  const send = useMutation({
    mutationFn: (workbook: File) => importComponents(workbook),
    onSuccess: async (response) => {
      setResult(response.data);
      await queryClient.invalidateQueries({ queryKey: queryKeys.masterComponents.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast.success("Import finished", { description: response.message });
    },
    onError: (error) => toast.error("Import did not go through", { description: error.message }),
  });

  const take = async (candidate: File | null | undefined) => {
    if (!candidate) return;
    if (!isSpreadsheet(candidate)) {
      setProblem("Pick an Excel workbook, .xlsx or .xls.");
      return;
    }
    setProblem(null);
    setResult(null);
    setReading(true);
    try {
      const parsed = await readImportRows(candidate);
      setFile(candidate);
      setRows(parsed);
      if (parsed.length === 0) setProblem("That sheet has no rows below the heading.");
    } catch {
      setProblem("That file could not be read as a workbook.");
    } finally {
      setReading(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void take(event.dataTransfer.files?.[0]);
  };

  const clear = () => {
    setFile(null);
    setRows([]);
    setProblem(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import components</DialogTitle>
          <DialogDescription>Drop a filled template and check the rows before they go in.</DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-sunken p-4" role="status">
            <div className="flex items-center gap-2 text-body font-medium text-foreground">
              <CircleCheck className="size-5 text-success" aria-hidden="true" />
              {countOf(result.successCount, "part")} added, {countOf(result.updatedCount, "part")} updated
            </div>
            {result.failedRows.length > 0 ? (
              <ul className="flex flex-col gap-1 text-body-sm text-danger">
                {result.failedRows.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-foreground-muted">Every row went in.</p>
            )}
          </div>
        ) : (
          <div
            role="group"
            aria-label="Workbook upload"
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex items-center gap-4 rounded-md border border-dashed border-border bg-surface-sunken p-4 transition-colors",
              dragging && "border-primary bg-accent",
            )}
          >
            <FileSpreadsheet className="size-8 shrink-0 text-foreground-subtle" aria-hidden="true" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-body-sm text-foreground">{file ? file.name : "Drop a workbook here"}</p>
              <p className="text-caption text-foreground-muted">One part per row from row three: name, vendor, failure rate, cost.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="secondary" size="sm" loading={reading} onClick={() => inputRef.current?.click()}>
                {file ? "Choose another" : "Choose a file"}
              </Button>
              {file ? (
                <Button type="button" variant="ghost" size="sm" onClick={clear}>
                  <X /> Remove
                </Button>
              ) : null}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={acceptedExtensions.join(",")}
              aria-label="Workbook file"
              className="sr-only"
              onChange={(event) => void take(event.target.files?.[0])}
            />
          </div>
        )}
        {problem ? <p className="text-body-sm text-danger">{problem}</p> : null}
        {rows.length > 0 && !result ? (
          <div className="flex flex-col gap-2">
            <p className="text-body-sm text-foreground-muted" aria-live="polite">
              {countOf(ready, "row")} ready{flagged > 0 ? `, ${countOf(flagged, "row")} will be skipped` : ""}.
            </p>
            <Table containerClassName="max-h-72" dense>
              <TableCaption className="sr-only">Rows read from the workbook and whether each will go in</TableCaption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead numeric>Row</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead numeric>Failure rate</TableHead>
                  <TableHead numeric>Cost</TableHead>
                  <TableHead>Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessed.map(({ row, problems, notes }) => (
                  <TableRow key={row.line} className={cn(problems.length > 0 && "text-foreground-muted")}>
                    <TableCell numeric>{row.line}</TableCell>
                    <TableCell>{row.componentName || <span className="text-foreground-subtle">Missing</span>}</TableCell>
                    <TableCell className="text-foreground-muted">{row.manufacturerName || <span className="text-foreground-subtle">Missing</span>}</TableCell>
                    <TableCell numeric>{row.failureRate}</TableCell>
                    <TableCell numeric>{row.cost}</TableCell>
                    <TableCell className="whitespace-normal">
                      {problems.length > 0 ? (
                        <span className="inline-flex items-start gap-1 text-danger">
                          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                          {problems.join(" ")}
                        </span>
                      ) : notes.length > 0 ? (
                        <span className="inline-flex items-start gap-1 text-warning">
                          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                          {notes.join(" ")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CircleCheck className="size-3.5" aria-hidden="true" /> Ready
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {result ? "Done" : "Cancel"}
            </Button>
          </DialogClose>
          {!result ? (
            <Button type="button" disabled={!file || ready === 0} loading={send.isPending} onClick={() => file && send.mutate(file)}>
              Import {ready > 0 ? countOf(ready, "row") : "rows"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { FileSpreadsheet, X } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { readImportRows, type ImportRow } from "@/features/master-data/import-rows";
import { countOf } from "@/lib/format";
import { cn } from "@/lib/utils";

const acceptedExtensions = [".xlsx", ".xls"];

function isSpreadsheet(file: File): boolean {
  const name = file.name.toLowerCase();
  return acceptedExtensions.some((extension) => name.endsWith(extension));
}

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    if (open) {
      setFile(null);
      setRows([]);
      setProblem(null);
    }
  }, [open]);

  const take = async (candidate: File | null | undefined) => {
    if (!candidate) return;
    if (!isSpreadsheet(candidate)) {
      setProblem("Pick an Excel workbook, .xlsx or .xls.");
      return;
    }
    setProblem(null);
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
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import components</DialogTitle>
          <DialogDescription>Drop a filled template and check the rows before they go in.</DialogDescription>
        </DialogHeader>
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
        {problem ? <p className="text-body-sm text-danger">{problem}</p> : null}
        {rows.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-body-sm text-foreground-muted">{countOf(rows.length, "row")} found.</p>
            <Table containerClassName="max-h-72" dense>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead numeric>Row</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead numeric>Failure rate</TableHead>
                  <TableHead numeric>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.line}>
                    <TableCell numeric>{row.line}</TableCell>
                    <TableCell>{row.componentName}</TableCell>
                    <TableCell className="text-foreground-muted">{row.manufacturerName}</TableCell>
                    <TableCell numeric>{row.failureRate}</TableCell>
                    <TableCell numeric>{row.cost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

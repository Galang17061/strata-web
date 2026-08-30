"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Meta } from "@/lib/api/client";
import { formatCount } from "@/lib/format";

const pageSizes = [10, 25, 50];

type TablePaginationProps = {
  meta: Meta | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  noun?: string;
};

export function TablePagination({ meta, page, pageSize, onPageChange, onPageSizeChange, noun = "rows" }: TablePaginationProps) {
  const total = meta?.totalData ?? 0;
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, meta?.totalPage ?? 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-body-sm text-foreground-muted">
      <p aria-live="polite">
        {total === 0 ? `No ${noun}` : `Showing ${formatCount(first)} to ${formatCount(last)} of ${formatCount(total)} ${noun}`}
      </p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span>Per page</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger size="sm" aria-label="Rows per page" className="w-20 font-mono tabular-nums">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size) => (
                <SelectItem key={size} value={String(size)} className="font-mono tabular-nums">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <span className="font-mono tabular-nums">
          {formatCount(page)} / {formatCount(totalPages)}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="icon-sm" aria-label="Previous page" disabled={!meta?.hasPreviousPage} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft />
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label="Next page" disabled={!meta?.hasNextPage} onClick={() => onPageChange(page + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

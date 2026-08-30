"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TableProps = React.ComponentProps<"table"> & {
  dense?: boolean;
  containerClassName?: string;
};

function Table({ className, dense = false, containerClassName, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full overflow-auto rounded-md border border-border bg-surface",
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        data-dense={dense ? "true" : undefined}
        className={cn("group/table w-full caption-bottom text-body-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("sticky top-0 z-10 bg-surface [&_tr]:border-b [&_tr]:border-border", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-surface-sunken/40", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-border bg-surface-sunken/60 font-medium", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "h-11 border-b border-border transition-colors group-data-[dense=true]/table:h-9 hover:bg-accent/60 data-[state=selected]:bg-accent",
        className,
      )}
      {...props}
    />
  );
}

type TableHeadProps = React.ComponentProps<"th"> & { numeric?: boolean };

function TableHead({ className, numeric = false, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-left align-middle text-caption uppercase whitespace-nowrap text-foreground-muted first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0",
        numeric && "text-right",
        className,
      )}
      {...props}
    />
  );
}

type TableCellProps = React.ComponentProps<"td"> & { numeric?: boolean };

function TableCell({ className, numeric = false, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-2 align-middle whitespace-nowrap first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0",
        numeric && "text-right font-mono text-numeric tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-body-sm text-foreground-muted", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

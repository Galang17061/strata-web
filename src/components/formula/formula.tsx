"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type FormulaProps = {
  tex: string;
  block?: boolean;
  className?: string;
};

export function Formula({ tex, block = false, className }: FormulaProps) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: block, throwOnError: false, output: "html" }),
    [tex, block],
  );

  return (
    <span
      className={cn("formula text-foreground", block && "block", className)}
      role="math"
      aria-label={tex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function plainFormulaToTex(formula: string): string {
  return formula
    .replace(/\s+/g, "")
    .replace(/\*/g, " \\cdot ")
    .replace(/([A-Za-z]+)(\d+)(?:_(\d+))?/g, (_, letters: string, digits: string, sub?: string) =>
      sub ? `${letters}_{${digits},${sub}}` : `${letters}_{${digits}}`,
    );
}

import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  numeric?: boolean;
};

function Input({ className, type, numeric = false, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      inputMode={numeric ? "decimal" : undefined}
      className={cn(
        "h-9 w-full min-w-0 rounded-sm border border-border bg-surface-sunken px-3 text-body-sm text-foreground pointer-coarse:h-10 transition-[border-color,box-shadow] outline-none placeholder:text-foreground-subtle file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/30",
        numeric && "font-mono tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  illustration: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-3 px-4 py-8" : "gap-4 px-6 py-12",
        className,
      )}
    >
      <div className="text-primary">{illustration}</div>
      <div className="flex flex-col gap-1">
        <h3 className="text-h3 text-foreground">{title}</h3>
        <p className="max-w-sm text-body-sm text-foreground-muted">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

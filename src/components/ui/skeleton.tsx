import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("strata-skeleton rounded-sm bg-surface-sunken", className)}
      {...props}
    />
  );
}

export { Skeleton };

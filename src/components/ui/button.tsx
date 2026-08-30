import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { StrataLoader } from "@/components/brand/loader";
import { cn } from "@/lib/utils";

const touchSlop = "pointer-coarse:relative pointer-coarse:after:absolute pointer-coarse:after:-inset-1.5 pointer-coarse:after:content-['']";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border border-transparent text-body-sm font-semibold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "border-border bg-surface text-foreground hover:bg-surface-sunken aria-expanded:bg-surface-sunken",
        outline:
          "border-border bg-surface text-foreground hover:bg-surface-sunken aria-expanded:bg-surface-sunken",
        ghost:
          "text-foreground-muted hover:bg-surface-sunken hover:text-foreground aria-expanded:bg-surface-sunken aria-expanded:text-foreground",
        destructive:
          "bg-danger text-danger-foreground hover:bg-danger/90 focus-visible:ring-danger/40",
        link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: `h-8 px-3 text-body-sm ${touchSlop}`,
        default: `h-9 px-3.5 ${touchSlop}`,
        lg: "h-10 px-4 text-body",
        icon: `size-9 ${touchSlop}`,
        "icon-sm": `size-8 ${touchSlop}`,
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <>
          <StrataLoader size="sm" className="text-current" />
          <span className="contents [&_svg:first-child]:hidden">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };

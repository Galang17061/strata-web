import {
  markLayerHeight,
  markLayerRadius,
  markLayerX,
  markLayers,
} from "@/components/brand/mark-geometry";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

export type LoaderSize = "sm" | "md" | "lg";

const loaderPixels: Record<LoaderSize, number> = { sm: 16, md: 24, lg: 40 };

type StrataLoaderProps = {
  size?: LoaderSize;
  label?: string;
  className?: string;
};

export function StrataLoader({ size = "md", label = "Loading", className }: StrataLoaderProps) {
  const pixels = loaderPixels[size];

  return (
    <span
      role="status"
      aria-label={label}
      aria-live="polite"
      className={cn("inline-flex shrink-0 items-center justify-center text-primary", className)}
    >
      <svg
        className="strata-loader"
        width={pixels}
        height={pixels}
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
      >
        {markLayers.map((layer) => (
          <rect
            key={layer.y}
            x={markLayerX}
            y={layer.y}
            width={layer.width}
            height={markLayerHeight}
            rx={markLayerRadius}
          />
        ))}
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background">
      <StrataLoader size="lg" label={label} />
      <Wordmark size={24} className="animate-in fade-in duration-(--dur-slow) text-foreground-muted" />
    </div>
  );
}

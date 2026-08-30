import { cn } from "@/lib/utils";

type IllustrationProps = {
  size?: number;
  className?: string;
  title?: string;
};

function Frame({
  size = 120,
  className,
  title,
  children,
}: IllustrationProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      {children}
    </svg>
  );
}

export function LayersIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <g className="text-foreground-subtle" stroke="currentColor">
        <rect x="18" y="78" width="84" height="18" rx="4" />
        <rect x="26" y="52" width="68" height="18" rx="4" />
        <path d="M60 70v8M60 44v8" />
      </g>
      <g className="text-primary" stroke="currentColor">
        <rect x="36" y="26" width="48" height="18" rx="4" fill="currentColor" fillOpacity="0.12" />
        <path d="M44 35h32" />
      </g>
    </Frame>
  );
}

export function EmptyBlocksIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <g className="text-foreground-subtle" stroke="currentColor">
        <rect x="8" y="50" width="26" height="20" rx="4" />
        <rect x="86" y="50" width="26" height="20" rx="4" />
        <path d="M34 60h12M74 60h12" />
      </g>
      <g className="text-primary" stroke="currentColor">
        <rect x="46" y="44" width="28" height="32" rx="5" strokeDasharray="4 4" />
        <path d="M60 54v12M54 60h12" />
      </g>
    </Frame>
  );
}

export function BrokenLinkIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <g className="text-foreground-subtle" stroke="currentColor">
        <rect x="8" y="48" width="32" height="24" rx="5" />
        <rect x="80" y="48" width="32" height="24" rx="5" />
        <path d="M40 60h12M68 60h12" />
      </g>
      <g className="text-primary" stroke="currentColor">
        <path d="M56 50l-6 20M70 50l-6 20" />
        <path d="M60 32v6M60 82v6M46 26l4 4M74 26l-4 4" />
      </g>
    </Frame>
  );
}

export function CurveIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <g className="text-foreground-subtle" stroke="currentColor">
        <path d="M20 20v80h80" />
        <path d="M20 44h80" strokeDasharray="3 5" />
        <path d="M20 66h80" strokeDasharray="3 5" />
      </g>
      <g className="text-primary" stroke="currentColor">
        <path d="M24 26c18 4 30 22 42 44s18 26 30 28" strokeWidth="2.5" />
        <circle cx="66" cy="70" r="4" fill="currentColor" fillOpacity="0.2" />
      </g>
    </Frame>
  );
}

export function ConnectedBlocksIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <g className="text-foreground-subtle" stroke="currentColor">
        <path d="M10 60h14M46 40h14M46 80h14M74 40h14M74 80h14M96 60h14" />
        <path d="M24 60c8 0 8-20 22-20M24 60c8 0 8 20 22 20M88 40c8 0 8 20 22 20M88 80c8 0 8-20 22-20" />
      </g>
      <g className="text-primary" stroke="currentColor">
        <rect x="46" y="30" width="28" height="20" rx="4" fill="currentColor" fillOpacity="0.12" />
        <rect x="46" y="70" width="28" height="20" rx="4" fill="currentColor" fillOpacity="0.12" />
      </g>
    </Frame>
  );
}

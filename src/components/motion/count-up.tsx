"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useMotionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

type CountUpProps = {
  value: number;
  format?: (value: number) => string;
  delay?: number;
  duration?: number;
  className?: string;
  active?: boolean;
  immediate?: boolean;
  as?: "span" | "text" | "tspan";
};

const defaultFormat = (value: number) => Math.round(value).toLocaleString("en-US");

export function CountUp({
  value,
  format = defaultFormat,
  delay = 0,
  duration,
  className,
  active = true,
  immediate = false,
  as = "span",
}: CountUpProps) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement | SVGTextElement | SVGTSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const ready = immediate || inView;
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    if (!ready || !active) return;
    if (reduced) {
      setDisplay(format(value));
      return;
    }
    const controls = animate(0, value, {
      duration: duration ?? tokens.count,
      delay,
      ease: tokens.easeStandard,
      onUpdate: (latest) => setDisplay(format(latest)),
    });
    return () => controls.stop();
  }, [ready, active, value, delay, duration, reduced, format, tokens]);

  if (as === "text") {
    return (
      <text ref={ref as React.RefObject<SVGTextElement>} className={className}>
        {display}
      </text>
    );
  }
  if (as === "tspan") {
    return (
      <tspan ref={ref as React.RefObject<SVGTSpanElement>} className={className}>
        {display}
      </tspan>
    );
  }
  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={cn("font-mono tabular-nums", className)}
    >
      {display}
    </span>
  );
}

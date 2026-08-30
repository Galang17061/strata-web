"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { durationMs, useMotionTokens } from "@/lib/motion";

type ProgressState = "idle" | "loading" | "done";

export function RouteProgress() {
  const pathname = usePathname();
  const tokens = useMotionTokens();
  const [state, setState] = useState<ProgressState>("idle");
  const lastPath = useRef(pathname);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/")) return;
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) return;
      setState("loading");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setState("done");
    const timer = window.setTimeout(() => setState("idle"), durationMs("--dur-slow"));
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-full h-0.5 overflow-hidden">
      <motion.div
        className="h-full bg-primary"
        initial={false}
        animate={{
          width: state === "idle" ? "0%" : state === "loading" ? "70%" : "100%",
          opacity: state === "idle" ? 0 : 1,
        }}
        transition={{
          width: { duration: state === "loading" ? tokens.reveal * 2 : tokens.base, ease: tokens.easeStandard },
          opacity: { duration: tokens.fast, delay: state === "idle" ? tokens.fast : 0 },
        }}
      />
    </div>
  );
}

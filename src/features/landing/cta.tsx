"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const slow = useTransform(scrollYProgress, [0, 1], [12, -12]);
  const slower = useTransform(scrollYProgress, [0, 1], [6, -6]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-brand-950 text-white">
      <motion.svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-40 h-[520px] w-[520px] fill-brand-400/10"
        style={{ y: reduced ? 0 : slow }}
      >
        <rect x="3" y="22" width="26" height="6" rx="0.72" />
        <rect x="3" y="13" width="20" height="6" rx="0.72" />
        <rect x="3" y="4" width="14" height="6" rx="0.72" />
      </motion.svg>
      <motion.svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -left-32 h-[420px] w-[420px] fill-brand-300/8"
        style={{ y: reduced ? 0 : slower }}
      >
        <rect x="3" y="22" width="26" height="6" rx="0.72" />
        <rect x="3" y="13" width="20" height="6" rx="0.72" />
        <rect x="3" y="4" width="14" height="6" rx="0.72" />
      </motion.svg>
      <Reveal className="relative mx-auto flex w-full max-w-content flex-col items-start gap-6 px-6 py-24 lg:py-32">
        <h2 className="max-w-2xl text-h1 sm:text-display">Ready to score your system?</h2>
        <p className="max-w-xl text-body text-brand-200">
          Sign in to open your projects, wire the blocks, and see the number change as the parts do.
        </p>
        <Button asChild size="lg" className="bg-white text-brand-900 hover:bg-brand-100">
          <Link href="/sign-in">
            Sign in <ArrowRight />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}

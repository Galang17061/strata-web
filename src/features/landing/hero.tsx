"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDiagram } from "@/features/landing/hero-diagram";
import { useMotionTokens } from "@/lib/motion";

export function LandingHero() {
  const tokens = useMotionTokens();
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: tokens.slow, delay, ease: tokens.easeEmphasized },
  });

  return (
    <section className="mx-auto grid w-full max-w-content items-center gap-12 px-6 pt-32 pb-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:pt-40 lg:pb-28">
      <div className="flex flex-col gap-6">
        <motion.p {...enter(0)} className="text-caption uppercase text-primary">
          Reliability, layer by layer
        </motion.p>
        <motion.h1 {...enter(tokens.stagger)} className="text-h1 sm:text-display text-foreground">
          Know how likely your system still works.
        </motion.h1>
        <motion.p {...enter(tokens.stagger * 2)} className="max-w-xl text-body text-foreground-muted sm:text-lg">
          Model your system as layers of blocks, wire them the way they really connect, and let
          Strata score every layer from the parts up.
        </motion.p>
        <motion.div {...enter(tokens.stagger * 3)} className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/sign-in">
              Sign in <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="#how-it-works">
              See how it works <ArrowDown />
            </a>
          </Button>
        </motion.div>
      </div>
      <motion.div {...enter(tokens.stagger * 2)} className="flex justify-center lg:justify-end">
        <HeroDiagram />
      </motion.div>
    </section>
  );
}

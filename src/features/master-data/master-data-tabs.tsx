"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMotionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Vendors", href: "/master-data/vendors/" },
  { label: "Components", href: "/master-data/components/" },
];

export function MasterDataTabs() {
  const pathname = usePathname();
  const tokens = useMotionTokens();
  return (
    <nav aria-label="Master data sections" className="flex items-end gap-1 border-b border-border">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative -mb-px inline-flex h-10 items-center px-3 text-body-sm font-medium whitespace-nowrap text-foreground-muted transition-colors outline-none hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring",
              active && "text-foreground",
            )}
          >
            {tab.label}
            {active ? (
              <motion.span
                layoutId="master-data-tab-indicator"
                aria-hidden="true"
                className="absolute inset-x-1 bottom-0 h-0.5 rounded-pill bg-primary"
                transition={{ duration: tokens.base, ease: tokens.easeStandard }}
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

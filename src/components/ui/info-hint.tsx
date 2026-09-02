"use client";

import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type InfoHintProps = {
  label: string;
  children: ReactNode;
};

export function InfoHint({ label, children }: InfoHintProps) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`What is ${label}?`}
        className="inline-flex size-5 items-center justify-center rounded-full text-foreground-subtle transition-colors duration-(--dur-base) hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <CircleHelp className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 text-body-sm normal-case tracking-normal">
        <p className="font-semibold">{label}</p>
        <div className="mt-1.5 flex flex-col gap-2 text-foreground-muted">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

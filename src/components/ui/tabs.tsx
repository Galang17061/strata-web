"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { motion } from "motion/react";

import { useMotionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TabsIdContext = React.createContext<string>("tabs");

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const id = React.useId();
  return (
    <TabsIdContext.Provider value={id}>
      <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />
    </TabsIdContext.Provider>
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("relative flex w-full items-end gap-1 border-b border-border", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const id = React.useContext(TabsIdContext);
  const tokens = useMotionTokens();
  const ref = React.useRef<HTMLButtonElement>(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setActive(element.getAttribute("data-state") === "active");
    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { attributes: true, attributeFilter: ["data-state"] });
    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        "relative -mb-px inline-flex h-10 items-center gap-1.5 px-3 text-body-sm font-medium whitespace-nowrap text-foreground-muted transition-colors outline-none hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      {active ? (
        <motion.span
          layoutId={`${id}-indicator`}
          aria-hidden="true"
          className="absolute inset-x-1 bottom-0 h-0.5 rounded-pill bg-primary"
          transition={{ duration: tokens.base, ease: tokens.easeStandard }}
        />
      ) : null}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };

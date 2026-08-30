"use client";

import { Plus, RefreshCw, Save } from "lucide-react";
import { useState, type ReactNode } from "react";
import { EmptyState } from "@/components/brand/empty-state";
import {
  BrokenLinkIllustration,
  ConnectedBlocksIllustration,
  CurveIllustration,
  EmptyBlocksIllustration,
  LayersIllustration,
} from "@/components/brand/illustrations";
import { PageLoader, StrataLoader } from "@/components/brand/loader";
import { Mark } from "@/components/brand/mark";
import { Wordmark } from "@/components/brand/wordmark";
import { LayerCrumbs } from "@/components/layers/layer-crumbs";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatHours, formatReliability } from "@/lib/format";
import { reliabilityBands, reliabilityLabels } from "@/lib/reliability";

const brandSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const surfaceTokens = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["surface-elevated", "bg-surface-elevated"],
  ["surface-sunken", "bg-surface-sunken"],
  ["border", "bg-border"],
  ["border-strong", "bg-border-strong"],
  ["foreground", "bg-foreground"],
  ["foreground-muted", "bg-foreground-muted"],
  ["foreground-subtle", "bg-foreground-subtle"],
  ["sidebar", "bg-sidebar"],
] as const;

const statusTokens = [
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
  ["info", "bg-info"],
  ["chart-1", "bg-chart-1"],
  ["chart-2", "bg-chart-2"],
  ["chart-3", "bg-chart-3"],
  ["chart-4", "bg-chart-4"],
  ["chart-5", "bg-chart-5"],
] as const;

const brandClasses: Record<(typeof brandSteps)[number], string> = {
  50: "bg-brand-50",
  100: "bg-brand-100",
  200: "bg-brand-200",
  300: "bg-brand-300",
  400: "bg-brand-400",
  500: "bg-brand-500",
  600: "bg-brand-600",
  700: "bg-brand-700",
  800: "bg-brand-800",
  900: "bg-brand-900",
  950: "bg-brand-950",
};

const sampleRows = [
  { name: "Cooling loop", project: "Plant A", hours: 12000, r: 0.9421 },
  { name: "Power train", project: "Plant A", hours: 8000, r: 0.8123 },
  { name: "Signalling", project: "Plant B", hours: 20000, r: 0.6402 },
  { name: "Hydraulics", project: "Plant B", hours: 15000, r: 0.3311 },
  { name: "Telemetry", project: "Plant C", hours: 500, r: null },
];

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2">{title}</h2>
        {hint ? <p className="text-body-sm text-foreground-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-12 rounded-sm border border-border ${className}`} />
      <span className="font-mono text-caption text-foreground-muted">{label}</span>
    </div>
  );
}

export function Styleguide() {
  const [markKey, setMarkKey] = useState(0);
  const [overlay, setOverlay] = useState(false);
  const [liveValue, setLiveValue] = useState(0.9421);
  const [dense, setDense] = useState(false);
  const [saving, setSaving] = useState(false);
  const [crumbs, setCrumbs] = useState([
    { id: "sys", name: "Cooling loop" },
    { id: "l1", name: "Pump station" },
    { id: "l2", name: "Pump A" },
  ]);

  const simulateSave = () => {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 1600);
  };

  return (
    <TooltipProvider>
      <main className="mx-auto flex w-full max-w-content flex-col gap-12 px-6 py-10">
        <header className="flex items-center justify-between">
          <Wordmark size={28} />
          <div className="flex items-center gap-3">
            <span className="text-caption uppercase text-foreground-muted">Internal styleguide</span>
            <ThemeToggle />
          </div>
        </header>

        <Section title="Identity" hint="Mark, wordmark, and the layer-in signature.">
          <div className="flex flex-wrap items-end gap-8">
            <Mark size={16} />
            <Mark size={24} />
            <Mark size={32} />
            <Mark size={48} />
            <Wordmark size={24} />
            <Wordmark size={32} />
            <Wordmark size={32} markOnly />
            <div className="flex items-center gap-3">
              <Wordmark key={markKey} size={40} animate />
              <Button variant="secondary" size="sm" onClick={() => setMarkKey((k) => k + 1)}>
                <RefreshCw /> Replay
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Loader" hint="Three layers laid down one after another, then fading together.">
          <div className="flex flex-wrap items-center gap-8">
            <StrataLoader size="sm" />
            <StrataLoader size="md" />
            <StrataLoader size="lg" />
            <Button variant="secondary" onClick={() => setOverlay(true)}>
              Show page loader
            </Button>
            {overlay ? (
              <button
                type="button"
                className="contents"
                aria-label="Dismiss page loader"
                onClick={() => setOverlay(false)}
              >
                <PageLoader />
              </button>
            ) : null}
          </div>
        </Section>

        <Section title="Colour" hint="Every value comes from a token; dark theme swaps them in place.">
          <div className="grid grid-cols-6 gap-3 sm:grid-cols-11">
            {brandSteps.map((step) => (
              <Swatch key={step} label={`brand-${step}`} className={brandClasses[step]} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
            {surfaceTokens.map(([label, className]) => (
              <Swatch key={label} label={label} className={className} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-9">
            {statusTokens.map(([label, className]) => (
              <Swatch key={label} label={label} className={className} />
            ))}
          </div>
        </Section>

        <Section title="Type" hint="Manrope for words, JetBrains Mono for numbers.">
          <div className="flex flex-col gap-3">
            <p className="text-display">Display 56</p>
            <h1 className="text-h1">Heading one 32</h1>
            <h2 className="text-h2">Heading two 24</h2>
            <h3 className="text-h3">Heading three 18</h3>
            <p className="text-body">Body 15. Model your system as layers of blocks and wire them the way they connect.</p>
            <p className="text-body-sm">Body small 14 for tables and forms.</p>
            <p className="text-caption uppercase text-foreground-muted">Caption 12.5 uppercase</p>
            <p className="font-mono text-numeric-lg">0.94210000</p>
            <p className="font-mono text-numeric">λ = 1.2000e-5 · β = 1.84 · η = 12,500 h</p>
          </div>
        </Section>

        <Section title="Buttons" hint="Primary, secondary, ghost, destructive, link; heights 32, 36, 40.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus /> Primary
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button loading={saving} onClick={simulateSave}>
              <Save /> Save changes
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small 32</Button>
            <Button>Default 36</Button>
            <Button size="lg">Large 40</Button>
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
            <Button size="icon-sm" variant="secondary" aria-label="Refresh">
              <RefreshCw />
            </Button>
          </div>
        </Section>

        <Section title="Inputs" hint="Height 36, sunken background, label above in caption.">
          <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sg-name">System name</Label>
              <Input id="sg-name" placeholder="Cooling loop" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sg-hours">Running hours</Label>
              <Input id="sg-hours" numeric defaultValue="12500" />
              <span className="text-caption text-foreground-muted normal-case tracking-normal">Hours since the last overhaul</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sg-bad">Failure rate</Label>
              <Input id="sg-bad" numeric aria-invalid defaultValue="abc" />
              <span className="text-body-sm text-danger">Enter a number greater than zero.</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sg-off">Vendor</Label>
              <Input id="sg-off" disabled defaultValue="Locked" />
            </div>
          </div>
        </Section>

        <Section title="Badges" hint="Reliability wears the same colour everywhere; the number is always shown.">
          <div className="flex flex-wrap items-center gap-3">
            {reliabilityBands.map((band, index) => (
              <ReliabilityBadge key={band} value={[0.9421, 0.8123, 0.6402, 0.3311, null][index]} />
            ))}
            <ReliabilityBadge value={0.9421} size="sm" />
            <span className="text-caption uppercase text-foreground-muted">{reliabilityLabels.good}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ReliabilityBadge value={liveValue} decimals={8} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLiveValue((v) => Number((v > 0.5 ? v - 0.31 : v + 0.31).toFixed(8)))}
            >
              <RefreshCw /> Recalculate
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Saved</Badge>
            <Badge variant="warning">Unsaved</Badge>
            <Badge variant="danger">Failed</Badge>
            <Badge variant="info">Recalculating</Badge>
            <Badge size="sm">Small</Badge>
          </div>
        </Section>

        <Section title="Card" hint="Surface, radius md, padding 20, title with an action on the right.">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Cooling loop</CardTitle>
                  <CardDescription>3 systems · best 0.9421</CardDescription>
                </div>
                <CardAction>
                  <Button variant="secondary" size="sm">
                    Open
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-foreground-muted">
                  Two pump stations in parallel feeding a single heat exchanger.
                </p>
              </CardContent>
              <CardFooter>
                <ReliabilityBadge value={0.9421} />
                <span className="ml-auto font-mono text-numeric text-foreground-muted">{formatHours(12000)}</span>
              </CardFooter>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardTitle>Compact card</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Table" hint="Sticky header, 44 px rows, mono numbers right-aligned, dense 36 px.">
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setDense((d) => !d)}>
              {dense ? "Comfortable rows" : "Dense rows"}
            </Button>
          </div>
          <Table dense={dense}>
            <TableHeader>
              <TableRow>
                <TableHead>System</TableHead>
                <TableHead>Project</TableHead>
                <TableHead numeric>Running hours</TableHead>
                <TableHead numeric>R(t)</TableHead>
                <TableHead>Band</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-foreground-muted">{row.project}</TableCell>
                  <TableCell numeric>{formatHours(row.hours)}</TableCell>
                  <TableCell numeric>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{formatReliability(row.r)}</span>
                      </TooltipTrigger>
                      <TooltipContent>{formatReliability(row.r, 8)}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <ReliabilityBadge value={row.r} size="sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section title="Dialog and sheet" hint="Dialog for short forms, sheet on the right for properties and logs.">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create project</DialogTitle>
                  <DialogDescription>Give the project a name. You can add systems next.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sg-dialog-name">Project name</Label>
                  <Input id="sg-dialog-name" placeholder="Plant A" autoFocus />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button>Create project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary">Open sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Pump A</SheetTitle>
                  <SheetDescription>Component properties</SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sg-sheet-hours">Running hours</Label>
                    <Input id="sg-sheet-hours" numeric defaultValue="12500" />
                  </div>
                  <ReliabilityBadge value={0.9421} decimals={8} />
                </SheetBody>
                <SheetFooter>
                  <Button>Save changes</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </Section>

        <Section title="Breadcrumbs" hint="Page breadcrumb in the topbar, layered chips above the canvas.">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Plant A</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Cooling loop</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <LayerCrumbs items={crumbs} onSelect={(_, index) => setCrumbs((c) => c.slice(0, index + 1))} />
          {crumbs.length < 3 ? (
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                setCrumbs([
                  { id: "sys", name: "Cooling loop" },
                  { id: "l1", name: "Pump station" },
                  { id: "l2", name: "Pump A" },
                ])
              }
            >
              Reset layers
            </Button>
          ) : null}
        </Section>

        <Section title="Skeleton and empty states" hint="Skeletons take the shape of the content; empty states say what to do next.">
          <div className="grid gap-4 md:grid-cols-3">
            <Card size="sm">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-pill" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </Card>
            <Card size="sm">
              <EmptyState
                compact
                illustration={<EmptyBlocksIllustration />}
                title="No systems yet"
                description="Create one to start wiring blocks."
                action={
                  <Button size="sm">
                    <Plus /> New system
                  </Button>
                }
              />
            </Card>
            <Card size="sm">
              <EmptyState
                compact
                illustration={<CurveIllustration />}
                title="Nothing to plot"
                description="Recalculate the system to draw its curve."
              />
            </Card>
          </div>
          <div className="flex flex-wrap items-center gap-8 text-primary">
            <LayersIllustration />
            <EmptyBlocksIllustration />
            <BrokenLinkIllustration />
            <CurveIllustration />
            <ConnectedBlocksIllustration />
          </div>
        </Section>

        <Separator />
        <p className="text-body-sm text-foreground-muted">
          This page exists to check every piece in both themes. It is not linked from the app.
        </p>
      </main>
    </TooltipProvider>
  );
}

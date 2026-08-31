"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Formula } from "@/components/formula/formula";
import { Reveal } from "@/components/motion/reveal";
import { ReliabilityBadge } from "@/components/reliability/reliability-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatHours, formatReliability } from "@/lib/format";
import {
  curvePoints,
  exponentialReliability,
  poissonReliability,
  weibullReliability,
  type Distribution,
} from "@/lib/reliability-math";
import { cn } from "@/lib/utils";

const maxHours = 20000;
const shape = 1.8;
const scale = 12000;
const failureRate = 1 / 12000;

export function LandingLiveCurve() {
  const [hours, setHours] = useState(8000);
  const [distribution, setDistribution] = useState<Distribution>("weibull");
  const [allowedFailures, setAllowedFailures] = useState(1);
  const [mounted, setMounted] = useState(false);
  const gradientId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const points = useMemo(
    () => curvePoints(distribution, maxHours, 80, { shape, scale, failureRate, allowedFailures }),
    [distribution, allowedFailures],
  );
  const value =
    distribution === "weibull"
      ? weibullReliability(hours, shape, scale)
      : distribution === "poisson"
        ? poissonReliability(hours, failureRate, allowedFailures)
        : exponentialReliability(hours, failureRate);

  const tex =
    distribution === "weibull"
      ? `R(t) = e^{-\\left(\\frac{t}{\\eta}\\right)^{\\beta}} = e^{-\\left(\\frac{${hours}}{${scale}}\\right)^{${shape}}} = ${formatReliability(value, 4)}`
      : distribution === "poisson"
        ? `R(t) = \\sum_{k=0}^{c} \\frac{e^{-\\lambda t}(\\lambda t)^{k}}{k!} = ${formatReliability(value, 4)}`
        : `R(t) = e^{-\\lambda t} = e^{-\\frac{${hours}}{${scale}}} = ${formatReliability(value, 4)}`;

  return (
    <section className="mx-auto w-full max-w-content px-6 py-20 lg:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-caption uppercase text-primary">Live curve</p>
        <h2 className="mt-2 text-h1">Watch a block age.</h2>
        <p className="mt-3 text-body text-foreground-muted">
          Slide the running hours and switch the distribution. Everything here is computed in
          your browser.
        </p>
      </Reveal>
      <Reveal delay={0.1} className="mt-10 grid gap-8 rounded-lg border border-border bg-surface p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:p-8">
        <div className="h-64 w-full sm:h-72">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="hours"
                  type="number"
                  domain={[0, maxHours]}
                  ticks={[0, 5000, 10000, 15000, 20000]}
                  tickFormatter={(tick: number) => `${Math.round(tick / 1000)}k`}
                  stroke="var(--border-strong)"
                  tick={{ fill: "var(--foreground-muted)", fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 1]}
                  ticks={[0, 0.25, 0.5, 0.75, 1]}
                  stroke="var(--border-strong)"
                  tick={{ fill: "var(--foreground-muted)", fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border-strong)" }}
                  contentStyle={{
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                  labelFormatter={(label) => formatHours(label)}
                  formatter={(item) => [formatReliability(item, 8), "R(t)"]}
                />
                <ReferenceLine x={hours} stroke="var(--primary)" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="reliability"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="live-hours">Running hours</Label>
              <span className="font-mono text-numeric text-foreground">{formatHours(hours)}</span>
            </div>
            <Slider
              id="live-hours"
              min={0}
              max={maxHours}
              step={250}
              value={[hours]}
              onValueChange={(next) => setHours(next[0] ?? 0)}
              aria-label="Running hours"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Distribution</Label>
            <div role="radiogroup" aria-label="Distribution" className="inline-flex rounded-sm border border-border bg-surface-sunken p-0.5">
              {(["weibull", "exponential", "poisson"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={distribution === option}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDistribution(option)}
                  className={cn(
                    "flex-1 capitalize",
                    distribution === option && "bg-surface text-foreground shadow-sm hover:bg-surface",
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
          {distribution === "poisson" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="live-allowed-failures">Allowed failures</Label>
                <span className="font-mono text-numeric text-foreground">{allowedFailures}</span>
              </div>
              <Slider
                id="live-allowed-failures"
                min={0}
                max={5}
                step={1}
                value={[allowedFailures]}
                onValueChange={(next) => setAllowedFailures(next[0] ?? 0)}
                aria-label="Allowed failures"
              />
              <p className="text-caption text-foreground-muted normal-case tracking-normal">
                How many faults the part may take before it counts as down. At zero this matches exponential.
              </p>
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <span className="text-caption uppercase text-foreground-muted">Chance it still works</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-numeric-lg text-foreground">{formatReliability(value, 4)}</span>
              <ReliabilityBadge value={value} showLabel size="sm" />
            </div>
          </div>
          <div className="overflow-x-auto rounded-sm bg-surface-sunken px-4 py-3">
            <Formula tex={tex} block className="text-body-sm" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

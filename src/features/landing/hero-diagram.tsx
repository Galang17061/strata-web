"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { CountUp } from "@/components/motion/count-up";
import { PathDraw } from "@/components/motion/path-draw";
import { formatReliability } from "@/lib/format";
import { durationMs, useMotionTokens } from "@/lib/motion";
import { parallelReliability, seriesReliability } from "@/lib/reliability-math";

const blockWidth = 92;
const blockHeight = 50;

const blocks = [
  { id: "A", x: 72, y: 135, value: 0.98 },
  { id: "B", x: 204, y: 45, value: 0.9 },
  { id: "C", x: 204, y: 135, value: 0.92 },
  { id: "D", x: 204, y: 225, value: 0.88 },
  { id: "E", x: 336, y: 135, value: 0.97 },
  { id: "F", x: 468, y: 90, value: 0.95 },
  { id: "G", x: 468, y: 180, value: 0.93 },
] as const;

type BlockId = (typeof blocks)[number]["id"];

function center(id: BlockId) {
  const block = blocks.find((item) => item.id === id)!;
  return { left: block.x, right: block.x + blockWidth, y: block.y + blockHeight / 2 };
}

function link(from: { x: number; y: number }, to: { x: number; y: number }) {
  const midX = (from.x + to.x) / 2;
  return `M${from.x} ${from.y} C${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
}

const inPoint = { x: 40, y: 160 };
const outPoint = { x: 600, y: 160 };

const edges: { id: string; d: string; target?: BlockId }[] = [
  { id: "in-A", d: link(inPoint, { x: center("A").left, y: center("A").y }), target: "A" },
  { id: "A-B", d: link({ x: center("A").right, y: center("A").y }, { x: center("B").left, y: center("B").y }), target: "B" },
  { id: "A-C", d: link({ x: center("A").right, y: center("A").y }, { x: center("C").left, y: center("C").y }), target: "C" },
  { id: "A-D", d: link({ x: center("A").right, y: center("A").y }, { x: center("D").left, y: center("D").y }), target: "D" },
  { id: "B-E", d: link({ x: center("B").right, y: center("B").y }, { x: center("E").left, y: center("E").y }), target: "E" },
  { id: "C-E", d: link({ x: center("C").right, y: center("C").y }, { x: center("E").left, y: center("E").y }) },
  { id: "D-E", d: link({ x: center("D").right, y: center("D").y }, { x: center("E").left, y: center("E").y }) },
  { id: "E-F", d: link({ x: center("E").right, y: center("E").y }, { x: center("F").left, y: center("F").y }), target: "F" },
  { id: "E-G", d: link({ x: center("E").right, y: center("E").y }, { x: center("G").left, y: center("G").y }), target: "G" },
  { id: "F-out", d: link({ x: center("F").right, y: center("F").y }, outPoint) },
  { id: "G-out", d: link({ x: center("G").right, y: center("G").y }, outPoint) },
];

const systemValue = seriesReliability([
  0.98,
  parallelReliability([0.9, 0.92, 0.88]),
  0.97,
  parallelReliability([0.95, 0.93]),
]);

function Capsule({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect
        x={x - 20}
        y={y - 12}
        width={40}
        height={24}
        rx={12}
        className="fill-surface-sunken stroke-border-strong"
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        className="fill-foreground-muted font-mono text-[11px] font-medium"
      >
        {label}
      </text>
    </g>
  );
}

export function HeroDiagram() {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const loop = durationMs("--dur-scene-loop");
    if (loop <= 0) return;
    const timer = window.setInterval(() => setCycle((current) => current + 1), loop);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const edgeStep = tokens.reveal * 0.55;
  const edgeDelay = (index: number) => index * edgeStep;
  const blockDelay = (id: BlockId) => {
    const index = edges.findIndex((edge) => edge.target === id);
    return edgeDelay(index) + tokens.reveal * 0.7;
  };
  const valuesStart = edgeDelay(edges.length) + tokens.reveal;
  const totalDelay = valuesStart + tokens.count;

  return (
    <svg
      key={cycle}
      viewBox="0 0 640 320"
      role="img"
      aria-label="A reliability block diagram with seven blocks wired in series and parallel, each scored and combined into a system total"
      className="h-auto w-full max-w-2xl overflow-visible"
    >
      <Capsule x={inPoint.x} y={inPoint.y} label="IN" />
      <Capsule x={outPoint.x} y={outPoint.y} label="OUT" />
      {edges.map((edge, index) => (
        <PathDraw
          key={edge.id}
          d={edge.d}
          delay={edgeDelay(index)}
          className="stroke-foreground-subtle"
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      ))}
      {blocks.map((block) => (
        <motion.g
          key={block.id}
          initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: tokens.base,
            delay: reduced ? 0 : blockDelay(block.id),
            ease: tokens.easeEmphasized,
          }}
          style={{ transformOrigin: `${block.x + blockWidth / 2}px ${block.y + blockHeight / 2}px` }}
        >
          <rect
            x={block.x}
            y={block.y}
            width={blockWidth}
            height={blockHeight}
            rx={8}
            className="fill-surface stroke-border-strong"
            strokeWidth={1.5}
          />
          <text
            x={block.x + 12}
            y={block.y + 20}
            className="fill-foreground-muted font-mono text-[11px]"
          >
            R{block.id}
          </text>
          <text
            x={block.x + 12}
            y={block.y + 39}
            className="fill-foreground font-mono text-[14px] font-medium tabular-nums"
          >
            <CountUp
              as="tspan"
              value={block.value}
              format={(value) => formatReliability(value, 4)}
              delay={reduced ? 0 : valuesStart}
            />
          </text>
        </motion.g>
      ))}
      <motion.g
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: tokens.slow, delay: reduced ? 0 : totalDelay, ease: tokens.easeEmphasized }}
      >
        <rect
          x={452}
          y={262}
          width={176}
          height={46}
          rx={10}
          className="fill-accent stroke-primary/40"
          strokeWidth={1.5}
        />
        <text x={468} y={281} className="fill-accent-foreground text-[11px] font-semibold uppercase tracking-[0.04em]">
          System
        </text>
        <text x={468} y={300} className="fill-foreground font-mono text-[16px] font-medium tabular-nums">
          <CountUp
            as="tspan"
            value={systemValue}
            format={(value) => formatReliability(value, 4)}
            delay={reduced ? 0 : totalDelay}
          />
        </text>
      </motion.g>
    </svg>
  );
}

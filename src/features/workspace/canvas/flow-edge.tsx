"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { motion, useReducedMotion } from "motion/react";
import { memo } from "react";
import type { CanvasEdge } from "@/features/workspace/model";
import { useMotionTokens } from "@/lib/motion";

function FlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const tokens = useMotionTokens();
  const reduced = useReducedMotion();
  const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 12 });
  const fresh = Boolean(data?.fresh) && !reduced;

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} className="edge-path" style={fresh ? { opacity: 0 } : undefined} />
      {fresh ? (
        <motion.path
          d={path}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: tokens.reveal, ease: tokens.easeStandard }}
          style={{ pointerEvents: "none" }}
        />
      ) : null}
    </>
  );
}

export const FlowEdge = memo(FlowEdgeComponent);

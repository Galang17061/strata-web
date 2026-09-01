import { api, type Envelope } from "@/lib/api/client";
import type {
  OptimizationApplyInput,
  OptimizationApplyResult,
  OptimizationChoice,
  OptimizationPreview,
  OptimizationPreviewInput,
  OptimizationScore,
} from "@/features/optimization/types";

export function runOptimizationPreview(input: OptimizationPreviewInput): Promise<Envelope<OptimizationPreview>> {
  return api.post<Envelope<OptimizationPreview>>("/Optimization/preview", input);
}

export function scoreOptimizationChoices(rbdSystemId: string, choices: OptimizationChoice[]): Promise<Envelope<OptimizationScore>> {
  return api.post<Envelope<OptimizationScore>>("/Optimization/score", { rbdSystemId, choices });
}

export function applyOptimization(input: OptimizationApplyInput): Promise<Envelope<OptimizationApplyResult>> {
  return api.post<Envelope<OptimizationApplyResult>>("/Optimization/apply", input);
}

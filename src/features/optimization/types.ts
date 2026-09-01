export type OptimizationMode = 1 | 2 | 3;

export type OptimizationCandidate = {
  componentId: string;
  vendorId: string;
  vendorName: string;
  failureRate: number;
  unitCost: number;
  reliability: number;
};

export type OptimizationSlot = {
  systemComponentId: string;
  componentName: string;
  formulaCode: string;
  units: number;
  connectionType: string | null;
  currentIndex: number;
  proposedIndex: number;
  locked: boolean;
  candidates: OptimizationCandidate[];
};

export type OptimizationFixedSlot = {
  systemComponentId: string;
  componentName: string;
  vendorName: string | null;
  reason: string;
  reliability: number;
  cost: number;
};

export type OptimizationTotals = {
  reliability: number;
  cost: number;
  baselineReliability: number;
  baselineCost: number;
};

export type GenerationPoint = {
  generation: number;
  bestFitness: number;
  bestReliability: number;
  bestCost: number;
};

export type OptimizationPreview = {
  rbdSystemId: string;
  systemName: string | null;
  mode: OptimizationMode;
  slots: OptimizationSlot[];
  fixedSlots: OptimizationFixedSlot[];
  totals: OptimizationTotals;
  feasible: boolean;
  history: GenerationPoint[] | null;
  generations: number;
  seed: number;
  executionMs: number;
};

export type OptimizationChoice = {
  systemComponentId: string;
  componentId: string;
};

export type OptimizationSettings = {
  mode: OptimizationMode;
  maxBudget: string;
  targetReliability: string;
  weightCost: number;
  populationSize: string;
  maxGenerations: string;
  crossoverProbability: string;
  mutationProbability: string;
  seed: string;
};

export type OptimizationPreviewInput = {
  rbdSystemId: string;
  mode: OptimizationMode;
  maxBudget?: number;
  targetReliability?: number;
  weightCost?: number;
  weightReliability?: number;
  populationSize?: number;
  maxGenerations?: number;
  crossoverProbability?: number;
  mutationProbability?: number;
  seed?: number;
  locks?: OptimizationChoice[];
};

export type OptimizationApplyInput = {
  rbdSystemId: string;
  projectName: string;
  systemName?: string;
  choices: OptimizationChoice[];
  mode: OptimizationMode;
  maxBudget?: number;
  targetReliability?: number;
  weightCost?: number;
  weightReliability?: number;
  populationSize?: number;
  maxGenerations?: number;
  crossoverProbability?: number;
  mutationProbability?: number;
  seed?: number;
};

export type OptimizationApplyResult = {
  projectId: string;
  rbdSystemId: string;
};

export type OptimizationScore = {
  totals: OptimizationTotals;
};

export type JobStatus = "queued" | "running" | "done" | "failed" | "cancelled";

export type SimulationRequestInput = {
  missionHours?: number;
  trials?: number;
  seed?: number;
  curvePoints?: number;
  hierarchyId?: string;
};

export type SimulationPoint = {
  hours: number;
  reliability: number;
};

export type SimulationCulprit = {
  code: string;
  componentName: string;
  share: number;
};

export type SimulationDiagram = {
  hierarchyId: string;
  hierarchyName: string;
  formula: string;
  components: number;
  survivors: number;
  reliability: number;
  lowerBound: number;
  upperBound: number;
  meanLife: number;
  medianLife: number;
  b10Life: number;
  curve: SimulationPoint[];
  culprits: SimulationCulprit[];
  warnings: string[];
};

export type SimulationCoverage = {
  diagramsInSystem: number;
  diagramsRehearsed: number;
  componentsInSystem: number;
  componentsRehearsed: number;
  componentsLeftOut: string[];
};

export type SimulationSummary = {
  rbdSystemId: string;
  systemName: string;
  missionHours: number;
  trials: number;
  seed: number;
  diagrams: SimulationDiagram[];
  coverage: SimulationCoverage;
  warnings: string[];
};

export type Job = {
  jobId: string;
  kind: string;
  rbdSystemId: string | null;
  status: JobStatus;
  request: SimulationRequestInput | null;
  result: SimulationSummary | null;
  errorMessage: string | null;
  createdBy: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

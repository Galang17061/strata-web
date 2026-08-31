export type DrawingScope = "system" | "hierarchy";

export type DrawingNodeView = {
  systemComponentId?: string;
  hierarchyId?: string;
  connectionType: string | null;
  positionX: string | null;
  positionY: string | null;
  idNode: string | null;
  componentName: string | null;
  vendorName: string | null;
  activeComponent: number | null;
};

export type DrawingEdgeView = {
  idEdge: string | null;
  sourceId: string | null;
  targetId: string | null;
};

export type DrawingNodeInput = {
  idNode: string;
  connectionType: string | null;
  positionX: string;
  positionY: string;
};

export type DrawingEdgeInput = {
  idEdge: string;
  sourceId: string;
  targetId: string;
};

export type HierarchyView = {
  hierarchyId: string;
  rbdSystemId: string | null;
  parentId: string;
  level: number;
  subSystemName: string | null;
  formula: string | null;
  formulaCode: string | null;
  connectionType: string | null;
  realibilityValue: number | null;
  runningHours: number | null;
  positionX: number | null;
  positionY: number | null;
  sourceId: string | null;
  targetId: string | null;
  children: HierarchyView[] | null;
};

export type HierarchyCreateInput = {
  rbdSystemId: string;
  parentId: string;
  level: number;
  subSystemName: string;
  formula?: string;
  formulaCode?: string;
  connectionType?: string;
  runningHours?: number;
};

export type HierarchyUpdateInput = {
  subSystemName?: string;
  formula?: string;
  formulaCode?: string;
  connectionType?: string;
};

export type ComponentInputParameters = {
  componentName: string;
  vendorName: string | null;
  failureRate: number | null;
  runningHours: number | null;
  formulaCode: string | null;
  componentReliability: number | null;
};

export type PlotComponentParameters = {
  systemComponentId: string;
  componentName: string;
  vendorName: string | null;
  failureRate: number | null;
  runningHours: number | null;
  formulaCode: string | null;
  cost: string | null;
  activeComponent: number | null;
  totalComponent: number | null;
  serialNumber: string | null;
  distributionType: string | null;
  shapeParameter: number | null;
  scaleParameter: number | null;
  componentReliability: number | null;
  mtbf: number | null;
};

export type ComponentDetail = {
  systemComponentId: string;
  rbdSystemId: string | null;
  parentId: string | null;
  componentName: string;
  componentTagNumber: string | null;
  active: number | null;
  vendor: string | null;
  formulaCode: string | null;
  distributionType: string | null;
  failureRate: number | null;
  runningHours: number | null;
  scaleParameter: number | null;
  shapeParameter: number | null;
  connectionType: string | null;
  connectionToId: string | null;
  positionX: string | null;
  positionY: string | null;
  idNode: string | null;
  reliabilityValue: number | null;
  activeComponent: number | null;
  totalComponent: number | null;
  regresi: number | null;
  mtbf: number | null;
  allowedFailures: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ComponentCreateInput = {
  parentId: string;
  componentName: string;
  componentTagNumber: string;
  vendor: string;
};

export type ComponentUpdateInput = {
  rbdSystemId: string;
  componentTagNumber: string;
  vendor: string;
  formulaCode: string;
  distributionType: string;
  failureRate: number;
  runningHours: number;
  scaleParameter: number;
  shapeParameter: number;
  connectionType: string;
  activeComponent: number;
  totalComponent: number;
  mtbf: number;
  allowedFailures: number;
};

export type FailureEvent = {
  failureEventId: string;
  systemComponentId: string;
  failureDate: string;
  failureNumber: number | null;
  runningHours: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type FailureEventInput = {
  systemComponentId: string;
  failureDate: string;
  failureNumber: number;
  runningHours: number;
};

export type PoissonParameter = {
  poissonParameterId: string;
  systemComponentId: string;
  failureTime: number | null;
  failureRate: number | null;
  allowedFailures: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  totalReliability: number | null;
};

export type WeibullParameter = {
  weibullParameterId: string;
  systemComponentId: string;
  failureTime: number | null;
  scaleParameter: number | null;
  shapeParameter: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  totalReliability: number | null;
};

export type HistoryComponentDetail = {
  formulaCode: string | null;
  componentName: string | null;
  vendor: string | null;
  type: string;
  connectionType: string | null;
  activeComponent: number | null;
  totalComponent: number | null;
  baseReliability: number | null;
  adjustedReliability: number | null;
  failureRate: number | null;
};

export type HistoryEntry = {
  historyId: string;
  rbdSystemId: string;
  hierarchyId: string;
  hierarchyName: string | null;
  hierarchyLevel: number | null;
  formulaCode: string | null;
  formula: string | null;
  calculatedReliability: number | null;
  reliabilityLookup: Record<string, number> | null;
  componentDetails: HistoryComponentDetail[] | null;
  runningHours: number | null;
  calculationTimestamp: string;
  calculatedBy: string | null;
};

export type SystemTotal = {
  rbdSystemId: string;
  systemName: string | null;
  reliabilityTotal: number | null;
  formula: string | null;
  level: unknown;
  hierarchyLookup: Record<string, number> | null;
  componentLookup: Record<string, number> | null;
};

export type HierarchyCalculation = {
  hierarchyId: string;
  hierarchyName: string | null;
  level: number;
  formulaCode: string | null;
  formula: string | null;
  calculatedReliability: number | null;
  reliabilityLookup: Record<string, number> | null;
  children: HierarchyCalculation[] | null;
};

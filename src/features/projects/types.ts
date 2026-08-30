export type Project = {
  projectId: string;
  projectName: string;
  hierarchyDepth: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type ProjectSystem = {
  rbdSystemId: string;
  projectId: string;
  projectName: string;
  drawingName: string | null;
  systemName: string | null;
  reliabilityTotal: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SystemView = {
  rbdSystemId: string | null;
  systemName: string | null;
  projectId: string;
  projectName: string;
  drawingName: string | null;
};

export type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PlotComponentValue = {
  comp_name: string | null;
  r_comp: number | null;
};

export type PlotPoint = {
  drawingName: string | null;
  time: number;
  components: Record<string, PlotComponentValue>;
};

export type ConnectionType = "Series" | "Parallel";

export type SystemComponentInput = {
  componentName: string;
  vendor: string;
  totalComponent: number;
  activeComponent: number;
  connectionType: ConnectionType;
  formulaCode: string | null;
};

export type SystemTreeInput = {
  name: string;
  connectionType: ConnectionType;
  formulaCode: string;
  hierarchy: SystemTreeInput[];
  components: SystemComponentInput[];
};

export type TreeComponent = {
  systemComponentId: string;
  formulaCode: string | null;
  componentName: string | null;
  vendorName: string | null;
  totalComponent: number | null;
  activeComponent: number | null;
  connectionType: string | null;
  targetEdges: string[] | null;
};

export type TreeNode = {
  hierarchyId: string;
  name: string;
  connectionType: string | null;
  formulaCode: string | null;
  level: number;
  hierarchy: TreeNode[] | null;
  components: TreeComponent[] | null;
};

export type SystemTree = {
  rbdSystemId: string;
  projectId: string;
  projectName: string;
  hierarchyDepth: number;
  systemName: string;
  hierarchy: TreeNode[] | null;
};

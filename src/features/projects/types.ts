export type Project = {
  projectId: string;
  projectName: string;
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

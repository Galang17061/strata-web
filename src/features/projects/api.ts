import { api, queryString, type Envelope } from "@/lib/api/client";
import type {
  ListParams,
  PlotPoint,
  Project,
  ProjectSystem,
  SystemTree,
  SystemTreeInput,
  SystemView,
} from "@/features/projects/types";

export function listProjects(params: ListParams = {}): Promise<Envelope<Project[]>> {
  return api.get<Envelope<Project[]>>(`/MasterProject${queryString(params)}`);
}

export function getProject(projectId: string): Promise<Envelope<Project>> {
  return api.get<Envelope<Project>>(`/MasterProject/${encodeURIComponent(projectId)}`);
}

export function createProject(input: { projectName: string; hierarchyDepth: number }): Promise<Envelope<Project>> {
  return api.post<Envelope<Project>>("/MasterProject", input);
}

export function updateProject(projectId: string, input: { projectName: string }): Promise<Envelope<Project>> {
  return api.put<Envelope<Project>>(`/MasterProject/${encodeURIComponent(projectId)}`, input);
}

export function listAllSystems(params: ListParams = {}): Promise<Envelope<ProjectSystem[]>> {
  return api.get<Envelope<ProjectSystem[]>>(`/MasterProject/allSystem${queryString({ sortOrder: "asc", ...params })}`);
}

export function recentSystems(): Promise<Envelope<ProjectSystem[]>> {
  return api.get<Envelope<ProjectSystem[]>>("/MasterProject/recent");
}

export function highReliabilitySystems(count = 10): Promise<Envelope<ProjectSystem[]>> {
  return api.get<Envelope<ProjectSystem[]>>(`/MasterProject/high-reliability${queryString({ count })}`);
}

export function systemsByProject(projectId: string): Promise<Envelope<SystemView[]>> {
  return api.get<Envelope<SystemView[]>>(`/MasterSystem/systemByProject${queryString({ projectId })}`);
}

export function createSystem(input: {
  projectId: string;
  systemName: string;
  hierarchy: SystemTreeInput[];
}): Promise<Envelope<{ rbdSystemId: string }>> {
  return api.post<Envelope<{ rbdSystemId: string }>>("/MasterSystem/createRbdSystem", input);
}

export function renameSystem(rbdSystemId: string, input: { projectId: string; systemName: string }): Promise<Envelope<SystemTree>> {
  return api.put<Envelope<SystemTree>>(`/MasterSystem/${encodeURIComponent(rbdSystemId)}`, {
    ...input,
    hierarchy: null,
  });
}

export function deleteSystem(rbdSystemId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/MasterSystem/${encodeURIComponent(rbdSystemId)}`);
}

export function getSystemTree(rbdSystemId: string): Promise<Envelope<SystemTree>> {
  return api.get<Envelope<SystemTree>>(`/MasterSystem/getRbdTreeView/${encodeURIComponent(rbdSystemId)}`);
}

export function systemPlot(rbdSystemId: string): Promise<Envelope<PlotPoint[]>> {
  return api.get<Envelope<PlotPoint[]>>(`/ReliabilityTotal/reliabilityPlot${queryString({ rbdSystemId })}`, {
    silent: true,
  });
}

export function plotTotals(points: PlotPoint[] | undefined): number[] {
  if (!points) return [];
  return points
    .map((point) => point.components?.TOTAL?.r_comp)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

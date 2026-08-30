import { api, queryString, type Envelope } from "@/lib/api/client";
import type { ListParams, PlotPoint, Project, ProjectSystem, SystemView } from "@/features/projects/types";

export function listProjects(params: ListParams = {}): Promise<Envelope<Project[]>> {
  return api.get<Envelope<Project[]>>(`/MasterProject${queryString(params)}`);
}

export function getProject(projectId: string): Promise<Envelope<Project>> {
  return api.get<Envelope<Project>>(`/MasterProject/${encodeURIComponent(projectId)}`);
}

export function createProject(input: { projectName: string }): Promise<Envelope<Project>> {
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

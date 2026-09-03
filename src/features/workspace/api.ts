import { api, queryString, type Envelope } from "@/lib/api/client";
import type {
  ComponentCreateInput,
  ComponentDetail,
  ComponentInputParameters,
  ComponentUpdateInput,
  DrawingEdgeInput,
  DrawingEdgeView,
  DrawingNodeInput,
  DrawingNodeView,
  DrawingScope,
  FailureEvent,
  FailureEventInput,
  HierarchyCalculation,
  HierarchyCreateInput,
  HierarchyUpdateInput,
  HierarchyView,
  HistoryEntry,
  PlotComponentParameters,
  PoissonParameter,
  SystemTotal,
  WeibullParameter,
} from "@/features/workspace/types";

const drawing = "/ReliabilityEditor/rbdDrawing";

function scopeQuery(scope: DrawingScope, id: string): string {
  return scope === "system" ? queryString({ rbdSystemId: id }) : queryString({ hierarchyId: id });
}

export function listDrawingNodes(scope: DrawingScope, id: string): Promise<Envelope<DrawingNodeView[]>> {
  const route = scope === "system" ? "getNodesByRbdSystem" : "getNodesByHierarchy";
  return api.get<Envelope<DrawingNodeView[]>>(`${drawing}/${route}${scopeQuery(scope, id)}`);
}

export function listDrawingEdges(scope: DrawingScope, id: string): Promise<Envelope<DrawingEdgeView[]>> {
  const route = scope === "system" ? "getEdgesByRbdSystem" : "getEdgesByHierarchy";
  return api.get<Envelope<DrawingEdgeView[]>>(`${drawing}/${route}${scopeQuery(scope, id)}`);
}

export function saveDrawingNodes(scope: DrawingScope, id: string, nodes: DrawingNodeInput[]): Promise<Envelope<unknown>> {
  const route = scope === "system" ? "saveNodesByRbdSystem" : "saveNodesByHierarchy";
  return api.put<Envelope<unknown>>(`${drawing}/${route}${scopeQuery(scope, id)}`, nodes);
}

export function saveDrawingEdges(scope: DrawingScope, id: string, edges: DrawingEdgeInput[]): Promise<Envelope<unknown>> {
  const route = scope === "system" ? "saveEdgesByRbdSystem" : "saveEdgesByHierarchy";
  return api.put<Envelope<unknown>>(`${drawing}/${route}${scopeQuery(scope, id)}`, edges, { skipTransform: true });
}

export function childHierarchies(parentId: string): Promise<Envelope<HierarchyView[]>> {
  return api.get<Envelope<HierarchyView[]>>(`/Hierarchy/parent/${encodeURIComponent(parentId)}`);
}

export function getHierarchy(hierarchyId: string): Promise<Envelope<HierarchyView>> {
  return api.get<Envelope<HierarchyView>>(`/Hierarchy/${encodeURIComponent(hierarchyId)}`);
}

export function createHierarchy(input: HierarchyCreateInput): Promise<Envelope<HierarchyView>> {
  return api.post<Envelope<HierarchyView>>("/Hierarchy", input);
}

export function updateHierarchy(hierarchyId: string, input: HierarchyUpdateInput): Promise<Envelope<HierarchyView>> {
  return api.put<Envelope<HierarchyView>>(`/Hierarchy/${encodeURIComponent(hierarchyId)}`, input);
}

export function deleteHierarchy(hierarchyId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/Hierarchy/${encodeURIComponent(hierarchyId)}`);
}

export function hierarchyInputParameters(hierarchyId: string): Promise<Envelope<ComponentInputParameters[]>> {
  return api.get<Envelope<ComponentInputParameters[]>>(
    `/MasterSystem/hierarchy/${encodeURIComponent(hierarchyId)}/input-parameters`,
  );
}

export function hierarchyPlotParameters(hierarchyId: string): Promise<Envelope<PlotComponentParameters[]>> {
  return api.get<Envelope<PlotComponentParameters[]>>(`/MasterSystem/hierarchy/${encodeURIComponent(hierarchyId)}/plot-graphic`);
}

export function createComponent(input: ComponentCreateInput): Promise<Envelope<ComponentDetail>> {
  return api.post<Envelope<ComponentDetail>>("/SystemComponentProperties", input);
}

export function getComponent(systemComponentId: string): Promise<Envelope<ComponentDetail>> {
  return api.get<Envelope<ComponentDetail>>(`/SystemComponentProperties/${encodeURIComponent(systemComponentId)}`);
}

export function updateComponent(systemComponentId: string, input: ComponentUpdateInput): Promise<Envelope<ComponentDetail>> {
  return api.put<Envelope<ComponentDetail>>(`/SystemComponentProperties/${encodeURIComponent(systemComponentId)}`, input);
}

export function deleteComponent(systemComponentId: string): Promise<Envelope<unknown>> {
  return api.delete<Envelope<unknown>>(`/SystemComponentProperties/${encodeURIComponent(systemComponentId)}`);
}

export function listFailureEvents(
  systemComponentId: string,
  params: { page: number; pageSize: number },
): Promise<Envelope<FailureEvent[]>> {
  return api.get<Envelope<FailureEvent[]>>(`/ReliabilityEditor/failureEvent${queryString({ systemComponentId, ...params })}`);
}

export function createFailureEvents(inputs: FailureEventInput[]): Promise<Envelope<FailureEventInput[]>> {
  return api.post<Envelope<FailureEventInput[]>>("/ReliabilityEditor/failureEvent", inputs);
}

export function deleteFailureEvent(failureEventId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/ReliabilityEditor/failureEvent/${encodeURIComponent(failureEventId)}`);
}

export function deleteFailureEventsOfComponent(systemComponentId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/ReliabilityEditor/failureEvent/bySystemComponent/${encodeURIComponent(systemComponentId)}`);
}

export function listWeibullParameters(systemComponentId: string): Promise<Envelope<WeibullParameter[]>> {
  return api.get<Envelope<WeibullParameter[]>>(`/SystemComponentProperties/${encodeURIComponent(systemComponentId)}/weibull-parameters`);
}

export function listPoissonParameters(systemComponentId: string): Promise<Envelope<PoissonParameter[]>> {
  return api.get<Envelope<PoissonParameter[]>>(`/SystemComponentProperties/${encodeURIComponent(systemComponentId)}/poisson-parameters`);
}

export async function fitDistribution(systemComponentId: string, distribution: "weibull" | "exponential" | "poisson"): Promise<void> {
  const base = `/SystemComponentProperties/${encodeURIComponent(systemComponentId)}`;
  if (distribution === "weibull") {
    await api.post<Envelope<unknown>>(`${base}/weibull-parameter`, []);
    await api.put<Envelope<unknown>>(`${base}/weibull`, {});
    return;
  }
  if (distribution === "poisson") {
    await api.post<Envelope<unknown>>(`${base}/poisson-parameter`, []).catch(() => undefined);
    await api.put<Envelope<unknown>>(`${base}/poisson`, {});
    return;
  }
  await api.post<Envelope<unknown>>(`${base}/exponential-parameter`, []);
  await api.put<Envelope<unknown>>(`${base}/exponential`, {});
}

export type ParameterSuggestion = {
  source: "history" | "vendor" | "master" | "none";
  events: number;
  components: number;
  totalHours: number;
  failureRate: number | null;
  mtbf: number | null;
};

export function suggestedParameters(systemComponentId: string): Promise<Envelope<ParameterSuggestion>> {
  return api.get<Envelope<ParameterSuggestion>>(
    `/SystemComponentProperties/${encodeURIComponent(systemComponentId)}/suggested-parameters`,
  );
}

export type SystemVersion = {
  systemSnapshotId: string;
  rbdSystemId: string;
  label: string;
  kind: "manual" | "auto";
  createdBy: string | null;
  createdAt: string;
};

export function listVersions(rbdSystemId: string): Promise<Envelope<SystemVersion[]>> {
  return api.get<Envelope<SystemVersion[]>>(`/Snapshot/system/${encodeURIComponent(rbdSystemId)}`);
}

export function saveVersion(rbdSystemId: string, label: string): Promise<Envelope<SystemVersion>> {
  return api.post<Envelope<SystemVersion>>(`/Snapshot/system/${encodeURIComponent(rbdSystemId)}`, { label });
}

export function restoreVersion(
  snapshotId: string,
  systemName?: string,
): Promise<Envelope<{ projectId: string; rbdSystemId: string }>> {
  return api.post<Envelope<{ projectId: string; rbdSystemId: string }>>(
    `/Snapshot/${encodeURIComponent(snapshotId)}/Restore`,
    { systemName: systemName ?? null },
  );
}

export function deleteVersion(snapshotId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/Snapshot/${encodeURIComponent(snapshotId)}`);
}

export function systemTotal(rbdSystemId: string): Promise<Envelope<SystemTotal>> {
  return api.get<Envelope<SystemTotal>>(`/ReliabilityTotal/rbdSystem/${encodeURIComponent(rbdSystemId)}/reliability-total`);
}

export function hierarchyReliability(hierarchyId: string): Promise<Envelope<HierarchyCalculation>> {
  return api.get<Envelope<HierarchyCalculation>>(`/ReliabilityTotal/hierarchy/${encodeURIComponent(hierarchyId)}/reliability`);
}

export function listHistory(hierarchyId: string, params: { page: number; pageSize: number }): Promise<Envelope<HistoryEntry[]>> {
  return api.get<Envelope<HistoryEntry[]>>(
    `/ReliabilityTotal/hierarchy/${encodeURIComponent(hierarchyId)}/history${queryString({ ...params, sortOrder: "desc" })}`,
  );
}

export function deleteHistory(historyId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/ReliabilityTotal/reliability-history/${encodeURIComponent(historyId)}`);
}

export function updateRunningHours(rbdSystemId: string, runningHours: number): Promise<Envelope<null>> {
  return api.put<Envelope<null>>(`/ReliabilityTotal/update-running-hours${queryString({ rbdSystemId, runningHours })}`, undefined, {
    silent: true,
  });
}

export function updateSystemFormula(rbdSystemId: string, formula: string): Promise<Envelope<string>> {
  return api.put<Envelope<string>>(`/ReliabilityTotal/updateFormula${queryString({ rbdSystemId, formula })}`);
}

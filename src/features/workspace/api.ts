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
  SystemTotal,
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

export function systemTotal(rbdSystemId: string): Promise<Envelope<SystemTotal>> {
  return api.get<Envelope<SystemTotal>>(`/ReliabilityTotal/rbdSystem/${encodeURIComponent(rbdSystemId)}/reliability-total`);
}

export function hierarchyReliability(hierarchyId: string): Promise<Envelope<HierarchyCalculation>> {
  return api.get<Envelope<HierarchyCalculation>>(`/ReliabilityTotal/hierarchy/${encodeURIComponent(hierarchyId)}/reliability`);
}

export function updateSystemFormula(rbdSystemId: string, formula: string): Promise<Envelope<string>> {
  return api.put<Envelope<string>>(`/ReliabilityTotal/updateFormula${queryString({ rbdSystemId, formula })}`);
}

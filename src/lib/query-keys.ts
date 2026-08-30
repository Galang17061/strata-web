export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (params: Record<string, unknown>) => ["projects", "list", params] as const,
    detail: (projectId: string) => ["projects", "detail", projectId] as const,
  },
  systems: {
    all: ["systems"] as const,
    list: (params: Record<string, unknown>) => ["systems", "list", params] as const,
    recent: ["systems", "recent"] as const,
    highReliability: (count: number) => ["systems", "high-reliability", count] as const,
    byProject: (projectId: string) => ["systems", "by-project", projectId] as const,
    tree: (rbdSystemId: string) => ["systems", "tree", rbdSystemId] as const,
    plot: (rbdSystemId: string) => ["systems", "plot", rbdSystemId] as const,
    total: (rbdSystemId: string) => ["systems", "total", rbdSystemId] as const,
  },
  hierarchy: {
    children: (parentId: string) => ["hierarchy", "children", parentId] as const,
    reliability: (hierarchyId: string) => ["hierarchy", "reliability", hierarchyId] as const,
    history: (hierarchyId: string, params: Record<string, unknown>) =>
      ["hierarchy", "history", hierarchyId, params] as const,
    inputParameters: (hierarchyId: string) => ["hierarchy", "input-parameters", hierarchyId] as const,
    plot: (hierarchyId: string) => ["hierarchy", "plot", hierarchyId] as const,
    plotParameters: (hierarchyId: string) => ["hierarchy", "plot-parameters", hierarchyId] as const,
  },
  drawing: {
    nodes: (scope: "system" | "hierarchy", id: string) => ["drawing", "nodes", scope, id] as const,
    edges: (scope: "system" | "hierarchy", id: string) => ["drawing", "edges", scope, id] as const,
  },
  components: {
    all: ["components"] as const,
    list: (params: Record<string, unknown>) => ["components", "list", params] as const,
    detail: (systemComponentId: string) => ["components", "detail", systemComponentId] as const,
    failures: (systemComponentId: string, params: Record<string, unknown>) =>
      ["components", "failures", systemComponentId, params] as const,
    weibull: (systemComponentId: string) => ["components", "weibull", systemComponentId] as const,
  },
  masterComponents: {
    all: ["master-components"] as const,
    list: (params: Record<string, unknown>) => ["master-components", "list", params] as const,
  },
  vendors: {
    all: ["vendors"] as const,
    list: (params: Record<string, unknown>) => ["vendors", "list", params] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: Record<string, unknown>) => ["users", "list", params] as const,
    roles: ["users", "roles"] as const,
    access: (userId: string) => ["users", "access", userId] as const,
  },
};

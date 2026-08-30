export function projectHref(projectId: string): string {
  return `/projects/detail/?project=${encodeURIComponent(projectId)}`;
}

export function workspaceHref(projectId: string, rbdSystemId?: string | null): string {
  const base = `/workspace/?project=${encodeURIComponent(projectId)}`;
  return rbdSystemId ? `${base}&system=${encodeURIComponent(rbdSystemId)}` : base;
}

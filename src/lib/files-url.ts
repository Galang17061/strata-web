import { apiRootUrl } from "@/lib/env";

function filesRootUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_FILES_BASE_URL ?? "").replace(/\/+$/, "");
  return configured || apiRootUrl();
}

export function filesUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (trimmed === "") return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const relative = trimmed.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^files\//i, "");
  return `${filesRootUrl()}/files/${relative}`;
}

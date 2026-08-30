function trimSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

export function apiBaseUrl(): string {
  return trimSlashes(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");
}

export function apiRootUrl(): string {
  return apiBaseUrl().replace(/\/api$/i, "");
}

export function swaggerUrl(): string {
  const root = apiRootUrl();
  return root ? `${root}/swagger/index.html` : "";
}

export function tokenCookieName(): string {
  return process.env.NEXT_PUBLIC_ACCESS_TOKEN_NAME || "strata_token";
}

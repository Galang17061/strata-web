import { toast } from "sonner";
import { readCookie } from "@/lib/cookies";
import { apiBaseUrl, tokenCookieName } from "@/lib/env";

export type Meta = {
  totalData: number;
  totalPage: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Envelope<T> = {
  status: string;
  statusCode: number;
  message: string;
  data: T;
  meta: Meta | null;
};

export type RequestOptions = {
  skipTransform?: boolean;
  signal?: AbortSignal;
  silent?: boolean;
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;
  body: unknown;

  constructor(message: string, status: number, body?: unknown, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.fieldErrors = fieldErrors;
  }
}

export function toPascalCase(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function toPascalCaseKeys<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((item) => toPascalCaseKeys(item)) as T;
  if (typeof value !== "object") return value;
  if (value instanceof Date || value instanceof File || value instanceof Blob) return value;
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    result[toPascalCase(key)] = toPascalCaseKeys(entry);
  }
  return result as T;
}

type UnauthorizedHandler = (status: number) => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let handlingUnauthorized = false;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export function isSignInRoute(endpoint: string): boolean {
  return endpoint.toLowerCase().startsWith("/auth/login");
}

export function messageFromErrorBody(body: unknown, status: number): { message: string; fieldErrors: Record<string, string[]> } {
  const fallback = `Request failed with status ${status}`;
  if (!body || typeof body !== "object") return { message: fallback, fieldErrors: {} };
  const record = body as Record<string, unknown>;
  const errors = record.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(errors as Record<string, unknown>)) {
      fieldErrors[field] = Array.isArray(messages) ? messages.map(String) : [String(messages)];
    }
    const message = Object.entries(fieldErrors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join(" | ");
    return { message: message || fallback, fieldErrors };
  }
  const message = record.message ?? record.error ?? record.title;
  return { message: typeof message === "string" && message ? message : fallback, fieldErrors: {} };
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const token = readCookie(tokenCookieName());
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const init: RequestInit = { method, headers, signal: options.signal };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.skipTransform ? body : toPascalCaseKeys(body));
  }

  const response = await fetch(`${apiBaseUrl()}${endpoint}`, init);

  if (response.status === 401 || response.status === 403) {
    const payload = await readJson(response);
    const { message } = messageFromErrorBody(payload, response.status);
    if (!isSignInRoute(endpoint) && unauthorizedHandler && !handlingUnauthorized) {
      handlingUnauthorized = true;
      try {
        unauthorizedHandler(response.status);
      } finally {
        handlingUnauthorized = false;
      }
    }
    throw new ApiError(message, response.status, payload);
  }

  if (response.status >= 500) {
    const payload = await readJson(response);
    const message = "The service is not responding right now. Try again in a moment.";
    if (!options.silent) toast.error("Service unavailable", { description: message });
    throw new ApiError(message, response.status, payload);
  }

  if (!response.ok) {
    const payload = await readJson(response);
    const { message, fieldErrors } = messageFromErrorBody(payload, response.status);
    throw new ApiError(message, response.status, payload, fieldErrors);
  }

  return (await readJson(response)) as T;
}

export type DownloadedFile = {
  blob: Blob;
  fileName: string;
};

export function fileNameFromDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded) return decodeURIComponent(encoded[1].trim());
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain ? plain[1].trim() : fallback;
}

async function download(endpoint: string, fallbackName: string): Promise<DownloadedFile> {
  const token = readCookie(tokenCookieName());
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiBaseUrl()}${endpoint}`, { headers });
  if (response.status === 401 || response.status === 403) {
    if (unauthorizedHandler && !handlingUnauthorized) {
      handlingUnauthorized = true;
      try {
        unauthorizedHandler(response.status);
      } finally {
        handlingUnauthorized = false;
      }
    }
    throw new ApiError("You are not allowed to fetch this file.", response.status);
  }
  if (!response.ok) {
    const payload = await readJson(response);
    const { message } = messageFromErrorBody(payload, response.status);
    throw new ApiError(message, response.status, payload);
  }
  return {
    blob: await response.blob(),
    fileName: fileNameFromDisposition(response.headers.get("Content-Disposition"), fallbackName),
  };
}

export const api = {
  download,
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>("GET", endpoint, undefined, options),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", endpoint, body, options),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", endpoint, body, options),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>("DELETE", endpoint, undefined, options),
};

export function queryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  api,
  messageFromErrorBody,
  queryString,
  setUnauthorizedHandler,
  toPascalCaseKeys,
} from "./client";

function jsonResponse(body: unknown, status = 200, contentType = "application/json") {
  return new Response(body === undefined ? "" : JSON.stringify(body), {
    status,
    headers: { "Content-Type": contentType },
  });
}

describe("toPascalCaseKeys", () => {
  it("capitalises every key, deeply, and leaves arrays and values alone", () => {
    expect(toPascalCaseKeys({ username: "a", nested: { runningHours: 1, list: [{ idNode: "x" }] } })).toEqual({
      Username: "a",
      Nested: { RunningHours: 1, List: [{ IdNode: "x" }] },
    });
    expect(toPascalCaseKeys([{ a: 1 }, 2, null])).toEqual([{ A: 1 }, 2, null]);
    expect(toPascalCaseKeys("plain")).toBe("plain");
  });
});

describe("messageFromErrorBody", () => {
  it("turns validation problems into one message per field", () => {
    const parsed = messageFromErrorBody(
      { title: "One or more validation errors occurred.", errors: { ProjectName: ["The ProjectName field is required."] } },
      400,
    );
    expect(parsed.fieldErrors).toEqual({ ProjectName: ["The ProjectName field is required."] });
    expect(parsed.message).toBe("ProjectName: The ProjectName field is required.");
  });

  it("falls back to message, error, or title", () => {
    expect(messageFromErrorBody({ message: "Incorrect username or password" }, 401).message).toBe(
      "Incorrect username or password",
    );
    expect(messageFromErrorBody({ title: "Bad" }, 400).message).toBe("Bad");
    expect(messageFromErrorBody("", 418).message).toBe("Request failed with status 418");
  });
});

describe("api", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://service.test/api");
    vi.stubEnv("NEXT_PUBLIC_ACCESS_TOKEN_NAME", "strata_token");
    vi.stubGlobal("fetch", fetchMock);
    document.cookie = "strata_token=abc123; Path=/";
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    setUnauthorizedHandler(null);
    document.cookie = "strata_token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/";
  });

  it("sends the bearer token and a PascalCase body, then unwraps the envelope", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ status: "success", statusCode: 200, message: "ok", data: { id: 1 }, meta: null }),
    );
    const result = await api.post<{ data: { id: number } }>("/MasterProject", { projectName: "Plant A" });
    expect(result.data.id).toBe(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://service.test/api/MasterProject");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer abc123");
    expect(init?.body).toBe(JSON.stringify({ ProjectName: "Plant A" }));
  });

  it("keeps the body untouched when asked to", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));
    await api.put("/ReliabilityEditor/rbdDrawing/saveEdgesByHierarchy?hierarchyId=1", [{ idEdge: "IE1" }], {
      skipTransform: true,
    });
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify([{ idEdge: "IE1" }]));
  });

  it("raises a field-aware error for validation problems", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ errors: { ProjectName: ["required"] } }, 400, "application/problem+json"),
    );
    await expect(api.post("/MasterProject", {})).rejects.toMatchObject({
      status: 400,
      fieldErrors: { ProjectName: ["required"] },
    });
  });

  it("tells the app when a session is rejected, except while signing in", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, 401));
    await expect(api.get("/MasterProject")).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledWith(401);
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Incorrect username or password" }, 401));
    await expect(api.post("/Auth/Login", { username: "x", password: "y" })).rejects.toMatchObject({
      message: "Incorrect username or password",
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("queryString", () => {
  it("skips empty values and encodes the rest", () => {
    expect(queryString({ page: 1, pageSize: 10, search: "", sortBy: undefined })).toBe("?page=1&pageSize=10");
    expect(queryString({})).toBe("");
  });
});

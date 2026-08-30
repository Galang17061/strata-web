import { afterEach, describe, expect, it, vi } from "vitest";
import { filesUrl } from "./files-url";

describe("filesUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hangs a stored logo path under the service files root", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000/api");
    vi.stubEnv("NEXT_PUBLIC_FILES_BASE_URL", "");
    expect(filesUrl("logo/abc.png")).toBe("http://localhost:5000/files/logo/abc.png");
  });

  it("straightens backslashes and a leading files folder", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000/api/");
    vi.stubEnv("NEXT_PUBLIC_FILES_BASE_URL", "");
    expect(filesUrl("\\logo\\abc.png")).toBe("http://localhost:5000/files/logo/abc.png");
    expect(filesUrl("/files/logo/abc.png")).toBe("http://localhost:5000/files/logo/abc.png");
  });

  it("prefers a dedicated files root when one is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000/api");
    vi.stubEnv("NEXT_PUBLIC_FILES_BASE_URL", "https://cdn.example.test/");
    expect(filesUrl("logo/abc.png")).toBe("https://cdn.example.test/files/logo/abc.png");
  });

  it("leaves an absolute address alone and gives nothing for an empty one", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000/api");
    expect(filesUrl("https://elsewhere.test/logo.png")).toBe("https://elsewhere.test/logo.png");
    expect(filesUrl("")).toBeNull();
    expect(filesUrl("   ")).toBeNull();
    expect(filesUrl(null)).toBeNull();
    expect(filesUrl(undefined)).toBeNull();
  });
});

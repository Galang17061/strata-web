import { beforeEach, describe, expect, it } from "vitest";
import { rememberMe, scopedStorage, setRememberMe } from "./store";

describe("the session lives where the visitor asked it to", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stays for next time by default", () => {
    expect(rememberMe()).toBe(true);
    scopedStorage.setItem("s", "v");
    expect(localStorage.getItem("s")).toBe("v");
    expect(sessionStorage.getItem("s")).toBeNull();
  });

  it("stays only for this visit when told not to remember", () => {
    setRememberMe(false);
    scopedStorage.setItem("s", "v");
    expect(sessionStorage.getItem("s")).toBe("v");
    expect(localStorage.getItem("s")).toBeNull();
  });

  it("moves house when the answer changes", () => {
    setRememberMe(false);
    scopedStorage.setItem("s", "short");
    setRememberMe(true);
    scopedStorage.setItem("s", "long");
    expect(localStorage.getItem("s")).toBe("long");
    expect(sessionStorage.getItem("s")).toBeNull();
  });

  it("reads from either home and clears both", () => {
    sessionStorage.setItem("s", "v");
    expect(scopedStorage.getItem("s")).toBe("v");
    localStorage.setItem("s", "w");
    expect(scopedStorage.getItem("s")).toBe("w");
    scopedStorage.removeItem("s");
    expect(localStorage.getItem("s")).toBeNull();
    expect(sessionStorage.getItem("s")).toBeNull();
  });
});

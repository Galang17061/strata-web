import { describe, expect, it } from "vitest";
import { chapterAt, chapters, clock } from "./demo-player";

describe("the tour chapters keep their order", () => {
  it("starts at zero and only moves forward", () => {
    expect(chapters[0].at).toBe(0);
    for (let i = 1; i < chapters.length; i += 1) {
      expect(chapters[i].at).toBeGreaterThan(chapters[i - 1].at);
    }
  });

  it("reads every mark as minutes and seconds", () => {
    expect(clock(0)).toBe("0:00");
    expect(clock(53)).toBe("0:53");
    expect(clock(81)).toBe("1:21");
    expect(clock(157.8)).toBe("2:37");
  });

  it("knows which chapter any moment belongs to", () => {
    expect(chapterAt(0)).toBe(0);
    expect(chapterAt(30.9)).toBe(0);
    expect(chapterAt(31)).toBe(1);
    expect(chapterAt(140)).toBe(5);
    expect(chapterAt(500)).toBe(chapters.length - 1);
  });
});

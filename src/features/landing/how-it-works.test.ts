import { describe, expect, it } from "vitest";
import { buildLayers } from "./how-it-works";

describe("the demo stack scores itself bottom up", () => {
  it("keeps the components at the bottom and the system on top", () => {
    const layers = buildLayers(["a", "b"]);
    expect(layers).toHaveLength(4);
    expect(layers[0]).toMatchObject({ id: "components", kind: "base" });
    expect(layers[3]).toMatchObject({ id: "system", kind: "system" });
    expect(layers[1]).toMatchObject({ id: "a", kind: "sub" });
  });

  it("scores every layer a shade below the one beneath it", () => {
    const layers = buildLayers(["a", "b", "c"]);
    for (let index = 1; index < layers.length; index += 1) {
      expect(layers[index].value).toBeLessThan(layers[index - 1].value);
      expect(layers[index].value).toBeCloseTo(layers[index - 1].value * 0.98, 10);
    }
    expect(layers[0].value).toBeCloseTo(0.9612, 10);
  });

  it("still stands with no sub-systems at all", () => {
    const layers = buildLayers([]);
    expect(layers).toHaveLength(2);
    expect(layers[1].value).toBeCloseTo(0.9612 * 0.98, 10);
  });
});

import { describe, expect, it } from "vitest";
import type { ComponentDetail } from "@/features/workspace/types";
import { distributionOf, formFromDetail, formProblem, toUpdateInput } from "./properties-tab";

const detail: ComponentDetail = {
  systemComponentId: "SCP-00001",
  rbdSystemId: "RS-00001",
  parentId: null,
  componentName: "Pump",
  componentTagNumber: null,
  active: 1,
  vendor: "Northwind Pumps",
  formulaCode: "C1",
  distributionType: "Poisson",
  failureRate: 0.00000851,
  runningHours: 8000,
  scaleParameter: null,
  shapeParameter: null,
  connectionType: "Series",
  connectionToId: null,
  positionX: null,
  positionY: null,
  idNode: "SCP-00001",
  reliabilityValue: 0.99995,
  activeComponent: 1,
  totalComponent: 1,
  regresi: null,
  mtbf: null,
  allowedFailures: 2,
  createdAt: null,
  updatedAt: null,
};

describe("tolerant distribution in the part form", () => {
  it("reads the stored allowance back into the form", () => {
    expect(distributionOf(detail)).toBe("poisson");
    const form = formFromDetail(detail);
    expect(form.distribution).toBe("poisson");
    expect(form.allowedFailures).toBe("2");
  });

  it("refuses a blank allowance and accepts zero", () => {
    const form = formFromDetail(detail);
    expect(formProblem({ ...form, allowedFailures: "" })).toMatch(/Allowed failures/);
    expect(formProblem({ ...form, allowedFailures: "0" })).toBeNull();
    expect(formProblem({ ...form, distribution: "exponential", allowedFailures: "" })).toBeNull();
  });

  it("sends the allowance along with the rest of the part", () => {
    const input = toUpdateInput(detail, formFromDetail(detail));
    expect(input.distributionType).toBe("poisson");
    expect(input.allowedFailures).toBe(2);
  });
});

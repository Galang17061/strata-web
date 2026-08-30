import { describe, expect, it } from "vitest";
import { MODULES, ROLES, hasRole, permissionAllows, permissionsFor, roleOf } from "./roles";

const user = (roleName: string, accessData: Parameters<typeof permissionsFor>[0] extends infer U ? (U extends { accessData: infer A } ? A : never) : never = []) => ({
  roleName,
  accessData,
});

describe("permissionsFor", () => {
  it("gives each role the matrix the product defines", () => {
    expect(permissionsFor(user("admin"), MODULES.SETTINGS).canView).toBe(true);
    expect(permissionsFor(user("Master Engineer"), MODULES.SETTINGS).canView).toBe(false);
    expect(permissionsFor(user("staff engineer"), MODULES.MASTER_DATA)).toMatchObject({
      canView: true,
      canCreate: false,
      canDownload: true,
    });
    expect(permissionsFor(user("viewer"), MODULES.DESIGN_FOR_RELIABILITY).canUpdate).toBe(false);
    expect(permissionsFor(user("viewer"), MODULES.PROFILE).canUpdate).toBe(true);
  });

  it("lets access rows from the service win over the matrix", () => {
    const granted = user("viewer", [
      { modul: "master-data", is_add: true, is_edit: false, is_delete: false, is_view: true, is_download: false },
    ]);
    expect(permissionsFor(granted, MODULES.MASTER_DATA)).toEqual({
      canView: true,
      canCreate: true,
      canUpdate: false,
      canDelete: false,
      canDownload: false,
    });
    expect(permissionsFor(granted, MODULES.DASHBOARD).canCreate).toBe(false);
  });

  it("treats unknown roles and missing users as the most restricted", () => {
    expect(roleOf(user("mystery"))).toBe(ROLES.VIEWER);
    expect(permissionsFor(null, MODULES.DASHBOARD).canView).toBe(false);
    expect(hasRole(user("ADMIN"), [ROLES.ADMIN])).toBe(true);
    expect(hasRole(null, ROLES.ADMIN)).toBe(false);
  });

  it("maps a permission key to its flag", () => {
    const permission = permissionsFor(user("staff engineer"), MODULES.MASTER_DATA);
    expect(permissionAllows(permission, "view")).toBe(true);
    expect(permissionAllows(permission, "delete")).toBe(false);
  });
});

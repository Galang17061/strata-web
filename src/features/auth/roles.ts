import type { AuthUser } from "@/features/auth/types";

export const ROLES = {
  ADMIN: "admin",
  MASTER_ENGINEER: "master engineer",
  STAFF_ENGINEER: "staff engineer",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const MODULES = {
  DASHBOARD: "dashboard",
  DESIGN_FOR_RELIABILITY: "design-for-reliability",
  MASTER_DATA: "master-data",
  SETTINGS: "settings",
  PROFILE: "profile",
} as const;

export type ModuleName = (typeof MODULES)[keyof typeof MODULES];

export type Permission = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canDownload: boolean;
};

export type PermissionKey = "view" | "create" | "update" | "delete" | "download";

const full: Permission = { canView: true, canCreate: true, canUpdate: true, canDelete: true, canDownload: true };
const readOnly: Permission = { canView: true, canCreate: false, canUpdate: false, canDelete: false, canDownload: true };
const none: Permission = { canView: false, canCreate: false, canUpdate: false, canDelete: false, canDownload: false };
const profile: Permission = { canView: true, canCreate: false, canUpdate: true, canDelete: false, canDownload: false };

export const ROLE_PERMISSIONS: Record<UserRole, Record<ModuleName, Permission>> = {
  [ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: full,
    [MODULES.DESIGN_FOR_RELIABILITY]: full,
    [MODULES.MASTER_DATA]: full,
    [MODULES.SETTINGS]: full,
    [MODULES.PROFILE]: profile,
  },
  [ROLES.MASTER_ENGINEER]: {
    [MODULES.DASHBOARD]: full,
    [MODULES.DESIGN_FOR_RELIABILITY]: full,
    [MODULES.MASTER_DATA]: full,
    [MODULES.SETTINGS]: none,
    [MODULES.PROFILE]: profile,
  },
  [ROLES.STAFF_ENGINEER]: {
    [MODULES.DASHBOARD]: full,
    [MODULES.DESIGN_FOR_RELIABILITY]: full,
    [MODULES.MASTER_DATA]: readOnly,
    [MODULES.SETTINGS]: none,
    [MODULES.PROFILE]: profile,
  },
  [ROLES.VIEWER]: {
    [MODULES.DASHBOARD]: readOnly,
    [MODULES.DESIGN_FOR_RELIABILITY]: readOnly,
    [MODULES.MASTER_DATA]: readOnly,
    [MODULES.SETTINGS]: none,
    [MODULES.PROFILE]: profile,
  },
};

export const NO_PERMISSION: Permission = none;

export function roleOf(user: Pick<AuthUser, "roleName"> | null | undefined): UserRole {
  const name = user?.roleName?.toLowerCase() as UserRole | undefined;
  return name && name in ROLE_PERMISSIONS ? name : ROLES.VIEWER;
}

export function permissionsFor(
  user: Pick<AuthUser, "roleName" | "accessData"> | null | undefined,
  moduleName: ModuleName,
): Permission {
  if (!user) return none;
  const access = user.accessData?.find((entry) => entry.modul.toLowerCase() === moduleName);
  if (access) {
    return {
      canView: access.is_view,
      canCreate: access.is_add,
      canUpdate: access.is_edit,
      canDelete: access.is_delete,
      canDownload: access.is_download,
    };
  }
  return ROLE_PERMISSIONS[roleOf(user)][moduleName] ?? none;
}

export function permissionAllows(permission: Permission, key: PermissionKey): boolean {
  switch (key) {
    case "view":
      return permission.canView;
    case "create":
      return permission.canCreate;
    case "update":
      return permission.canUpdate;
    case "delete":
      return permission.canDelete;
    case "download":
      return permission.canDownload;
  }
}

export function hasRole(user: Pick<AuthUser, "roleName"> | null | undefined, roles: UserRole | UserRole[]): boolean {
  if (!user) return false;
  const wanted = Array.isArray(roles) ? roles : [roles];
  return wanted.includes(roleOf(user));
}

"use client";

import type { ReactNode } from "react";
import { permissionAllows, type ModuleName, type PermissionKey, type UserRole } from "@/features/auth/roles";
import { usePermissions, useRole } from "@/features/auth/session";

type PermissionGateProps = {
  children: ReactNode;
  moduleName?: ModuleName;
  permission?: PermissionKey;
  requireRole?: UserRole | UserRole[];
  fallback?: ReactNode;
};

export function useAllowed({
  moduleName,
  permission,
  requireRole,
}: Omit<PermissionGateProps, "children" | "fallback">): boolean {
  const permissions = usePermissions(moduleName);
  const { hasRole } = useRole();
  if (requireRole && !hasRole(requireRole)) return false;
  if (permission && !permissionAllows(permissions, permission)) return false;
  return true;
}

export function PermissionGate({
  children,
  moduleName,
  permission,
  requireRole,
  fallback = null,
}: PermissionGateProps) {
  const allowed = useAllowed({ moduleName, permission, requireRole });
  return <>{allowed ? children : fallback}</>;
}

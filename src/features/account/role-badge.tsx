import { Badge } from "@/components/ui/badge";
import { ROLES, roleOf } from "@/features/auth/roles";

const roleLabels = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.MASTER_ENGINEER]: "Master engineer",
  [ROLES.STAFF_ENGINEER]: "Staff engineer",
  [ROLES.VIEWER]: "Viewer",
} as const;

const roleVariants = {
  [ROLES.ADMIN]: "default",
  [ROLES.MASTER_ENGINEER]: "info",
  [ROLES.STAFF_ENGINEER]: "secondary",
  [ROLES.VIEWER]: "outline",
} as const;

export function roleLabel(roleName: string | null | undefined): string {
  return roleLabels[roleOf({ roleName: roleName ?? "" })];
}

export function RoleBadge({ roleName }: { roleName: string | null | undefined }) {
  const role = roleOf({ roleName: roleName ?? "" });
  return <Badge variant={roleVariants[role]}>{roleLabels[role]}</Badge>;
}

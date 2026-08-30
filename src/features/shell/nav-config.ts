import { Boxes, LayoutDashboard, Users, Workflow, type LucideIcon } from "lucide-react";
import { MODULES, ROLES, type ModuleName, type UserRole } from "@/features/auth/roles";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  moduleName: ModuleName;
  requireRole?: UserRole[];
  match?: string[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard/",
        icon: LayoutDashboard,
        moduleName: MODULES.DASHBOARD,
      },
    ],
  },
  {
    label: "Work",
    items: [
      {
        label: "Projects",
        href: "/projects/",
        icon: Workflow,
        moduleName: MODULES.DESIGN_FOR_RELIABILITY,
        match: ["/projects/", "/workspace/"],
      },
      {
        label: "Master data",
        href: "/master-data/vendors/",
        icon: Boxes,
        moduleName: MODULES.MASTER_DATA,
        match: ["/master-data/"],
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        label: "Account management",
        href: "/account/",
        icon: Users,
        moduleName: MODULES.SETTINGS,
        requireRole: [ROLES.ADMIN],
      },
    ],
  },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const patterns = item.match ?? [item.href];
  return patterns.some((pattern) => pathname === pattern || pathname.startsWith(pattern));
}

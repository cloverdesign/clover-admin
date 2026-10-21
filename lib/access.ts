/**
 * Client-side access rules for project visibility. The API already scopes
 * `GET /api/projects` should scope by assignment/scope; these helpers add UI
 * defense in depth. Effective permissions are consumed when supplied by the
 * API; the built-in Admin seed is a compatibility fallback until then.
 */

import type { Admin, Project } from "@/lib/api/models"
import { INITIAL_ROLES, type PermissionId } from "@/lib/role-drafts"

const SEEDED_ADMIN_PERMISSIONS = INITIAL_ROLES.find((role) => role.id === "ADMIN")!.permissions

const ROUTE_PERMISSIONS: readonly [RegExp, PermissionId][] = [
  [/^\/admin$/, "projects.view"],
  [/^\/admin\/projects\/new$/, "projects.create"],
  [/^\/admin\/projects\/[^/]+\/edit$/, "projects.edit"],
  [/^\/admin\/projects(?:\/[^/]+)?$/, "projects.view"],
  [/^\/admin\/calendar$/, "projects.view"],
  [/^\/admin\/deliverables\/new$/, "delivery.edit"],
  [/^\/admin\/deliverables\/[^/]+\/edit$/, "delivery.edit"],
  [/^\/admin\/deliverables(?:\/[^/]+)?$/, "delivery.view"],
  [/^\/admin\/clients$/, "clients.view"],
  [/^\/admin\/clients\/new-project$/, "projects.create"],
  [/^\/admin\/clients\/new$/, "clients.edit"],
  [/^\/admin\/clients\/[^/]+\/edit$/, "clients.edit"],
  [/^\/admin\/invoices\/new$/, "invoices.manage"],
  [/^\/admin\/invoices\/[^/]+\/edit$/, "invoices.manage"],
  [/^\/admin\/invoices$/, "invoices.view"],
  [/^\/admin\/invoices\/[^/]+(?:\/edit)?$/, "invoices.view"],
  [/^\/admin\/revisions(?:\/[^/]+)?$/, "revisions.view"],
  [/^\/admin\/cms(?:\/.*)?$/, "site.edit"],
  // The current Team screen includes role promotion and assignment controls;
  // keep it owner-only until those actions are split by permission.
  [/^\/admin\/team$/, "roles.manage"],
  [/^\/admin\/team\/roles$/, "roles.manage"],
  [/^\/admin\/settings(?:\/.*)?$/, "workspace.settings"],
]

/** UI policy only; API endpoints must enforce the same grants independently. */
export function hasPermission(
  me: Admin | undefined,
  permission: PermissionId
): boolean {
  if (!me?.approved || !me.emailVerified) return false
  if (me.role === "SUPER_ADMIN" || me.roleId === "SUPER_ADMIN") return true
  if (permission === "roles.manage") return false
  if (me.effectivePermissions) return me.effectivePermissions.includes(permission)
  if ((me.roleId ?? me.role) === "ADMIN") {
    return SEEDED_ADMIN_PERMISSIONS.includes(permission)
  }
  return false
}

/** Super admins see every project; other admins only ones they're assigned to. */
export function canSeeProject(me: Admin | undefined, project: Project): boolean {
  if (!me || !hasPermission(me, "projects.view")) return false
  if (isSuperAdmin(me)) return true
  if (hasPermission(me, "projects.view") && me.projectScope === "all") return true
  return (project.assignedAdmins ?? []).some((a) => a.id === me.id)
}

/** Filter a project list down to the ones the given admin may see. */
export function visibleProjects(me: Admin | undefined, projects: Project[]): Project[] {
  if (isSuperAdmin(me)) return projects
  return projects.filter((p) => canSeeProject(me, p))
}

/** UI policy only. The API must independently enforce these permissions. */
export function isSuperAdmin(me: Admin | undefined): boolean {
  return Boolean(me?.approved && me.emailVerified && (me.role === "SUPER_ADMIN" || me.roleId === "SUPER_ADMIN"))
}

/** Explicit allowlist: new workspace routes are restricted until reviewed. */
export function canAccessAdminRoute(me: Admin | undefined, pathname: string): boolean {
  if (!me?.approved || !me.emailVerified) return false
  if (isSuperAdmin(me)) return true
  const path = pathname.replace(/\/+$/, "")
  const route = ROUTE_PERMISSIONS.find(([pattern]) => pattern.test(path))
  return route ? hasPermission(me, route[1]) : false
}

/**
 * Client-side access rules for project visibility. The API already scopes
 * `GET /api/projects` by assignment for non-super-admins, so these helpers are
 * defense-in-depth — they keep the list consistent and gate direct navigation
 * to a project detail/edit route the server would otherwise 404 on.
 */

import type { Admin, Project } from "@/lib/api/models"

/** Super admins see every project; other admins only ones they're assigned to. */
export function canSeeProject(me: Admin | undefined, project: Project): boolean {
  if (!me) return false
  if (me.role === "SUPER_ADMIN") return true
  return (project.assignedAdmins ?? []).some((a) => a.id === me.id)
}

/** Filter a project list down to the ones the given admin may see. */
export function visibleProjects(me: Admin | undefined, projects: Project[]): Project[] {
  if (me?.role === "SUPER_ADMIN") return projects
  return projects.filter((p) => canSeeProject(me, p))
}

/** UI policy only. The API must independently enforce these permissions. */
export function isSuperAdmin(me: Admin | undefined): boolean {
  return Boolean(me?.approved && me.emailVerified && me.role === "SUPER_ADMIN")
}

/** Explicit allowlist: new workspace routes are restricted until reviewed. */
export function canAccessAdminRoute(me: Admin | undefined, pathname: string): boolean {
  if (!me?.approved || !me.emailVerified) return false
  if (isSuperAdmin(me)) return true
  if (me.role !== "ADMIN") return false
  const path = pathname.replace(/\/+$/, "")
  return path === "/admin" || path === "/admin/projects" ||
    path === "/admin/calendar" ||
    /^\/admin\/projects\/(?!new$)[^/]+$/.test(path) ||
    /^\/admin\/deliverables(?:\/[^/]+(?:\/edit)?)?$/.test(path)
}

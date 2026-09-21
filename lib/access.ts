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

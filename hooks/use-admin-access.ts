"use client"

import { useMe } from "@/lib/queries/auth-queries"
import { hasPermission } from "@/lib/access"
import type { PermissionId } from "@/lib/role-drafts"

export function useAdminAccess(permission: PermissionId = "workspace.settings") {
  return hasPermission(useMe().data, permission)
}

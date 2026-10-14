"use client"

import { useMe } from "@/lib/queries/auth-queries"
import { isSuperAdmin } from "@/lib/access"

export function useAdminAccess() {
  return isSuperAdmin(useMe().data)
}

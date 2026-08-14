/**
 * Admin-management hooks (super-admin only). The list read plus approve / revoke
 * / set-role / delete mutations, each invalidating the admins list so the Team
 * screen reflects the change. Toast copy rides on `meta`.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { AdminsService } from "@/lib/services/admins-service"
import type { AdminRole } from "@/lib/api/models"

export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admins.all,
    queryFn: () => AdminsService.list(),
    meta: { errorMessage: "Couldn’t load admins." },
  })
}

export function useApproveAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AdminsService.approve(id),
    meta: { successMessage: "Admin approved.", errorMessage: "Couldn’t approve this admin." },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins.all }),
  })
}

export function useRevokeAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AdminsService.revoke(id),
    meta: { successMessage: "Access revoked.", errorMessage: "Couldn’t revoke access." },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins.all }),
  })
}

export function useSetAdminRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; role: AdminRole }) =>
      AdminsService.setRole(vars.id, { role: vars.role }),
    meta: { successMessage: "Role updated.", errorMessage: "Couldn’t change this admin’s role." },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins.all }),
  })
}

export function useDeleteAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AdminsService.remove(id),
    meta: { successMessage: "Admin deleted.", errorMessage: "Couldn’t delete this admin." },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins.all }),
  })
}

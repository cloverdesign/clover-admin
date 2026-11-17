/**
 * Admin-management hooks (super-admin only). The list read plus approve / revoke
 * / set-role / delete mutations, each invalidating the admins list so the Team
 * screen reflects the change. Toast copy rides on `meta`.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { AdminsService } from "@/lib/services/admins-service"
import type { Admin, AdminRole } from "@/lib/api/models"

/**
 * TEMPORARY: `GET /api/admins` isn't documented to include `assignedRole`, so
 * ADMIN rows without it are filled from `GET /api/admins/{id}`, one request
 * per row. A failed lookup leaves the row as the list returned it. Drop the
 * fill once the list includes the field.
 */
async function listAdminsWithRoles(): Promise<Admin[]> {
  const admins = await AdminsService.list()
  return Promise.all(
    admins.map(async (admin) => {
      if (admin.role !== "ADMIN" || admin.assignedRole !== undefined) return admin
      try {
        const detail = await AdminsService.getById(admin.id)
        return { ...admin, assignedRole: detail.assignedRole ?? null }
      } catch {
        return admin
      }
    })
  )
}

export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admins.all,
    queryFn: listAdminsWithRoles,
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

/**
 * Assign or clear an admin's dynamic RBAC role. The list endpoint isn't
 * documented to include `assignedRole`, so the response is written into the
 * cached list rather than relying only on the refetch. Roles are refetched
 * because their `adminCount` changes.
 */
export function useAssignAdminRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; roleId: string | null }) =>
      AdminsService.setAssignedRole(vars.id, { roleId: vars.roleId }),
    meta: { successMessage: "Role assigned.", errorMessage: "Couldn’t assign this role." },
    onSuccess: (updated, vars) => {
      qc.setQueryData<Admin[]>(queryKeys.admins.all, (list) =>
        list?.map((a) =>
          a.id === vars.id ? { ...a, assignedRole: updated.assignedRole ?? null } : a
        )
      )
      qc.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
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

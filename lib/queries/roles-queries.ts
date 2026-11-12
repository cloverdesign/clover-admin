/**
 * Role (dynamic RBAC) hooks — super-admin only. Saving an existing role can
 * take two writes (details, then the full permission set), so `useSaveRole`
 * sends only the parts that changed. Every write refetches the roles list.
 * Admin queries are refetched too, since deleting a role clears it from the
 * admins who had it.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { RolesService } from "@/lib/services/roles-service"
import type { Role } from "@/lib/api/models"

export function useRoles(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => RolesService.list(),
    enabled: options.enabled ?? true,
    meta: { errorMessage: "Couldn’t load roles." },
  })
}

export type RoleSaveInput = {
  /** Omit to create a new role. */
  id?: string
  name: string
  description: string
  permissionKeys: string[]
  /** Only for updates: which parts changed, so unchanged parts aren't rewritten. */
  changed?: { details: boolean; permissions: boolean }
}

export function useSaveRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: RoleSaveInput): Promise<Role | undefined> => {
      if (!input.id) {
        return RolesService.create({
          name: input.name,
          description: input.description || undefined,
          permissionKeys: input.permissionKeys,
        })
      }
      const changed = input.changed ?? { details: true, permissions: true }
      let role: Role | undefined
      if (changed.details) {
        role = await RolesService.update(input.id, {
          name: input.name,
          description: input.description,
        })
      }
      if (changed.permissions) {
        role = await RolesService.setPermissions(input.id, input.permissionKeys)
      }
      return role
    },
    meta: { successMessage: "Role saved.", errorMessage: "Couldn’t save this role." },
    // Refetch even on failure: a two-step update can half-apply.
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.roles.all }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => RolesService.remove(id),
    meta: { successMessage: "Role deleted.", errorMessage: "Couldn’t delete this role." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.roles.all })
      qc.invalidateQueries({ queryKey: queryKeys.admins.all })
    },
  })
}

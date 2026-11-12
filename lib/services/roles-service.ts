/**
 * Dynamic RBAC transport (super-admin only). Roles are arbitrary bundles of
 * permission keys; renaming and permission edits are separate endpoints, and
 * the permission write replaces the whole set.
 */

import { apiClient } from "@/lib/api/client"
import { RoleEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type { Role, RoleCreateInput, RoleUpdateInput } from "@/lib/api/models"

export class RolesService {
  static async list(): Promise<Role[]> {
    const res = await apiClient.get<ApiEnvelope<Role[]>>(RoleEndpoints.list)
    return res.data.data
  }

  static async create(input: RoleCreateInput): Promise<Role> {
    const res = await apiClient.post<ApiEnvelope<Role>>(RoleEndpoints.create, input)
    return res.data.data
  }

  static async update(id: string, input: RoleUpdateInput): Promise<Role> {
    const res = await apiClient.put<ApiEnvelope<Role>>(RoleEndpoints.update(id), input)
    return res.data.data
  }

  static async setPermissions(id: string, permissionKeys: string[]): Promise<Role> {
    const res = await apiClient.put<ApiEnvelope<Role>>(RoleEndpoints.permissions(id), {
      permissionKeys,
    })
    return res.data.data
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(RoleEndpoints.remove(id))
  }
}

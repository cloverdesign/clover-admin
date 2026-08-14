/**
 * Admin account management transport (super-admin only). List/read plus the
 * lifecycle actions: approve, revoke, change role, delete. The action responses
 * aren't consumed (the queries invalidate the list), so they resolve to void.
 */

import { apiClient } from "@/lib/api/client"
import { AdminsEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type { Admin, AdminRoleInput } from "@/lib/api/models"

export class AdminsService {
  static async list(): Promise<Admin[]> {
    const res = await apiClient.get<ApiEnvelope<Admin[]>>(AdminsEndpoints.list)
    return res.data.data
  }

  static async getById(id: string): Promise<Admin> {
    const res = await apiClient.get<ApiEnvelope<Admin>>(AdminsEndpoints.byId(id))
    return res.data.data
  }

  static async approve(id: string): Promise<void> {
    await apiClient.post<ApiEnvelope<Admin>>(AdminsEndpoints.approve(id))
  }

  static async revoke(id: string): Promise<void> {
    await apiClient.post<ApiEnvelope<Admin>>(AdminsEndpoints.revoke(id))
  }

  static async setRole(id: string, input: AdminRoleInput): Promise<void> {
    await apiClient.put<ApiEnvelope<Admin>>(AdminsEndpoints.role(id), input)
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(AdminsEndpoints.remove(id))
  }
}

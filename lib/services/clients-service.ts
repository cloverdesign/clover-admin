/** Clients transport — CRUD + portal invite. Unwraps the response envelope. */

import { apiClient } from "@/lib/api/client"
import { ClientEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type { Client, ClientInput } from "@/lib/api/models"

export class ClientsService {
  static async list(): Promise<Client[]> {
    const res = await apiClient.get<ApiEnvelope<Client[]>>(ClientEndpoints.list)
    return res.data.data
  }

  static async getById(id: string): Promise<Client> {
    const res = await apiClient.get<ApiEnvelope<Client>>(ClientEndpoints.byId(id))
    return res.data.data
  }

  static async create(input: ClientInput): Promise<Client> {
    const res = await apiClient.post<ApiEnvelope<Client>>(
      ClientEndpoints.create,
      input
    )
    return res.data.data
  }

  static async update(id: string, input: ClientInput): Promise<Client> {
    const res = await apiClient.put<ApiEnvelope<Client>>(
      ClientEndpoints.update(id),
      input
    )
    return res.data.data
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(ClientEndpoints.remove(id))
  }

  static async sendPortalInvite(id: string): Promise<void> {
    await apiClient.post<ApiEnvelope<null>>(ClientEndpoints.sendPortalInvite(id))
  }
}

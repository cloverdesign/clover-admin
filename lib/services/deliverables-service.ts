/**
 * Deliverables transport. Thin static methods over the axios client; each
 * unwraps the `{ success, message, data }` envelope and returns the payload.
 */

import { apiClient } from "@/lib/api/client"
import { DeliverableEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type { Deliverable, DeliverableInput } from "@/lib/api/models"

export class DeliverablesService {
  static async listByProject(projectId: string): Promise<Deliverable[]> {
    const res = await apiClient.get<ApiEnvelope<Deliverable[]>>(
      DeliverableEndpoints.listByProject(projectId)
    )
    return res.data.data
  }

  static async create(
    projectId: string,
    input: DeliverableInput
  ): Promise<void> {
    await apiClient.post<ApiEnvelope<null>>(
      DeliverableEndpoints.create(projectId),
      input
    )
  }

  static async update(
    id: string,
    input: DeliverableInput
  ): Promise<Deliverable> {
    const res = await apiClient.put<ApiEnvelope<Deliverable>>(
      DeliverableEndpoints.update(id),
      input
    )
    return res.data.data
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(DeliverableEndpoints.remove(id))
  }
}

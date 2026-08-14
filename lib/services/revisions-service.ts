/**
 * Revision requests transport — list/detail plus the admin decisions: update
 * status, and approve (scaffold as a new phase or a new linked project).
 */

import { apiClient } from "@/lib/api/client"
import { RevisionEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type {
  RevisionRequest,
  RevisionStatusInput,
  RevisionApproveInput,
} from "@/lib/api/models"

export class RevisionsService {
  static async list(): Promise<RevisionRequest[]> {
    const res = await apiClient.get<ApiEnvelope<RevisionRequest[]>>(
      RevisionEndpoints.list
    )
    return res.data.data
  }

  static async getById(id: string): Promise<RevisionRequest> {
    const res = await apiClient.get<ApiEnvelope<RevisionRequest>>(
      RevisionEndpoints.byId(id)
    )
    return res.data.data
  }

  static async updateStatus(
    id: string,
    input: RevisionStatusInput
  ): Promise<RevisionRequest> {
    const res = await apiClient.put<ApiEnvelope<RevisionRequest>>(
      RevisionEndpoints.updateStatus(id),
      input
    )
    return res.data.data
  }

  static async approve(
    id: string,
    input: RevisionApproveInput
  ): Promise<RevisionRequest> {
    const res = await apiClient.post<ApiEnvelope<RevisionRequest>>(
      RevisionEndpoints.approve(id),
      input
    )
    return res.data.data
  }
}

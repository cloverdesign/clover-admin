/**
 * Projects transport — the hub. Project CRUD plus its nested collections:
 * milestones, updates, and invoices (list/create). Unwraps the envelope.
 */

import { apiClient } from "@/lib/api/client"
import { ProjectEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type {
  Project,
  ProjectInput,
  ProjectUpdateInput,
  Milestone,
  MilestoneInput,
  ProjectUpdatePost,
  ProjectUpdatePostInput,
  Invoice,
  InvoiceInput,
} from "@/lib/api/models"

export class ProjectsService {
  static async list(): Promise<Project[]> {
    const res = await apiClient.get<ApiEnvelope<Project[]>>(ProjectEndpoints.list)
    return res.data.data
  }

  static async getById(id: string): Promise<Project> {
    const res = await apiClient.get<ApiEnvelope<Project>>(ProjectEndpoints.byId(id))
    return res.data.data
  }

  static async create(input: ProjectInput): Promise<Project> {
    const res = await apiClient.post<ApiEnvelope<Project>>(
      ProjectEndpoints.create,
      input
    )
    return res.data.data
  }

  static async update(id: string, input: ProjectUpdateInput): Promise<Project> {
    const res = await apiClient.put<ApiEnvelope<Project>>(
      ProjectEndpoints.update(id),
      input
    )
    return res.data.data
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(ProjectEndpoints.remove(id))
  }

  /* --------------------------------------------------------- milestones */

  static async createMilestone(
    projectId: string,
    input: MilestoneInput
  ): Promise<Milestone> {
    const res = await apiClient.post<ApiEnvelope<Milestone>>(
      ProjectEndpoints.createMilestone(projectId),
      input
    )
    return res.data.data
  }

  static async updateMilestone(
    projectId: string,
    milestoneId: string,
    input: MilestoneInput
  ): Promise<Milestone> {
    const res = await apiClient.put<ApiEnvelope<Milestone>>(
      ProjectEndpoints.updateMilestone(projectId, milestoneId),
      input
    )
    return res.data.data
  }

  static async removeMilestone(
    projectId: string,
    milestoneId: string
  ): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(
      ProjectEndpoints.removeMilestone(projectId, milestoneId)
    )
  }

  /* ------------------------------------------------------ project updates */

  static async createUpdate(
    projectId: string,
    input: ProjectUpdatePostInput
  ): Promise<ProjectUpdatePost> {
    const res = await apiClient.post<ApiEnvelope<ProjectUpdatePost>>(
      ProjectEndpoints.createUpdate(projectId),
      input
    )
    return res.data.data
  }

  static async removeUpdate(projectId: string, updateId: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(
      ProjectEndpoints.removeUpdate(projectId, updateId)
    )
  }

  /* ------------------------------------------------------------ invoices */

  static async invoices(projectId: string): Promise<Invoice[]> {
    const res = await apiClient.get<ApiEnvelope<Invoice[]>>(
      ProjectEndpoints.invoices(projectId)
    )
    return res.data.data
  }

  static async createInvoice(
    projectId: string,
    input: InvoiceInput
  ): Promise<Invoice> {
    const res = await apiClient.post<ApiEnvelope<Invoice>>(
      ProjectEndpoints.createInvoice(projectId),
      input
    )
    return res.data.data
  }
}

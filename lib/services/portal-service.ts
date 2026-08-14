/**
 * Client-portal transport — everything the client-facing app calls, routed
 * through `portalClient` (portal token). Auth is passwordless OTP; the rest are
 * client-scoped reads plus deliverable reviews and revision requests. All unwrap
 * the `{ success, message, data }` envelope.
 */

import { portalClient } from "@/lib/api/portal-client"
import { PortalEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type {
  Client,
  Project,
  Deliverable,
  RevisionRequest,
  PortalOtpRequestInput,
  PortalOtpVerifyInput,
  PortalSession,
  DeliverableReviewInput,
  PortalRevisionRequestInput,
  ClientProfileInput,
} from "@/lib/api/models"

export class PortalAuthService {
  static async requestOtp(input: PortalOtpRequestInput): Promise<void> {
    await portalClient.post<ApiEnvelope<{ message: string }>>(
      PortalEndpoints.requestOtp,
      input
    )
  }

  static async verifyOtp(input: PortalOtpVerifyInput): Promise<PortalSession> {
    const res = await portalClient.post<ApiEnvelope<PortalSession>>(
      PortalEndpoints.verifyOtp,
      input
    )
    return res.data.data
  }

  static async logout(): Promise<void> {
    await portalClient.post<ApiEnvelope<null>>(PortalEndpoints.logout)
  }

  static async me(): Promise<Client> {
    const res = await portalClient.get<ApiEnvelope<Client>>(PortalEndpoints.me)
    return res.data.data
  }

  static async updateMe(input: ClientProfileInput): Promise<Client> {
    const res = await portalClient.put<ApiEnvelope<Client>>(
      PortalEndpoints.me,
      input
    )
    return res.data.data
  }
}

export class PortalProjectsService {
  static async list(): Promise<Project[]> {
    const res = await portalClient.get<ApiEnvelope<Project[]>>(
      PortalEndpoints.projects
    )
    return res.data.data
  }

  static async getById(id: string): Promise<Project> {
    const res = await portalClient.get<ApiEnvelope<Project>>(
      PortalEndpoints.project(id)
    )
    return res.data.data
  }

  static async deliverables(id: string): Promise<Deliverable[]> {
    const res = await portalClient.get<ApiEnvelope<Deliverable[]>>(
      PortalEndpoints.projectDeliverables(id)
    )
    return res.data.data
  }

  static async submitRevision(
    id: string,
    input: PortalRevisionRequestInput
  ): Promise<RevisionRequest> {
    const res = await portalClient.post<ApiEnvelope<RevisionRequest>>(
      PortalEndpoints.projectRevisions(id),
      input
    )
    return res.data.data
  }
}

export class PortalDeliverablesService {
  static async review(
    id: string,
    input: DeliverableReviewInput
  ): Promise<Deliverable> {
    const res = await portalClient.post<ApiEnvelope<Deliverable>>(
      PortalEndpoints.reviewDeliverable(id),
      input
    )
    return res.data.data
  }
}

export class PortalRevisionsService {
  static async list(): Promise<RevisionRequest[]> {
    const res = await portalClient.get<ApiEnvelope<RevisionRequest[]>>(
      PortalEndpoints.revisions
    )
    return res.data.data
  }
}

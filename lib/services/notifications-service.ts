/**
 * Notifications transport — the admin attention feed. Read-only: the server
 * derives and returns the notifications; read/seen state is client-side.
 */

import { apiClient } from "@/lib/api/client"
import { NotificationEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type { Notification } from "@/lib/api/models"

export class NotificationsService {
  static async list(): Promise<Notification[]> {
    const res = await apiClient.get<ApiEnvelope<Notification[]>>(
      NotificationEndpoints.list
    )
    return res.data.data
  }
}

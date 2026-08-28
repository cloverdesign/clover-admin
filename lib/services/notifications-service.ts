/**
 * Notifications transport — the admin attention feed, plus the read flags. The
 * server derives the feed and owns read state per admin; the client only reads
 * the list and flips the flags.
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

  /** Mark one read, or pass `read: false` to flip it back to unread. */
  static async markRead(id: string, read = true): Promise<void> {
    await apiClient.patch<ApiEnvelope<Notification>>(
      NotificationEndpoints.read(id),
      { read }
    )
  }

  static async markAllRead(): Promise<void> {
    await apiClient.post<ApiEnvelope<null>>(NotificationEndpoints.readAll)
  }
}

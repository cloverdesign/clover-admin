/**
 * Notifications hook — the admin attention feed shown in the header bell.
 *
 * Polls the server every 60s so the feed stays live without websockets. Errors
 * are silent and resolve to an empty list: until the `/api/notifications`
 * endpoint ships (or if it's ever unreachable), the bell simply shows the
 * "all caught up" empty state rather than a toast storm.
 */

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { NotificationsService } from "@/lib/services/notifications-service"
import type { Notification } from "@/lib/api/models"

export function useNotifications() {
  const query = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => NotificationsService.list(),
    refetchInterval: 60_000,
    retry: false,
    meta: { silent: true as const },
  })

  const notifications: Notification[] = query.data ?? []
  return { ...query, notifications }
}

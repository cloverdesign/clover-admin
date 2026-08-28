/**
 * Notifications hooks — the admin attention feed shown in the header bell.
 *
 * Polls the server every 60s so the feed stays live without websockets. Errors
 * are silent and resolve to an empty list: if the endpoint is ever unreachable
 * the bell simply shows the "all caught up" empty state rather than a toast
 * storm.
 *
 * Read state is server-held (`Notification.read`, per admin). The mutations
 * write the cache optimistically so the badge reacts on click rather than after
 * the round trip, then reconcile on settle.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
  const unreadCount = notifications.filter((n) => !n.read).length
  return { ...query, notifications, unreadCount }
}

/** Patch the cached feed in place — shared by both read mutations. */
function useWriteReadFlag() {
  const qc = useQueryClient()
  return (predicate: (n: Notification) => boolean, read: boolean) => {
    qc.setQueryData<Notification[]>(queryKeys.notifications.all, (prev) =>
      prev?.map((n) => (predicate(n) ? { ...n, read } : n))
    )
  }
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  const write = useWriteReadFlag()
  return useMutation({
    mutationFn: (vars: { id: string; read?: boolean }) =>
      NotificationsService.markRead(vars.id, vars.read ?? true),
    // Silent: the bell's own state is the feedback, a toast would be noise.
    meta: { silent: true as const },
    onMutate: (vars) => write((n) => n.id === vars.id, vars.read ?? true),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  const write = useWriteReadFlag()
  return useMutation({
    mutationFn: () => NotificationsService.markAllRead(),
    meta: { silent: true as const },
    onMutate: () => write(() => true, true),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  })
}

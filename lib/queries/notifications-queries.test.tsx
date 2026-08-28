import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { queryKeys } from "@/lib/api/query-client"
import { NotificationsService } from "@/lib/services/notifications-service"
import type { Notification } from "@/lib/api/models"
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/queries/notifications-queries"

function notification(over: Partial<Notification>): Notification {
  return {
    id: "n1",
    type: "INVOICE_OVERDUE",
    title: "Invoice overdue",
    body: null,
    href: "/admin/invoices/i1",
    entityType: "invoice",
    entityId: "i1",
    read: false,
    createdAt: "2026-08-28T10:00:00.000Z",
    ...over,
  }
}

/**
 * A provider with its own client, cache pre-seeded, so nothing hits network.
 *
 * `serverAfter` is what the list endpoint returns once refetched — the read
 * mutations invalidate on settle, so without it the feed reconciles to whatever
 * the stub returns and the assertion sees an empty list.
 */
function harness(seed: Notification[], serverAfter: Notification[] = seed) {
  vi.spyOn(NotificationsService, "list").mockResolvedValue(serverAfter)
  const qc = new QueryClient({
    defaultOptions: {
      // staleTime so the seeded cache is authoritative and the mount fetch
      // doesn't race the optimistic write. Invalidation still forces a refetch.
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })
  qc.setQueryData(queryKeys.notifications.all, seed)
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { qc, wrapper }
}

describe("useNotifications", () => {
  it("counts unread from the server's read flag", () => {
    const { wrapper } = harness([
      notification({ id: "a", read: false }),
      notification({ id: "b", read: true }),
      notification({ id: "c", read: false }),
    ])
    const { result } = renderHook(() => useNotifications(), { wrapper })
    expect(result.current.unreadCount).toBe(2)
    expect(result.current.notifications).toHaveLength(3)
  })

  it("reports zero for an empty feed rather than undefined", () => {
    const { wrapper } = harness([])
    const { result } = renderHook(() => useNotifications(), { wrapper })
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications).toEqual([])
  })
})

describe("useMarkNotificationRead", () => {
  it("drops the badge count before the request resolves", async () => {
    // The optimistic write is the point — the bell should react on click, not
    // after a round trip.
    let resolve!: () => void
    const pending = new Promise<void>((r) => {
      resolve = r
    })
    vi.spyOn(NotificationsService, "markRead").mockReturnValue(pending)

    const { wrapper } = harness([
      notification({ id: "a", read: false }),
      notification({ id: "b", read: false }),
    ])
    const { result } = renderHook(
      () => ({ feed: useNotifications(), mark: useMarkNotificationRead() }),
      { wrapper }
    )
    expect(result.current.feed.unreadCount).toBe(2)

    result.current.mark.mutate({ id: "a" })
    await waitFor(() => expect(result.current.feed.unreadCount).toBe(1))

    resolve()
  })

  it("marks only the notification it was given", async () => {
    vi.spyOn(NotificationsService, "markRead").mockResolvedValue(undefined)
    const { wrapper } = harness(
      [notification({ id: "a", read: false }), notification({ id: "b", read: false })],
      [notification({ id: "a", read: true }), notification({ id: "b", read: false })]
    )
    const { result } = renderHook(
      () => ({ feed: useNotifications(), mark: useMarkNotificationRead() }),
      { wrapper }
    )

    result.current.mark.mutate({ id: "a" })
    await waitFor(() => {
      const byId = Object.fromEntries(
        result.current.feed.notifications.map((n) => [n.id, n.read])
      )
      expect(byId).toEqual({ a: true, b: false })
    })
  })
})

describe("useMarkAllNotificationsRead", () => {
  it("clears the whole feed's unread state", async () => {
    vi.spyOn(NotificationsService, "markAllRead").mockResolvedValue(undefined)
    const { wrapper } = harness(
      [
        notification({ id: "a", read: false }),
        notification({ id: "b", read: false }),
        notification({ id: "c", read: true }),
      ],
      [
        notification({ id: "a", read: true }),
        notification({ id: "b", read: true }),
        notification({ id: "c", read: true }),
      ]
    )
    const { result } = renderHook(
      () => ({ feed: useNotifications(), markAll: useMarkAllNotificationsRead() }),
      { wrapper }
    )

    result.current.markAll.mutate()
    await waitFor(() => expect(result.current.feed.unreadCount).toBe(0))
  })
})

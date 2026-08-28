"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification01Icon,
  Invoice01Icon,
  Task01Icon,
  DeliveryBox01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { EmptyState } from "@/components/ui/empty-state"
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/queries/notifications-queries"
import type { Notification, NotificationType } from "@/lib/api/models"

const TYPE_ICON: Record<NotificationType, typeof Invoice01Icon> = {
  INVOICE_OVERDUE: Invoice01Icon,
  REVISION_REQUESTED: Task01Icon,
  DELIVERABLE_REVIEW: DeliveryBox01Icon,
  MILESTONE_DUE: Clock01Icon,
}

/** Rough relative age, e.g. "3d ago" / "just now". */
function ago(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const mins = Math.max(0, Math.round((Date.now() - then) / 60_000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 14) return `${days}d ago`
  if (days < 60) return `${Math.round(days / 7)}w ago`
  return `${Math.round(days / 30)}mo ago`
}

/** Header bell — opens the notifications feed and carries the unread count.
 * Read state is the server's (`Notification.read`), so it follows the admin
 * across devices rather than living in this browser. */
export function NotificationBell() {
  const [open, setOpen] = React.useState(false)
  const { notifications, unreadCount } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative flex size-9 items-center justify-center rounded-(--button-radius) border border-border bg-input/30 text-muted-foreground transition-colors hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
      >
        <HugeiconsIcon icon={Notification01Icon} className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background tabular-nums">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-96 max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-medium">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1.5 text-muted-foreground">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            size="sm"
            icon={CheckmarkCircle02Icon}
            title="All caught up"
            description="You have no new notifications."
          />
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => {
              const onActivate = () => {
                if (!n.read) markRead.mutate({ id: n.id })
                setOpen(false)
              }
              const body = <NotificationRow notification={n} />
              const className = cn(
                "flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50",
                !n.read && "bg-muted/30"
              )
              // Not every notification carries a deep link; one without an href
              // is still worth showing and still marks itself read on click.
              return n.href ? (
                <Link key={n.id} href={n.href} onClick={onActivate} className={className}>
                  {body}
                </Link>
              ) : (
                <button key={n.id} type="button" onClick={onActivate} className={className}>
                  {body}
                </button>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** The inside of one feed row — shared by the linked and unlinked variants. */
function NotificationRow({ notification }: { notification: Notification }) {
  const unread = !notification.read
  return (
    <>
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <HugeiconsIcon icon={TYPE_ICON[notification.type]} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm",
              unread ? "font-medium" : "text-foreground/80"
            )}
          >
            {notification.title}
          </span>
          {unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
        </div>
        {notification.body && (
          <p className="truncate text-xs text-muted-foreground">{notification.body}</p>
        )}
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">
          {ago(notification.createdAt)}
        </p>
      </div>
    </>
  )
}

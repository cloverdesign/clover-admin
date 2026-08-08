"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Loading03Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  CONTENT_STATUS_LABEL,
  DEPLOY_STATUS_LABEL,
  type ContentStatus,
  type DeployStatus,
} from "@/lib/mock/cms"
import { useCmsPublish } from "@/components/admin/cms/publish-context"

/** Content state as a badge: Draft, Published, or Published-with-edits. */
export function ContentStatusBadge({
  status,
  pendingChanges,
}: {
  status: ContentStatus
  pendingChanges?: boolean
}) {
  if (status === "PUBLISHED" && pendingChanges) {
    return <Badge variant="info">Unpublished edits</Badge>
  }
  return (
    <Badge variant={status === "PUBLISHED" ? "success" : "warning"}>
      {CONTENT_STATUS_LABEL[status]}
    </Badge>
  )
}

const DEPLOY_TONE: Record<DeployStatus, string> = {
  LIVE: "text-success",
  QUEUED: "text-muted-foreground",
  BUILDING: "text-info",
  ERROR: "text-destructive",
}

/** Live deploy status with an animated glyph while building. */
export function DeployPill({ status }: { status: DeployStatus }) {
  const building = status === "QUEUED" || status === "BUILDING"
  const icon = building
    ? Loading03Icon
    : status === "ERROR"
      ? Alert02Icon
      : CheckmarkCircle02Icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        DEPLOY_TONE[status]
      )}
    >
      <HugeiconsIcon
        icon={icon}
        className={cn("size-3.5", building && "animate-spin")}
      />
      {DEPLOY_STATUS_LABEL[status]}
    </span>
  )
}

/** Sticky banner shown across the CMS while a deploy is running. */
export function DeployBanner() {
  const { building, status } = useCmsPublish()
  if (!building) return null
  return (
    <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-5 flex items-center gap-2.5 border-b border-info/30 bg-info/10 px-4 py-2.5 text-sm text-info sm:-mx-6 sm:-mt-6 sm:px-6">
      <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
      <span className="font-medium">
        {status === "QUEUED" ? "Deploy queued" : "Deploying to Vercel…"}
      </span>
      <span className="text-info/80">
        The marketing site is rebuilding. Changes go live when it finishes.
      </span>
    </div>
  )
}

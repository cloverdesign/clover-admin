import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, GitBranchIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Project, ProjectStatus } from "@/lib/api/models"

/** Client-friendly wording for project status (softer than the admin labels). */
export const PORTAL_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: "Getting started",
  IN_PROGRESS: "In progress",
  REVIEW: "In review",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
  CANCELLED: "Cancelled",
}

const STATUS_VARIANT: Record<
  ProjectStatus,
  "success" | "info" | "warning" | "secondary" | "destructive"
> = {
  PLANNING: "secondary",
  IN_PROGRESS: "info",
  REVIEW: "warning",
  COMPLETED: "success",
  ON_HOLD: "warning",
  CANCELLED: "destructive",
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{PORTAL_STATUS_LABEL[status]}</Badge>
}

/** Simple labelled progress bar — clamps to 0–100. */
export function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * Circular progress for the dashboard project spotlight — the arc is real
 * completion, not decoration. The progress stroke inherits `currentColor`, so
 * the caller tints it (default: brand) via text color; the track stays neutral.
 * Grows from empty on mount via a dashoffset transition (skipped when the ring
 * enters already complete, and by reduced-motion users through the eased value).
 */
export function ProgressRing({
  value,
  size = 76,
  strokeWidth = 6,
  className,
  children,
}: {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct / 100)
  return (
    <div
      className={cn("relative inline-flex shrink-0 text-primary", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {children}
      </span>
    </div>
  )
}

/** Linked project row — name, status, type/phase, and a labelled progress bar.
 * Used on the dashboard project list and the all-projects page; revisions render
 * the same card at a slightly smaller icon with a "Revision" tag. */
export function ProjectCard({
  project,
  isRevision,
}: {
  project: Project
  isRevision?: boolean
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/30 sm:p-5"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground",
          isRevision && "size-9"
        )}
      >
        <HugeiconsIcon icon={isRevision ? GitBranchIcon : Folder01Icon} className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{project.name}</span>
          {isRevision && <span className="text-xs text-muted-foreground">Revision</span>}
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {[project.type, project.phase].filter(Boolean).join(" · ") || "—"}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={project.progress} />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {Math.round(project.progress)}%
          </span>
        </div>
      </div>
    </Link>
  )
}

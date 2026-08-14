import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { ProjectStatus } from "@/lib/api/models"

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

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Task01Icon,
  DeliveryBox01Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type {
  AttentionKind,
  Phase,
  ProjectStatus,
} from "@/lib/mock/dashboard"
import { PHASE_COLOR } from "@/lib/phase-colors"

/** Icon + label per attention kind. Shared across dashboard layout variants. */
export const KIND_META: Record<
  AttentionKind,
  { icon: typeof Task01Icon; label: string }
> = {
  revision: { icon: Task01Icon, label: "Revision request" },
  deliverable: { icon: DeliveryBox01Icon, label: "Deliverable review" },
  invoice: { icon: Invoice01Icon, label: "Invoice" },
}

export function KindIcon({
  kind,
  className,
}: {
  kind: AttentionKind
  className?: string
}) {
  return <HugeiconsIcon icon={KIND_META[kind].icon} className={className} />
}

export function PhaseBadge({ phase }: { phase: Phase }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className="size-1.5 rounded-full"
        style={{ background: PHASE_COLOR[phase] }}
      />
      {phase}
    </Badge>
  )
}

/** Map each attention status to a semantic badge variant. */
const STATUS_VARIANT: Record<
  string,
  "destructive" | "info" | "success" | "warning" | "secondary"
> = {
  Overdue: "destructive",
  "Changes requested": "destructive",
  Requested: "info",
  "In review": "info",
  Ready: "success",
  Draft: "warning",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>
  )
}

const STATUS_DOT: Record<ProjectStatus, string> = {
  "on-track": "bg-lime-500",
  "at-risk": "bg-destructive",
  kickoff: "bg-muted-foreground/50",
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  kickoff: "Kickoff",
}

export function ProjectStatusDot({
  status,
  withLabel,
}: {
  status: ProjectStatus
  withLabel?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", STATUS_DOT[status])} />
      {withLabel && (
        <span className="text-xs text-muted-foreground">
          {STATUS_LABEL[status]}
        </span>
      )}
    </span>
  )
}

export function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/** Segmented tick meter (ui-test8 style): discrete bars, filled in lime up to
 * the value, the rest muted. */
export function SegmentMeter({
  value,
  segments = 10,
  className,
}: {
  value: number
  segments?: number
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const filled = Math.round((clamped / 100) * segments)
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("flex items-center gap-[3px]", className)}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "anim-grow h-4 w-[3px] rounded-full",
            i < filled ? "bg-lime-500" : "bg-muted-foreground/20"
          )}
          style={{ animationDelay: `${i * 28}ms` }}
        />
      ))}
    </div>
  )
}

"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Route01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import type { Milestone } from "@/lib/api/models"

/**
 * Milestone timeline on the client project view (PRD §1.2.4) — a read-only,
 * top-to-bottom sequence of the project's milestones. Completed steps fill the
 * rail in the brand color so progress reads as a path; the in-progress step is
 * ringed, upcoming steps are hollow. Renders nothing when a project has no
 * milestones (the detail endpoint may not embed any).
 */
export function PortalMilestones({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) return null

  const ordered = [...milestones].sort(
    (a, b) =>
      a.order - b.order ||
      (a.dueDate ?? "").localeCompare(b.dueDate ?? "")
  )
  const completed = ordered.filter((m) => m.status === "COMPLETED").length
  const nowIso = new Date().toISOString()

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Route01Icon} className="size-4 text-muted-foreground" />
          <h2 className="font-heading text-sm font-medium">Timeline</h2>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {completed}/{ordered.length}
        </span>
      </div>

      <ol className="mt-4">
        {ordered.map((milestone, i) => {
          const done = milestone.status === "COMPLETED"
          const active = milestone.status === "IN_PROGRESS"
          const isLast = i === ordered.length - 1
          const overdue =
            !done && Boolean(milestone.dueDate) && (milestone.dueDate as string) < nowIso

          return (
            <li key={milestone.id} className="relative flex gap-4">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-6 bottom-0 left-3 w-px -translate-x-1/2",
                    done ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
                  done && "bg-primary text-primary-foreground",
                  active && "border-2 border-primary bg-background",
                  !done && !active && "border border-border bg-background"
                )}
              >
                {done ? (
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                ) : active ? (
                  <span className="size-2 rounded-full bg-primary" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>

              <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-6")}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      done && "text-muted-foreground"
                    )}
                  >
                    {milestone.title}
                  </span>
                  {active && <Badge variant="info">In progress</Badge>}
                  {overdue && <Badge variant="destructive">Overdue</Badge>}
                </div>

                {milestone.description && (
                  <p className="mt-0.5 text-sm whitespace-pre-wrap text-muted-foreground">
                    {milestone.description}
                  </p>
                )}

                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    overdue ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {done
                    ? milestone.completedAt
                      ? `Completed ${formatDate(milestone.completedAt)}`
                      : "Completed"
                    : milestone.dueDate
                      ? `Due ${formatDate(milestone.dueDate)}`
                      : "No date set"}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

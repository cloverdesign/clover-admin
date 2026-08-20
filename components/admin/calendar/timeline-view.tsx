"use client"

import Link from "next/link"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import {
  axisTicks,
  datePercent,
  projectColor,
  projectSpan,
  spanStyle,
  type CalProject,
  type CalMilestone,
  type Period,
} from "@/components/admin/calendar/calendar-lib"

/**
 * Timeline (Gantt) — one row per project, its bar spanning start→end across a
 * shared time axis, with milestone diamonds pinned to their due dates. The
 * paradigm for "where does everything sit". Positions are percentages of the
 * visible range, so the same code scales from a week to a year.
 */
export function TimelineView({
  projects,
  milestones,
  start,
  end,
  period,
  today,
}: {
  projects: CalProject[]
  milestones: CalMilestone[]
  start: Date
  end: Date
  period: Period
  today: Date
}) {
  const ticks = axisTicks(start, end, period)
  const showToday = today >= start && today <= end
  const todayLeft = datePercent(today, start, end)

  const milestonesByProject = new Map<string, CalMilestone[]>()
  for (const m of milestones) {
    const list = milestonesByProject.get(m.projectId) ?? []
    list.push(m)
    milestonesByProject.set(m.projectId, list)
  }

  const rows = projects
    .map((project) => ({ project, span: projectSpan(project) }))
    .filter(
      (r): r is { project: CalProject; span: { start: Date; end: Date } } =>
        r.span !== null && spanStyle(r.span.start, r.span.end, start, end) !== null
    )

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed py-20 text-center">
        <p className="text-sm text-muted-foreground">No projects run through this range.</p>
        <p className="text-xs text-muted-foreground/70">
          Jump to a different period or zoom out.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <div className="min-w-[760px]">
        {/* Axis */}
        <div className="flex border-b border-border">
          <div className="w-48 shrink-0 border-r border-border px-4 py-2 text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase">
            Project
          </div>
          <div className="relative h-9 flex-1">
            {ticks.map((tick, i) => (
              <div
                key={i}
                className={cn(
                  "absolute top-0 flex h-full items-center whitespace-nowrap text-[10px] tabular-nums",
                  tick.major ? "text-foreground/70" : "text-muted-foreground/50"
                )}
                style={{ left: `${datePercent(tick.date, start, end)}%` }}
              >
                <span className="-translate-x-1/2 px-1">{tick.label}</span>
              </div>
            ))}
            {showToday && (
              <div
                className="absolute top-0 z-10 h-full w-px bg-primary"
                style={{ left: `${todayLeft}%` }}
              />
            )}
          </div>
        </div>

        {/* Rows */}
        {rows.map(({ project, span }, rowIndex) => {
          const style = spanStyle(span.start, span.end, start, end)!
          const color = projectColor(project)
          const projMilestones = milestonesByProject.get(project.id) ?? []
          return (
            <div
              key={project.id}
              className={cn(
                "flex items-stretch",
                rowIndex > 0 && "border-t border-border"
              )}
            >
              <Link
                href={`/admin/projects/${project.id}`}
                className="group flex w-48 shrink-0 flex-col justify-center border-r border-border px-4 py-2.5 transition-colors hover:bg-muted/40"
              >
                <span className="truncate text-sm font-medium group-hover:text-foreground">
                  {project.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {project.clientName}
                </span>
              </Link>

              <div className="relative h-14 flex-1">
                {/* major gridlines */}
                {ticks
                  .filter((t) => t.major)
                  .map((tick, i) => (
                    <div
                      key={i}
                      className="absolute inset-y-0 w-px bg-border/50"
                      style={{ left: `${datePercent(tick.date, start, end)}%` }}
                    />
                  ))}
                {showToday && (
                  <div
                    className="absolute inset-y-0 z-10 w-px bg-primary/40"
                    style={{ left: `${todayLeft}%` }}
                  />
                )}

                {/* the project bar */}
                <Link
                  href={`/admin/projects/${project.id}`}
                  title={`${project.name} · ${format(span.start, "MMM d")} – ${format(span.end, "MMM d, yyyy")}`}
                  className="absolute top-1/2 flex h-6 -translate-y-1/2 items-center overflow-hidden rounded-md px-2 text-[11px] font-medium text-neutral-950 transition-[filter] hover:brightness-105"
                  style={{ left: style.left, width: style.width, backgroundColor: color }}
                >
                  <span className="truncate">{project.name}</span>
                </Link>

                {/* milestone markers */}
                {projMilestones.map((m) => {
                  const due = new Date(m.dueDate)
                  if (due < start || due > end) return null
                  const done = m.status === "COMPLETED"
                  return (
                    <span
                      key={m.id}
                      title={`${m.title} · due ${format(due, "MMM d")}`}
                      className={cn(
                        "absolute top-1/2 z-20 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] border",
                        done
                          ? "border-foreground/40 bg-background"
                          : "border-foreground bg-foreground"
                      )}
                      style={{ left: `${datePercent(due, start, end)}%` }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

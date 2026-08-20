"use client"

import Link from "next/link"
import {
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  format,
} from "date-fns"

import { cn } from "@/lib/utils"
import {
  projectColor,
  projectSpan,
  type CalProject,
  type CalMilestone,
  type Period,
} from "@/components/admin/calendar/calendar-lib"

const WEEK = { weekStartsOn: 1 } as const
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * Calendar grid — the "what's on this day" paradigm. Month shows a day grid,
 * week a roomier 7-column strip, day a single agenda. Each day carries the
 * projects active that day and the milestones due, coloured by project.
 */
export function GridView({
  projects,
  milestones,
  anchor,
  period,
  today,
}: {
  projects: CalProject[]
  milestones: CalMilestone[]
  anchor: Date
  period: Period
  today: Date
}) {
  const byId = new Map(projects.map((p) => [p.id, p]))

  const activeOn = (day: Date): CalProject[] =>
    projects.filter((p) => {
      const span = projectSpan(p)
      return span !== null && span.start <= day && span.end >= day
    })
  const dueOn = (day: Date): CalMilestone[] =>
    milestones.filter((m) => isSameDay(new Date(m.dueDate), day))

  if (period === "day") {
    return (
      <DayAgenda
        day={anchor}
        projects={activeOn(anchor)}
        milestones={dueOn(anchor)}
        byId={byId}
      />
    )
  }

  const days =
    period === "week"
      ? eachDayOfInterval({
          start: startOfWeek(anchor, WEEK),
          end: endOfWeek(anchor, WEEK),
        })
      : eachDayOfInterval({
          start: startOfWeek(startOfMonth(anchor), WEEK),
          end: endOfWeek(endOfMonth(anchor), WEEK),
        })

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <DayCell
            key={i}
            day={day}
            inMonth={period === "week" || isSameMonth(day, anchor)}
            isToday={isSameDay(day, today)}
            tall={period === "week"}
            projects={activeOn(day)}
            milestones={dueOn(day)}
            byId={byId}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}

function DayCell({
  day,
  inMonth,
  isToday,
  tall,
  projects,
  milestones,
  byId,
  index,
}: {
  day: Date
  inMonth: boolean
  isToday: boolean
  tall: boolean
  projects: CalProject[]
  milestones: CalMilestone[]
  byId: Map<string, CalProject>
  index: number
}) {
  const cap = tall ? 6 : 2
  const items = [
    ...milestones.map((m) => ({ kind: "milestone" as const, m })),
    ...projects.map((p) => ({ kind: "project" as const, p })),
  ]
  const shown = items.slice(0, cap)
  const overflow = items.length - shown.length

  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-border p-1.5",
        tall ? "min-h-64" : "min-h-28",
        index % 7 !== 0 && "border-l",
        index >= 7 && "border-t",
        !inMonth && "bg-muted/30"
      )}
    >
      <div className="flex justify-end">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
            isToday && "bg-primary font-semibold text-primary-foreground",
            !isToday && !inMonth && "text-muted-foreground/40",
            !isToday && inMonth && "text-muted-foreground"
          )}
        >
          {format(day, "d")}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {shown.map((item) =>
          item.kind === "milestone" ? (
            <Link
              key={`m-${item.m.id}`}
              href={`/admin/projects/${item.m.projectId}`}
              title={`${item.m.title} — ${item.m.projectName}`}
              className="flex items-center gap-1.5 rounded px-1 py-0.5 text-[11px] transition-colors hover:bg-muted"
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rotate-45",
                  item.m.status === "COMPLETED" ? "bg-muted-foreground/40" : "bg-foreground"
                )}
              />
              <span className="truncate">{item.m.title}</span>
            </Link>
          ) : (
            <Link
              key={`p-${item.p.id}`}
              href={`/admin/projects/${item.p.id}`}
              title={item.p.name}
              className="flex items-center gap-1.5 rounded px-1 py-0.5 text-[11px] transition-colors hover:bg-muted"
            >
              <span
                className="size-2 shrink-0 rounded-[3px]"
                style={{ backgroundColor: projectColor(byId.get(item.p.id) ?? item.p) }}
              />
              <span className="truncate text-muted-foreground">{item.p.name}</span>
            </Link>
          )
        )}
        {overflow > 0 && (
          <span className="px-1 text-[11px] text-muted-foreground/60">+{overflow} more</span>
        )}
      </div>
    </div>
  )
}

function DayAgenda({
  day,
  projects,
  milestones,
  byId,
}: {
  day: Date
  projects: CalProject[]
  milestones: CalMilestone[]
  byId: Map<string, CalProject>
}) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border bg-card p-5">
      <div>
        <h2 className="font-heading text-sm font-medium">
          Milestones due
          <span className="ml-2 text-xs text-muted-foreground">{milestones.length}</span>
        </h2>
        {milestones.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing due on {format(day, "MMM d")}.</p>
        ) : (
          <ul className="mt-2 flex flex-col divide-y divide-border rounded-xl border">
            {milestones.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/projects/${m.projectId}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rotate-45",
                      m.status === "COMPLETED" ? "bg-muted-foreground/40" : "bg-foreground"
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{m.projectName}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-heading text-sm font-medium">
          Active projects
          <span className="ml-2 text-xs text-muted-foreground">{projects.length}</span>
        </h2>
        {projects.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No projects running this day.</p>
        ) : (
          <ul className="mt-2 flex flex-col divide-y divide-border rounded-xl border">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: projectColor(byId.get(p.id) ?? p) }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{p.clientName}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

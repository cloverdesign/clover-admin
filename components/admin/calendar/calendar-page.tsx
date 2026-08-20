"use client"

import * as React from "react"
import { useQueries } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { queryKeys } from "@/lib/api/query-client"
import { ProjectsService } from "@/lib/services/projects-service"
import { useProjects } from "@/lib/queries/projects-queries"
import { useClients } from "@/lib/queries/clients-queries"
import { Button } from "@/components/ui/button"
import { TimelineView } from "@/components/admin/calendar/timeline-view"
import { GridView } from "@/components/admin/calendar/grid-view"
import {
  rangeFor,
  rangeLabel,
  stepAnchor,
  projectColor,
  VIEW_PERIODS,
  PERIOD_LABEL,
  type CalView,
  type Period,
  type CalProject,
  type CalMilestone,
} from "@/components/admin/calendar/calendar-lib"

/**
 * Project calendar — a studio-wide overview of every project across time, in two
 * paradigms (timeline of spans, or a day/week/month grid) at whatever zoom fits.
 * Projects come from the list; milestones are fanned out of each project's detail
 * (the only place the API embeds them) and light up as that data streams in.
 */
export function CalendarPage() {
  const [view, setView] = React.useState<CalView>("timeline")
  const [period, setPeriod] = React.useState<Period>("month")
  const [anchor, setAnchor] = React.useState(() => new Date())
  const [today] = React.useState(() => new Date())

  const projectsQ = useProjects()
  const clientsQ = useClients()

  const live = React.useMemo(
    () => (projectsQ.data ?? []).filter((p) => !p.archived),
    [projectsQ.data]
  )
  const clientName = React.useCallback(
    (id: string) => clientsQ.data?.find((c) => c.id === id)?.company ?? "—",
    [clientsQ.data]
  )

  const projects: CalProject[] = React.useMemo(
    () => live.map((p) => ({ ...p, clientName: clientName(p.clientId) })),
    [live, clientName]
  )

  // Milestones live only on the project detail — fan out to collect them.
  const detailQs = useQueries({
    queries: live.map((p) => ({
      queryKey: queryKeys.projects.byId(p.id),
      queryFn: () => ProjectsService.getById(p.id),
    })),
  })
  const milestones: CalMilestone[] = detailQs.flatMap((q) => {
    const proj = q.data
    if (!proj?.milestones) return []
    return proj.milestones
      .filter((m) => m.dueDate)
      .map((m) => ({
        id: m.id,
        title: m.title,
        dueDate: m.dueDate as string,
        status: m.status,
        projectId: proj.id,
        projectName: proj.name,
      }))
  })

  const supportedPeriods = VIEW_PERIODS[view]
  const switchView = (next: CalView) => {
    setView(next)
    if (!VIEW_PERIODS[next].includes(period)) setPeriod("month")
  }

  const { start, end } = rangeFor(anchor, period)

  if (projectsQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (projectsQ.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load the calendar.</p>
        <Button variant="outline" size="sm" onClick={() => projectsQ.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{rangeLabel(anchor, period)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous"
              onClick={() => setAnchor((a) => stepAnchor(a, period, -1))}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next"
              onClick={() => setAnchor((a) => stepAnchor(a, period, 1))}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Button>
          </div>

          <Segmented
            options={supportedPeriods.map((p) => ({ value: p, label: PERIOD_LABEL[p] }))}
            value={period}
            onChange={(v) => setPeriod(v as Period)}
          />
          <Segmented
            options={[
              { value: "timeline", label: "Timeline" },
              { value: "grid", label: "Grid" },
            ]}
            value={view}
            onChange={(v) => switchView(v as CalView)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === "timeline" ? (
          <TimelineView
            projects={projects}
            milestones={milestones}
            start={start}
            end={end}
            period={period}
            today={today}
          />
        ) : (
          <GridView
            projects={projects}
            milestones={milestones}
            anchor={anchor}
            period={period}
            today={today}
          />
        )}
      </div>

      <Legend projects={projects} />
    </div>
  )
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-input/30 p-0.5">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full px-3 py-1 text-sm transition-colors",
              active
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/** Phase colour key — only the phases actually present, plus the done/cancelled
 * muted treatment when any exist. */
function Legend({ projects }: { projects: CalProject[] }) {
  const phases = Array.from(
    new Map(
      projects
        .filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED" && p.phase)
        .map((p) => [p.phase, projectColor(p)])
    ).entries()
  )
  const hasDone = projects.some((p) => p.status === "COMPLETED" || p.status === "CANCELLED")
  if (phases.length === 0 && !hasDone) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {phases.map(([phase, color]) => (
        <span key={phase} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
          {phase}
        </span>
      ))}
      {hasDone && (
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px] bg-neutral-400" />
          Done / cancelled
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span className="size-2 rotate-45 bg-foreground" />
        Milestone
      </span>
    </div>
  )
}

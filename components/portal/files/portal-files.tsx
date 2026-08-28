"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  usePortalAllDeliverables,
  usePortalProjects,
} from "@/lib/queries/portal-queries"
import { DeliverableList } from "@/components/portal/deliverables/deliverable-list"

/**
 * Every file the studio has shipped, across the whole engagement — the page that
 * `GET /api/portal/deliverables` made possible. Before that endpoint the only
 * way to assemble this was one request per project, so finished work was only
 * ever visible inside the project that produced it.
 */
export function PortalFiles() {
  const deliverablesQ = usePortalAllDeliverables()
  const projectsQ = usePortalProjects()
  const [projectFilter, setProjectFilter] = React.useState<string | null>(null)

  const projects = projectsQ.data ?? []
  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "A project"

  if (deliverablesQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (deliverablesQ.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your files.</p>
        <Button variant="outline" size="sm" onClick={() => deliverablesQ.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const all = deliverablesQ.data ?? []
  // Only offer the filter for projects that actually shipped something.
  const withFiles = projects.filter((p) => all.some((d) => d.projectId === p.id))
  const shown = projectFilter
    ? all.filter((d) => d.projectId === projectFilter)
    : all
  const readyCount = all.filter((d) => d.status === "READY").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {readyCount === 0
            ? "Finished work from your studio collects here."
            : `${readyCount} file${readyCount === 1 ? "" : "s"} across your projects`}
        </p>
      </div>

      {withFiles.length > 1 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <FilterPill
            active={projectFilter === null}
            onClick={() => setProjectFilter(null)}
          >
            All
          </FilterPill>
          {withFiles.map((p) => (
            <FilterPill
              key={p.id}
              active={projectFilter === p.id}
              onClick={() => setProjectFilter(p.id)}
            >
              {p.name}
            </FilterPill>
          ))}
        </div>
      )}

      <DeliverableList
        deliverables={shown}
        projectName={projectFilter ? undefined : projectName}
        emptyMessage={
          projectFilter
            ? "Nothing shipped on this project yet."
            : "Finished work shows up here as your studio ships it."
        }
      />
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
        active
          ? "bg-secondary font-medium text-secondary-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

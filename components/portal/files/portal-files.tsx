"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  usePortalAllDeliverables,
  usePortalProjects,
} from "@/lib/queries/portal-queries"
import { PortalPage, PortalFilterPill } from "@/components/portal/shell/portal-page"
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
  const shownCount = shown.filter((d) => d.status === "READY").length

  return (
    <PortalPage
      title="Files"
      subtitle="Everything your studio has shipped, newest first."
      toolbar={
        withFiles.length > 1 ? (
          <>
            <PortalFilterPill
              active={projectFilter === null}
              onClick={() => setProjectFilter(null)}
            >
              All
            </PortalFilterPill>
            {withFiles.map((p) => (
              <PortalFilterPill
                key={p.id}
                active={projectFilter === p.id}
                onClick={() => setProjectFilter(p.id)}
              >
                {p.name}
              </PortalFilterPill>
            ))}
          </>
        ) : null
      }
      meta={`${shownCount} file${shownCount === 1 ? "" : "s"}`}
    >
      <DeliverableList
        deliverables={shown}
        projectName={projectFilter ? undefined : projectName}
        emptyMessage={
          projectFilter
            ? "Nothing shipped on this project yet."
            : "Finished work shows up here as your studio ships it."
        }
      />
    </PortalPage>
  )
}

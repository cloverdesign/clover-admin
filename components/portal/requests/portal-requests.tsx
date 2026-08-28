"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, GitBranchIcon } from "@hugeicons/core-free-icons"

import { byNewest } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { usePortalRevisions, usePortalProjects } from "@/lib/queries/portal-queries"
import { RevisionCard } from "@/components/portal/projects/portal-revisions"
import { RequestRevisionButton } from "@/components/portal/home/dashboard-sections"
import { PortalPage, PortalFilterPill } from "@/components/portal/shell/portal-page"
import type { RevisionRequest } from "@/lib/api/models"

type Slice = "open" | "resolved" | "all"

const SLICE_LABEL: Record<Slice, string> = {
  open: "Open",
  resolved: "Resolved",
  all: "All",
}

function isOpen(r: RevisionRequest): boolean {
  return r.status === "REQUESTED" || r.status === "IN_REVIEW"
}

/**
 * Revision requests hub — every request the client has raised, across all their
 * projects. The per-project view shows the same requests scoped to one project;
 * this is the cross-project home for them, reachable from the shell nav.
 */
export function PortalRequests() {
  const { data: revisions, isLoading, isError } = usePortalRevisions()
  const { data: projects } = usePortalProjects()
  const [slice, setSlice] = React.useState<Slice>("open")

  const projectName = (id: string) =>
    projects?.find((p) => p.id === id)?.name ?? "a project"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !revisions) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your requests.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const sorted = [...revisions].sort((a, b) => byNewest(a.createdAt, b.createdAt))
  const openCount = sorted.filter(isOpen).length
  const shown = sorted.filter((r) =>
    slice === "open" ? isOpen(r) : slice === "resolved" ? !isOpen(r) : true
  )

  return (
    <PortalPage
      title="Revision requests"
      subtitle={
        revisions.length === 0
          ? "You haven’t raised any requests yet."
          : `${openCount} open · ${revisions.length - openCount} resolved`
      }
      toolbar={
        revisions.length > 0 ? (
          <>
            {(Object.keys(SLICE_LABEL) as Slice[]).map((key) => (
              <PortalFilterPill
                key={key}
                active={slice === key}
                onClick={() => setSlice(key)}
              >
                {SLICE_LABEL[key]}
              </PortalFilterPill>
            ))}
          </>
        ) : null
      }
      action={
        projects && projects.length > 0 ? (
          <RequestRevisionButton projects={projects} />
        ) : undefined
      }
    >
      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-20 text-center">
          <HugeiconsIcon icon={GitBranchIcon} className="size-6 text-muted-foreground/60" />
          <p className="max-w-sm text-sm text-muted-foreground">
            {revisions.length === 0
              ? "Need a change on a project? Raise a revision and your studio takes it from there."
              : slice === "open"
                ? "Nothing open. Every request has been decided."
                : "No resolved requests yet."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((r) => (
            <RevisionCard key={r.id} request={r} projectName={projectName(r.projectId)} />
          ))}
        </ul>
      )}
    </PortalPage>
  )
}

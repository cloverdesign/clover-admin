"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Folder01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { usePortalProjects } from "@/lib/queries/portal-queries"
import { ProjectCard } from "@/components/portal/parts"
import { PortalPage, PortalFilterPill } from "@/components/portal/shell/portal-page"
import type { Project } from "@/lib/api/models"

type Slice = "active" | "completed" | "all"

const SLICE_LABEL: Record<Slice, string> = {
  active: "Active",
  completed: "Completed",
  all: "All",
}

function isActive(p: Project): boolean {
  return !p.archived && p.status !== "COMPLETED" && p.status !== "CANCELLED"
}

function inSlice(p: Project, slice: Slice): boolean {
  if (slice === "active") return isActive(p)
  if (slice === "completed") return !isActive(p)
  return true
}

/** "2 projects · 1 revision" — the revision count is called out separately so the
 * line matches the number of cards on screen. */
function summarize(projects: number, revisions: number): string {
  const head = `${projects} project${projects === 1 ? "" : "s"} with Clover`
  if (revisions === 0) return head
  return `${head} · ${revisions} revision${revisions === 1 ? "" : "s"}`
}

/**
 * All projects — the complete engagement in one flat list, with revisions nested
 * under the project they branch from. The dashboard spotlights and summarizes;
 * this is the exhaustive view behind the "All projects" link.
 */
export function PortalProjects() {
  const { data: projects, isLoading, isError } = usePortalProjects()
  const [slice, setSlice] = React.useState<Slice>("active")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !projects) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your projects.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const roots = projects.filter((p) => !p.parentProjectId)
  const orphans = projects.filter(
    (p) => p.parentProjectId && !projects.some((x) => x.id === p.parentProjectId)
  )
  const topLevel = [...roots, ...orphans]
  const childrenOf = (id: string) => projects.filter((p) => p.parentProjectId === id)

  // A revision follows its parent regardless of the slice — hiding a completed
  // revision under an active project would leave the parent's history with a gap.
  const shown = topLevel.filter((p) => inSlice(p, slice))
  // Only offer slices that would actually show something different.
  const hasCompleted = topLevel.some((p) => !isActive(p))

  return (
    <PortalPage
      title="Your projects"
      subtitle={
        projects.length === 0
          ? "You don’t have any projects yet."
          : summarize(topLevel.length, projects.length - topLevel.length)
      }
      toolbar={
        hasCompleted ? (
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
      meta={
        projects.length > 0
          ? `${shown.length} project${shown.length === 1 ? "" : "s"}`
          : undefined
      }
    >
      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-20 text-center">
          <HugeiconsIcon icon={Folder01Icon} className="size-6 text-muted-foreground/60" />
          <p className="max-w-xs text-sm text-muted-foreground">
            {projects.length === 0
              ? "Your studio will add your project here soon."
              : slice === "active"
                ? "Nothing in flight right now."
                : "No completed projects yet."}
          </p>
        </div>
      ) : (
        shown.map((p) => (
          <div key={p.id} className="flex flex-col gap-2">
            <ProjectCard project={p} />
            {childrenOf(p.id).length > 0 && (
              <div className="ml-4 flex flex-col gap-2 border-l border-border pl-4">
                {childrenOf(p.id).map((child) => (
                  <ProjectCard key={child.id} project={child} isRevision />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </PortalPage>
  )
}

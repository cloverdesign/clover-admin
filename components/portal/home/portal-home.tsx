"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  ArrowRight01Icon,
  Folder01Icon,
  GitBranchIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePortalProjects, usePortalMe } from "@/lib/queries/portal-queries"
import { ProjectStatusBadge, ProgressBar } from "@/components/portal/parts"
import type { Project } from "@/lib/api/models"

/**
 * Client home — always the first screen. Lists every project the client has,
 * with revision-projects (those with a parent) nested under the original, so the
 * whole engagement reads as one thread.
 */
export function PortalHome() {
  const { data: projects, isLoading, isError } = usePortalProjects()
  const { data: client } = usePortalMe()

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
  const childrenOf = (id: string) => projects.filter((p) => p.parentProjectId === id)
  // Orphans (parent not in the returned set) still deserve to show.
  const orphans = projects.filter(
    (p) => p.parentProjectId && !projects.some((x) => x.id === p.parentProjectId)
  )
  const topLevel = [...roots, ...orphans]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {client?.name ? `Welcome, ${client.name.split(" ")[0]}` : "Your projects"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {projects.length === 0
            ? "You don’t have any projects yet."
            : `${topLevel.length} project${topLevel.length === 1 ? "" : "s"} with Clover`}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-20 text-center">
          <HugeiconsIcon icon={Folder01Icon} className="size-6 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            Your studio will add your project here soon.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {topLevel.map((p) => (
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
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  isRevision,
}: {
  project: Project
  isRevision?: boolean
}) {
  return (
    <Link
      href={`/portal/projects/${project.id}`}
      className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/30 sm:p-5"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground",
          isRevision && "size-9"
        )}
      >
        <HugeiconsIcon icon={isRevision ? GitBranchIcon : Folder01Icon} className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{project.name}</span>
          {isRevision && (
            <span className="text-xs text-muted-foreground">Revision</span>
          )}
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {[project.type, project.phase].filter(Boolean).join(" · ") || "—"}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={project.progress} className="max-w-xs" />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {Math.round(project.progress)}%
          </span>
        </div>
      </div>

      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="size-5 shrink-0 self-center text-muted-foreground/40 transition-colors group-hover:text-foreground"
      />
    </Link>
  )
}

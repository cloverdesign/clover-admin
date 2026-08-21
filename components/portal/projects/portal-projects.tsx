"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  ArrowLeft01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { usePortalProjects } from "@/lib/queries/portal-queries"
import { ProjectCard } from "@/components/portal/parts"

/**
 * All projects — the complete engagement in one flat list, with revisions nested
 * under the project they branch from. The dashboard spotlights and summarizes;
 * this is the exhaustive view behind the "All projects" link.
 */
export function PortalProjects() {
  const { data: projects, isLoading, isError } = usePortalProjects()

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
  const childrenOf = (id: string) =>
    projects.filter((p) => p.parentProjectId === id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length === 0
              ? "You don’t have any projects yet."
              : `${topLevel.length} project${topLevel.length === 1 ? "" : "s"} with Clover`}
          </p>
        </div>
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

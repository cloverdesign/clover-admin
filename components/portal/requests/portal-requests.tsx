"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, GitBranchIcon } from "@hugeicons/core-free-icons"

import { byNewest } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { usePortalRevisions, usePortalProjects } from "@/lib/queries/portal-queries"
import { RevisionCard } from "@/components/portal/projects/portal-revisions"
import { RequestRevisionButton } from "@/components/portal/home/dashboard-sections"

/**
 * Revision requests hub — every request the client has raised, across all their
 * projects, split into Open (awaiting a decision) and Resolved. The per-project
 * project view shows the same requests scoped to one project; this is the
 * cross-project home for them, reachable from the shell nav.
 */
export function PortalRequests() {
  const { data: revisions, isLoading, isError } = usePortalRevisions()
  const { data: projects } = usePortalProjects()

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
  const open = sorted.filter(
    (r) => r.status === "REQUESTED" || r.status === "IN_REVIEW"
  )
  const resolved = sorted.filter(
    (r) => r.status === "APPROVED" || r.status === "DECLINED"
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Revision requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {revisions.length === 0
              ? "You haven’t raised any requests yet."
              : `${open.length} open · ${resolved.length} resolved`}
          </p>
        </div>
        {projects && projects.length > 0 && (
          <RequestRevisionButton projects={projects} />
        )}
      </div>

      {revisions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-20 text-center">
          <HugeiconsIcon icon={GitBranchIcon} className="size-6 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            Need a change on a project? Raise a revision and your studio takes it from there.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {open.length > 0 && (
            <Group title="Open">
              {open.map((r) => (
                <RevisionCard key={r.id} request={r} projectName={projectName(r.projectId)} />
              ))}
            </Group>
          )}
          {resolved.length > 0 && (
            <Group title="Resolved">
              {resolved.map((r) => (
                <RevisionCard key={r.id} request={r} projectName={projectName(r.projectId)} />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="flex flex-col gap-3">{children}</ul>
    </section>
  )
}

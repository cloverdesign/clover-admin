"use client"

import * as React from "react"
import { GitPullRequestIcon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { byNewest } from "@/lib/format"
import { useRevisions } from "@/lib/queries/revisions-queries"
import { useProjects } from "@/lib/queries/projects-queries"
import { useClients } from "@/lib/queries/clients-queries"
import type { RevisionStatus } from "@/lib/api/models"
import { Button } from "@/components/ui/button"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { RevisionsTable, type RevisionRefs } from "@/components/admin/revisions/revisions-table"

type Filter = "all" | RevisionStatus

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "REQUESTED", label: "Requested" },
  { key: "IN_REVIEW", label: "In review" },
  { key: "APPROVED", label: "Approved" },
  { key: "DECLINED", label: "Declined" },
]

const isPending = (s: RevisionStatus) => s === "REQUESTED" || s === "IN_REVIEW"

/** Revision requests queue (§1.4) — status filter + metrics over a sortable
 * table. Pending requests lead. Client/project names composed from their lists. */
export function RevisionsList() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const revisionsQ = useRevisions()
  const projectsQ = useProjects()
  const clientsQ = useClients()

  const refs: RevisionRefs = React.useMemo(() => {
    const projById = new Map((projectsQ.data ?? []).map((p) => [p.id, p]))
    const clientById = new Map((clientsQ.data ?? []).map((c) => [c.id, c]))
    return {
      projectName: (id) => projById.get(id)?.name ?? "—",
      clientName: (id) => clientById.get(id)?.company ?? "—",
    }
  }, [projectsQ.data, clientsQ.data])

  if (revisionsQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (revisionsQ.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load revision requests.</p>
        <Button variant="outline" size="sm" onClick={() => revisionsQ.refetch()}>Retry</Button>
      </div>
    )
  }

  const all = [...(revisionsQ.data ?? [])].sort(
    (a, b) => Number(isPending(b.status)) - Number(isPending(a.status)) || byNewest(a.createdAt, b.createdAt)
  )
  const data = filter === "all" ? all : all.filter((r) => r.status === filter)
  const countFor = (key: Filter) =>
    key === "all" ? all.length : all.filter((r) => r.status === key).length
  const count = (s: RevisionStatus) => all.filter((r) => r.status === s).length
  const pendingCount = all.filter((r) => isPending(r.status)).length

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <div className="-mb-px flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors",
                active ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn("text-xs tabular-nums", active ? "text-muted-foreground" : "text-muted-foreground/50")}>
                {countFor(tab.key)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
        <Metric label="Pending" value={String(pendingCount)} tone={pendingCount > 0 ? "warning" : undefined} />
        <Metric label="Requested" value={String(count("REQUESTED"))} />
        <Metric label="In review" value={String(count("IN_REVIEW"))} />
        <Metric label="Approved" value={String(count("APPROVED"))} />
      </div>

      <PanelCard
        icon={GitPullRequestIcon}
        title="Revision requests"
        className="min-h-0 flex-1"
        bodyClassName="min-h-0 overflow-y-auto px-2"
      >
        {data.length ? (
          <RevisionsTable data={data} refs={refs} />
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">No requests in this filter.</div>
        )}
      </PanelCard>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "warning" }) {
  return (
    <div className="bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-xl font-semibold tracking-tight tabular-nums", tone === "warning" && "text-warning")}>
        {value}
      </div>
    </div>
  )
}

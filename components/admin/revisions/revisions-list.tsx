"use client"

import * as React from "react"
import { GitPullRequestIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { byNewest } from "@/lib/format"
import {
  REVISIONS,
  isPending,
  type RevisionRequest,
  type RevisionStatus,
} from "@/lib/mock/revisions"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { RevisionsTable } from "@/components/admin/revisions/revisions-table"

type Filter = "all" | RevisionStatus

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "REQUESTED", label: "Requested" },
  { key: "IN_REVIEW", label: "In review" },
  { key: "APPROVED", label: "Approved" },
  { key: "DECLINED", label: "Declined" },
]

/** Pending first (needs a decision), then most recent. */
const ALL = [...REVISIONS].sort(
  (a, b) =>
    Number(isPending(b)) - Number(isPending(a)) || byNewest(a.createdAt, b.createdAt)
)

/**
 * Revision requests queue (§1.4) — a status filter + metrics strip over a
 * sortable table. Pending requests (Requested / In review) lead. Row opens the
 * request to review and action. Only the table body scrolls.
 */
export function RevisionsList() {
  const [filter, setFilter] = React.useState<Filter>("all")

  const data = filter === "all" ? ALL : ALL.filter((r) => r.status === filter)
  const countFor = (key: Filter) =>
    key === "all" ? ALL.length : ALL.filter((r) => r.status === key).length

  const count = (s: RevisionStatus) => ALL.filter((r) => r.status === s).length

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      {/* Status filter */}
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
                active
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-xs tabular-nums",
                  active ? "text-muted-foreground" : "text-muted-foreground/50"
                )}
              >
                {countFor(tab.key)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Summary strip */}
      <div className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
        <Metric
          label="Pending"
          value={String(ALL.filter(isPending).length)}
          tone={ALL.filter(isPending).length > 0 ? "warning" : undefined}
        />
        <Metric label="Requested" value={String(count("REQUESTED"))} />
        <Metric label="In review" value={String(count("IN_REVIEW"))} />
        <Metric label="Approved" value={String(count("APPROVED"))} />
      </div>

      {/* Table */}
      <PanelCard
        icon={GitPullRequestIcon}
        title="Revision requests"
        className="min-h-0 flex-1"
        bodyClassName="min-h-0 overflow-y-auto px-2"
      >
        {data.length ? (
          <RevisionsTable data={data} />
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No requests in this filter.
          </div>
        )}
      </PanelCard>
    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "warning"
}) {
  return (
    <div className="bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-xl font-semibold tracking-tight tabular-nums",
          tone === "warning" && "text-warning"
        )}
      >
        {value}
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { DeliveryBox01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { byNewest } from "@/lib/format"
import {
  DELIVERABLES,
  reviewFor,
  isAwaitingReview,
  type Deliverable,
} from "@/lib/mock/deliverables"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { DeliverablesTable } from "@/components/admin/deliverables/deliverables-table"

type Filter = "all" | "READY" | "awaiting" | "changes" | "SUPERSEDED"

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "READY", label: "Current" },
  { key: "awaiting", label: "Awaiting review" },
  { key: "changes", label: "Changes requested" },
  { key: "SUPERSEDED", label: "Older versions" },
]

function matches(d: Deliverable, filter: Filter): boolean {
  switch (filter) {
    case "all":
      return true
    case "READY":
      return d.status === "READY"
    case "SUPERSEDED":
      return d.status === "SUPERSEDED"
    case "awaiting":
      return isAwaitingReview(d)
    case "changes":
      return reviewFor(d.id)?.status === "CHANGES_REQUESTED"
  }
}

/** Most recent upload first. */
const ALL = [...DELIVERABLES].sort((a, b) => byNewest(a.uploadedAt, b.uploadedAt))

/**
 * Deliverables page — a status/review filter toolbar + metrics strip over a
 * sortable table (dashboard feel). Deliverables are the finished work uploaded
 * or linked per project (§1.2.6); the client reviews the live version. Only the
 * table body scrolls.
 */
export function DeliverablesList() {
  const [filter, setFilter] = React.useState<Filter>("all")

  const data = ALL.filter((d) => matches(d, filter))
  const countFor = (key: Filter) => ALL.filter((d) => matches(d, key)).length

  const awaiting = ALL.filter(isAwaitingReview).length
  const changes = ALL.filter(
    (d) => reviewFor(d.id)?.status === "CHANGES_REQUESTED"
  ).length
  const approved = ALL.filter((d) => reviewFor(d.id)?.status === "APPROVED").length

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
        <Metric label="Deliverables" value={String(ALL.length)} />
        <Metric
          label="Awaiting review"
          value={String(awaiting)}
          tone={awaiting > 0 ? "info" : undefined}
        />
        <Metric
          label="Changes requested"
          value={String(changes)}
          tone={changes > 0 ? "warning" : undefined}
        />
        <Metric label="Approved" value={String(approved)} />
      </div>

      {/* Table */}
      <PanelCard
        icon={DeliveryBox01Icon}
        title="Deliverables"
        className="min-h-0 flex-1"
        bodyClassName="min-h-0 overflow-y-auto px-2"
      >
        {data.length ? (
          <DeliverablesTable data={data} />
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No deliverables in this filter.
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
  tone?: "info" | "warning"
}) {
  return (
    <div className="bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-xl font-semibold tracking-tight tabular-nums",
          tone === "info" && "text-info",
          tone === "warning" && "text-warning"
        )}
      >
        {value}
      </div>
    </div>
  )
}

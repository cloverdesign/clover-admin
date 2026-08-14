"use client"

import * as React from "react"
import { DeliveryBox01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { byNewest } from "@/lib/format"
import { useAllDeliverables } from "@/lib/queries/deliverables-queries"
import { useProjects } from "@/lib/queries/projects-queries"
import { useClients } from "@/lib/queries/clients-queries"
import type { Deliverable } from "@/lib/api/models"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { DeliverablesTable, type DeliverableRefs } from "@/components/admin/deliverables/deliverables-table"

type Filter = "all" | "READY" | "SUPERSEDED"

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "READY", label: "Current" },
  { key: "SUPERSEDED", label: "Older versions" },
]

/**
 * Deliverables page — composed across projects (no global endpoint). Status
 * (Ready/Superseded → Current/Older) + version; reviews aren't shown here (the
 * admin API has no review data — that's portal-only). Only the table scrolls.
 */
export function DeliverablesList() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const { deliverables, isLoading, isError, refetch } = useAllDeliverables()
  const projectsQ = useProjects()
  const clientsQ = useClients()

  const refs: DeliverableRefs = React.useMemo(() => {
    const projById = new Map((projectsQ.data ?? []).map((p) => [p.id, p]))
    const clientById = new Map((clientsQ.data ?? []).map((c) => [c.id, c]))
    // Group siblings by project + title to derive current/older.
    const siblingCount = new Map<string, number>()
    for (const d of deliverables) {
      const k = `${d.projectId}::${d.title}`
      siblingCount.set(k, (siblingCount.get(k) ?? 0) + 1)
    }
    const key = (d: Deliverable) => `${d.projectId}::${d.title}`
    return {
      projectName: (id) => projById.get(id)?.name ?? "—",
      clientName: (id) => {
        const p = projById.get(id)
        return (p && clientById.get(p.clientId)?.company) ?? "—"
      },
      isCurrent: (d) => d.status === "READY",
      hasSiblings: (d) => (siblingCount.get(key(d)) ?? 0) > 1,
    }
  }, [deliverables, projectsQ.data, clientsQ.data])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load deliverables.</p>
        <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  const all = [...deliverables].sort((a, b) => byNewest(a.uploadedAt, b.uploadedAt))
  const data = filter === "all" ? all : all.filter((d) => d.status === filter)
  const countFor = (key: Filter) =>
    key === "all" ? all.length : all.filter((d) => d.status === key).length

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

      <div className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-2xl border bg-border">
        <Metric label="Deliverables" value={String(all.length)} />
        <Metric label="Current" value={String(countFor("READY"))} />
        <Metric label="Older versions" value={String(countFor("SUPERSEDED"))} />
      </div>

      <PanelCard
        icon={DeliveryBox01Icon}
        title="Deliverables"
        className="min-h-0 flex-1"
        bodyClassName="min-h-0 overflow-y-auto px-2"
      >
        {data.length ? (
          <DeliverablesTable data={data} refs={refs} />
        ) : (
          <EmptyState
            size="sm"
            icon={DeliveryBox01Icon}
            title="No deliverables"
            description="No deliverables match this filter yet."
          />
        )}
      </PanelCard>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  )
}

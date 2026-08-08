"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { convert } from "@/lib/mock/currencies"
import { useSiteCurrency } from "@/hooks/use-site-currency"
import { useClients } from "@/lib/queries/clients-queries"
import { useProjects } from "@/lib/queries/projects-queries"
import type { ClientStatus } from "@/lib/api/models"
import { ClientsLedger, type ClientRollup } from "@/components/admin/clients/clients-ledger"
import { ClientsEmpty } from "@/components/admin/clients/clients-empty"
import { ClientDetailPanel } from "@/components/admin/clients/client-detail-panel"
import { Button } from "@/components/ui/button"

type Filter = "all" | ClientStatus

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "LEAD", label: "Leads" },
  { key: "ONBOARDING", label: "Onboarding" },
  { key: "ACTIVE", label: "Active" },
  { key: "ON_HOLD", label: "On hold" },
  { key: "CHURNED", label: "Churned" },
]

const ACTIVE_PROJECT = (status: string) =>
  status !== "COMPLETED" && status !== "CANCELLED"

/**
 * Clients page — status filter over the ledger + a detail panel docked by the
 * `?c=<id>` param. Clients come from the API; per-client project rollups
 * (active count + pipeline value) are composed from the projects list.
 */
export function ClientsList({ selectedId }: { selectedId?: string }) {
  const [display] = useSiteCurrency()
  const [filter, setFilter] = React.useState<Filter>("all")

  const clientsQ = useClients()
  const projectsQ = useProjects()

  // Compose per-client rollups from projects (one request, cheap).
  const rollups = React.useMemo(() => {
    const map = new Map<string, ClientRollup>()
    for (const p of projectsQ.data ?? []) {
      const r = map.get(p.clientId) ?? { active: 0, pipeline: 0 }
      if (!p.archived && ACTIVE_PROJECT(p.status)) r.active += 1
      r.pipeline += convert(p.totalValue, p.currency, display)
      map.set(p.clientId, r)
    }
    return map
  }, [projectsQ.data, display])

  if (clientsQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }

  if (clientsQ.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load clients.</p>
        <Button variant="outline" size="sm" onClick={() => clientsQ.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const clients = clientsQ.data ?? []
  if (!clients.length) return <ClientsEmpty />

  const data = filter === "all" ? clients : clients.filter((c) => c.status === filter)
  const countFor = (key: Filter) =>
    key === "all" ? clients.length : clients.filter((c) => c.status === key).length

  return (
    <div className="flex h-full min-h-0 gap-4 md:gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="-mb-px flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border">
          {TABS.map((tab) => {
            const activeTab = filter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors",
                  activeTab
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    activeTab ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}
                >
                  {countFor(tab.key)}
                </span>
              </button>
            )
          })}
        </div>

        {data.length ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <ClientsLedger
              data={data}
              rollups={rollups}
              display={display}
              selectedId={selectedId}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No clients in this filter.
          </div>
        )}
      </div>

      {selectedId && <ClientDetailPanel id={selectedId} />}
    </div>
  )
}

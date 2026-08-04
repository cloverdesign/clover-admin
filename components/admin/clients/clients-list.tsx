"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { CLIENTS, getClient, type ClientStatus } from "@/lib/mock/clients"
import { ClientsLedger } from "@/components/admin/clients/clients-ledger"
import { ClientsEmpty } from "@/components/admin/clients/clients-empty"
import { ClientDetailPanel } from "@/components/admin/clients/client-detail-panel"

type Filter = "all" | ClientStatus

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "LEAD", label: "Leads" },
  { key: "ONBOARDING", label: "Onboarding" },
  { key: "ACTIVE", label: "Active" },
  { key: "ON_HOLD", label: "On hold" },
  { key: "CHURNED", label: "Churned" },
]

/**
 * Clients page — a status filter toolbar over the ledger, with a detail panel
 * that docks beside the list (desktop) / covers the screen (mobile) when a
 * client is selected via `?c=<id>`. Title, global search and New-client live in
 * the shell top bar. `selectedId` comes from the page's search param.
 */
export function ClientsList({ selectedId }: { selectedId?: string }) {
  const [filter, setFilter] = React.useState<Filter>("all")

  const data =
    filter === "all" ? CLIENTS : CLIENTS.filter((c) => c.status === filter)

  const countFor = (key: Filter) =>
    key === "all" ? CLIENTS.length : CLIENTS.filter((c) => c.status === key).length

  const selected = selectedId ? getClient(selectedId) : undefined

  if (!CLIENTS.length) return <ClientsEmpty />

  return (
    <div className="flex h-full min-h-0 gap-4 md:gap-5">
      {/* List column — shrinks when the panel is open */}
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
            <ClientsLedger data={data} selectedId={selectedId} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No clients in this filter.
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && <ClientDetailPanel id={selected.id} />}
    </div>
  )
}

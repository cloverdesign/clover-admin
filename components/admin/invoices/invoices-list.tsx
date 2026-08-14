"use client"

import * as React from "react"
import { Invoice01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { byNewest } from "@/lib/format"
import { convert } from "@/lib/mock/currencies"
import { formatMoney } from "@/lib/mock/clients"
import { useSiteCurrency } from "@/hooks/use-site-currency"
import { useAllInvoices } from "@/lib/queries/invoices-queries"
import { useProjects } from "@/lib/queries/projects-queries"
import { useClients } from "@/lib/queries/clients-queries"
import type { InvoiceStatus } from "@/lib/api/models"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { InvoicesTable, type InvoiceRefs } from "@/components/admin/invoices/invoices-table"

type Filter = "all" | InvoiceStatus

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "SENT", label: "Sent" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "PAID", label: "Paid" },
]

/**
 * Invoices page — a status filter + metrics strip over a sortable table.
 * Invoices are composed across projects (no global endpoint); project + client
 * names are resolved from their lists. Money follows the currency switcher.
 */
export function InvoicesList() {
  const [display] = useSiteCurrency()
  const [filter, setFilter] = React.useState<Filter>("all")

  const { invoices, isLoading, isError, refetch } = useAllInvoices()
  const projectsQ = useProjects()
  const clientsQ = useClients()

  const refs: InvoiceRefs = React.useMemo(() => {
    const projById = new Map((projectsQ.data ?? []).map((p) => [p.id, p]))
    const clientById = new Map((clientsQ.data ?? []).map((c) => [c.id, c]))
    return {
      projectName: (id) => projById.get(id)?.name ?? "—",
      clientName: (id) => {
        const p = projById.get(id)
        return (p && clientById.get(p.clientId)?.company) ?? "—"
      },
    }
  }, [projectsQ.data, clientsQ.data])

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
        <p className="text-sm text-muted-foreground">Couldn’t load invoices.</p>
        <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
      </div>
    )
  }

  const all = [...invoices].sort((a, b) => byNewest(a.issuedDate ?? "", b.issuedDate ?? ""))
  const data = filter === "all" ? all : all.filter((i) => i.status === filter)
  const countFor = (key: Filter) =>
    key === "all" ? all.length : all.filter((i) => i.status === key).length

  const sum = (pred: (s: InvoiceStatus) => boolean) =>
    all.filter((i) => pred(i.status)).reduce((s, i) => s + convert(i.amount, i.currency, display), 0)
  const outstanding = sum((s) => s === "SENT" || s === "OVERDUE")
  const overdue = sum((s) => s === "OVERDUE")
  const paid = sum((s) => s === "PAID")
  const drafts = all.filter((i) => i.status === "DRAFT").length

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
                active
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
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
        <Metric label="Outstanding" value={formatMoney(outstanding, display)} />
        <Metric label="Overdue" value={formatMoney(overdue, display)} tone={overdue > 0 ? "warning" : undefined} />
        <Metric label="Paid" value={formatMoney(paid, display)} />
        <Metric label="Drafts" value={String(drafts)} />
      </div>

      <PanelCard
        icon={Invoice01Icon}
        title="Invoices"
        className="min-h-0 flex-1"
        bodyClassName="min-h-0 overflow-y-auto px-2"
      >
        {data.length ? (
          <InvoicesTable data={data} refs={refs} />
        ) : (
          <EmptyState
            size="sm"
            icon={Invoice01Icon}
            title="No invoices"
            description="No invoices match this filter yet."
          />
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
      <div className={cn("mt-1 font-mono text-xl font-semibold tracking-tight tabular-nums", tone === "warning" && "text-warning")}>
        {value}
      </div>
    </div>
  )
}

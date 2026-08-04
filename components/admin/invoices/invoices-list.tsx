"use client"

import * as React from "react"
import { Invoice01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { byNewest } from "@/lib/format"
import { useDisplayMoney } from "@/components/admin/clients/atoms"
import {
  INVOICES,
  invoiceTotals,
  formatMoney,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/mock/invoices"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { InvoicesTable } from "@/components/admin/invoices/invoices-table"

type Filter = "all" | InvoiceStatus

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "SENT", label: "Sent" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "PAID", label: "Paid" },
]

/** Most recent first. */
const ALL = [...INVOICES].sort((a, b) => byNewest(a.issuedDate, b.issuedDate))

/**
 * Invoices page — a status filter toolbar + metrics strip over a sortable
 * table (dashboard feel). Money totals follow the currency switcher; each row
 * shows its own currency. Only the table body scrolls.
 */
export function InvoicesList() {
  const money = useDisplayMoney()
  const [filter, setFilter] = React.useState<Filter>("all")

  const data = filter === "all" ? ALL : ALL.filter((i) => i.status === filter)
  const countFor = (key: Filter) =>
    key === "all" ? ALL.length : ALL.filter((i) => i.status === key).length

  const totals = invoiceTotals(ALL, money.display)

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
        <Metric label="Outstanding" value={formatMoney(totals.outstanding, money.display)} />
        <Metric
          label="Overdue"
          value={formatMoney(totals.overdue, money.display)}
          tone={totals.overdue > 0 ? "warning" : undefined}
        />
        <Metric label="Paid" value={formatMoney(totals.paid, money.display)} />
        <Metric label="Drafts" value={String(totals.draftCount)} />
      </div>

      {/* Table */}
      <PanelCard
        icon={Invoice01Icon}
        title="Invoices"
        className="min-h-0 flex-1"
        bodyClassName="min-h-0 overflow-y-auto px-2"
      >
        {data.length ? (
          <InvoicesTable data={data} />
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No invoices in this filter.
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

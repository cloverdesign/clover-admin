"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  type Client,
  activeProjectCount,
  clientTotalValue,
  formatMoney,
} from "@/lib/mock/clients"
import { convert } from "@/lib/mock/currencies"
import {
  Monogram,
  ClientStatusBadge,
  useDisplayMoney,
} from "@/components/admin/clients/atoms"

/**
 * Ledger layout for the Clients page — a summary metrics strip over a flat
 * customer list with right-aligned monospace figures (Stripe Customers feel).
 * Numbers-first: pipeline value and outstanding lead the surface. Receives the
 * already-filtered client set from the page.
 */
export function ClientsLedger({
  data,
  selectedId,
}: {
  data: Client[]
  selectedId?: string
}) {
  const money = useDisplayMoney()

  const activeCount = data.filter((c) => c.status === "active").length
  const pipeline = data.reduce((s, c) => s + clientTotalValue(c, money.display), 0)
  const outstanding = data.reduce(
    (s, c) => s + convert(c.outstanding, c.currency, money.display),
    0
  )

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Summary strip */}
      <div className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
        <Metric label="Clients" value={String(data.length)} />
        <Metric label="Active" value={String(activeCount)} />
        <Metric label="Pipeline value" value={formatMoney(pipeline, money.display)} />
        <Metric
          label="Outstanding"
          value={formatMoney(outstanding, money.display)}
          tone={outstanding > 0 ? "warning" : undefined}
        />
      </div>

      {/* Flat list — only the rows scroll; header stays pinned */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card">
        <div className="grid shrink-0 grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-5 py-2.5 text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase sm:grid-cols-[1.6fr_1fr_0.8fr_0.9fr]">
          <span>Client</span>
          <span className="hidden sm:block">Contact</span>
          <span className="hidden text-right sm:block">Projects</span>
          <span className="text-right">Value</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto">
          {data.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients?c=${client.id}`}
              scroll={false}
              className={cn(
                "grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-muted/40 sm:grid-cols-[1.6fr_1fr_0.8fr_0.9fr]",
                selectedId === client.id && "bg-muted/60"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Monogram company={client.company} className="size-8 text-[10px]" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{client.company}</div>
                  <div className="truncate text-xs text-muted-foreground sm:hidden">
                    {client.email}
                  </div>
                </div>
              </div>
              <div className="hidden min-w-0 sm:block">
                <div className="truncate text-sm">{client.contactName}</div>
                <div className="truncate text-xs text-muted-foreground">{client.email}</div>
              </div>
              <div className="hidden items-center justify-end gap-2 sm:flex">
                <ClientStatusBadge status={client.status} />
                <Badge variant="secondary" className="tabular-nums">
                  {activeProjectCount(client)} active
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-medium tabular-nums">
                  {money.total(client)}
                </div>
                {client.outstanding > 0 && (
                  <div className="font-mono text-xs text-warning tabular-nums">
                    {formatMoney(client.outstanding, client.currency)} due
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
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

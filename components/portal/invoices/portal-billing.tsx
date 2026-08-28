"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { formatFull } from "@/lib/mock/invoices"
import { Button } from "@/components/ui/button"
import {
  usePortalAllInvoices,
  usePortalProjects,
} from "@/lib/queries/portal-queries"
import { billingSummary } from "@/components/portal/home/use-portal-overview"
import {
  InvoiceList,
  visibleInvoices,
} from "@/components/portal/invoices/invoice-list"

/**
 * Everything billed, in one place — the page `GET /api/portal/invoices` made
 * possible. The summary band reuses the dashboard's `billingSummary`, so the
 * headline here and the card there can't disagree.
 */
export function PortalBilling() {
  const invoicesQ = usePortalAllInvoices()
  const projectsQ = usePortalProjects()

  const projects = projectsQ.data ?? []
  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "A project"

  if (invoicesQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (invoicesQ.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your invoices.</p>
        <Button variant="outline" size="sm" onClick={() => invoicesQ.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const invoices = invoicesQ.data ?? []
  const shown = visibleInvoices(invoices)
  const billing = billingSummary(invoices)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {shown.length === 0
            ? "Invoices from your studio collect here."
            : `${shown.length} invoice${shown.length === 1 ? "" : "s"} issued`}
        </p>
      </div>

      {billing && <SummaryBand billing={billing} />}

      <InvoiceList invoices={invoices} projectName={projectName} />
    </div>
  )
}

function SummaryBand({
  billing,
}: {
  billing: NonNullable<ReturnType<typeof billingSummary>>
}) {
  const total = billing.paid + billing.outstanding
  const paidPct = total > 0 ? Math.round((billing.paid / total) * 100) : 0
  const next = billing.nextDue

  const cells: { label: string; value: string; tone?: string }[] = [
    { label: "Paid", value: formatFull(billing.paid, billing.currency) },
    {
      label: "Outstanding",
      value: formatFull(billing.outstanding, billing.currency),
      tone: billing.outstanding > 0 ? "text-foreground" : undefined,
    },
    {
      label: next?.overdue ? "Overdue since" : "Next due",
      value: next
        ? next.dueDate
          ? formatDate(next.dueDate)
          : next.invoiceNumber
        : "—",
      tone: next?.overdue ? "text-destructive" : undefined,
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cells.map((cell) => (
          <div key={cell.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{cell.label}</dt>
            <dd
              className={cn(
                "mt-0.5 truncate font-mono text-xl font-semibold tabular-nums",
                cell.tone
              )}
            >
              {cell.value}
            </dd>
          </div>
        ))}
      </div>

      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${paidPct}% of billed work paid`}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${paidPct}%` }} />
      </div>
    </div>
  )
}

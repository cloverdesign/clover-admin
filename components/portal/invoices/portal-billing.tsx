"use client"

import * as React from "react"
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
import { PortalPage, PortalFilterPill } from "@/components/portal/shell/portal-page"
import { billingSummary } from "@/components/portal/home/use-portal-overview"
import {
  InvoiceList,
  visibleInvoices,
} from "@/components/portal/invoices/invoice-list"
import type { Invoice } from "@/lib/api/models"

type Slice = "all" | "open" | "paid"

const SLICE_LABEL: Record<Slice, string> = {
  all: "All",
  open: "Open",
  paid: "Paid",
}

function inSlice(invoice: Invoice, slice: Slice): boolean {
  if (slice === "open") return invoice.status === "SENT" || invoice.status === "OVERDUE"
  if (slice === "paid") return invoice.status === "PAID"
  return true
}

/**
 * Everything billed, in one place — the page `GET /api/portal/invoices` made
 * possible. The hero summary reuses the dashboard's `billingSummary`, so the
 * headline here and the card there can't disagree.
 */
export function PortalBilling() {
  const invoicesQ = usePortalAllInvoices()
  const projectsQ = usePortalProjects()
  const [slice, setSlice] = React.useState<Slice>("all")

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
  const billing = billingSummary(invoices)
  const shown = visibleInvoices(invoices).filter((i) => inSlice(i, slice))

  return (
    <PortalPage
      title="Invoices"
      subtitle="Every invoice your studio has issued."
      summary={billing && <BillingSummary billing={billing} />}
      toolbar={
        <>
          {(Object.keys(SLICE_LABEL) as Slice[]).map((key) => (
            <PortalFilterPill
              key={key}
              active={slice === key}
              onClick={() => setSlice(key)}
            >
              {SLICE_LABEL[key]}
            </PortalFilterPill>
          ))}
        </>
      }
      meta={`${shown.length} invoice${shown.length === 1 ? "" : "s"}`}
    >
      <InvoiceList
        invoices={shown}
        projectName={projectName}
        emptyMessage={
          slice === "open"
            ? "Nothing outstanding. You’re all paid up."
            : slice === "paid"
              ? "No paid invoices yet."
              : "Invoices appear here once your studio issues one."
        }
      />
    </PortalPage>
  )
}

/** Paid vs outstanding, in the client's primary currency, with the next date
 * that matters. Lives in the hero: it describes the page, not the filter. */
function BillingSummary({
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

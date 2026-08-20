"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  Invoice01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"

import { formatDate, byNewest } from "@/lib/format"
import { formatFull } from "@/lib/mock/invoices"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePortalProjectInvoices } from "@/lib/queries/portal-queries"
import type { Invoice, InvoiceStatus } from "@/lib/api/models"

/**
 * Invoices on the client project view (PRD §1.2.3 / §1.2.4). The client sees
 * invoices once the studio marks them Sent — drafts stay internal — with the
 * currency shown and the PDF available to download.
 */
export function PortalInvoices({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = usePortalProjectInvoices(projectId)

  if (isLoading) {
    return (
      <section className="rounded-2xl border bg-card p-5">
        <SectionHeading />
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-2xl border bg-card p-5">
        <SectionHeading />
        <p className="py-6 text-center text-sm text-muted-foreground">
          Couldn’t load invoices.
        </p>
      </section>
    )
  }

  // Drafts are internal to the studio — the client only sees issued invoices.
  const invoices = (data ?? [])
    .filter((i) => i.status !== "DRAFT")
    .sort((a, b) => byNewest(a.issuedDate ?? a.createdAt, b.issuedDate ?? b.createdAt))

  return (
    <section className="rounded-2xl border bg-card p-5">
      <SectionHeading count={invoices.length} />

      {invoices.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No invoices yet. They’ll appear here once your studio issues one.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </ul>
      )}
    </section>
  )
}

function SectionHeading({ count }: { count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <HugeiconsIcon icon={Invoice01Icon} className="size-4 text-muted-foreground" />
      <h2 className="font-heading text-sm font-medium">Invoices</h2>
      {count != null && count > 0 && (
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      )}
    </div>
  )
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const dueLabel =
    invoice.status === "PAID"
      ? invoice.paidDate
        ? `Paid ${formatDate(invoice.paidDate)}`
        : "Paid"
      : invoice.dueDate
        ? `Due ${formatDate(invoice.dueDate)}`
        : null

  return (
    <li className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium tabular-nums">
            {invoice.invoiceNumber}
          </span>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {[invoice.description, dueLabel].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>

      <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">
        {formatFull(invoice.amount, invoice.currency)}
      </span>

      {invoice.pdfUrl && (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Download invoice ${invoice.invoiceNumber} PDF`}
          render={<a href={invoice.pdfUrl} download target="_blank" rel="noreferrer" />}
        >
          <HugeiconsIcon icon={Download01Icon} className="size-4" />
        </Button>
      )}
    </li>
  )
}

/** Client-facing invoice status. "Sent" reads as an outstanding balance to the
 * client, so it becomes "Due"; Draft never reaches the portal. */
const PORTAL_INVOICE_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Due",
  PAID: "Paid",
  OVERDUE: "Overdue",
}

const PORTAL_INVOICE_VARIANT: Record<
  InvoiceStatus,
  "secondary" | "info" | "success" | "destructive"
> = {
  DRAFT: "secondary",
  SENT: "info",
  PAID: "success",
  OVERDUE: "destructive",
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={PORTAL_INVOICE_VARIANT[status]}>{PORTAL_INVOICE_LABEL[status]}</Badge>
}

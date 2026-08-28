"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Invoice01Icon,
  Download01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate, byNewest } from "@/lib/format"
import { formatFull, lineTotal } from "@/lib/mock/invoices"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import type { Invoice, InvoiceStatus } from "@/lib/api/models"

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

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={PORTAL_INVOICE_VARIANT[status]}>{PORTAL_INVOICE_LABEL[status]}</Badge>
}

/** Drafts are internal to the studio — the client only ever sees issued ones. */
export function visibleInvoices(invoices: Invoice[]): Invoice[] {
  return invoices
    .filter((i) => i.status !== "DRAFT")
    .sort((a, b) => byNewest(a.issuedDate ?? a.createdAt, b.issuedDate ?? b.createdAt))
}

function whenLabel(invoice: Invoice): string {
  if (invoice.status === "PAID") {
    return invoice.paidDate ? `Paid ${formatDate(invoice.paidDate)}` : "Paid"
  }
  return invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : "No due date"
}

/**
 * Invoices as rows that open a detail panel. The row carries the number, amount
 * and state; line items, dates and the PDF live in the slide-over, so a client
 * scanning "what do I owe" isn't reading a billing breakdown to find out.
 */
export function InvoiceList({
  invoices,
  projectName,
  emptyMessage = "No invoices yet. They appear here once your studio issues one.",
}: {
  invoices: Invoice[]
  /** Renders the project under each number — omit on a single-project view. */
  projectName?: (projectId: string) => string
  emptyMessage?: string
}) {
  const shown = React.useMemo(() => visibleInvoices(invoices), [invoices])
  const [openId, setOpenId] = React.useState<string | null>(null)
  const active = shown.find((i) => i.id === openId) ?? null

  if (shown.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
        <HugeiconsIcon icon={Invoice01Icon} className="size-6 text-muted-foreground/60" />
        <p className="max-w-xs text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <ul className="overflow-hidden rounded-2xl border bg-card">
        {shown.map((invoice, i) => (
          <li key={invoice.id}>
            <button
              type="button"
              onClick={() => setOpenId(invoice.id)}
              className={cn(
                "group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 sm:gap-4 sm:px-5",
                i > 0 && "border-t border-border"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium tabular-nums">
                    {invoice.invoiceNumber}
                  </span>
                  <InvoiceStatusBadge status={invoice.status} />
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {[projectName?.(invoice.projectId), whenLabel(invoice)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>

              <span
                className={cn(
                  "shrink-0 font-mono text-sm font-semibold tabular-nums",
                  invoice.status === "OVERDUE" && "text-destructive"
                )}
              >
                {formatFull(invoice.amount, invoice.currency)}
              </span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground"
              />
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={active !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
          {active && (
            <InvoicePanel invoice={active} subtitle={projectName?.(active.projectId)} />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function InvoicePanel({ invoice, subtitle }: { invoice: Invoice; subtitle?: string }) {
  const dates: { label: string; value: string }[] = [
    { label: "Issued", value: formatDate(invoice.issuedDate) },
    { label: "Due", value: formatDate(invoice.dueDate) },
  ]
  if (invoice.paidDate) {
    dates.push({ label: "Paid", value: formatDate(invoice.paidDate) })
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="pr-6 font-mono tabular-nums">
          {invoice.invoiceNumber}
        </SheetTitle>
        <SheetDescription>
          {[subtitle, whenLabel(invoice)].filter(Boolean).join(" · ")}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto px-4">
        <div className="flex items-end justify-between gap-4">
          <span className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
            {formatFull(invoice.amount, invoice.currency)}
          </span>
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        {invoice.description && (
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {invoice.description}
          </p>
        )}

        <dl className="grid grid-cols-3 gap-4 border-t border-border pt-4">
          {dates.map((d) => (
            <div key={d.label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{d.label}</dt>
              <dd className="mt-0.5 truncate text-sm">{d.value}</dd>
            </div>
          ))}
        </dl>

        {invoice.lineItems.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">What you’re billed for</p>
            <ul className="mt-2 flex flex-col divide-y divide-border">
              {invoice.lineItems.map((line, i) => (
                <li key={i} className="flex items-baseline gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{line.description}</span>
                    {line.quantity !== 1 && (
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {line.quantity} × {formatFull(line.unitPrice, invoice.currency)}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-sm tabular-nums">
                    {formatFull(lineTotal(line), invoice.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <SheetFooter>
        <SheetClose render={<Button variant="ghost" size="sm">Close</Button>} />
        {invoice.pdfUrl && (
          <Button
            variant="default"
            size="sm"
            render={
              <a href={invoice.pdfUrl} download target="_blank" rel="noreferrer" />
            }
          >
            <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" className="size-4" />
            Download PDF
          </Button>
        )}
      </SheetFooter>
    </>
  )
}

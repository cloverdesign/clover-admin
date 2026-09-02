"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Invoice01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate, byNewest } from "@/lib/format"
import { formatFull, lineTotal } from "@/lib/mock/invoices"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { usePortalMe } from "@/lib/queries/portal-queries"
import { InvoicePdfButton } from "@/components/invoices/invoice-pdf-button"
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
 * Invoices as a sortable table whose rows open a detail panel. The row carries
 * what a client scans for — number, dates, state, amount — and the panel holds
 * the billing breakdown and the PDF.
 */
export function InvoiceList({
  invoices,
  projectName,
  emptyMessage = "Invoices appear here once your studio issues one.",
}: {
  invoices: Invoice[]
  /** Adds a Project column — omit on a single-project view. */
  projectName?: (projectId: string) => string
  emptyMessage?: string
}) {
  const rows = React.useMemo(() => visibleInvoices(invoices), [invoices])
  const [openId, setOpenId] = React.useState<string | null>(null)
  // The PDF's billed-to block names the client; the portal only knows itself.
  const { data: client } = usePortalMe()
  const active = rows.find((i) => i.id === openId) ?? null

  const columns = React.useMemo<ColumnDef<Invoice>[]>(() => {
    const cols: ColumnDef<Invoice>[] = [
      {
        id: "invoiceNumber",
        accessorFn: (i) => i.invoiceNumber,
        header: ({ column }) => <DataTableSortHeader column={column} title="Invoice" />,
        cell: ({ getValue }) => (
          <span className="font-mono font-medium tabular-nums">{getValue<string>()}</span>
        ),
      },
    ]

    if (projectName) {
      cols.push({
        id: "project",
        accessorFn: (i) => projectName(i.projectId),
        header: ({ column }) => <DataTableSortHeader column={column} title="Project" />,
        cell: ({ getValue }) => (
          <span className="truncate text-muted-foreground">{getValue<string>()}</span>
        ),
      })
    }

    cols.push(
      {
        id: "issuedDate",
        accessorFn: (i) => i.issuedDate ?? "",
        header: ({ column }) => <DataTableSortHeader column={column} title="Issued" />,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatDate(getValue<string>() || null)}
          </span>
        ),
      },
      {
        id: "dueDate",
        accessorFn: (i) => i.dueDate ?? "",
        header: ({ column }) => <DataTableSortHeader column={column} title="Due" />,
        cell: ({ row }) => (
          <span
            className={cn(
              "whitespace-nowrap",
              row.original.status === "OVERDUE"
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (i) => i.status,
        header: ({ column }) => <DataTableSortHeader column={column} title="Status" />,
        cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
      },
      {
        id: "amount",
        accessorFn: (i) => i.amount,
        header: ({ column }) => (
          <DataTableSortHeader column={column} title="Amount" className="ml-auto" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <span
              className={cn(
                "font-mono font-medium tabular-nums",
                row.original.status === "OVERDUE" && "text-destructive"
              )}
            >
              {formatFull(row.original.amount, row.original.currency)}
            </span>
          </div>
        ),
      }
    )

    return cols
  }, [projectName])

  if (rows.length === 0) {
    return (
      <EmptyState
        bordered
        size="sm"
        icon={Invoice01Icon}
        title="No invoices"
        description={emptyMessage}
      />
    )
  }

  return (
    <>
      <DataTable columns={columns} data={rows} onRowClick={(i) => setOpenId(i.id)} />

      <Sheet open={active !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
          {active && (
            <InvoicePanel
              invoice={active}
              subtitle={projectName?.(active.projectId)}
              billedTo={client?.company ?? "Your company"}
              contact={client?.name}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function InvoicePanel({
  invoice,
  subtitle,
  billedTo,
  contact,
}: {
  invoice: Invoice
  subtitle?: string
  billedTo: string
  contact?: string | null
}) {
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
            <p className="text-xs font-medium text-muted-foreground">
              What you’re billed for
            </p>
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
        {/* Always offered. The API leaves `pdfUrl` null, and the old
            `invoice.pdfUrl &&` guard meant a client opened their invoice and
            found no way to download it, with nothing saying why. */}
        <InvoicePdfButton
          variant="default"
          label="Download PDF"
          data={{
            invoice,
            billedTo: { company: billedTo, contact: contact },
            projectName: subtitle,
          }}
        />
      </SheetFooter>
    </>
  )
}

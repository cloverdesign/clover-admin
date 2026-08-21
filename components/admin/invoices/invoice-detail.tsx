"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download04Icon,
  SentIcon,
  CheckmarkCircle02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Delete02Icon,
  Alert02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_VARIANT, formatFull } from "@/lib/mock/invoices"
import {
  useInvoice,
  useSendInvoice,
  useMarkInvoicePaid,
  useMarkInvoiceOverdue,
  useDeleteInvoice,
} from "@/lib/queries/invoices-queries"
import { useProject } from "@/lib/queries/projects-queries"
import { useClient } from "@/lib/queries/clients-queries"
import type { Invoice } from "@/lib/api/models"

/**
 * Invoice detail — document view + the status lifecycle (Draft → Sent → Paid,
 * or mark overdue), all real mutations. Billed-to project/client names are
 * composed from their records (the API Invoice carries only projectId).
 */
export function InvoiceDetail({ id }: { id: string }) {
  const invoiceQ = useInvoice(id)

  if (invoiceQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (invoiceQ.isError || !invoiceQ.data) {
    return <div className="p-6 text-sm text-muted-foreground">Invoice not found.</div>
  }
  return <InvoiceDetailInner invoice={invoiceQ.data} />
}

function InvoiceDetailInner({ invoice }: { invoice: Invoice }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const projectQ = useProject(invoice.projectId)
  const clientId = projectQ.data?.clientId
  const clientQ = useClient(clientId ?? "")

  const send = useSendInvoice()
  const markPaid = useMarkInvoicePaid()
  const markOverdue = useMarkInvoiceOverdue()
  const del = useDeleteInvoice()

  const status = invoice.status
  const open = status === "SENT" || status === "OVERDUE"
  const busy = send.isPending || markPaid.isPending || markOverdue.isPending

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Action bar */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-xl font-semibold tracking-tight">{invoice.invoiceNumber}</h1>
          <CopyButton value={invoice.invoiceNumber} label="invoice number" />
          <Badge variant={INVOICE_STATUS_VARIANT[status]}>{INVOICE_STATUS_LABEL[status]}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {status === "DRAFT" && (
            <Button className="gap-1.5" disabled={busy} onClick={() => send.mutate(invoice.id)}>
              <HugeiconsIcon icon={SentIcon} data-icon="inline-start" className="size-4" />
              Send invoice
            </Button>
          )}
          {open && (
            <Button className="gap-1.5" disabled={busy} onClick={() => markPaid.mutate(invoice.id)}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} data-icon="inline-start" className="size-4" />
              Mark paid
            </Button>
          )}
          {/* The PDF is generated server-side on issue (§1.2.3), so a draft that
              hasn't been rendered yet has no `pdfUrl` — show the action disabled
              rather than handing over a link that goes nowhere. */}
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={!invoice.pdfUrl}
            title={invoice.pdfUrl ? undefined : "No PDF generated for this invoice yet"}
            render={
              invoice.pdfUrl ? (
                <a
                  href={invoice.pdfUrl}
                  download={`${invoice.invoiceNumber}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                />
              ) : undefined
            }
          >
            <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" className="size-4" />
            PDF
          </Button>
          <InvoiceActions
            invoice={invoice}
            canOverdue={status === "SENT"}
            onOverdue={() => markOverdue.mutate(invoice.id)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>
      </div>

      {/* Document */}
      <div className="mt-6 rounded-2xl border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">Billed to</div>
            {clientId ? (
              <Link href={`/admin/clients?c=${clientId}`} className="mt-1 block text-base font-medium underline-offset-4 hover:underline">
                {clientQ.data?.company ?? "…"}
              </Link>
            ) : (
              <div className="mt-1 text-base font-medium">…</div>
            )}
            <Link href={`/admin/projects/${invoice.projectId}`} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              {projectQ.data?.name ?? "…"}
            </Link>
          </div>
          <div className="text-right text-sm">
            <Meta label="Issued" value={formatDate(invoice.issuedDate)} />
            <Meta label="Due" value={formatDate(invoice.dueDate)} tone={status === "OVERDUE" ? "destructive" : undefined} />
            {invoice.paidDate && status === "PAID" && (
              <Meta label="Paid" value={formatDate(invoice.paidDate)} tone="success" />
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="mt-8">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            <span>Description</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="divide-y divide-border">
            {(invoice.lineItems ?? []).map((li, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm">
                <span>{li.description}</span>
                <span className="text-right font-mono tabular-nums">{formatFull(li.amount, invoice.currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-4 border-t border-border pt-3">
            <span className="text-sm font-medium">Total</span>
            <span className="text-right font-mono text-base font-semibold tabular-nums">
              {formatFull(invoice.amount, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {invoice.invoiceNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the invoice from the project and the client’s portal. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                del.mutate(
                  { id: invoice.id, projectId: invoice.projectId },
                  { onSuccess: () => { setConfirmOpen(false); router.push("/admin/invoices") } }
                )
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Meta({ label, value, tone }: { label: string; value: string; tone?: "destructive" | "success" }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", tone === "destructive" && "text-destructive", tone === "success" && "text-success")}>
        {value}
      </span>
    </div>
  )
}

function InvoiceActions({
  invoice,
  canOverdue,
  onOverdue,
  onDelete,
}: {
  invoice: Invoice
  canOverdue: boolean
  onOverdue: () => void
  onDelete: () => void
}) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Invoice actions"
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/admin/invoices/${invoice.id}/edit`)}>
          <HugeiconsIcon icon={PencilEdit02Icon} />
          Edit invoice
        </DropdownMenuItem>
        {canOverdue && (
          <DropdownMenuItem onClick={onOverdue}>
            <HugeiconsIcon icon={Alert02Icon} />
            Mark overdue
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <HugeiconsIcon icon={Delete02Icon} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

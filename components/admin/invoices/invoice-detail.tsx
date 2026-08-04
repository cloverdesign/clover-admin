"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download04Icon,
  SentIcon,
  CheckmarkCircle02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
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
import {
  getInvoice,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  formatFull,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/mock/invoices"

/**
 * Invoice detail — a document-style view with line items and totals, plus the
 * status lifecycle actions (§1.2.3: Draft → Sent → Paid). No backend: sending /
 * marking paid mutate local state and confirm with a toast.
 */
export function InvoiceDetail({ id }: { id: string }) {
  const invoice = getInvoice(id)
  if (!invoice) {
    return <div className="p-6 text-sm text-muted-foreground">Invoice not found.</div>
  }
  return <InvoiceDetailInner invoice={invoice} />
}

function InvoiceDetailInner({ invoice }: { invoice: Invoice }) {
  const router = useRouter()
  const [status, setStatus] = React.useState<InvoiceStatus>(invoice.status)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const send = () => {
    setStatus("SENT")
    toast.success(`Invoice ${invoice.number} sent to ${invoice.client}`)
  }
  const markPaid = () => {
    setStatus("PAID")
    toast.success(`Marked ${invoice.number} as paid`)
  }

  const open = status === "SENT" || status === "OVERDUE"

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Action bar */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-xl font-semibold tracking-tight">
            {invoice.number}
          </h1>
          <Badge variant={INVOICE_STATUS_VARIANT[status]}>
            {INVOICE_STATUS_LABEL[status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {status === "DRAFT" && (
            <Button className="gap-1.5" onClick={send}>
              <HugeiconsIcon icon={SentIcon} data-icon="inline-start" className="size-4" />
              Send invoice
            </Button>
          )}
          {open && (
            <Button className="gap-1.5" onClick={markPaid}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} data-icon="inline-start" className="size-4" />
              Mark paid
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => toast.success(`Downloading ${invoice.number}.pdf`)}
          >
            <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" className="size-4" />
            PDF
          </Button>
          <InvoiceActions invoice={invoice} onDelete={() => setConfirmOpen(true)} />
        </div>
      </div>

      {/* Document */}
      <div className="mt-6 rounded-2xl border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Billed to
            </div>
            <Link
              href={`/admin/clients?c=${invoice.clientId}`}
              className="mt-1 block text-base font-medium underline-offset-4 hover:underline"
            >
              {invoice.client}
            </Link>
            <Link
              href={`/admin/projects/${invoice.projectId}`}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {invoice.projectName}
            </Link>
          </div>
          <div className="text-right text-sm">
            <Meta label="Issued" value={formatDate(invoice.issuedDate)} />
            <Meta
              label="Due"
              value={formatDate(invoice.dueDate)}
              tone={status === "OVERDUE" ? "destructive" : undefined}
            />
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
            {invoice.lineItems.map((li, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm">
                <span>{li.description}</span>
                <span className="text-right font-mono tabular-nums">
                  {formatFull(li.amount, invoice.currency)}
                </span>
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
            <AlertDialogTitle>Delete {invoice.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the invoice from the project and the client's portal.
              This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false)
                toast.success(`Deleted ${invoice.number}`)
                router.push("/admin/invoices")
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Meta({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "destructive" | "success"
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium",
          tone === "destructive" && "text-destructive",
          tone === "success" && "text-success"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function InvoiceActions({
  invoice,
  onDelete,
}: {
  invoice: Invoice
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
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <HugeiconsIcon icon={Delete02Icon} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon, Loading03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES } from "@/lib/mock/currencies"
import { formatFull, lineTotal, INVOICE_STATUS_LABEL, INVOICE_STATUS_VARIANT } from "@/lib/mock/invoices"
import { toApiDateTime } from "@/lib/format"
import { useInvoice, useUpdateInvoice } from "@/lib/queries/invoices-queries"
import type { Invoice } from "@/lib/api/models"
import { Badge } from "@/components/ui/badge"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

/** Form-local line, kept as strings so the inputs stay controlled while empty. */
type Line = { description: string; quantity: string; unitPrice: string }

const EMPTY_LINE: Line = { description: "", quantity: "1", unitPrice: "" }

/** Edit Invoice — editorial split, pre-filled from the API (PUT /api/invoices/{id}).
 * Status stays on the detail's lifecycle actions; this edits the contents. */
export function EditInvoicePage({ id }: { id?: string }) {
  const router = useRouter()
  const invoiceQ = useInvoice(id ?? "")

  if (invoiceQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (invoiceQ.isError || !invoiceQ.data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Invoice not found.</p>
        <Button variant="outline" render={<Link href="/admin/invoices" />}>Go to invoices</Button>
      </div>
    )
  }
  return <EditInvoiceForm invoice={invoiceQ.data} router={router} />
}

function EditInvoiceForm({ invoice, router }: { invoice: Invoice; router: ReturnType<typeof useRouter> }) {
  const update = useUpdateInvoice()
  const backHref = `/admin/invoices/${invoice.id}`

  const [currency, setCurrency] = React.useState(invoice.currency)
  const [due, setDue] = React.useState((invoice.dueDate ?? "").slice(0, 10))
  const [issued, setIssued] = React.useState((invoice.issuedDate ?? "").slice(0, 10))
  const [lines, setLines] = React.useState<Line[]>(
    invoice.lineItems.length
      ? invoice.lineItems.map((l) => ({
          description: l.description,
          quantity: String(l.quantity),
          unitPrice: String(l.unitPrice),
        }))
      : [{ ...EMPTY_LINE }]
  )

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const addLine = () => setLines((prev) => [...prev, { ...EMPTY_LINE }])
  const removeLine = (i: number) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)))

  // Every line needs description + quantity + unitPrice or the API rejects the
  // whole payload with a bare "Required"; `dueDate` is required too.
  const lineItems = lines
    .filter(
      (l) => l.description.trim() && Number(l.quantity) > 0 && Number(l.unitPrice) > 0
    )
    .map((l) => ({
      description: l.description.trim(),
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
    }))
  const total = lineItems.reduce((s, l) => s + lineTotal(l), 0)
  const valid = lineItems.length > 0 && Boolean(due)

  const save = () => {
    update.mutate(
      {
        id: invoice.id,
        input: {
          amount: total,
          currency,
          lineItems,
          dueDate: toApiDateTime(due) as string,
          issuedDate: toApiDateTime(issued),
          description: invoice.description ?? undefined,
        },
      },
      { onSuccess: () => router.push(backHref) }
    )
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit invoice</h1>
            <p className="mt-2 text-sm text-muted-foreground">Update the line items, currency and dates.</p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-3">
              <Monogram company={invoice.invoiceNumber} className="size-10" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-sm font-medium">{invoice.invoiceNumber}</div>
              </div>
              <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>{INVOICE_STATUS_LABEL[invoice.status]}</Badge>
            </div>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Invoice details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Line items, currency and dates.</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Line items</div>
              <div className="grid grid-cols-[1fr_4.5rem_7rem_5.5rem_2.25rem] items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit price</span>
                <span className="text-right">Total</span>
                <span className="sr-only">Remove</span>
              </div>
              {lines.map((line, i) => {
                const rowTotal = Number(line.quantity) * Number(line.unitPrice)
                return (
                <div key={i} className="grid grid-cols-[1fr_4.5rem_7rem_5.5rem_2.25rem] items-center gap-2">
                  <Input value={line.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Description" />
                  <Input value={line.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} type="number" inputMode="numeric" min="1" step="1" aria-label={`Quantity for line ${i + 1}`} />
                  <Input value={line.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value })} type="number" inputMode="decimal" min="0" placeholder="0" aria-label={`Unit price for line ${i + 1}`} />
                  <span className="truncate text-right font-mono text-sm tabular-nums text-muted-foreground">
                    {Number.isFinite(rowTotal) && rowTotal > 0 ? formatFull(rowTotal, currency) : "—"}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove line"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  </button>
                </div>
                )
              })}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addLine}>
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
                Add line item
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Currency" htmlFor="currency">
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                  <SelectTrigger id="currency" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Issued" htmlFor="issued">
                <Input id="issued" type="date" value={issued} onChange={(e) => setIssued(e.target.value)} />
              </Field>
              <Field label="Due *" htmlFor="due">
                <Input id="due" type="date" required value={due} onChange={(e) => setDue(e.target.value)} />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono text-base font-semibold tabular-nums">{formatFull(total, currency)}</span>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href={backHref} />}>Cancel</Button>
            <Button onClick={save} disabled={!valid || update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      }
    />
  )
}

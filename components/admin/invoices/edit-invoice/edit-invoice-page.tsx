"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/format"
import { CURRENCIES } from "@/lib/mock/currencies"
import { PROJECTS, getProject } from "@/lib/mock/projects"
import {
  getInvoice,
  formatFull,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
} from "@/lib/mock/invoices"
import { Badge } from "@/components/ui/badge"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

const PROJECT_OPTIONS = PROJECTS.filter((p) => !p.archived)

type Line = { description: string; amount: string }

/**
 * Edit Invoice — same editorial split as New Invoice, pre-filled from the
 * record. Status stays on the detail's lifecycle actions; this edits the
 * contents. No backend — Save confirms with a toast and returns to the invoice.
 */
export function EditInvoicePage({ id }: { id?: string }) {
  const router = useRouter()
  const invoice = id ? getInvoice(id) : undefined

  const [selectedId, setSelectedId] = React.useState(invoice?.projectId ?? "")
  const [currency, setCurrency] = React.useState(invoice?.currency ?? "USD")
  const [due, setDue] = React.useState(formatDate(invoice?.dueDate))
  const [lines, setLines] = React.useState<Line[]>(
    invoice?.lineItems.map((l) => ({ description: l.description, amount: String(l.amount) })) ?? [
      { description: "", amount: "" },
    ]
  )

  const project = selectedId ? getProject(selectedId) : undefined

  if (!invoice) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Invoice not found.</p>
        <Button variant="outline" render={<Link href="/admin/invoices" />}>
          Go to invoices
        </Button>
      </div>
    )
  }

  const backHref = `/admin/invoices/${invoice.id}`
  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const addLine = () => setLines((prev) => [...prev, { description: "", amount: "" }])
  const removeLine = (i: number) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)))

  const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0)
  const valid =
    Boolean(project) &&
    lines.filter((l) => l.description.trim() && Number(l.amount) > 0).length > 0

  const save = () => {
    toast.success(`Saved changes to ${invoice.number}`)
    router.push(backHref)
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit invoice</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the invoice's project, line items and due date.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-3">
              <Monogram company={invoice.client} className="size-10" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-sm font-medium">{invoice.number}</div>
                <div className="truncate text-xs text-muted-foreground">{invoice.client}</div>
              </div>
              <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
                {INVOICE_STATUS_LABEL[invoice.status]}
              </Badge>
            </div>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Invoice details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Project, line items, currency and due date.
          </p>

          <div className="space-y-4">
            <Field label="Project" htmlFor="project">
              <Select value={selectedId} onValueChange={(v) => v && setSelectedId(v)}>
                <SelectTrigger id="project" className="w-full">
                  <SelectValue placeholder="Select a project">
                    {(v) => {
                      const p = v ? getProject(v as string) : undefined
                      return p ? `${p.client} · ${p.name}` : "Select a project"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_OPTIONS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.client} · {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="space-y-2">
              <div className="text-sm font-medium">Line items</div>
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={line.description}
                    onChange={(e) => setLine(i, { description: e.target.value })}
                    placeholder="Description"
                    className="flex-1"
                  />
                  <Input
                    value={line.amount}
                    onChange={(e) => setLine(i, { amount: e.target.value })}
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-28"
                  />
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
              ))}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addLine}>
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
                Add line item
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Currency" htmlFor="currency">
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Due date" htmlFor="due">
                <Input id="due" value={due} onChange={(e) => setDue(e.target.value)} placeholder="Aug 31, 2024" />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono text-base font-semibold tabular-nums">
                {formatFull(total, currency)}
              </span>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href={backHref} />}>Cancel</Button>
            <Button onClick={save} disabled={!valid}>Save changes</Button>
          </div>
        </div>
      }
    />
  )
}

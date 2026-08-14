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
import { formatFull } from "@/lib/mock/invoices"
import { toApiDateTime } from "@/lib/format"
import { useProjects, useCreateProjectInvoice } from "@/lib/queries/projects-queries"
import { useClients } from "@/lib/queries/clients-queries"
import { useSendInvoice } from "@/lib/queries/invoices-queries"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

type Line = { description: string; amount: string }

/** New Invoice — bill a project (POST /api/projects/{id}/invoices). Optionally
 * send on create (a second lifecycle call). Launchable with `?project=<id>`. */
export function NewInvoicePage({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const projectsQ = useProjects()
  const clientsQ = useClients()
  const create = useCreateProjectInvoice()
  const send = useSendInvoice()

  const projects = (projectsQ.data ?? []).filter((p) => !p.archived)
  const clientName = (cid: string) => clientsQ.data?.find((c) => c.id === cid)?.company ?? ""

  const [selectedId, setSelectedId] = React.useState(projectId ?? "")
  const project = projects.find((p) => p.id === selectedId)

  const [currency, setCurrency] = React.useState(project?.currency ?? "USD")
  const [due, setDue] = React.useState("")
  const [issued, setIssued] = React.useState("")
  const [mode, setMode] = React.useState<"draft" | "sent">("draft")
  const [lines, setLines] = React.useState<Line[]>([{ description: "", amount: "" }])

  const pickProject = (id: string) => {
    setSelectedId(id)
    const p = projects.find((x) => x.id === id)
    if (p) setCurrency(p.currency)
  }

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const addLine = () => setLines((prev) => [...prev, { description: "", amount: "" }])
  const removeLine = (i: number) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)))

  const lineItems = lines
    .filter((l) => l.description.trim() && Number(l.amount) > 0)
    .map((l) => ({ description: l.description.trim(), amount: Number(l.amount) }))
  const total = lineItems.reduce((s, l) => s + l.amount, 0)
  const valid = Boolean(project) && lineItems.length > 0

  const submit = () => {
    if (!project) return
    create.mutate(
      {
        projectId: project.id,
        input: {
          amount: total,
          currency,
          lineItems,
          dueDate: toApiDateTime(due),
          issuedDate: toApiDateTime(issued),
        },
      },
      {
        onSuccess: (invoice) => {
          if (mode === "sent") send.mutate(invoice.id)
          router.push("/admin/invoices")
        },
      }
    )
  }

  const busy = create.isPending || send.isPending

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New invoice</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bill a project. It appears in the client's portal once you send it.
            </p>
            {project ? (
              <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-3">
                <Monogram company={clientName(project.clientId) || project.name} className="size-10" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{clientName(project.clientId) || "—"}</div>
                  <div className="truncate text-xs text-muted-foreground">{project.name}</div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                Pick a project to bill on the right.
              </div>
            )}
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Invoice details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Project, line items, currency and dates.</p>

          <div className="space-y-4">
            <Field label="Project" htmlFor="project">
              <Select value={selectedId} onValueChange={(v) => v && pickProject(v)}>
                <SelectTrigger id="project" className="w-full">
                  <SelectValue placeholder="Select a project">
                    {(v) => {
                      const p = projects.find((x) => x.id === v)
                      return p ? `${clientName(p.clientId)} · ${p.name}` : "Select a project"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {clientName(p.clientId)} · {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="space-y-2">
              <div className="text-sm font-medium">Line items</div>
              {lines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={line.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Description" className="flex-1" />
                  <Input value={line.amount} onChange={(e) => setLine(i, { amount: e.target.value })} type="number" inputMode="numeric" placeholder="0" className="w-28" />
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
              <Field label="Due" htmlFor="due">
                <Input id="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </Field>
            </div>

            <Field label="On create" htmlFor="mode" hint="Send now emails the client; save as draft to send later.">
              <Select value={mode} onValueChange={(v) => v && setMode(v as "draft" | "sent")}>
                <SelectTrigger id="mode" className="w-full">
                  <SelectValue>{(v) => (v === "sent" ? "Create & send" : "Save as draft")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as draft</SelectItem>
                  <SelectItem value="sent">Create & send</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono text-base font-semibold tabular-nums">{formatFull(total, currency)}</span>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href="/admin/invoices" />}>Cancel</Button>
            <Button onClick={submit} disabled={!valid || busy}>
              {busy ? <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" /> : mode === "sent" ? "Create & send" : "Create draft"}
            </Button>
          </div>
        </div>
      }
    />
  )
}

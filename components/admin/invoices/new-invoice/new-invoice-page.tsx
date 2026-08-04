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
import { CURRENCIES } from "@/lib/mock/currencies"
import { PROJECTS, getProject } from "@/lib/mock/projects"
import { formatFull } from "@/lib/mock/invoices"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

const PROJECT_OPTIONS = PROJECTS.filter((p) => !p.archived)

type Line = { description: string; amount: string }

/**
 * New Invoice — generate an invoice for a project (§1.2.3). Launchable with
 * `?project=<id>` prefilled from a project. Editorial split: the target on the
 * left, line items on the right. No backend — submit confirms with a toast.
 */
export function NewInvoicePage({ projectId }: { projectId?: string }) {
  const router = useRouter()

  const [selectedId, setSelectedId] = React.useState(projectId ?? "")
  const project = selectedId ? getProject(selectedId) : undefined

  const [currency, setCurrency] = React.useState(project?.currency ?? "USD")
  const [due, setDue] = React.useState("")
  const [status, setStatus] = React.useState<"draft" | "sent">("draft")
  const [lines, setLines] = React.useState<Line[]>([{ description: "", amount: "" }])

  // When the project changes, follow its currency.
  const pickProject = (id: string) => {
    setSelectedId(id)
    const p = getProject(id)
    if (p) setCurrency(p.currency)
  }

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const addLine = () => setLines((prev) => [...prev, { description: "", amount: "" }])
  const removeLine = (i: number) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)))

  const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0)
  const validLines = lines.filter((l) => l.description.trim() && Number(l.amount) > 0)
  const valid = Boolean(project) && validLines.length > 0

  const submit = () => {
    toast.success(
      `Created ${status === "sent" ? "and sent " : ""}invoice for ${project?.client} · ${formatFull(total, currency)}`
    )
    router.push("/admin/invoices")
  }

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
                <Monogram company={project.client} className="size-10" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{project.client}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {project.name}
                  </div>
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
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Project, line items, currency and due date.
          </p>

          <div className="space-y-4">
            <Field label="Project" htmlFor="project">
              <Select value={selectedId} onValueChange={(v) => v && pickProject(v)}>
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

            {/* Line items */}
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

            <Field label="On create" htmlFor="status" hint="Send now emails the client; save as draft to send later.">
              <Select value={status} onValueChange={(v) => v && setStatus(v as "draft" | "sent")}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue>
                    {(v) => (v === "sent" ? "Create & send" : "Save as draft")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as draft</SelectItem>
                  <SelectItem value="sent">Create & send</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Total */}
            <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono text-base font-semibold tabular-nums">
                {formatFull(total, currency)}
              </span>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href="/admin/invoices" />}>Cancel</Button>
            <Button onClick={submit} disabled={!valid}>
              {status === "sent" ? "Create & send" : "Create draft"}
            </Button>
          </div>
        </div>
      }
    />
  )
}

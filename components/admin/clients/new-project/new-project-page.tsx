"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PHASE_ORDER } from "@/lib/phase-colors"
import { CURRENCIES } from "@/lib/mock/currencies"
import { useClient } from "@/lib/queries/clients-queries"
import { useCreateProject } from "@/lib/queries/projects-queries"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

/** New Project — launched from a client (`?client=<id>`). POST /api/projects. */
export function NewProjectPage({ clientId }: { clientId?: string }) {
  const router = useRouter()
  const clientQ = useClient(clientId ?? "")
  const create = useCreateProject()

  const [name, setName] = React.useState("")
  const [type, setType] = React.useState("")
  const [phase, setPhase] = React.useState("Kickoff")
  const [value, setValue] = React.useState("")
  const [currency, setCurrency] = React.useState("USD")
  const [brief, setBrief] = React.useState("")

  if (!clientId) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Pick a client to add a project to.</p>
        <Button variant="outline" render={<Link href="/admin/clients" />}>Go to clients</Button>
      </div>
    )
  }

  const client = clientQ.data
  const backHref = `/admin/clients?c=${clientId}`
  const valid = name.trim().length > 0

  const submit = () => {
    create.mutate(
      {
        clientId,
        name: name.trim(),
        type: type || undefined,
        phase,
        status: "PLANNING",
        currency,
        totalValue: Number(value) || 0,
        description: brief || undefined,
      },
      { onSuccess: () => router.push(backHref) }
    )
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Set up a new project. It appears in the client's portal and starts their timeline.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-border p-3">
              {clientQ.isLoading ? (
                <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Monogram company={client?.company ?? "—"} className="size-10" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{client?.company ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">{client?.name ?? ""}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Project details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Name it, set the starting phase and budget.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project name" htmlFor="pname">
                <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Site build" />
              </Field>
              <Field label="Type" htmlFor="ptype">
                <Input id="ptype" value={type} onChange={(e) => setType(e.target.value)} placeholder="Website" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starting phase" htmlFor="pphase">
                <Select value={phase} onValueChange={(v) => v && setPhase(v)}>
                  <SelectTrigger id="pphase" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PHASE_ORDER.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Currency" htmlFor="pcurrency">
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                  <SelectTrigger id="pcurrency" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (<SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Value" htmlFor="pvalue">
              <Input id="pvalue" type="number" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
            </Field>
            <Field label="Brief" htmlFor="pbrief" hint="Optional — a short summary of the work.">
              <Textarea id="pbrief" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} placeholder="What are we building?" />
            </Field>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href={backHref} />}>Cancel</Button>
            <Button onClick={submit} disabled={!valid || create.isPending}>
              {create.isPending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </div>
      }
    />
  )
}

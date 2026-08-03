"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { getClient } from "@/lib/mock/clients"
import { getCurrency } from "@/lib/mock/currencies"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

/**
 * New Project page — launched from a client (`?client=<id>`). Reuses the
 * editorial split: the client it's for on the left (30%), the project form on
 * the right (70%). No backend yet — submit confirms with a toast and returns to
 * the client.
 */
export function NewProjectPage({ clientId }: { clientId?: string }) {
  const router = useRouter()
  const client = clientId ? getClient(clientId) : undefined

  const [name, setName] = React.useState("")
  const [phase, setPhase] = React.useState("Kickoff")
  const [value, setValue] = React.useState("")
  const [brief, setBrief] = React.useState("")

  const currency = client?.currency ?? "USD"
  const backHref = client ? `/admin/clients?c=${client.id}` : "/admin/clients"
  const valid = name.trim().length > 0

  const submit = () => {
    toast.success(
      `Created project “${name}”${client ? ` for ${client.company}` : ""}`
    )
    router.push(backHref)
  }

  if (!client) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">
          Pick a client to add a project to.
        </p>
        <Button variant="outline" render={<Link href="/admin/clients" />}>
          Go to clients
        </Button>
      </div>
    )
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Set up a new project. It appears in the client's portal and starts
              their timeline.
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-xl border border-border p-3">
              <Monogram company={client.company} className="size-10" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{client.company}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {client.contactName}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Project details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Name it, set the starting phase and budget.
          </p>

          <div className="space-y-4">
            <Field label="Project name" htmlFor="pname">
              <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Site build" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starting phase" htmlFor="pphase">
                <Select value={phase} onValueChange={(v) => v && setPhase(v)}>
                  <SelectTrigger id="pphase" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASE_ORDER.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label={`Value (${getCurrency(currency)?.code ?? currency})`}
                htmlFor="pvalue"
              >
                <Input id="pvalue" type="number" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
              </Field>
            </div>
            <Field label="Brief" htmlFor="pbrief" hint="Optional — a short summary of the work.">
              <Textarea id="pbrief" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} placeholder="What are we building?" />
            </Field>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href={backHref} />}>Cancel</Button>
            <Button onClick={submit} disabled={!valid}>Create project</Button>
          </div>
        </div>
      }
    />
  )
}

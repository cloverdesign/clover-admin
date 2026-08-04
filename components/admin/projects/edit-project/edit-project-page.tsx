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
import { formatDate } from "@/lib/format"
import { CURRENCIES } from "@/lib/mock/currencies"
import { PHASE_ORDER } from "@/lib/phase-colors"
import type { Phase } from "@/lib/mock/dashboard"
import {
  getProject,
  PROJECT_STATUS_LABEL,
  type ProjectStatus,
} from "@/lib/mock/projects"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

const STATUSES: ProjectStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
]

/**
 * Edit Project — same editorial split as the create flows, pre-filled from the
 * project. No backend: Save confirms with a toast and returns to the project.
 */
export function EditProjectPage({ id }: { id?: string }) {
  const router = useRouter()
  const project = id ? getProject(id) : undefined

  const [name, setName] = React.useState(project?.name ?? "")
  const [type, setType] = React.useState(project?.type ?? "")
  const [phase, setPhase] = React.useState<Phase>(project?.phase ?? "Kickoff")
  const [status, setStatus] = React.useState<ProjectStatus>(project?.status ?? "PLANNING")
  const [value, setValue] = React.useState(project ? String(project.totalValue) : "")
  const [currency, setCurrency] = React.useState(project?.currency ?? "USD")
  const [start, setStart] = React.useState(formatDate(project?.startDate, "month"))
  const [target, setTarget] = React.useState(formatDate(project?.endDate, "month"))
  const [brief, setBrief] = React.useState(project?.description ?? "")

  if (!project) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Button variant="outline" render={<Link href="/admin/projects" />}>
          Go to projects
        </Button>
      </div>
    )
  }

  const backHref = `/admin/projects/${project.id}`
  const valid = name.trim().length > 0

  const save = () => {
    toast.success(`Saved changes to ${name}`)
    router.push(backHref)
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit project</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the project's details. Phase and status also change from the
              project page.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-3">
              <Monogram company={project.client} className="size-10" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{project.name}</div>
                <div className="truncate text-xs text-muted-foreground">{project.client}</div>
              </div>
            </div>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Project details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Name, phase, budget and timeline.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project name" htmlFor="pname">
                <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Type" htmlFor="ptype">
                <Input id="ptype" value={type} onChange={(e) => setType(e.target.value)} placeholder="Website" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phase" htmlFor="pphase">
                <Select value={phase} onValueChange={(v) => v && setPhase(v as Phase)}>
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
              <Field label="Status" htmlFor="pstatus">
                <Select value={status} onValueChange={(v) => v && setStatus(v as ProjectStatus)}>
                  <SelectTrigger id="pstatus" className="w-full">
                    <SelectValue>
                      {(v) => PROJECT_STATUS_LABEL[v as ProjectStatus] ?? v}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Value" htmlFor="pvalue">
                <Input id="pvalue" type="number" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
              </Field>
              <Field label="Currency" htmlFor="pcurrency">
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                  <SelectTrigger id="pcurrency" className="w-full">
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" htmlFor="pstart">
                <Input id="pstart" value={start} onChange={(e) => setStart(e.target.value)} placeholder="Mar 2024" />
              </Field>
              <Field label="Target" htmlFor="ptarget">
                <Input id="ptarget" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Sep 2024" />
              </Field>
            </div>
            <Field label="Brief" htmlFor="pbrief">
              <Textarea id="pbrief" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} />
            </Field>
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

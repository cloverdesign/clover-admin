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
import { CURRENCIES } from "@/lib/mock/currencies"
import { PHASE_ORDER } from "@/lib/phase-colors"
import { toApiDateTime } from "@/lib/format"
import { DatePicker } from "@/components/ui/date-picker"
import { PROJECT_STATUS_LABEL } from "@/lib/mock/projects"
import { useProject, useUpdateProject } from "@/lib/queries/projects-queries"
import { useClient } from "@/lib/queries/clients-queries"
import type { Project, ProjectStatus } from "@/lib/api/models"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

const STATUSES: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD", "CANCELLED"]

/** Edit Project — PUT /api/projects/{id}. */
export function EditProjectPage({ id }: { id?: string }) {
  const router = useRouter()
  const projectQ = useProject(id ?? "")

  if (projectQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (projectQ.isError || !projectQ.data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Button variant="outline" render={<Link href="/admin/projects" />}>Go to projects</Button>
      </div>
    )
  }
  return <EditProjectForm project={projectQ.data} router={router} />
}

function EditProjectForm({ project, router }: { project: Project; router: ReturnType<typeof useRouter> }) {
  const update = useUpdateProject()
  const clientQ = useClient(project.clientId)
  const backHref = `/admin/projects/${project.id}`

  const [name, setName] = React.useState(project.name)
  const [type, setType] = React.useState(project.type)
  const [phase, setPhase] = React.useState(project.phase)
  const [status, setStatus] = React.useState<ProjectStatus>(project.status)
  const [value, setValue] = React.useState(String(project.totalValue))
  const [currency, setCurrency] = React.useState(project.currency)
  const [start, setStart] = React.useState((project.startDate ?? "").slice(0, 10))
  const [end, setEnd] = React.useState((project.endDate ?? "").slice(0, 10))
  const [progress, setProgress] = React.useState(String(project.progress))
  const [brief, setBrief] = React.useState(project.description ?? "")

  const valid = name.trim().length > 0

  const save = () => {
    update.mutate(
      {
        id: project.id,
        input: {
          name: name.trim(),
          type,
          phase,
          status,
          currency,
          totalValue: Number(value) || 0,
          startDate: toApiDateTime(start),
          endDate: toApiDateTime(end),
          progress: Math.max(0, Math.min(100, Number(progress) || 0)),
          description: brief || undefined,
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
            <h1 className="text-2xl font-semibold tracking-tight">Edit project</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the project's details. Phase and status also change from the project page.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-3">
              <Monogram company={clientQ.data?.company ?? project.name} className="size-10" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{project.name}</div>
                <div className="truncate text-xs text-muted-foreground">{clientQ.data?.company ?? ""}</div>
              </div>
            </div>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Project details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Name, phase, budget and timeline.</p>

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
                <Select value={phase} onValueChange={(v) => v && setPhase(v)}>
                  <SelectTrigger id="pphase" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PHASE_ORDER.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" htmlFor="pstatus">
                <Select value={status} onValueChange={(v) => v && setStatus(v as ProjectStatus)}>
                  <SelectTrigger id="pstatus" className="w-full">
                    <SelectValue>{(v) => PROJECT_STATUS_LABEL[v as ProjectStatus] ?? v}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (<SelectItem key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</SelectItem>))}
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
                  <SelectTrigger id="pcurrency" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (<SelectItem key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" htmlFor="pstart">
                <DatePicker id="pstart" value={start} onChange={setStart} placeholder="No start date" />
              </Field>
              <Field label="Target" htmlFor="ptarget">
                <DatePicker id="ptarget" value={end} onChange={setEnd} placeholder="No end date" />
              </Field>
            </div>
            <Field label="Progress" htmlFor="pprogress" hint="0–100%. Auto-syncs from milestone completion when the project has milestones.">
              <div className="flex items-center gap-2">
                <Input
                  id="pprogress"
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </Field>
            <Field label="Brief" htmlFor="pbrief">
              <Textarea id="pbrief" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} />
            </Field>
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

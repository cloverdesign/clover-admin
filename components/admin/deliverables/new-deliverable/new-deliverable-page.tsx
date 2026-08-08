"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload04Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
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
import { useProjects, useProject } from "@/lib/queries/projects-queries"
import { useClients } from "@/lib/queries/clients-queries"
import { useCreateDeliverable } from "@/lib/queries/deliverables-queries"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

type Source = "file" | "link"

/** New Deliverable — POST /api/projects/{id}/deliverables. Provide a file URL or
 * an external link (the API stores either). Launchable with `?project=<id>`. */
export function NewDeliverablePage({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const projectsQ = useProjects()
  const clientsQ = useClients()
  const create = useCreateDeliverable()

  const projects = (projectsQ.data ?? []).filter((p) => !p.archived)
  const clientName = (cid: string) => clientsQ.data?.find((c) => c.id === cid)?.company ?? ""

  const [selectedId, setSelectedId] = React.useState(projectId ?? "")
  const project = projects.find((p) => p.id === selectedId)
  const projectQ = useProject(selectedId)
  const milestones = projectQ.data?.milestones ?? []

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [source, setSource] = React.useState<Source>("file")
  const [fileUrl, setFileUrl] = React.useState("")
  const [link, setLink] = React.useState("")
  const [milestoneId, setMilestoneId] = React.useState("")

  const sourceValid = source === "file" ? /\S+/.test(fileUrl) : /\S+\.\S+/.test(link.trim())
  const valid = Boolean(project) && title.trim().length > 0 && sourceValid

  const submit = () => {
    if (!project) return
    create.mutate(
      {
        projectId: project.id,
        input: {
          title: title.trim(),
          description: description || undefined,
          fileUrl: source === "file" ? fileUrl.trim() : undefined,
          externalLink: source === "link" ? link.trim() : undefined,
          milestoneId: milestoneId || undefined,
        },
      },
      { onSuccess: () => router.push("/admin/deliverables") }
    )
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New deliverable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Link finished work for the client to review. Provide a file URL or an
              external link (Figma, a hosted build).
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
                Pick a project on the right.
              </div>
            )}
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Deliverable details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Project, asset and an optional milestone.</p>

          <div className="space-y-4">
            <Field label="Project" htmlFor="project">
              <Select value={selectedId} onValueChange={(v) => { if (v) { setSelectedId(v); setMilestoneId("") } }}>
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
                    <SelectItem key={p.id} value={p.id}>{clientName(p.clientId)} · {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Title" htmlFor="title">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Homepage design" />
            </Field>

            <Field label="Description" htmlFor="description">
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's in this deliverable and what you'd like reviewed." />
            </Field>

            <div className="space-y-2">
              <div className="text-sm font-medium">Asset</div>
              <div className="grid grid-cols-2 gap-2">
                <SourceTab active={source === "file"} icon={Upload04Icon} label="File URL" onClick={() => setSource("file")} />
                <SourceTab active={source === "link"} icon={LinkSquare02Icon} label="External link" onClick={() => setSource("link")} />
              </div>
              {source === "file" ? (
                <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="/uploads/homepage-v1.pdf or https://…" inputMode="url" />
              ) : (
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://figma.com/file/…" inputMode="url" />
              )}
            </div>

            <Field label="Milestone" htmlFor="milestone" hint="Optional — ties this deliverable to a project milestone.">
              <Select value={milestoneId} onValueChange={(v) => v && setMilestoneId(v === "none" ? "" : v)} disabled={!project}>
                <SelectTrigger id="milestone" className="w-full">
                  <SelectValue placeholder="No milestone">
                    {(v) => (v && v !== "none" ? milestones.find((m) => m.id === v)?.title ?? "No milestone" : "No milestone")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No milestone</SelectItem>
                  {milestones.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href="/admin/deliverables" />}>Cancel</Button>
            <Button onClick={submit} disabled={!valid || create.isPending}>
              {create.isPending ? "Adding…" : "Add deliverable"}
            </Button>
          </div>
        </div>
      }
    />
  )
}

function SourceTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof Upload04Icon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors",
        active ? "border-foreground bg-muted/50 font-medium text-foreground" : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      <HugeiconsIcon icon={icon} className="size-4" />
      {label}
    </button>
  )
}

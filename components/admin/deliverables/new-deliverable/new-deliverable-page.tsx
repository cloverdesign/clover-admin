"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { PROJECTS, getProject } from "@/lib/mock/projects"
import { deliverablesForProject } from "@/lib/mock/deliverables"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

const PROJECT_OPTIONS = PROJECTS.filter((p) => !p.archived)

type Source = "upload" | "link"

/**
 * New Deliverable — upload a file or link an external asset against a project
 * (§1.2.6). Launchable with `?project=<id>` prefilled from a project. Editorial
 * split: the target on the left, the asset details on the right. The version is
 * derived from any existing deliverable with the same title. No backend — submit
 * confirms with a toast.
 */
export function NewDeliverablePage({ projectId }: { projectId?: string }) {
  const router = useRouter()

  const [selectedId, setSelectedId] = React.useState(projectId ?? "")
  const project = selectedId ? getProject(selectedId) : undefined

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [source, setSource] = React.useState<Source>("upload")
  const [fileName, setFileName] = React.useState("")
  const [link, setLink] = React.useState("")
  const [milestoneId, setMilestoneId] = React.useState("")

  const milestones = project?.milestones ?? []

  // Next version = one past any existing deliverable sharing this exact title.
  const existing = project
    ? deliverablesForProject(project.id).filter(
        (d) => d.title.trim().toLowerCase() === title.trim().toLowerCase()
      )
    : []
  const nextVersion = existing.length
    ? Math.max(...existing.map((d) => d.version)) + 1
    : 1

  const pickProject = (id: string) => {
    setSelectedId(id)
    setMilestoneId("")
  }

  const sourceValid =
    source === "upload" ? fileName.trim().length > 0 : /\S+\.\S+/.test(link.trim())
  const valid = Boolean(project) && title.trim().length > 0 && sourceValid

  const submit = () => {
    const label = nextVersion > 1 ? `${title} v${nextVersion}` : title
    toast.success(`Added “${label}” to ${project?.name}`)
    router.push("/admin/deliverables")
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New deliverable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload finished work or link an external asset. It appears in the
              client's portal for review once added.
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
                Pick a project on the right.
              </div>
            )}
            {project && title.trim() && (
              <div className="mt-3 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                Saves as{" "}
                <span className="font-mono text-foreground">v{nextVersion}</span>
                {nextVersion > 1 && " — supersedes the current version"}.
              </div>
            )}
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Deliverable details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Project, asset, and an optional milestone to deliver against.
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

            <Field label="Title" htmlFor="title">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Homepage design"
              />
            </Field>

            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's in this deliverable and what you'd like reviewed."
              />
            </Field>

            {/* Source toggle */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Asset</div>
              <div className="grid grid-cols-2 gap-2">
                <SourceTab
                  active={source === "upload"}
                  icon={Upload04Icon}
                  label="Upload file"
                  onClick={() => setSource("upload")}
                />
                <SourceTab
                  active={source === "link"}
                  icon={LinkSquare02Icon}
                  label="External link"
                  onClick={() => setSource("link")}
                />
              </div>
              {source === "upload" ? (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center transition-colors hover:border-ring/60 hover:bg-muted/30">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={Upload04Icon} className="size-5" />
                  </span>
                  {fileName ? (
                    <span className="font-mono text-sm">{fileName}</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium">Choose a file</span>
                      <span className="text-xs text-muted-foreground">
                        Figma export, PDF, image or video
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                  />
                </label>
              ) : (
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://figma.com/file/…"
                  inputMode="url"
                />
              )}
            </div>

            <Field
              label="Milestone"
              htmlFor="milestone"
              hint="Optional — ties this deliverable to a project milestone."
            >
              <Select
                value={milestoneId}
                onValueChange={(v) => v && setMilestoneId(v === "none" ? "" : v)}
                disabled={!project}
              >
                <SelectTrigger id="milestone" className="w-full">
                  <SelectValue placeholder="No milestone">
                    {(v) =>
                      v && v !== "none"
                        ? milestones.find((m) => m.id === v)?.title ?? "No milestone"
                        : "No milestone"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No milestone</SelectItem>
                  {milestones.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href="/admin/deliverables" />}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!valid}>
              Add deliverable
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
        active
          ? "border-foreground bg-muted/50 font-medium text-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      <HugeiconsIcon icon={icon} className="size-4" />
      {label}
    </button>
  )
}

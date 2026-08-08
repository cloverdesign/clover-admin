"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDeliverable, useUpdateDeliverable } from "@/lib/queries/deliverables-queries"
import { useProject } from "@/lib/queries/projects-queries"
import type { Deliverable } from "@/lib/api/models"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

/** Edit Deliverable — PUT /api/deliverables/{id}. Edits title, description,
 * external link and milestone (upload a new version to replace the asset). */
export function EditDeliverablePage({ id }: { id?: string }) {
  const router = useRouter()
  const { data, isLoading, isError } = useDeliverable(id ?? "")

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Deliverable not found.</p>
        <Button variant="outline" render={<Link href="/admin/deliverables" />}>Go to deliverables</Button>
      </div>
    )
  }
  return <EditDeliverableForm deliverable={data} router={router} />
}

function EditDeliverableForm({ deliverable, router }: { deliverable: Deliverable; router: ReturnType<typeof useRouter> }) {
  const update = useUpdateDeliverable()
  const projectQ = useProject(deliverable.projectId)
  const milestones = projectQ.data?.milestones ?? []
  const backHref = `/admin/deliverables/${deliverable.id}`

  const [title, setTitle] = React.useState(deliverable.title)
  const [description, setDescription] = React.useState(deliverable.description ?? "")
  const [milestoneId, setMilestoneId] = React.useState(deliverable.milestoneId ?? "")

  const valid = title.trim().length > 0

  const save = () => {
    update.mutate(
      {
        id: deliverable.id,
        projectId: deliverable.projectId,
        input: {
          title: title.trim(),
          description: description || undefined,
          externalLink: deliverable.externalLink ?? undefined,
          fileUrl: deliverable.fileUrl ?? undefined,
          milestoneId: milestoneId || undefined,
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
            <h1 className="text-2xl font-semibold tracking-tight">Edit deliverable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the title, description and milestone. Upload a new version to replace the asset.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-3">
              <Monogram company={deliverable.title} className="size-10" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{deliverable.title}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">v{deliverable.version}</div>
              </div>
              <Badge variant={deliverable.status === "READY" ? "success" : "secondary"}>
                {deliverable.status === "READY" ? "Ready" : "Superseded"}
              </Badge>
            </div>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Deliverable details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Title, description and the milestone it delivers against.</p>

          <div className="space-y-4">
            <Field label="Title" htmlFor="title">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Field label="Milestone" htmlFor="milestone" hint="Optional — ties this deliverable to a project milestone.">
              <Select value={milestoneId} onValueChange={(v) => v && setMilestoneId(v === "none" ? "" : v)}>
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

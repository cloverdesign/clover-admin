"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  GitBranchIcon,
  Add01Icon,
  Delete02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate, byNewest } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  usePortalRevisions,
  useSubmitRevision,
} from "@/lib/queries/portal-queries"
import type { RevisionRequest, RevisionStatus } from "@/lib/api/models"

/**
 * Revision requests on the client project view (PRD §1.2.5). The client asks for
 * a change — with an optional timeframe and reference links — then tracks it
 * through Requested → In review → Approved / Declined. Once approved, the studio
 * links the resulting project, which the client can jump straight to.
 */
export function PortalRevisions({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = usePortalRevisions()

  const requests = (data ?? [])
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => byNewest(a.createdAt, b.createdAt))

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={GitBranchIcon} className="size-4 text-muted-foreground" />
          <h2 className="font-heading text-sm font-medium">Revision requests</h2>
          {requests.length > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {requests.length}
            </span>
          )}
        </div>
        <NewRevisionDialog projectId={projectId} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
        </div>
      ) : isError ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Couldn’t load your requests.
        </p>
      ) : requests.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Need a change? Request a revision and your studio will take it from there.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {requests.map((request) => (
            <RevisionCard key={request.id} request={request} />
          ))}
        </ul>
      )}
    </section>
  )
}

function RevisionCard({ request }: { request: RevisionRequest }) {
  return (
    <li className="rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm whitespace-pre-wrap">{request.description}</p>
        <RevisionStatusBadge status={request.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Requested {formatDate(request.createdAt)}</span>
        {request.targetTimeframe && <span>· Target: {request.targetTimeframe}</span>}
      </div>

      <RevisionStepper status={request.status} className="mt-3" />

      {request.status === "APPROVED" && request.resultingProjectId && (
        <Link
          href={`/projects/${request.resultingProjectId}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
        >
          View the new project
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </Link>
      )}
      {request.status === "APPROVED" && request.resultingPhaseNote && (
        <p className="mt-2 text-sm text-muted-foreground">{request.resultingPhaseNote}</p>
      )}
    </li>
  )
}

/* ------------------------------------------------------------ status display */

const REVISION_LABEL: Record<RevisionStatus, string> = {
  REQUESTED: "Requested",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  DECLINED: "Declined",
}

const REVISION_VARIANT: Record<
  RevisionStatus,
  "secondary" | "info" | "success" | "destructive"
> = {
  REQUESTED: "secondary",
  IN_REVIEW: "info",
  APPROVED: "success",
  DECLINED: "destructive",
}

function RevisionStatusBadge({ status }: { status: RevisionStatus }) {
  return <Badge variant={REVISION_VARIANT[status]}>{REVISION_LABEL[status]}</Badge>
}

/** Three-node tracker: Requested → In review → decision. The final node reads
 * Approved (green) or Declined (red); before that it's a neutral pending step. */
function RevisionStepper({
  status,
  className,
}: {
  status: RevisionStatus
  className?: string
}) {
  const declined = status === "DECLINED"
  const stepIndex =
    status === "REQUESTED" ? 0 : status === "IN_REVIEW" ? 1 : 2
  const steps = [
    { label: "Requested" },
    { label: "In review" },
    { label: declined ? "Declined" : "Approved" },
  ]

  return (
    <ol className={cn("flex items-center", className)}>
      {steps.map((step, i) => {
        const reached = i <= stepIndex
        const isDecision = i === 2
        const tone = !reached
          ? "text-muted-foreground/50"
          : isDecision && declined
            ? "text-destructive"
            : isDecision
              ? "text-success"
              : "text-foreground"
        const dot = !reached
          ? "bg-muted"
          : isDecision && declined
            ? "bg-destructive"
            : isDecision
              ? "bg-success"
              : "bg-foreground"
        return (
          <li key={step.label} className="flex items-center gap-2 last:flex-initial">
            <span className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", dot)} />
              <span className={cn("text-xs whitespace-nowrap", tone)}>{step.label}</span>
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-px w-6 shrink-0",
                  i < stepIndex ? "bg-foreground/30" : "bg-border"
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ---------------------------------------------------------------- submit form */

type AttachmentDraft = { url: string; name: string }

function NewRevisionDialog({ projectId }: { projectId: string }) {
  const submit = useSubmitRevision()
  const [open, setOpen] = React.useState(false)
  const [description, setDescription] = React.useState("")
  const [timeframe, setTimeframe] = React.useState("")
  const [attachments, setAttachments] = React.useState<AttachmentDraft[]>([])

  const reset = () => {
    setDescription("")
    setTimeframe("")
    setAttachments([])
  }

  const addAttachment = () =>
    setAttachments((prev) => [...prev, { url: "", name: "" }])
  const updateAttachment = (index: number, patch: Partial<AttachmentDraft>) =>
    setAttachments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...patch } : a))
    )
  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index))

  const onSubmit = () => {
    const cleanAttachments = attachments
      .map((a) => ({ url: a.url.trim(), name: a.name.trim() }))
      .filter((a) => a.url)
      .map((a) => ({ url: a.url, name: a.name || a.url }))
    submit.mutate(
      {
        projectId,
        input: {
          description: description.trim(),
          targetTimeframe: timeframe.trim() || undefined,
          attachments: cleanAttachments.length ? cleanAttachments : undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
            Request a revision
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a revision</DialogTitle>
          <DialogDescription>
            Describe the change you’d like. Your studio will review it and either fold it
            into this project or spin up a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="revision-description">What needs to change?</Label>
            <Textarea
              id="revision-description"
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the revision you’re after…"
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="revision-timeframe">
              Target timeframe <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="revision-timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g. Before the end of the month"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Reference links <span className="text-muted-foreground">(optional)</span>
            </span>
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={attachment.url}
                  onChange={(e) => updateAttachment(index, { url: e.target.value })}
                  placeholder="https://…"
                  className="flex-1"
                />
                <Input
                  value={attachment.name}
                  onChange={(e) => updateAttachment(index, { name: e.target.value })}
                  placeholder="Label"
                  className="w-28"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove link"
                  onClick={() => removeAttachment(index)}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={addAttachment}
            >
              <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
              Add a link
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            }
          />
          <Button
            variant="default"
            size="sm"
            disabled={submit.isPending || description.trim().length === 0}
            onClick={onSubmit}
          >
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

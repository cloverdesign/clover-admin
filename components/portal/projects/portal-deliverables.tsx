"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  DeliveryBox01Icon,
  Download01Icon,
  LinkSquare02Icon,
  Image01Icon,
  File01Icon,
  CheckmarkCircle02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons"

import { formatDate, byNewest } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  usePortalProjectDeliverables,
  useReviewDeliverable,
  useSubmitRevision,
} from "@/lib/queries/portal-queries"
import type { Deliverable, DeliverableReviewStatus } from "@/lib/api/models"

/**
 * Deliverables on the client project view (PRD §1.2.6). Finished work the studio
 * has shipped: the client previews or downloads it, then approves or requests
 * changes with a comment (the entry point into a revision request).
 *
 * The portal `Deliverable` carries no embedded review, so once the client acts we
 * hold the outcome locally and reflect it on the card — the mutation still fires
 * and invalidates, so a reload from the server stays authoritative.
 */
export function PortalDeliverables({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = usePortalProjectDeliverables(projectId)

  if (isLoading) {
    return (
      <section className="rounded-2xl border bg-card p-5">
        <SectionHeading />
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-2xl border bg-card p-5">
        <SectionHeading />
        <p className="py-6 text-center text-sm text-muted-foreground">
          Couldn’t load deliverables.
        </p>
      </section>
    )
  }

  const deliverables = data ?? []
  // Current versions lead; superseded ones fold into their title group below.
  const current = deliverables.filter((d) => d.status === "READY")
  const supersededByTitle = new Map<string, Deliverable[]>()
  for (const d of deliverables) {
    if (d.status !== "SUPERSEDED") continue
    const list = supersededByTitle.get(d.title) ?? []
    list.push(d)
    supersededByTitle.set(d.title, list)
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <SectionHeading count={current.length} />

      {current.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing here yet. Finished work will show up as your studio ships it.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {[...current].sort((a, b) => byNewest(a.uploadedAt, b.uploadedAt)).map((d) => (
            <DeliverableCard
              key={d.id}
              deliverable={d}
              projectId={projectId}
              olderVersions={(supersededByTitle.get(d.title) ?? []).sort((a, b) =>
                byNewest(a.uploadedAt, b.uploadedAt)
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function SectionHeading({ count }: { count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <HugeiconsIcon icon={DeliveryBox01Icon} className="size-4 text-muted-foreground" />
      <h2 className="font-heading text-sm font-medium">Deliverables</h2>
      {count != null && count > 0 && (
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      )}
    </div>
  )
}

function DeliverableCard({
  deliverable,
  projectId,
  olderVersions,
}: {
  deliverable: Deliverable
  projectId: string
  olderVersions: Deliverable[]
}) {
  const review = useReviewDeliverable()
  const submitRevision = useSubmitRevision()
  // Once the client acts, remember the outcome so the card updates immediately.
  const [outcome, setOutcome] = React.useState<DeliverableReviewStatus | null>(null)
  const [changesOpen, setChangesOpen] = React.useState(false)
  const [comment, setComment] = React.useState("")
  // §7d: let a "request changes" optionally be promoted into a revision request.
  const [raiseRevision, setRaiseRevision] = React.useState(false)

  const approve = () =>
    review.mutate(
      { deliverableId: deliverable.id, projectId, input: { status: "APPROVED" } },
      { onSuccess: () => setOutcome("APPROVED") }
    )

  const requestChanges = () =>
    review.mutate(
      {
        deliverableId: deliverable.id,
        projectId,
        input: { status: "CHANGES_REQUESTED", comment: comment.trim() || undefined },
      },
      {
        onSuccess: () => {
          setOutcome("CHANGES_REQUESTED")
          setChangesOpen(false)
          // Promote to a full revision request tied to this deliverable (§7d).
          if (raiseRevision) {
            submitRevision.mutate({
              projectId,
              input: { description: comment.trim(), deliverableId: deliverable.id },
            })
          }
          setComment("")
          setRaiseRevision(false)
        },
      }
    )

  const isImage = looksLikeImage(deliverable.fileUrl)

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <HugeiconsIcon
            icon={deliverable.externalLink ? LinkSquare02Icon : isImage ? Image01Icon : File01Icon}
            className="size-4.5"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">{deliverable.title}</span>
            <Badge variant="secondary">v{deliverable.version}</Badge>
            {outcome && (
              <Badge variant={outcome === "APPROVED" ? "success" : "warning"}>
                {outcome === "APPROVED" ? "You approved this" : "Changes requested"}
              </Badge>
            )}
          </div>
          {deliverable.description && (
            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
              {deliverable.description}
            </p>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">
            Shared {formatDate(deliverable.uploadedAt)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {deliverable.fileUrl && (
              <Button
                variant="outline"
                size="sm"
                render={
                  <a href={deliverable.fileUrl} download target="_blank" rel="noreferrer" />
                }
              >
                <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" className="size-4" />
                Download
              </Button>
            )}
            {deliverable.externalLink && (
              <Button
                variant="outline"
                size="sm"
                render={
                  <a href={deliverable.externalLink} target="_blank" rel="noreferrer" />
                }
              >
                <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-start" className="size-4" />
                Open link
              </Button>
            )}
          </div>

          {!outcome && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
              <Button
                variant="default"
                size="sm"
                disabled={review.isPending}
                onClick={approve}
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} data-icon="inline-start" className="size-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={review.isPending}
                onClick={() => setChangesOpen(true)}
              >
                <HugeiconsIcon icon={PencilEdit02Icon} data-icon="inline-start" className="size-4" />
                Request changes
              </Button>
            </div>
          )}

          {olderVersions.length > 0 && (
            <details className="mt-3 border-t pt-3">
              <summary className="cursor-pointer text-xs text-muted-foreground marker:content-none hover:text-foreground">
                {olderVersions.length} previous version
                {olderVersions.length === 1 ? "" : "s"}
              </summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {olderVersions.map((old) => (
                  <li
                    key={old.id}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Badge variant="secondary">v{old.version}</Badge>
                    <span className="text-muted-foreground/70">
                      {formatDate(old.uploadedAt)}
                    </span>
                    {(old.fileUrl || old.externalLink) && (
                      <a
                        href={old.fileUrl ?? old.externalLink ?? "#"}
                        download={Boolean(old.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
                      >
                        <HugeiconsIcon
                          icon={old.externalLink ? LinkSquare02Icon : Download01Icon}
                          className="size-3.5"
                        />
                        {old.externalLink ? "Open" : "Download"}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      <RequestChangesDialog
        open={changesOpen}
        onOpenChange={setChangesOpen}
        comment={comment}
        onCommentChange={setComment}
        raiseRevision={raiseRevision}
        onRaiseRevisionChange={setRaiseRevision}
        pending={review.isPending || submitRevision.isPending}
        onSubmit={requestChanges}
        title={deliverable.title}
      />
    </div>
  )
}

function RequestChangesDialog({
  open,
  onOpenChange,
  comment,
  onCommentChange,
  raiseRevision,
  onRaiseRevisionChange,
  pending,
  onSubmit,
  title,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  comment: string
  onCommentChange: (value: string) => void
  raiseRevision: boolean
  onRaiseRevisionChange: (value: boolean) => void
  pending: boolean
  onSubmit: () => void
  title: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
          <DialogDescription>
            Tell your studio what needs another look on “{title}”. They’ll follow up,
            and can turn this into a revision if it’s a bigger change.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          autoFocus
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="What would you like changed?"
          rows={4}
        />
        <Label className="flex items-start gap-2.5 text-sm font-normal text-muted-foreground">
          <Checkbox
            checked={raiseRevision}
            onCheckedChange={(v) => onRaiseRevisionChange(v === true)}
            className="mt-0.5"
          />
          Also raise this as a revision request — for a bigger scope change your studio
          tracks separately.
        </Label>
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
            disabled={pending || comment.trim().length === 0}
            onClick={onSubmit}
          >
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function looksLikeImage(url: string | null): boolean {
  if (!url) return false
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(url)
}

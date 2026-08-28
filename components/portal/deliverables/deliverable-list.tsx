"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DeliveryBox01Icon,
  Download01Icon,
  LinkSquare02Icon,
  Image01Icon,
  File01Icon,
  CheckmarkCircle02Icon,
  PencilEdit02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate, byNewest } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { useReviewDeliverable, useSubmitRevision } from "@/lib/queries/portal-queries"
import type { Deliverable, DeliverableReviewStatus } from "@/lib/api/models"

/** One current deliverable plus every superseded version of the same title. */
export type DeliverableGroup = {
  current: Deliverable
  older: Deliverable[]
}

/**
 * Fold a flat deliverable list into current-version groups. Versions of one
 * piece of work share a title within a project, so that pair is the group key —
 * two projects can both ship a "Logo pack" without collapsing into each other.
 */
export function groupDeliverables(deliverables: Deliverable[]): DeliverableGroup[] {
  const key = (d: Deliverable) => `${d.projectId}::${d.title}`
  const superseded = new Map<string, Deliverable[]>()
  for (const d of deliverables) {
    if (d.status !== "SUPERSEDED") continue
    const list = superseded.get(key(d)) ?? []
    list.push(d)
    superseded.set(key(d), list)
  }
  return deliverables
    .filter((d) => d.status === "READY")
    .sort((a, b) => byNewest(a.uploadedAt, b.uploadedAt))
    .map((current) => ({
      current,
      older: (superseded.get(key(current)) ?? []).sort((a, b) =>
        byNewest(a.uploadedAt, b.uploadedAt)
      ),
    }))
}

function looksLikeImage(url: string | null): boolean {
  if (!url) return false
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(url)
}

function fileIcon(d: Deliverable) {
  if (d.externalLink) return LinkSquare02Icon
  return looksLikeImage(d.fileUrl) ? Image01Icon : File01Icon
}

/* ------------------------------------------------------------------- list */

/**
 * Deliverables as rows that open a review panel, rather than cards that carry
 * their own controls. Reviewing is the portal's highest-value action and it now
 * happens in one place, whether the client arrives from a project or from Files.
 */
export function DeliverableList({
  deliverables,
  projectName,
  emptyMessage = "Nothing here yet. Finished work shows up as your studio ships it.",
}: {
  deliverables: Deliverable[]
  /** Renders the project under each title — omit on a single-project view. */
  projectName?: (projectId: string) => string
  emptyMessage?: string
}) {
  const groups = React.useMemo(() => groupDeliverables(deliverables), [deliverables])
  const [openId, setOpenId] = React.useState<string | null>(null)
  const active = groups.find((g) => g.current.id === openId) ?? null

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
        <HugeiconsIcon icon={DeliveryBox01Icon} className="size-6 text-muted-foreground/60" />
        <p className="max-w-xs text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <ul className="overflow-hidden rounded-2xl border bg-card">
        {groups.map((group, i) => (
          <li key={group.current.id}>
            <DeliverableRow
              group={group}
              subtitle={projectName?.(group.current.projectId)}
              divided={i > 0}
              onOpen={() => setOpenId(group.current.id)}
            />
          </li>
        ))}
      </ul>

      <Sheet
        open={active !== null}
        onOpenChange={(open) => !open && setOpenId(null)}
      >
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
          {active && (
            <DeliverablePanel
              group={active}
              subtitle={projectName?.(active.current.projectId)}
              onDone={() => setOpenId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function ReviewBadge({ status }: { status: DeliverableReviewStatus | null }) {
  if (status === "APPROVED") return <Badge variant="success">You approved this</Badge>
  if (status === "CHANGES_REQUESTED") return <Badge variant="warning">Changes requested</Badge>
  return <Badge variant="info">Needs your review</Badge>
}

function DeliverableRow({
  group,
  subtitle,
  divided,
  onOpen,
}: {
  group: DeliverableGroup
  subtitle?: string
  divided: boolean
  onOpen: () => void
}) {
  const d = group.current
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 sm:px-5",
        divided && "border-t border-border"
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
        {looksLikeImage(d.fileUrl) ? (
          <Image
            src={d.fileUrl as string}
            alt=""
            width={40}
            height={40}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <HugeiconsIcon icon={fileIcon(d)} className="size-4.5" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium">{d.title}</span>
          <Badge variant="secondary">v{d.version}</Badge>
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {[subtitle, `Shared ${formatDate(d.uploadedAt)}`].filter(Boolean).join(" · ")}
        </span>
      </span>

      <span className="hidden shrink-0 sm:block">
        <ReviewBadge status={d.review?.status ?? null} />
      </span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground"
      />
    </button>
  )
}

/* ------------------------------------------------------------------ panel */

/**
 * The review slide-over: preview, the studio's note, the file, and the decision.
 * The panel holds the outcome locally after acting so the row updates at once —
 * the mutation still invalidates, so a reload stays server-authoritative.
 */
function DeliverablePanel({
  group,
  subtitle,
  onDone,
}: {
  group: DeliverableGroup
  subtitle?: string
  onDone: () => void
}) {
  const { current: d, older } = group
  const review = useReviewDeliverable()
  const submitRevision = useSubmitRevision()

  const [outcome, setOutcome] = React.useState<DeliverableReviewStatus | null>(
    d.review?.status ?? null
  )
  const [changesOpen, setChangesOpen] = React.useState(false)
  const [comment, setComment] = React.useState("")
  const [raiseRevision, setRaiseRevision] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const approve = () =>
    review.mutate(
      { deliverableId: d.id, projectId: d.projectId, input: { status: "APPROVED" } },
      { onSuccess: () => setOutcome("APPROVED") }
    )

  const requestChanges = () => {
    if (comment.trim().length === 0) {
      setError("Say what needs changing first.")
      return
    }
    review.mutate(
      {
        deliverableId: d.id,
        projectId: d.projectId,
        input: { status: "CHANGES_REQUESTED", comment: comment.trim() },
      },
      {
        onSuccess: () => {
          setOutcome("CHANGES_REQUESTED")
          if (raiseRevision) {
            submitRevision.mutate({
              projectId: d.projectId,
              input: { description: comment.trim(), deliverableId: d.id },
            })
          }
          setChangesOpen(false)
          setComment("")
          setRaiseRevision(false)
        },
      }
    )
  }

  const pending = review.isPending || submitRevision.isPending

  return (
    <>
      <SheetHeader>
        <SheetTitle className="pr-6">{d.title}</SheetTitle>
        <SheetDescription>
          {[subtitle, `Version ${d.version}`, `Shared ${formatDate(d.uploadedAt)}`]
            .filter(Boolean)
            .join(" · ")}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto px-4">
        {looksLikeImage(d.fileUrl) && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted">
            <Image
              src={d.fileUrl as string}
              alt={d.title}
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-contain"
              unoptimized
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <ReviewBadge status={outcome} />
        </div>

        {d.description && (
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {d.description}
          </p>
        )}

        {(d.fileUrl || d.externalLink) && (
          <div className="flex flex-wrap items-center gap-2">
            {d.fileUrl && (
              <Button
                variant="outline"
                size="sm"
                render={<a href={d.fileUrl} download target="_blank" rel="noreferrer" />}
              >
                <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" className="size-4" />
                Download
              </Button>
            )}
            {d.externalLink && (
              <Button
                variant="outline"
                size="sm"
                render={<a href={d.externalLink} target="_blank" rel="noreferrer" />}
              >
                <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-start" className="size-4" />
                Open link
              </Button>
            )}
          </div>
        )}

        {d.review?.comment && (
          <div className="rounded-xl border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">Your note</p>
            <p className="mt-1 text-sm whitespace-pre-wrap">{d.review.comment}</p>
          </div>
        )}

        {changesOpen && (
          <div className="space-y-3 rounded-xl border p-3">
            <Label htmlFor="deliverable-comment">What needs another look?</Label>
            <Textarea
              id="deliverable-comment"
              autoFocus
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Describe the change you're after"
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Label className="flex items-start gap-2.5 text-sm font-normal text-muted-foreground">
              <Checkbox
                checked={raiseRevision}
                onCheckedChange={(v) => setRaiseRevision(v === true)}
                className="mt-0.5"
              />
              Also raise this as a revision request — for a bigger scope change your
              studio tracks separately.
            </Label>
          </div>
        )}

        {older.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              {older.length} previous version{older.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {older.map((old) => (
                <li key={old.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">v{old.version}</Badge>
                  <span>{formatDate(old.uploadedAt)}</span>
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
          </div>
        )}
      </div>

      <SheetFooter>
        {outcome ? (
          <Button variant="outline" size="sm" onClick={onDone}>
            Close
          </Button>
        ) : changesOpen ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                setChangesOpen(false)
                setError(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="default" size="sm" disabled={pending} onClick={requestChanges}>
              Send request
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setChangesOpen(true)}
            >
              <HugeiconsIcon icon={PencilEdit02Icon} data-icon="inline-start" className="size-4" />
              Request changes
            </Button>
            <Button variant="default" size="sm" disabled={pending} onClick={approve}>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                data-icon="inline-start"
                className="size-4"
              />
              Approve
            </Button>
          </>
        )}
      </SheetFooter>
    </>
  )
}

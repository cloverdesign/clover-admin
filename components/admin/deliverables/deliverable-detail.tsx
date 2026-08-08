"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download04Icon,
  LinkSquare02Icon,
  File01Icon,
  Image01Icon,
  Upload04Icon,
  Layers01Icon,
  Message01Icon,
  CheckmarkCircle02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  getDeliverable,
  versionsOf,
  reviewFor,
  formatBytes,
  fileKind,
  versionBadge,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_VARIANT,
  type Deliverable,
} from "@/lib/mock/deliverables"

/**
 * Deliverable detail — a document-style view of one version: a preview of the
 * file/link, its version history, and the client's review. When the client has
 * requested changes, the header surfaces the two responses (§1.2.6): ship a new
 * version, or open a formal revision request (the §1.2.5 hand-off). No backend —
 * every action mutates local state and confirms with a toast.
 */
export function DeliverableDetail({ id }: { id: string }) {
  const deliverable = getDeliverable(id)
  if (!deliverable) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Deliverable not found.</div>
    )
  }
  return <DeliverableDetailInner deliverable={deliverable} />
}

function DeliverableDetailInner({ deliverable }: { deliverable: Deliverable }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const review = reviewFor(deliverable.id)
  const versions = versionsOf(deliverable)
  const version = versionBadge(deliverable)
  const changesRequested = review?.status === "CHANGES_REQUESTED"

  const newVersionHref = `/admin/deliverables/new?project=${deliverable.projectId}`

  const open = () => {
    if (deliverable.externalLink) {
      toast.success(`Opening ${deliverable.externalLink}`)
    } else {
      toast.success(`Downloading ${deliverable.fileName}`)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Action bar */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{deliverable.title}</h1>
            <span className="font-mono text-sm text-muted-foreground">
              v{deliverable.version}
            </span>
            {version && <Badge variant={version.variant}>{version.label}</Badge>}
            {review && (
              <Badge variant={REVIEW_STATUS_VARIANT[review.status]}>
                {REVIEW_STATUS_LABEL[review.status]}
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            <Link
              href={`/admin/clients?c=${deliverable.clientId}`}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {deliverable.client}
            </Link>
            <span>·</span>
            <Link
              href={`/admin/projects/${deliverable.projectId}`}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {deliverable.projectName}
            </Link>
            {deliverable.milestoneTitle && (
              <>
                <span>·</span>
                <span>{deliverable.milestoneTitle}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {changesRequested && (
            <Button
              variant="outline"
              className="gap-1.5"
              render={<Link href="/admin/revisions" />}
            >
              <HugeiconsIcon icon={Message01Icon} data-icon="inline-start" className="size-4" />
              Revision request
            </Button>
          )}
          <Button className="gap-1.5" render={<Link href={newVersionHref} />}>
            <HugeiconsIcon icon={Upload04Icon} data-icon="inline-start" className="size-4" />
            New version
          </Button>
          <DeliverableActions
            deliverable={deliverable}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6">
        <Preview deliverable={deliverable} onOpen={open} />
      </div>

      {/* Description */}
      {deliverable.description && (
        <p className="mt-6 text-sm leading-relaxed text-foreground/90">
          {deliverable.description}
        </p>
      )}

      {/* Review */}
      {review && (
        <section className="mt-8">
          <SectionLabel>Client review</SectionLabel>
          <div
            className={cn(
              "mt-3 rounded-2xl border bg-card p-4",
              changesRequested && "border-warning/40"
            )}
          >
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={changesRequested ? Message01Icon : CheckmarkCircle02Icon}
                className={cn(
                  "size-4",
                  changesRequested ? "text-warning" : "text-success"
                )}
              />
              <span className="text-sm font-medium">
                {REVIEW_STATUS_LABEL[review.status]}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDate(review.reviewedAt)}
              </span>
            </div>
            {review.comment && (
              <p className="mt-2 text-sm text-foreground/90">“{review.comment}”</p>
            )}
            {changesRequested && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <Button size="sm" className="gap-1.5" render={<Link href={newVersionHref} />}>
                  <HugeiconsIcon icon={Upload04Icon} data-icon="inline-start" className="size-3.5" />
                  Upload new version
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  render={<Link href="/admin/revisions" />}
                >
                  <HugeiconsIcon icon={Message01Icon} data-icon="inline-start" className="size-3.5" />
                  Open revision request
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Versions */}
      {versions.length > 1 && (
        <section className="mt-8">
          <SectionLabel>
            Versions · {versions.length}
          </SectionLabel>
          <div className="mt-3 flex flex-col divide-y divide-border rounded-2xl border bg-card">
            {[...versions].reverse().map((v) => {
              const current = v.id === deliverable.id
              const vBadge = versionBadge(v)
              return (
                <Link
                  key={v.id}
                  href={`/admin/deliverables/${v.id}`}
                  aria-current={current ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    current ? "bg-muted/40" : "hover:bg-muted/40"
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-xs text-muted-foreground">
                    v{v.version}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {v.externalLink ?? v.fileName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Uploaded {formatDate(v.uploadedAt)}
                    </div>
                  </div>
                  {vBadge && <Badge variant={vBadge.variant}>{vBadge.label}</Badge>}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Meta */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Meta label="Version" value={`v${deliverable.version}`} />
        <Meta label="Uploaded" value={formatDate(deliverable.uploadedAt)} />
        <Meta
          label="Type"
          value={deliverable.externalLink ? "External link" : "File upload"}
        />
        <Meta
          label={deliverable.externalLink ? "Source" : "Size"}
          value={
            deliverable.externalLink
              ? "Linked"
              : formatBytes(deliverable.fileSizeBytes)
          }
        />
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deliverable.title}” v{deliverable.version}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the deliverable from the project and the client's
              portal. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false)
                toast.success(`Deleted ${deliverable.title} v${deliverable.version}`)
                router.push("/admin/deliverables")
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** File/link preview surface — a real preview is faked with a typed placeholder. */
function Preview({
  deliverable,
  onOpen,
}: {
  deliverable: Deliverable
  onOpen: () => void
}) {
  const kind = fileKind(deliverable)

  if (kind === "link") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <HugeiconsIcon icon={LinkSquare02Icon} className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium">External link</div>
            <div className="truncate font-mono text-xs text-muted-foreground">
              {deliverable.externalLink}
            </div>
          </div>
        </div>
        <Button className="gap-1.5" onClick={onOpen}>
          <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-start" className="size-4" />
          Open link
        </Button>
      </div>
    )
  }

  const icon = kind === "image" ? Image01Icon : File01Icon
  return (
    <div className="rounded-2xl border bg-card">
      {/* Faux preview canvas */}
      <div className="flex aspect-[16/9] items-center justify-center rounded-t-2xl bg-[repeating-linear-gradient(45deg,var(--muted)_0_10px,transparent_10px_20px)]">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-muted-foreground ring-1 ring-border">
          <HugeiconsIcon icon={icon} className="size-6" />
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="truncate font-mono text-sm">{deliverable.fileName}</div>
          <div className="text-xs text-muted-foreground">
            {formatBytes(deliverable.fileSizeBytes)}
          </div>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={onOpen}>
          <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" className="size-4" />
          Download
        </Button>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
      {children}
    </div>
  )
}

function DeliverableActions({
  deliverable,
  onDelete,
}: {
  deliverable: Deliverable
  onDelete: () => void
}) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Deliverable actions"
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/deliverables/${deliverable.id}/edit`)}
        >
          <HugeiconsIcon icon={PencilEdit02Icon} />
          Edit details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            router.push(`/admin/deliverables/new?project=${deliverable.projectId}`)
          }
        >
          <HugeiconsIcon icon={Layers01Icon} />
          Add version
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <HugeiconsIcon icon={Delete02Icon} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

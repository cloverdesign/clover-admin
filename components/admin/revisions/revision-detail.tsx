"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Attachment01Icon,
  GitMergeIcon,
  Folder01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
  getRevision,
  REVISION_STATUS_LABEL,
  REVISION_STATUS_VARIANT,
  type RevisionRequest,
  type RevisionStatus,
  type Resolution,
} from "@/lib/mock/revisions"

/**
 * Revision request detail — review the request, then decide (§1.2.5): approve
 * as a new phase on the existing project, approve as a new linked project, or
 * decline. Single-column document with the decision in the header bar. No
 * backend: decisions mutate local state + toast.
 */
export function RevisionDetail({ id }: { id: string }) {
  const revision = getRevision(id)
  if (!revision) {
    return <div className="p-6 text-sm text-muted-foreground">Request not found.</div>
  }
  return <RevisionDetailInner revision={revision} />
}

function RevisionDetailInner({ revision }: { revision: RevisionRequest }) {
  const [status, setStatus] = React.useState<RevisionStatus>(revision.status)
  const [resolution, setResolution] = React.useState<Resolution | undefined>(
    revision.resolution
  )
  const [declineOpen, setDeclineOpen] = React.useState(false)

  const pending = status === "requested" || status === "in-review"

  const approveAsPhase = () => {
    setStatus("approved")
    setResolution({ type: "phase", ref: revision.projectId, refName: `${revision.title} (phase)` })
    toast.success(`Approved — added a new phase to ${revision.projectName}`)
  }
  const approveAsProject = () => {
    setStatus("approved")
    setResolution({ type: "project", ref: revision.projectId, refName: revision.title })
    toast.success(`Approved — scaffolded a linked project “${revision.title}”`)
  }
  const decline = () => {
    setStatus("declined")
    setResolution(undefined)
    setDeclineOpen(false)
    toast.success(`Declined “${revision.title}”`)
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header + decision actions */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">{revision.title}</h1>
            <Badge variant={REVISION_STATUS_VARIANT[status]}>
              {REVISION_STATUS_LABEL[status]}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            <Link href={`/admin/clients?c=${revision.clientId}`} className="underline-offset-4 hover:text-foreground hover:underline">
              {revision.client}
            </Link>
            <span>·</span>
            <Link href={`/admin/projects/${revision.projectId}`} className="underline-offset-4 hover:text-foreground hover:underline">
              {revision.projectName}
            </Link>
            <span>·</span>
            <span>Requested {revision.requested}</span>
          </div>
        </div>

        {pending && (
          <div className="flex shrink-0 items-center gap-2">
            {status === "requested" && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatus("in-review")
                  toast.success("Moved to in review")
                }}
              >
                Mark in review
              </Button>
            )}
            <Button variant="outline" onClick={() => setDeclineOpen(true)}>
              Decline
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button className="gap-1.5">
                    Approve
                    <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={approveAsPhase}>
                  <HugeiconsIcon icon={GitMergeIcon} />
                  <div>
                    <div className="text-sm">As new phase</div>
                    <div className="text-xs text-muted-foreground">
                      Extends {revision.projectName}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={approveAsProject}>
                  <HugeiconsIcon icon={Folder01Icon} />
                  <div>
                    <div className="text-sm">As linked project</div>
                    <div className="text-xs text-muted-foreground">
                      Own brief, timeline & invoices
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Resolution banner (approved / declined) */}
      {status === "approved" && resolution && (
        <Link
          href={`/admin/projects/${resolution.ref}`}
          className="mt-6 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors hover:border-foreground/20"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">
              Approved · {resolution.type === "project" ? "linked project" : "new phase"}
            </div>
            <div className="truncate text-xs text-muted-foreground">{resolution.refName}</div>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
        </Link>
      )}
      {status === "declined" && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
          </span>
          <div className="text-sm text-muted-foreground">
            Declined on review — follow up outside the system.
          </div>
        </div>
      )}

      {/* Request details */}
      <div className="mt-6 flex flex-col gap-6">
        <section>
          <SectionLabel>Description</SectionLabel>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {revision.description}
          </p>
        </section>

        {revision.timeframe && (
          <section>
            <SectionLabel>Target timeframe</SectionLabel>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-muted-foreground" />
              {revision.timeframe}
            </div>
          </section>
        )}

        {revision.attachments.length > 0 && (
          <section>
            <SectionLabel>Attachments</SectionLabel>
            <div className="mt-2 flex flex-col divide-y divide-border rounded-xl border bg-card">
              {revision.attachments.map((a) => (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => toast.success(`Downloading ${a.name}`)}
                  className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{a.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.size}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <AlertDialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this request?</AlertDialogTitle>
            <AlertDialogDescription>
              The client will see it marked declined. You can follow up outside
              the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={decline}>
              Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

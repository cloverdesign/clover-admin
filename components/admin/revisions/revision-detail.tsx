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
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
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
import { REVISION_STATUS_LABEL, REVISION_STATUS_VARIANT } from "@/lib/mock/revisions"
import {
  useRevision,
  useUpdateRevisionStatus,
  useApproveRevision,
} from "@/lib/queries/revisions-queries"
import { useProject } from "@/lib/queries/projects-queries"
import { useClient } from "@/lib/queries/clients-queries"
import type { RevisionRequest } from "@/lib/api/models"
import { revisionTitle } from "@/components/admin/revisions/revisions-table"

/**
 * Revision request detail — review, then decide (§1.2.5): approve as a new phase
 * on the project, approve as a new linked project, or decline. Real mutations;
 * status reflects the refetched record.
 */
export function RevisionDetail({ id }: { id: string }) {
  const revisionQ = useRevision(id)

  if (revisionQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (revisionQ.isError || !revisionQ.data) {
    return <div className="p-6 text-sm text-muted-foreground">Request not found.</div>
  }
  return <RevisionDetailInner revision={revisionQ.data} />
}

function RevisionDetailInner({ revision }: { revision: RevisionRequest }) {
  const title = revisionTitle(revision.description)
  const [declineOpen, setDeclineOpen] = React.useState(false)

  const projectQ = useProject(revision.projectId)
  const clientQ = useClient(revision.clientId)
  const projectName = projectQ.data?.name ?? "the project"
  const clientName = clientQ.data?.company ?? "the client"

  const statusM = useUpdateRevisionStatus()
  const approveM = useApproveRevision()
  const busy = statusM.isPending || approveM.isPending

  const status = revision.status
  const pending = status === "REQUESTED" || status === "IN_REVIEW"

  const markInReview = () =>
    statusM.mutate({ id: revision.id, input: { status: "IN_REVIEW" } })
  const decline = () => {
    statusM.mutate(
      { id: revision.id, input: { status: "DECLINED" } },
      { onSuccess: () => setDeclineOpen(false) }
    )
  }
  const approveAsPhase = () =>
    approveM.mutate({
      id: revision.id,
      input: { type: "new_phase", phaseNote: `New phase from: ${title}` },
    })
  const approveAsProject = () =>
    approveM.mutate({
      id: revision.id,
      input: { type: "new_project", projectName: title, projectDescription: revision.description },
    })

  const attachments = revision.attachments as { name?: string; size?: string }[]

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header + decision actions */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <Badge variant={REVISION_STATUS_VARIANT[status]}>{REVISION_STATUS_LABEL[status]}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            <Link href={`/admin/clients?c=${revision.clientId}`} className="underline-offset-4 hover:text-foreground hover:underline">
              {clientName}
            </Link>
            <span>·</span>
            <Link href={`/admin/projects/${revision.projectId}`} className="underline-offset-4 hover:text-foreground hover:underline">
              {projectName}
            </Link>
            <span>·</span>
            <span>Requested {formatDate(revision.createdAt)}</span>
          </div>
        </div>

        {pending && (
          <div className="flex shrink-0 items-center gap-2">
            {status === "REQUESTED" && (
              <Button variant="ghost" disabled={busy} onClick={markInReview}>Mark in review</Button>
            )}
            <Button variant="outline" disabled={busy} onClick={() => setDeclineOpen(true)}>Decline</Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button className="gap-1.5" disabled={busy}>
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
                    <div className="text-xs text-muted-foreground">Extends {projectName}</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={approveAsProject}>
                  <HugeiconsIcon icon={Folder01Icon} />
                  <div>
                    <div className="text-sm">As linked project</div>
                    <div className="text-xs text-muted-foreground">Own brief, timeline & invoices</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Resolution banner */}
      {status === "APPROVED" && revision.resultingProjectId && (
        <Link
          href={`/admin/projects/${revision.resultingProjectId}`}
          className="mt-6 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors hover:border-foreground/20"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Approved · linked project</div>
            <div className="truncate text-xs text-muted-foreground">Opens the linked project</div>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
        </Link>
      )}
      {status === "APPROVED" && revision.resultingPhaseNote && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <HugeiconsIcon icon={GitMergeIcon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Approved · new phase</div>
            <div className="truncate text-xs text-muted-foreground">{revision.resultingPhaseNote}</div>
          </div>
        </div>
      )}
      {status === "DECLINED" && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
          </span>
          <div className="text-sm text-muted-foreground">Declined on review — follow up outside the system.</div>
        </div>
      )}

      {/* Request details */}
      <div className="mt-6 flex flex-col gap-6">
        <section>
          <SectionLabel>Description</SectionLabel>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{revision.description}</p>
        </section>

        {revision.targetTimeframe && (
          <section>
            <SectionLabel>Target timeframe</SectionLabel>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-muted-foreground" />
              {revision.targetTimeframe}
            </div>
          </section>
        )}

        {attachments.length > 0 && (
          <section>
            <SectionLabel>Attachments</SectionLabel>
            <div className="mt-2 flex flex-col divide-y divide-border rounded-xl border bg-card">
              {attachments.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toast.success(`Downloading ${a.name ?? "attachment"}`)}
                  className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{a.name ?? `Attachment ${i + 1}`}</span>
                  {a.size && <span className="shrink-0 text-xs text-muted-foreground">{a.size}</span>}
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
              The client will see it marked declined. You can follow up outside the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={decline}>Decline</AlertDialogAction>
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

"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Attachment01Icon,
  GitMergeIcon,
  Folder01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  Add01Icon,
  Delete02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { formatDate, toApiDateTime } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
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
 * (authored inline — phase name, milestones, optional new end date; backend-requests
 * §7a), approve as a new linked project, or decline with a reason surfaced to the
 * client (§7b). Real mutations; the resolved record drives the banner.
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
  const [declineReason, setDeclineReason] = React.useState("")
  const [phaseOpen, setPhaseOpen] = React.useState(false)
  const [projectOpen, setProjectOpen] = React.useState(false)

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

  const decline = () =>
    statusM.mutate(
      { id: revision.id, input: { status: "DECLINED", decisionNote: declineReason.trim() || undefined } },
      { onSuccess: () => setDeclineOpen(false) }
    )

  const attachments = revision.attachments ?? []
  // §7a: a phase approval links back to the same project; a project approval to a new one.
  const resultsInProject =
    Boolean(revision.resultingProjectId) &&
    revision.resultingProjectId !== revision.projectId
  const decisionNote = revision.decisionNote ?? revision.resultingPhaseNote

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
                <DropdownMenuItem onClick={() => setPhaseOpen(true)}>
                  <HugeiconsIcon icon={GitMergeIcon} />
                  <div>
                    <div className="text-sm">As new phase</div>
                    <div className="text-xs text-muted-foreground">Extends {projectName}</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProjectOpen(true)}>
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
      {status === "APPROVED" && resultsInProject && (
        <Link
          href={`/admin/projects/${revision.resultingProjectId}`}
          className="mt-6 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors hover:border-foreground/20"
        >
          <ResolutionIcon icon={Folder01Icon} tone="success" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Approved · linked project</div>
            <div className="truncate text-xs text-muted-foreground">
              {decisionNote ?? "Opens the linked project"}
            </div>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
        </Link>
      )}
      {status === "APPROVED" && !resultsInProject && (
        <Link
          href={`/admin/projects/${revision.projectId}`}
          className="mt-6 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors hover:border-foreground/20"
        >
          <ResolutionIcon icon={GitMergeIcon} tone="success" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Approved · new phase</div>
            <div className="truncate text-xs text-muted-foreground">
              {decisionNote ?? `Added to ${projectName}`}
            </div>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
        </Link>
      )}
      {status === "DECLINED" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border bg-card px-4 py-3">
          <ResolutionIcon icon={Cancel01Icon} tone="muted" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Declined</div>
            <div className="text-xs text-muted-foreground">
              {decisionNote ?? "No reason was recorded."}
            </div>
          </div>
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
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{a.name || a.url}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground/50" />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      <ApprovePhaseDialog
        open={phaseOpen}
        onOpenChange={setPhaseOpen}
        projectName={projectName}
        busy={busy}
        onApprove={(input) => approveM.mutate({ id: revision.id, input }, { onSuccess: () => setPhaseOpen(false) })}
      />
      <ApproveProjectDialog
        open={projectOpen}
        onOpenChange={setProjectOpen}
        defaultName={title}
        defaultDescription={revision.description}
        busy={busy}
        onApprove={(input) => approveM.mutate({ id: revision.id, input }, { onSuccess: () => setProjectOpen(false) })}
      />

      <AlertDialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this request?</AlertDialogTitle>
            <AlertDialogDescription>
              Let the client know why — they’ll see this reason on their request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            autoFocus
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Reason for declining (shown to the client)…"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy || declineReason.trim().length === 0}
              onClick={decline}
            >
              Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ------------------------------------------------------- approve: new phase */

type MilestoneRow = { title: string; due: string }

function ApprovePhaseDialog({
  open,
  onOpenChange,
  projectName,
  busy,
  onApprove,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  busy: boolean
  onApprove: (input: {
    type: "new_phase"
    phase: string
    milestones: { title: string; dueDate?: string }[]
    endDate?: string
    decisionNote?: string
  }) => void
}) {
  const [phase, setPhase] = React.useState("")
  const [rows, setRows] = React.useState<MilestoneRow[]>([{ title: "", due: "" }])
  const [endDate, setEndDate] = React.useState("")
  const [note, setNote] = React.useState("")

  const namedRows = rows.filter((r) => r.title.trim())
  const valid = phase.trim().length > 0 && namedRows.length > 0

  const submit = () =>
    onApprove({
      type: "new_phase",
      phase: phase.trim(),
      milestones: namedRows.map((r) => ({
        title: r.title.trim(),
        dueDate: toApiDateTime(r.due),
      })),
      endDate: toApiDateTime(endDate),
      decisionNote: note.trim() || undefined,
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve as a new phase</DialogTitle>
          <DialogDescription>
            Adds a phase and its milestones to {projectName}, and can extend the target
            finish. The client sees the new milestones on their timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phase-name">Phase name</Label>
            <Input
              id="phase-name"
              autoFocus
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              placeholder="e.g. Phase 2 — Rollout"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Milestones</Label>
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={row.title}
                  onChange={(e) =>
                    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))
                  }
                  placeholder="Milestone title"
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={row.due}
                  onChange={(e) =>
                    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, due: e.target.value } : r)))
                  }
                  className="w-40"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove milestone"
                  disabled={rows.length === 1}
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => setRows((prev) => [...prev, { title: "", due: "" }])}
            >
              <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
              Add milestone
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phase-end">
              New target finish <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="phase-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-48"
            />
          </div>

          <ClientNoteField id="phase-note" value={note} onChange={setNote} />
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button disabled={!valid || busy} onClick={submit}>
            Approve phase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ----------------------------------------------------- approve: new project */

function ApproveProjectDialog({
  open,
  onOpenChange,
  defaultName,
  defaultDescription,
  busy,
  onApprove,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultName: string
  defaultDescription: string
  busy: boolean
  onApprove: (input: {
    type: "new_project"
    projectName: string
    projectDescription: string
    decisionNote?: string
  }) => void
}) {
  // Seeded from the request; this dialog is scoped to one revision, so the
  // defaults are stable for its lifetime.
  const [name, setName] = React.useState(defaultName)
  const [description, setDescription] = React.useState(defaultDescription)
  const [note, setNote] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve as a linked project</DialogTitle>
          <DialogDescription>
            Scaffolds a new project with its own brief, timeline and invoices, linked to
            this client. It appears in their portal as a separate project.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-name">Project name</Label>
            <Input
              id="proj-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New project name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-desc">Brief</Label>
            <Textarea
              id="proj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <ClientNoteField id="proj-note" value={note} onChange={setNote} />
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button
            disabled={busy || name.trim().length === 0}
            onClick={() =>
              onApprove({
                type: "new_project",
                projectName: name.trim(),
                projectDescription: description.trim(),
                decisionNote: note.trim() || undefined,
              })
            }
          >
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResolutionIcon({
  icon,
  tone,
}: {
  icon: typeof GitMergeIcon
  tone: "success" | "muted"
}) {
  return (
    <span
      className={
        tone === "success"
          ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"
          : "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
      }
    >
      <HugeiconsIcon icon={icon} className="size-5" />
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
      {children}
    </div>
  )
}

/** Optional message to the client on an approval. The API includes it in the
 * approval email and the portal shows it on the request. */
function ClientNoteField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        Note to the client <span className="text-muted-foreground">(optional)</span>
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Anything they should know about how you're handling this."
        rows={2}
      />
    </div>
  )
}

"use client"

/**
 * Project detail — stacked, document-style view with collapsible sections. Wired
 * to the API: project + relations via useProject, phase via useUpdateProject,
 * milestones via the milestone mutations, invoices/deliverables via their
 * project-scoped queries, linked revisions composed from the projects list.
 *
 * Note: the API has no GET for milestones/updates, so they're read defensively
 * from the (optionally embedded) project detail — mutations still fire.
 */

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Money01Icon,
  UserGroupIcon,
  Add01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
  ArrowDown01Icon,
  Invoice01Icon,
  File01Icon,
  LinkSquare02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { PHASE_ORDER } from "@/lib/phase-colors"
import { formatMoney } from "@/lib/mock/clients"
import { PROJECT_STATUS_LABEL } from "@/lib/mock/projects"
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_VARIANT, formatFull } from "@/lib/mock/invoices"
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useProjects,
  useProjectInvoices,
} from "@/lib/queries/projects-queries"
import { useProjectDeliverables } from "@/lib/queries/deliverables-queries"
import { useClient } from "@/lib/queries/clients-queries"
import type { Project, Milestone, MilestoneStatus, Deliverable } from "@/lib/api/models"
import { Monogram } from "@/components/admin/clients/atoms"
import { ProgressBar } from "@/components/admin/dashboard/atoms"

/* ------------------------------------------------------------------- entry */

export function ProjectDetail({ id }: { id: string }) {
  const projectQ = useProject(id)

  if (projectQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (projectQ.isError || !projectQ.data) {
    return <div className="p-6 text-sm text-muted-foreground">Project not found.</div>
  }
  return <ProjectDetailInner project={projectQ.data} />
}

function ProjectDetailInner({ project }: { project: Project }) {
  const revisionsQ = useProjects()
  const revisions = (revisionsQ.data ?? []).filter((p) => p.parentProjectId === project.id)
  const milestones = project.milestones ?? []
  const completed = milestones.filter((m) => m.status === "COMPLETED").length

  return (
    <div className="mx-auto w-full max-w-3xl">
      <IdentityRow project={project} />
      <div className="flex flex-col">
        <Section label="Progress">
          <ProgressCard project={project} />
        </Section>
        {project.description && (
          <Section label="Brief">
            <p className="text-sm leading-relaxed text-foreground/90">
              {project.description}
            </p>
          </Section>
        )}
        <Section label="Details">
          <FactsGrid project={project} />
        </Section>
        <Section label="Milestones" count={`${completed}/${milestones.length}`}>
          <MilestonesEditor projectId={project.id} milestones={milestones} />
        </Section>
        <Section label="Invoices">
          <InvoicesTab project={project} />
        </Section>
        <Section label="Deliverables">
          <DeliverablesTab project={project} />
        </Section>
        {revisions.length > 0 && (
          <Section label="Linked revisions" count={String(revisions.length)}>
            <LinkedRevisionsList items={revisions} />
          </Section>
        )}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- collapsible section */

function Section({
  label,
  count,
  defaultOpen = true,
  children,
}: {
  label: string
  count?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <section className="border-b border-border py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full items-center gap-2 text-left"
      >
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-hover:text-foreground",
            !open && "-rotate-90"
          )}
        />
        <SectionLabel>{label}</SectionLabel>
        {count && (
          <Badge variant="secondary" className="ml-1">
            {count}
          </Badge>
        )}
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================ shared parts */

function IdentityRow({ project }: { project: Project }) {
  const clientQ = useClient(project.clientId)
  const clientName = clientQ.data?.company ?? "…"
  const update = useUpdateProject()

  const setPhase = (phase: string) => {
    update.mutate({ id: project.id, input: { ...toInput(project), phase } })
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Monogram company={clientName} className="size-12 rounded-xl text-sm" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">{project.name}</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            <Link
              href={`/admin/clients?c=${project.clientId}`}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {clientName}
            </Link>
            {project.type && (
              <>
                <span>·</span>
                <span>{project.type}</span>
              </>
            )}
            {project.parentProjectId && (
              <>
                <span>·</span>
                <Link
                  href={`/admin/projects/${project.parentProjectId}`}
                  className="text-info underline-offset-4 hover:underline"
                >
                  Revision of parent
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Select value={project.phase} onValueChange={(v) => v && setPhase(v)}>
          <SelectTrigger className="w-40" aria-label="Set phase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHASE_ORDER.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ProjectActions project={project} />
      </div>
    </div>
  )
}

/** Build the update body from a project (all editable fields). */
function toInput(p: Project) {
  return {
    name: p.name,
    type: p.type,
    description: p.description ?? undefined,
    phase: p.phase,
    status: p.status,
    progress: p.progress,
    currency: p.currency,
    totalValue: p.totalValue,
    budget: p.budget ?? undefined,
    startDate: p.startDate ?? undefined,
    endDate: p.endDate ?? undefined,
    archived: p.archived,
    notes: p.notes ?? undefined,
  }
}

function ProgressCard({ project }: { project: Project }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progress</span>
        <span className="font-mono text-muted-foreground">{project.progress}%</span>
      </div>
      <ProgressBar value={project.progress} className="mt-3" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Phase</span>
        <Badge variant="secondary">{project.phase}</Badge>
        <Badge variant="secondary" className="ml-auto">
          {PROJECT_STATUS_LABEL[project.status]}
        </Badge>
      </div>
    </div>
  )
}

function FactsGrid({ project }: { project: Project }) {
  const clientQ = useClient(project.clientId)
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Fact icon={UserGroupIcon} label="Client" value={clientQ.data?.company ?? "—"} />
      <Fact icon={Money01Icon} label="Value" value={formatMoney(project.totalValue, project.currency)} />
      <Fact
        icon={Calendar03Icon}
        label="Timeline"
        value={`${formatDate(project.startDate, "month")} — ${formatDate(project.endDate, "month")}`}
      />
    </div>
  )
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: typeof Money01Icon
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-3.5" />
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  )
}

function LinkedRevisionsList({ items }: { items: Project[] }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border bg-card">
      {items.map((c) => (
        <Link
          key={c.id}
          href={`/admin/projects/${c.id}`}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{c.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatMoney(c.totalValue, c.currency)}
            </div>
          </div>
          <Badge variant="secondary">{c.phase}</Badge>
        </Link>
      ))}
    </div>
  )
}

/* --------------------------------------------------------- milestones editor */

const MS_STATUS_META: Record<
  MilestoneStatus,
  { label: string; variant: "success" | "info" | "secondary" }
> = {
  COMPLETED: { label: "Completed", variant: "success" },
  IN_PROGRESS: { label: "In progress", variant: "info" },
  PENDING: { label: "Pending", variant: "secondary" },
}

function MilestonesEditor({
  projectId,
  milestones,
}: {
  projectId: string
  milestones: Milestone[]
}) {
  const create = useCreateMilestone()
  const update = useUpdateMilestone()
  const remove = useDeleteMilestone()
  const [title, setTitle] = React.useState("")
  const [due, setDue] = React.useState("")

  const completed = milestones.filter((m) => m.status === "COMPLETED").length
  const progress = milestones.length === 0 ? 0 : Math.round((completed / milestones.length) * 100)

  const toggle = (m: Milestone) => {
    const status: MilestoneStatus = m.status === "COMPLETED" ? "PENDING" : "COMPLETED"
    update.mutate({
      projectId,
      milestoneId: m.id,
      input: { title: m.title, description: m.description ?? undefined, status, dueDate: m.dueDate ?? undefined, order: m.order },
    })
  }

  const add = () => {
    const t = title.trim()
    if (!t) return
    create.mutate(
      { projectId, input: { title: t, dueDate: due.trim() || undefined, status: "PENDING", order: milestones.length } },
      { onSuccess: () => { setTitle(""); setDue("") } }
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={progress} />
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{progress}%</span>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-2xl border bg-card">
        {milestones.map((m) => {
          const meta = MS_STATUS_META[m.status]
          const done = m.status === "COMPLETED"
          return (
            <div key={m.id} className="group flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                aria-label={done ? "Mark incomplete" : "Mark complete"}
                onClick={() => toggle(m)}
                className={cn(
                  "shrink-0 transition-colors",
                  done ? "text-success" : "text-muted-foreground/50 hover:text-foreground"
                )}
              >
                <HugeiconsIcon icon={done ? CheckmarkCircle02Icon : CircleIcon} className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-sm font-medium", done && "text-muted-foreground line-through")}>
                  {m.title}
                </div>
                <div className="text-xs text-muted-foreground">Due {formatDate(m.dueDate, "compact")}</div>
              </div>
              <Badge variant={meta.variant} className="shrink-0">{meta.label}</Badge>
              <button
                type="button"
                aria-label="Remove"
                onClick={() => remove.mutate({ projectId, milestoneId: m.id })}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              </button>
            </div>
          )
        })}
        {milestones.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No milestones yet — add the first below.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-border p-3 sm:flex-row">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New milestone"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Input
          value={due}
          onChange={(e) => setDue(e.target.value)}
          type="date"
          className="sm:w-40"
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Button onClick={add} disabled={!title.trim() || create.isPending} className="gap-1.5">
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
          Add
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------ invoices / deliverables */

function InvoicesTab({ project }: { project: Project }) {
  const { data, isLoading, isError } = useProjectInvoices(project.id)
  const newHref = `/admin/invoices/new?project=${project.id}`

  if (isLoading) return <Loading />
  if (isError) return <ErrorLine label="invoices" />

  const invoices = data ?? []
  if (invoices.length === 0) {
    return (
      <EmptyTab
        icon={Invoice01Icon}
        title="No invoices yet"
        body="Generate an invoice for this project. It appears in the client's portal once sent."
        action={
          <Button className="gap-1.5" render={<Link href={newHref} />}>
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
            New invoice
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionLabel>{invoices.length} invoice{invoices.length > 1 ? "s" : ""}</SectionLabel>
        <Button variant="outline" size="sm" className="gap-1.5" render={<Link href={newHref} />}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
          New invoice
        </Button>
      </div>
      <div className="flex flex-col divide-y divide-border rounded-2xl border bg-card">
        {invoices.map((i) => (
          <Link
            key={i.id}
            href={`/admin/invoices/${i.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 flex-1">
              <div className="font-mono text-sm font-medium">{i.invoiceNumber}</div>
              <div className="text-xs text-muted-foreground">Due {formatDate(i.dueDate)}</div>
            </div>
            <Badge variant={INVOICE_STATUS_VARIANT[i.status]}>{INVOICE_STATUS_LABEL[i.status]}</Badge>
            <span className="w-20 text-right font-mono text-sm tabular-nums">
              {formatFull(i.amount, i.currency)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function versionBadgeFor(
  d: Deliverable,
  list: Deliverable[]
): { label: string; variant: "success" | "secondary" } | null {
  const siblings = list.filter((x) => x.title === d.title)
  if (siblings.length <= 1) return null
  return d.status === "READY"
    ? { label: "Current version", variant: "success" }
    : { label: "Older version", variant: "secondary" }
}

function DeliverablesTab({ project }: { project: Project }) {
  const { data, isLoading, isError } = useProjectDeliverables(project.id)
  const newHref = `/admin/deliverables/new?project=${project.id}`

  if (isLoading) return <Loading />
  if (isError) return <ErrorLine label="deliverables" />

  const items = data ?? []
  if (items.length === 0) {
    return (
      <EmptyTab
        icon={File01Icon}
        title="No deliverables yet"
        body="Upload finished work or link an external asset for the client to review."
        action={
          <Button className="gap-1.5" render={<Link href={newHref} />}>
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
            Add deliverable
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionLabel>{items.length} deliverable{items.length > 1 ? "s" : ""}</SectionLabel>
        <Button variant="outline" size="sm" className="gap-1.5" render={<Link href={newHref} />}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
          New deliverable
        </Button>
      </div>
      <div className="flex flex-col divide-y divide-border rounded-2xl border bg-card">
        {items.map((d) => {
          const vBadge = versionBadgeFor(d, items)
          return (
            <Link
              key={d.id}
              href={`/admin/deliverables/${d.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <HugeiconsIcon icon={d.externalLink ? LinkSquare02Icon : File01Icon} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{d.title}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">v{d.version}</span>
                </div>
                <div className="text-xs text-muted-foreground">Uploaded {formatDate(d.uploadedAt)}</div>
              </div>
              {vBadge && <Badge variant={vBadge.variant}>{vBadge.label}</Badge>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-dashed border-border py-10 text-muted-foreground">
      <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
    </div>
  )
}

function ErrorLine({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
      Couldn’t load {label}.
    </div>
  )
}

function EmptyTab({
  icon,
  title,
  body,
  action,
}: {
  icon: typeof Invoice01Icon
  title: string
  body: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-5" />
      </span>
      <div className="max-w-sm">
        <div className="text-sm font-medium">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      {action}
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

function ProjectActions({ project }: { project: Project }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const del = useDeleteProject()
  const update = useUpdateProject()
  const archived = project.archived

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Project actions"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project.id}/edit`)}>
            <HugeiconsIcon icon={PencilEdit02Icon} />
            Edit project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              update.mutate({ id: project.id, input: { ...toInput(project), archived: !archived } })
            }
          >
            <HugeiconsIcon icon={CircleIcon} />
            {archived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <HugeiconsIcon icon={Delete02Icon} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the project and its milestones, invoices and deliverables. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                del.mutate(project.id, {
                  onSuccess: () => {
                    setConfirmOpen(false)
                    router.push("/admin/projects")
                  },
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

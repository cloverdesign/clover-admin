"use client"

/**
 * PROTOTYPE — Project detail layout directions (throwaway).
 * Four ways to arrange the same detail content, switchable via `?layout=`:
 *   tabs    — centered column + horizontal tabs (the current build)
 *   split   — sticky context rail on the left, working area on the right
 *   stacked — one long scroll, every section in sequence (doc-style)
 *   focus   — milestone-forward: the editor is the hero, context in an aside
 * Pick one, then fold it into a clean project-detail and delete the rest.
 * No backend — phase setter + milestone editor mutate local state + toast.
 */

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Money01Icon,
  UserGroupIcon,
  Add01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Archive02Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Invoice01Icon,
  File01Icon,
  LinkSquare02Icon,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import type { Phase } from "@/lib/mock/dashboard"
import { formatMoney } from "@/lib/mock/clients"
import {
  childProjects,
  PROJECT_STATUS_LABEL,
  type Project,
  type Milestone,
  type MilestoneStatus,
} from "@/lib/mock/projects"
import {
  invoicesForProject,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  formatFull,
} from "@/lib/mock/invoices"
import { Monogram } from "@/components/admin/clients/atoms"
import { PhaseBadge, ProgressBar } from "@/components/admin/dashboard/atoms"
import { DETAIL_LAYOUTS, type DetailLayout } from "@/components/admin/projects/variant-types"

const LAYOUT_LABEL: Record<DetailLayout, string> = {
  tabs: "Tabs",
  split: "Split",
  stacked: "Stacked",
  focus: "Focus",
}

/* ------------------------------------------------------------ shared state */

function useProjectState(project: Project) {
  const [phase, setPhase] = React.useState<Phase>(project.phase)
  const [milestones, setMilestones] = React.useState<Milestone[]>(project.milestones)

  const completed = milestones.filter((m) => m.status === "COMPLETED").length
  const progress =
    milestones.length === 0 ? 0 : Math.round((completed / milestones.length) * 100)

  const setProjectPhase = (next: Phase) => {
    setPhase(next)
    toast.success(`Phase set to ${next}`)
  }

  return { phase, setProjectPhase, milestones, setMilestones, completed, progress }
}

type State = ReturnType<typeof useProjectState>

/* ------------------------------------------------------------------- entry */

export function ProjectDetailVariants({
  project,
  layout,
}: {
  project: Project
  layout: DetailLayout
}) {
  const state = useProjectState(project)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {layout === "tabs" && <TabsLayout project={project} state={state} />}
        {layout === "split" && <SplitLayout project={project} state={state} />}
        {layout === "stacked" && <StackedLayout project={project} state={state} />}
        {layout === "focus" && <FocusLayout project={project} state={state} />}
      </div>
      <Switcher active={layout} projectId={project.id} />
    </div>
  )
}

/* --------------------------------------------------------------- Layout A: tabs */

function TabsLayout({ project, state }: { project: Project; state: State }) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <IdentityRow project={project} state={state} />
      <ContentTabs project={project} state={state} className="mt-6" />
    </div>
  )
}

/* -------------------------------------------------------------- Layout B: split */

function SplitLayout({ project, state }: { project: Project; state: State }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
      {/* Context rail */}
      <aside className="flex flex-col gap-4 md:sticky md:top-0 md:self-start">
        <div className="flex items-center gap-3">
          <Monogram company={project.client} className="size-11 rounded-xl text-sm" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {project.name}
            </h1>
            <ClientLine project={project} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PhaseSetter phase={state.phase} onPhase={state.setProjectPhase} className="flex-1" />
          <ProjectActions project={project} />
        </div>
        <ProgressCard state={state} project={project} />
        <FactsList project={project} />
        <LinkedRevisions project={project} />
      </aside>

      {/* Working area */}
      <div className="min-w-0">
        <BriefSection project={project} />
        <ContentTabs project={project} state={state} className="mt-6" hideOverview />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ Layout C: stacked */

function StackedLayout({ project, state }: { project: Project; state: State }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <IdentityRow project={project} state={state} />
      <Block label="Progress">
        <ProgressCard state={state} project={project} />
      </Block>
      <Block label="Brief">
        <p className="text-sm leading-relaxed text-foreground/90">{project.brief}</p>
      </Block>
      <Block label="Details">
        <FactsGrid project={project} />
      </Block>
      <Block label={`Milestones · ${state.completed}/${state.milestones.length}`}>
        <MilestonesEditor state={state} />
      </Block>
      <Block label="Invoices">
        <InvoicesTab project={project} />
      </Block>
      <Block label="Deliverables">
        <DeliverablesTab project={project} />
      </Block>
      <LinkedRevisions project={project} />
    </div>
  )
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-3">{children}</div>
    </section>
  )
}

/* -------------------------------------------------------------- Layout D: focus */

function FocusLayout({ project, state }: { project: Project; state: State }) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <IdentityRow project={project} state={state} />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Milestones as the hero */}
        <div className="min-w-0">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold tracking-tight">Milestones</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {state.completed}/{state.milestones.length} done
            </span>
          </div>
          <MilestonesEditor state={state} />
        </div>

        {/* Context aside */}
        <aside className="flex flex-col gap-4">
          <ProgressCard state={state} project={project} />
          <div className="rounded-2xl border bg-card p-4">
            <SectionLabel>Brief</SectionLabel>
            <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
              {project.brief}
            </p>
          </div>
          <FactsList project={project} />
          <div className="grid grid-cols-2 gap-3">
            <MiniEntry
              icon={Invoice01Icon}
              label="Invoices"
              onClick={() => toast.success(`New invoice for ${project.name} (draft)`)}
            />
            <MiniEntry
              icon={File01Icon}
              label="Deliverables"
              onClick={() => toast.success(`Upload deliverable to ${project.name}`)}
            />
          </div>
          <LinkedRevisions project={project} />
        </aside>
      </div>
    </div>
  )
}

function MiniEntry({
  icon,
  label,
  onClick,
}: {
  icon: typeof Invoice01Icon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left transition-colors hover:border-foreground/20 hover:bg-muted/30"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-4" />
      </span>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[11px] text-muted-foreground">None yet · add</span>
    </button>
  )
}

/* ============================================================ shared parts */

/** Identity + phase setter + actions — the header shared by tabs/stacked/focus. */
function IdentityRow({ project, state }: { project: Project; state: State }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Monogram company={project.client} className="size-12 rounded-xl text-sm" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">{project.name}</h1>
          <ClientLine project={project} />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <PhaseSetter phase={state.phase} onPhase={state.setProjectPhase} />
        <ProjectActions project={project} />
      </div>
    </div>
  )
}

function ClientLine({ project }: { project: Project }) {
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
      <Link
        href={`/admin/clients?c=${project.clientId}`}
        className="underline-offset-4 hover:text-foreground hover:underline"
      >
        {project.client}
      </Link>
      <span>·</span>
      <span>{project.type}</span>
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
  )
}

function PhaseSetter({
  phase,
  onPhase,
  className,
}: {
  phase: Phase
  onPhase: (p: Phase) => void
  className?: string
}) {
  return (
    <Select value={phase} onValueChange={(v) => v && onPhase(v as Phase)}>
      <SelectTrigger className={cn("w-40", className)} aria-label="Set phase">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PHASE_ORDER.map((p) => (
          <SelectItem key={p} value={p}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ProgressCard({ state, project }: { state: State; project: Project }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progress</span>
        <span className="font-mono text-muted-foreground">{state.progress}%</span>
      </div>
      <ProgressBar value={state.progress} className="mt-3" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Phase</span>
        <PhaseBadge phase={state.phase} />
        <Badge variant="secondary" className="ml-auto">
          {PROJECT_STATUS_LABEL[project.status]}
        </Badge>
      </div>
    </div>
  )
}

function BriefSection({ project }: { project: Project }) {
  return (
    <section>
      <SectionLabel>Brief</SectionLabel>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{project.brief}</p>
    </section>
  )
}

/** Three facts as a horizontal grid (tabs/stacked overview). */
function FactsGrid({ project }: { project: Project }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Fact icon={UserGroupIcon} label="Client" value={project.client} />
      <Fact icon={Money01Icon} label="Value" value={formatMoney(project.value, project.currency)} />
      <Fact icon={Calendar03Icon} label="Timeline" value={`${formatDate(project.startDate, "month")} — ${formatDate(project.endDate, "month")}`} />
    </div>
  )
}

/** Same facts stacked for a narrow rail (split/focus). */
function FactsList({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-2">
      <Fact icon={UserGroupIcon} label="Client" value={project.client} />
      <Fact icon={Money01Icon} label="Value" value={formatMoney(project.value, project.currency)} />
      <Fact icon={Calendar03Icon} label="Timeline" value={`${formatDate(project.startDate, "month")} — ${formatDate(project.endDate, "month")}`} />
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

function LinkedRevisions({ project }: { project: Project }) {
  const children = childProjects(project.id)
  if (children.length === 0) return null
  return (
    <section>
      <SectionLabel>Linked revisions</SectionLabel>
      <div className="mt-2 flex flex-col divide-y divide-border rounded-xl border bg-card">
        {children.map((c) => (
          <Link
            key={c.id}
            href={`/admin/projects/${c.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatMoney(c.value, c.currency)}
              </div>
            </div>
            <PhaseBadge phase={c.phase} />
          </Link>
        ))}
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- content tabs */

function ContentTabs({
  project,
  state,
  className,
  hideOverview,
}: {
  project: Project
  state: State
  className?: string
  hideOverview?: boolean
}) {
  return (
    <Tabs defaultValue={hideOverview ? "milestones" : "overview"} className={className}>
      <TabsList variant="line" className="shrink-0">
        {!hideOverview && <TabsTrigger value="overview">Overview</TabsTrigger>}
        <TabsTrigger value="milestones">
          Milestones
          <Badge variant="secondary" className="ml-1.5">
            {state.completed}/{state.milestones.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
      </TabsList>

      <div className="mt-4">
        {!hideOverview && (
          <TabsContent value="overview">
            <div className="flex flex-col gap-6">
              <ProgressCard state={state} project={project} />
              <BriefSection project={project} />
              <FactsGrid project={project} />
              <LinkedRevisions project={project} />
            </div>
          </TabsContent>
        )}
        <TabsContent value="milestones">
          <MilestonesEditor state={state} />
        </TabsContent>
        <TabsContent value="invoices">
          <InvoicesTab project={project} />
        </TabsContent>
        <TabsContent value="deliverables">
          <DeliverablesTab project={project} />
        </TabsContent>
      </div>
    </Tabs>
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

function MilestonesEditor({ state }: { state: State }) {
  const { milestones, setMilestones, progress } = state
  const [title, setTitle] = React.useState("")
  const [due, setDue] = React.useState("")

  const toggle = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const next: MilestoneStatus = m.status === "COMPLETED" ? "PENDING" : "COMPLETED"
        toast.success(
          next === "COMPLETED" ? `Marked “${m.title}” complete` : `Reopened “${m.title}”`
        )
        return { ...m, status: next }
      })
    )
  }

  const move = (index: number, dir: -1 | 1) => {
    setMilestones((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((m, i) => ({ ...m, order: i }))
    })
  }

  const remove = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id))
    toast.success("Milestone removed")
  }

  const add = () => {
    const t = title.trim()
    if (!t) return
    setMilestones((prev) => [
      ...prev,
      { id: `m-${prev.length}-${t.length}`, title: t, dueDate: due.trim(), status: "PENDING", order: prev.length },
    ])
    setTitle("")
    setDue("")
    toast.success(`Added “${t}”`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={progress} />
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{progress}%</span>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-2xl border bg-card">
        {milestones.map((m, i) => {
          const meta = MS_STATUS_META[m.status]
          const done = m.status === "COMPLETED"
          return (
            <div key={m.id} className="group flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                aria-label={done ? "Mark incomplete" : "Mark complete"}
                onClick={() => toggle(m.id)}
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
              <Badge variant={meta.variant} className="shrink-0">
                {meta.label}
              </Badge>
              <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
                </IconBtn>
                <IconBtn label="Move down" disabled={i === milestones.length - 1} onClick={() => move(i, 1)}>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
                </IconBtn>
                <IconBtn label="Remove" onClick={() => remove(m.id)}>
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                </IconBtn>
              </div>
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
        <Button onClick={add} disabled={!title.trim()} className="gap-1.5">
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
          Add
        </Button>
      </div>
    </div>
  )
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------ invoices / deliverables */

function InvoicesTab({ project }: { project: Project }) {
  const invoices = invoicesForProject(project.id)
  const newHref = `/admin/invoices/new?project=${project.id}`

  if (invoices.length === 0) {
    return (
      <EmptyTab
        icon={Invoice01Icon}
        title="No invoices yet"
        body="Generate an invoice for this project — amount, currency and due date. It appears in the client's portal once sent."
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
              <div className="font-mono text-sm font-medium">{i.number}</div>
              <div className="text-xs text-muted-foreground">Due {formatDate(i.dueDate)}</div>
            </div>
            <Badge variant={INVOICE_STATUS_VARIANT[i.status]}>
              {INVOICE_STATUS_LABEL[i.status]}
            </Badge>
            <span className="w-20 text-right font-mono text-sm tabular-nums">
              {formatFull(i.amount, i.currency)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function DeliverablesTab({ project }: { project: Project }) {
  return (
    <EmptyTab
      icon={File01Icon}
      title="No deliverables yet"
      body="Upload finished work or link an external asset (Figma, a hosted build) for the client to review and download."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button className="gap-1.5" onClick={() => toast.success(`Upload deliverable to ${project.name}`)}>
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
            Add deliverable
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => toast.success("Link external asset")}>
            <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-start" className="size-4" />
            Link asset
          </Button>
        </div>
      }
    />
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

/* --------------------------------------------------------------------- bits */

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
          <DropdownMenuItem
            onClick={() => router.push(`/admin/projects/${project.id}/edit`)}
          >
            <HugeiconsIcon icon={PencilEdit02Icon} />
            Edit project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toast.success(`${archived ? "Unarchived" : "Archived"} ${project.name}`)}
          >
            <HugeiconsIcon icon={Archive02Icon} />
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
              onClick={() => {
                setConfirmOpen(false)
                toast.success(`Deleted ${project.name}`)
                router.push("/admin/projects")
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* ----------------------------------------------------------------- switcher */

function Switcher({ active, projectId }: { active: DetailLayout; projectId: string }) {
  return (
    <div className="pointer-events-none sticky bottom-4 z-20 mt-4 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-popover/90 p-1 shadow-lg backdrop-blur">
        {DETAIL_LAYOUTS.map((l) => (
          <Link
            key={l}
            href={`/admin/projects/${projectId}?layout=${l}`}
            scroll={false}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              l === active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {LAYOUT_LABEL[l]}
          </Link>
        ))}
      </div>
    </div>
  )
}

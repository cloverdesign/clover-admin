"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DollarCircleIcon,
  Calendar03Icon,
  DeliveryBox01Icon,
  File01Icon,
  LinkSquare02Icon,
  ArrowRight01Icon,
  GitBranchIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { formatFull } from "@/lib/mock/invoices"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useSubmitRevision } from "@/lib/queries/portal-queries"
import type {
  BillingSummary,
  UpcomingMilestone,
  RecentDeliverable,
} from "@/components/portal/home/use-portal-overview"
import type { Project } from "@/lib/api/models"

/* ---------------------------------------------------------------- billing */

/** Paid vs outstanding at a glance, plus the next invoice the client owes. */
export function BillingSnapshot({ billing }: { billing: NonNullable<BillingSummary> }) {
  const total = billing.paid + billing.outstanding
  const paidPct = total > 0 ? Math.round((billing.paid / total) * 100) : 0

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={DollarCircleIcon} className="size-4 text-muted-foreground" />
        <h2 className="font-heading text-sm font-medium">Billing</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-muted-foreground">Paid</dt>
          <dd className="mt-0.5 font-mono text-xl font-semibold tabular-nums">
            {formatFull(billing.paid, billing.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Outstanding</dt>
          <dd
            className={cn(
              "mt-0.5 font-mono text-xl font-semibold tabular-nums",
              billing.outstanding > 0 && "text-foreground"
            )}
          >
            {formatFull(billing.outstanding, billing.currency)}
          </dd>
        </div>
      </div>

      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${paidPct}% of billed work paid`}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${paidPct}%` }} />
      </div>

      {billing.nextDue && (
        <Link
          href={`/portal/projects/${billing.nextDue.projectId}`}
          className="group -mx-2 mt-auto flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium">
              Next due · {billing.nextDue.invoiceNumber}
            </span>
            <span
              className={cn(
                "block text-xs",
                billing.nextDue.overdue
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {billing.nextDue.overdue
                ? "Overdue"
                : billing.nextDue.dueDate
                  ? `Due ${formatDate(billing.nextDue.dueDate)}`
                  : "Due soon"}
            </span>
          </span>
          <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">
            {formatFull(billing.nextDue.amount, billing.nextDue.currency)}
          </span>
        </Link>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- milestones */

export function UpcomingMilestones({
  milestones,
}: {
  milestones: UpcomingMilestone[]
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-muted-foreground" />
        <h2 className="font-heading text-sm font-medium">Upcoming milestones</h2>
      </div>

      <ul className="flex flex-col gap-1">
        {milestones.map((milestone) => (
          <li key={milestone.id}>
            <Link
              href={`/portal/projects/${milestone.projectId}`}
              className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
            >
              <DateChip iso={milestone.dueDate} overdue={milestone.overdue} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {milestone.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {milestone.projectName}
                </span>
              </span>
              {milestone.overdue && <Badge variant="destructive">Overdue</Badge>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DateChip({ iso, overdue }: { iso: string; overdue: boolean }) {
  const d = new Date(iso)
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(d)
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
  return (
    <span
      className={cn(
        "flex size-11 shrink-0 flex-col items-center justify-center rounded-lg",
        overdue ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"
      )}
    >
      <span className="text-[10px] font-medium uppercase opacity-70">{month}</span>
      <span className="font-mono text-sm font-semibold tabular-nums leading-none">
        {day}
      </span>
    </span>
  )
}

/* ------------------------------------------------------------ latest work */

export function LatestWork({ items }: { items: RecentDeliverable[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={DeliveryBox01Icon} className="size-4 text-muted-foreground" />
        <h2 className="font-heading text-sm font-medium">Latest work</h2>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/portal/projects/${item.projectId}`}
            className="group w-40 shrink-0"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
              {looksLikeImage(item.fileUrl) ? (
                <Image
                  src={item.fileUrl as string}
                  alt={item.title}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <HugeiconsIcon
                    icon={item.externalLink ? LinkSquare02Icon : File01Icon}
                    className="size-7"
                  />
                </span>
              )}
              <span className="absolute right-2 bottom-2 flex size-6 items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 truncate text-sm font-medium">{item.title}</p>
            <p className="truncate text-xs text-muted-foreground">{item.projectName}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function looksLikeImage(url: string | null): boolean {
  if (!url) return false
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(url)
}

/* --------------------------------------------------------- quick actions */

/** Dashboard-level "Request a revision" — the project-page dialog needs a project
 * in context, so this one adds a picker up front. Attachments stay on the richer
 * project-page flow; this is the fast path. */
export function RequestRevisionButton({ projects }: { projects: Project[] }) {
  const submit = useSubmitRevision()
  const [open, setOpen] = React.useState(false)
  const [projectId, setProjectId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [timeframe, setTimeframe] = React.useState("")

  const selectable = projects.filter(
    (p) => !p.archived && p.status !== "CANCELLED"
  )
  if (selectable.length === 0) return null

  const activeId =
    projectId ||
    selectable.find((p) => p.status === "IN_PROGRESS" || p.status === "REVIEW")?.id ||
    selectable[0].id

  const onSubmit = () =>
    submit.mutate(
      {
        projectId: activeId,
        input: {
          description: description.trim(),
          targetTimeframe: timeframe.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
          setDescription("")
          setTimeframe("")
          setProjectId("")
        },
      }
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={GitBranchIcon} data-icon="inline-start" className="size-4" />
            Request a revision
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a revision</DialogTitle>
          <DialogDescription>
            Pick the project and describe the change. Your studio reviews it and either
            folds it in or spins up a new project.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="revision-project">Project</Label>
            <Select value={activeId} onValueChange={(v) => v && setProjectId(v)}>
              <SelectTrigger id="revision-project" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {selectable.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="revision-desc">What needs to change?</Label>
            <Textarea
              id="revision-desc"
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the revision you’re after…"
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="revision-when">
              Target timeframe <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="revision-when"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g. Before the end of the month"
            />
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

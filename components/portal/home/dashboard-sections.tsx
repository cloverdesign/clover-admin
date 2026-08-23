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
import type { Invoice, InvoiceStatus, Project } from "@/lib/api/models"

/* ---------------------------------------------------------------- billing */

/** Status wording the client sees. Drafts never reach the portal, so there's no
 * label for one. */
const INVOICE_TONE: Record<
  Exclude<InvoiceStatus, "DRAFT">,
  { label: string; dot: string; text?: string }
> = {
  PAID: { label: "Paid", dot: "bg-primary" },
  SENT: { label: "Due", dot: "bg-amber-500" },
  OVERDUE: { label: "Overdue", dot: "bg-destructive", text: "text-destructive" },
}

/**
 * Paid vs outstanding at a glance, then every invoice the studio has issued —
 * newest first. The list is the card's body rather than a "next due" teaser: a
 * client checking billing wants the whole ledger, and it keeps the card sized to
 * real content instead of stretching to its neighbour with a void in the middle.
 */
export function BillingSnapshot({
  billing,
  invoices,
}: {
  billing: NonNullable<BillingSummary>
  invoices: Invoice[]
}) {
  const total = billing.paid + billing.outstanding
  const paidPct = total > 0 ? Math.round((billing.paid / total) * 100) : 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
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

      {invoices.length > 0 && (
        <ul className="flex flex-col gap-0.5 border-t border-border pt-2">
          {invoices.map((invoice) => {
            const tone = INVOICE_TONE[invoice.status as Exclude<InvoiceStatus, "DRAFT">]
            if (!tone) return null
            const when =
              invoice.status === "PAID"
                ? invoice.paidDate
                  ? `Paid ${formatDate(invoice.paidDate)}`
                  : "Paid"
                : invoice.dueDate
                  ? `${tone.label} ${formatDate(invoice.dueDate)}`
                  : tone.label
            return (
              <li key={invoice.id}>
                <Link
                  href={`/projects/${invoice.projectId}`}
                  className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                >
                  <span
                    aria-hidden
                    className={cn("size-1.5 shrink-0 rounded-full", tone.dot)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-sm">
                      {invoice.invoiceNumber}
                    </span>
                    <span className={cn("block truncate text-xs text-muted-foreground", tone.text)}>
                      {when}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-sm tabular-nums">
                    {formatFull(invoice.amount, invoice.currency)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
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
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-muted-foreground" />
        <h2 className="font-heading text-sm font-medium">Upcoming milestones</h2>
      </div>

      <ul className="flex flex-col gap-1">
        {milestones.map((milestone) => (
          <li key={milestone.id}>
            <Link
              href={`/projects/${milestone.projectId}`}
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
            href={`/projects/${item.projectId}`}
            className="group flex w-60 shrink-0 flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/30"
          >
            <div className="flex items-start gap-3">
              {looksLikeImage(item.fileUrl) ? (
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={item.fileUrl as string}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                </span>
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <HugeiconsIcon
                    icon={item.externalLink ? LinkSquare02Icon : File01Icon}
                    className="size-4.5"
                  />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium">{item.title}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {item.projectName}
                </span>
              </span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                Shared {formatDate(item.uploadedAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                {item.externalLink ? "Open" : "View"}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
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
  // base-ui reads the trigger label from `items` (id → name); without it the
  // Select shows the raw project id.
  const projectItems = Object.fromEntries(selectable.map((p) => [p.id, p.name]))

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
            <Select
              items={projectItems}
              value={activeId}
              onValueChange={(v) => v && setProjectId(v)}
            >
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

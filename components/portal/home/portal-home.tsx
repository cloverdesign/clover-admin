"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  ArrowRight01Icon,
  Folder01Icon,
  GitBranchIcon,
  DeliveryBox01Icon,
  Invoice01Icon,
  AlertCircleIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CheckmarkBadge02Icon,
  SparklesIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate, formatRelative } from "@/lib/format"
import { formatMoney } from "@/lib/mock/clients"
import { Button } from "@/components/ui/button"
import { usePortalMe } from "@/lib/queries/portal-queries"
import {
  ProjectStatusBadge,
  ProgressRing,
  ProjectCard,
} from "@/components/portal/parts"
import {
  usePortalOverview,
  type AttentionItem,
  type ActivityEvent,
  type ActivityKind,
  type OverviewStats,
} from "@/components/portal/home/use-portal-overview"
import {
  BillingSnapshot,
  UpcomingMilestones,
  LatestWork,
  RequestRevisionButton,
} from "@/components/portal/home/dashboard-sections"
import type { Project } from "@/lib/api/models"

/**
 * Client dashboard — the first screen after sign-in. Answers three questions in
 * order: what needs me, where do my projects stand, and what just happened. A
 * project spotlight and an action queue lead; the full project list and an
 * activity stream follow. Everything derives from `usePortalOverview`, which
 * fans the per-project reads out across the client's whole engagement.
 */
export function PortalHome() {
  const { data: client } = usePortalMe()
  const overview = usePortalOverview()
  const {
    isLoading,
    isError,
    detailsLoading,
    projects,
    attention,
    activity,
    stats,
    billing,
    milestones,
    recentDeliverables,
  } = overview

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your dashboard.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const roots = projects.filter((p) => !p.parentProjectId)
  const orphans = projects.filter(
    (p) => p.parentProjectId && !projects.some((x) => x.id === p.parentProjectId)
  )
  const topLevel = [...roots, ...orphans]
  const childrenOf = (id: string) =>
    projects.filter((p) => p.parentProjectId === id)

  const isActive = (p: Project) =>
    !p.archived && p.status !== "COMPLETED" && p.status !== "CANCELLED"
  // Spotlight the active project closest to shipping; fall back to the newest.
  const spotlight =
    [...topLevel]
      .filter(isActive)
      .sort((a, b) => b.progress - a.progress || (a.updatedAt < b.updatedAt ? 1 : -1))[0] ??
    topLevel[0]
  const rest = topLevel.filter((p) => p.id !== spotlight?.id)

  const firstName = client?.name?.split(" ")[0]

  return (
    <div className="flex flex-col gap-8">
      <Greeting
        name={firstName}
        stats={stats}
        attentionCount={attention.length}
        action={<RequestRevisionButton projects={projects} />}
      />

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="anim-rise grid gap-4 lg:grid-cols-12" style={rise(1)}>
            {spotlight && (
              <div className="lg:col-span-7">
                <Spotlight project={spotlight} />
              </div>
            )}
            <div className={spotlight ? "lg:col-span-5" : "lg:col-span-12"}>
              <AttentionPanel
                items={attention}
                loading={detailsLoading && attention.length === 0}
              />
            </div>
          </div>

          <div className="anim-rise" style={rise(2)}>
            <StatsBand stats={stats} />
          </div>

          {(billing || milestones.length > 0) && (
            <div
              className={cn(
                "anim-rise grid gap-4",
                billing && milestones.length > 0 && "lg:grid-cols-2"
              )}
              style={rise(3)}
            >
              {billing && <BillingSnapshot billing={billing} />}
              {milestones.length > 0 && <UpcomingMilestones milestones={milestones} />}
            </div>
          )}

          {recentDeliverables.length > 0 && (
            <div className="anim-rise" style={rise(4)}>
              <LatestWork items={recentDeliverables} />
            </div>
          )}

          {rest.length > 0 && (
            <section className="anim-rise flex flex-col gap-4" style={rise(5)}>
              <SectionHeader
                icon={Folder01Icon}
                title="Your projects"
                action={<AllProjectsLink />}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {rest.map((p) => (
                  <div key={p.id} className="flex flex-col gap-2">
                    <ProjectCard project={p} />
                    {childrenOf(p.id).map((child) => (
                      <div key={child.id} className="ml-4 border-l border-border pl-4">
                        <ProjectCard project={child} isRevision />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {spotlight && childrenOf(spotlight.id).length > 0 && rest.length === 0 && (
            <section className="anim-rise flex flex-col gap-4" style={rise(5)}>
              <SectionHeader icon={GitBranchIcon} title="Revisions" />
              <div className="grid gap-4 sm:grid-cols-2">
                {childrenOf(spotlight.id).map((child) => (
                  <ProjectCard key={child.id} project={child} isRevision />
                ))}
              </div>
            </section>
          )}

          <section className="anim-rise flex flex-col gap-4" style={rise(6)}>
            <SectionHeader icon={SparklesIcon} title="Recent activity" />
            <ActivityFeed
              events={activity}
              loading={detailsLoading && activity.length === 0}
            />
          </section>
        </>
      )}
    </div>
  )
}

/** Staggered entrance delay for the one coherent load-in moment. */
function rise(step: number): React.CSSProperties {
  return { animationDelay: `${step * 70}ms` }
}

function greetingWord(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

function Greeting({
  name,
  stats,
  attentionCount,
  action,
}: {
  name?: string
  stats: OverviewStats
  attentionCount: number
  action?: React.ReactNode
}) {
  const bits: string[] = []
  if (stats.activeCount > 0) {
    bits.push(
      `${stats.activeCount} project${stats.activeCount === 1 ? "" : "s"} in motion`
    )
    bits.push(`${stats.overallProgress}% overall`)
  }
  bits.push(
    attentionCount > 0
      ? `${attentionCount} thing${attentionCount === 1 ? "" : "s"} need${attentionCount === 1 ? "s" : ""} you`
      : "nothing needs you"
  )

  return (
    <div
      className="anim-rise flex flex-wrap items-end justify-between gap-3"
      style={rise(0)}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {greetingWord()}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{bits.join(" · ")}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:block">
          {new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          }).format(new Date())}
        </span>
        {action}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- spotlight */

function Spotlight({ project }: { project: Project }) {
  return (
    <Link
      href={`/portal/projects/${project.id}`}
      className="group flex h-full flex-col justify-between gap-6 rounded-2xl border bg-card p-6 transition-colors hover:border-foreground/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon icon={Target01Icon} className="size-3.5" />
            In focus
          </p>
          <h2 className="mt-1 truncate text-xl font-semibold tracking-tight">
            {project.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            {project.phase && (
              <span className="text-sm text-muted-foreground">{project.phase}</span>
            )}
          </div>
        </div>
        <ProgressRing value={project.progress} size={76}>
          <span className="font-mono text-lg font-semibold tabular-nums">
            {Math.round(project.progress)}
            <span className="text-xs text-muted-foreground">%</span>
          </span>
        </ProgressRing>
      </div>

      <div className="flex items-end justify-between gap-4">
        <dl className="flex gap-6">
          <div>
            <dt className="text-xs text-muted-foreground">Started</dt>
            <dd className="mt-0.5 text-sm">{formatDate(project.startDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Target</dt>
            <dd className="mt-0.5 text-sm">{formatDate(project.endDate)}</dd>
          </div>
        </dl>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Open project
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  )
}

/* -------------------------------------------------------------- attention */

const ATTENTION_STYLE: Record<
  AttentionItem["tone"],
  { chip: string; icon: typeof AlertCircleIcon }
> = {
  danger: { chip: "bg-destructive/10 text-destructive", icon: AlertCircleIcon },
  warning: {
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: Clock01Icon,
  },
  brand: {
    chip: "bg-lime-500/10 text-lime-700 dark:text-lime-400",
    icon: DeliveryBox01Icon,
  },
}

function AttentionPanel({
  items,
  loading,
}: {
  items: AttentionItem[]
  loading: boolean
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-sm font-medium">Needs your attention</h2>
        {items.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-medium text-background tabular-nums">
            {items.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-8 text-muted-foreground">
          <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-lime-500/10 text-lime-700 dark:text-lime-400">
            <HugeiconsIcon icon={CheckmarkBadge02Icon} className="size-5" />
          </span>
          <p className="text-sm font-medium">You’re all caught up</p>
          <p className="text-xs text-muted-foreground">
            Nothing needs your review or payment right now.
          </p>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-1">
          {items.map((item) => {
            const style = ATTENTION_STYLE[item.tone]
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      style.chip
                    )}
                  >
                    <HugeiconsIcon icon={style.icon} className="size-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ stats */

function StatsBand({ stats }: { stats: OverviewStats }) {
  const cells: { label: string; value: string; accent?: boolean }[] = [
    { label: "In progress", value: String(stats.activeCount) },
    { label: "Overall progress", value: `${stats.overallProgress}%`, accent: true },
    {
      label: "Outstanding",
      value: stats.outstanding
        ? formatMoney(stats.outstanding.amount, stats.outstanding.currency)
        : "—",
    },
    { label: "Open requests", value: String(stats.openRequests) },
  ]
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card sm:grid-cols-4">
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className={cn(
            "flex flex-col gap-1 p-5 border-border",
            i % 2 === 1 && "border-l",
            i >= 2 && "border-t sm:border-t-0",
            i >= 1 && "sm:border-l"
          )}
        >
          <span className="text-xs text-muted-foreground">{cell.label}</span>
          <span
            className={cn(
              "font-mono text-2xl font-semibold tracking-tight tabular-nums",
              cell.accent && stats.overallProgress > 0 && "text-primary"
            )}
          >
            {cell.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- activity */

const ACTIVITY_ICON: Record<ActivityKind, typeof DeliveryBox01Icon> = {
  deliverable: DeliveryBox01Icon,
  "invoice-issued": Invoice01Icon,
  "invoice-paid": CheckmarkCircle02Icon,
  "revision-sent": GitBranchIcon,
  "revision-decided": CheckmarkBadge02Icon,
}

function ActivityFeed({
  events,
  loading,
}: {
  events: ActivityEvent[]
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border bg-card py-10 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
      </div>
    )
  }
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        Nothing’s happened yet — updates from your studio will show up here.
      </div>
    )
  }
  return (
    <ul className="overflow-hidden rounded-2xl border bg-card">
      {events.map((event, i) => (
        <li key={event.id}>
          <Link
            href={event.href}
            className={cn(
              "group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50",
              i > 0 && "border-t border-border"
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HugeiconsIcon icon={ACTIVITY_ICON[event.kind]} className="size-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">{event.title}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatRelative(event.at)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/* ----------------------------------------------------------------- shared */

function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: typeof Folder01Icon
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={icon} className="size-4 text-muted-foreground" />
        <h2 className="font-heading text-sm font-medium">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function AllProjectsLink() {
  return (
    <Link
      href="/portal/projects"
      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      All projects
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="size-4 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}

function EmptyState() {
  return (
    <div
      className="anim-rise flex flex-col items-center gap-2 rounded-2xl border border-dashed py-20 text-center"
      style={rise(0)}
    >
      <HugeiconsIcon icon={Folder01Icon} className="size-6 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground">
        Your studio will add your project here soon.
      </p>
    </div>
  )
}

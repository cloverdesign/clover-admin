"use client"

/**
 * Cross-project aggregation for the client dashboard. Reads the client-wide
 * invoice, deliverable and revision lists and folds them into three derived
 * views: what needs the client's action, a headline of where the engagement
 * stands, and a recent-activity stream.
 *
 * This was three `useQueries` fan-outs — invoices, deliverables and detail, one
 * request per project each, so 2+3N to paint. The backend added client-wide
 * invoice and deliverable reads, and the projects LIST turns out to embed
 * milestones (verified against a live session on 2026-08-28; the old comment
 * here claiming otherwise was stale). So it is now four requests flat, however
 * many projects the client has.
 *
 * Trade-off: the detail fan-out also warmed the per-project cache, so opening a
 * project now costs its own fetch. Cheap dashboard beats a pre-warmed click.
 */

import {
  usePortalProjects,
  usePortalRevisions,
  usePortalAllInvoices,
  usePortalAllDeliverables,
} from "@/lib/queries/portal-queries"
import type { Project, Invoice } from "@/lib/api/models"

export type AttentionTone = "danger" | "warning" | "brand"

export type AttentionItem = {
  id: string
  tone: AttentionTone
  title: string
  detail: string
  href: string
  /** ISO — used only to break ties within a priority band. */
  at: string
}

export type ActivityKind =
  | "deliverable"
  | "invoice-issued"
  | "invoice-paid"
  | "revision-sent"
  | "revision-decided"

export type ActivityEvent = {
  id: string
  kind: ActivityKind
  title: string
  href: string
  at: string
}

export type OverviewStats = {
  activeCount: number
  overallProgress: number
  outstanding: { currency: string; amount: number } | null
  openRequests: number
}

export type BillingSummary = {
  /** The currency the client transacts most in — the snapshot's frame. */
  currency: string
  paid: number
  outstanding: number
  nextDue: {
    invoiceNumber: string
    amount: number
    currency: string
    dueDate: string | null
    projectId: string
    overdue: boolean
  } | null
} | null

export type UpcomingMilestone = {
  id: string
  title: string
  dueDate: string
  projectId: string
  projectName: string
  overdue: boolean
}

export type RecentDeliverable = {
  id: string
  title: string
  fileUrl: string | null
  externalLink: string | null
  projectId: string
  projectName: string
  uploadedAt: string
}

export type PortalOverview = {
  isLoading: boolean
  isError: boolean
  /** Projects load first; the per-project fan-out streams in after. */
  detailsLoading: boolean
  projects: Project[]
  attention: AttentionItem[]
  activity: ActivityEvent[]
  stats: OverviewStats
  billing: BillingSummary
  milestones: UpcomingMilestone[]
  /** The same upcoming milestones grouped by project, uncapped — the dashboard's
   * spotlight shows the focused project's own next steps. */
  milestonesByProject: Record<string, UpcomingMilestone[]>
  /** Issued invoices (drafts stay internal to the studio), newest first. */
  recentInvoices: Invoice[]
  recentDeliverables: RecentDeliverable[]
}

const ATTENTION_RANK: Record<AttentionTone, number> = {
  danger: 0,
  brand: 1,
  warning: 2,
}

function isActive(p: Project): boolean {
  return !p.archived && p.status !== "COMPLETED" && p.status !== "CANCELLED"
}

/** Largest outstanding (sent/overdue) balance, grouped by currency — a client
 * rarely mixes currencies, so the biggest pile is the honest headline. */
function outstandingBalance(invoices: Invoice[]): OverviewStats["outstanding"] {
  const byCurrency = new Map<string, number>()
  for (const inv of invoices) {
    if (inv.status !== "SENT" && inv.status !== "OVERDUE") continue
    byCurrency.set(inv.currency, (byCurrency.get(inv.currency) ?? 0) + inv.amount)
  }
  let top: OverviewStats["outstanding"] = null
  for (const [currency, amount] of byCurrency) {
    if (!top || amount > top.amount) top = { currency, amount }
  }
  return top
}

/** Paid vs outstanding in the client's primary (most-used) currency, plus the
 * single most-pressing unpaid invoice across every currency. Shared with the
 * Invoices page so its summary band and the dashboard card can't drift. */
export function billingSummary(invoices: Invoice[]): BillingSummary {
  const visible = invoices.filter((i) => i.status !== "DRAFT")
  if (visible.length === 0) return null

  const frequency = new Map<string, number>()
  for (const inv of visible) {
    frequency.set(inv.currency, (frequency.get(inv.currency) ?? 0) + 1)
  }
  let currency = visible[0].currency
  let seen = 0
  for (const [code, count] of frequency) {
    if (count > seen) {
      seen = count
      currency = code
    }
  }

  const inCurrency = visible.filter((i) => i.currency === currency)
  const paid = inCurrency
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0)
  const outstanding = inCurrency
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.amount, 0)

  const unpaid = visible
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .sort((a, b) => {
      const da = a.dueDate ?? "9999"
      const db = b.dueDate ?? "9999"
      return da < db ? -1 : da > db ? 1 : 0
    })
  const next = unpaid[0]

  return {
    currency,
    paid,
    outstanding,
    nextDue: next
      ? {
          invoiceNumber: next.invoiceNumber,
          amount: next.amount,
          currency: next.currency,
          dueDate: next.dueDate,
          projectId: next.projectId,
          overdue: next.status === "OVERDUE",
        }
      : null,
  }
}

export function usePortalOverview(): PortalOverview {
  const projectsQ = usePortalProjects()
  const revisionsQ = usePortalRevisions()
  const projects = projectsQ.data ?? []
  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "your project"

  const deliverablesQ = usePortalAllDeliverables()
  const invoicesQ = usePortalAllInvoices()

  const deliverables = deliverablesQ.data ?? []
  const invoices = invoicesQ.data ?? []
  const revisions = revisionsQ.data ?? []

  /* ------------------------------------------------------------- attention */
  const attention: AttentionItem[] = []
  for (const inv of invoices) {
    if (inv.status === "OVERDUE") {
      attention.push({
        id: `inv-${inv.id}`,
        tone: "danger",
        title: `Invoice ${inv.invoiceNumber} is overdue`,
        detail: projectName(inv.projectId),
        href: `/projects/${inv.projectId}`,
        at: inv.dueDate ?? inv.issuedDate ?? inv.createdAt,
      })
    } else if (inv.status === "SENT") {
      attention.push({
        id: `inv-${inv.id}`,
        tone: "warning",
        title: `Invoice ${inv.invoiceNumber} is due`,
        detail: projectName(inv.projectId),
        href: `/projects/${inv.projectId}`,
        at: inv.dueDate ?? inv.issuedDate ?? inv.createdAt,
      })
    }
  }
  for (const d of deliverables) {
    if (d.status !== "READY") continue
    attention.push({
      id: `del-${d.id}`,
      tone: "brand",
      title: `“${d.title}” is ready for your review`,
      detail: projectName(d.projectId),
      href: `/projects/${d.projectId}`,
      at: d.uploadedAt,
    })
  }
  attention.sort((a, b) =>
    ATTENTION_RANK[a.tone] !== ATTENTION_RANK[b.tone]
      ? ATTENTION_RANK[a.tone] - ATTENTION_RANK[b.tone]
      : a.at < b.at
        ? 1
        : -1
  )

  /* -------------------------------------------------------------- activity */
  const activity: ActivityEvent[] = []
  for (const d of deliverables) {
    activity.push({
      id: `a-del-${d.id}`,
      kind: "deliverable",
      title: `New deliverable — ${d.title}`,
      href: `/projects/${d.projectId}`,
      at: d.uploadedAt,
    })
  }
  for (const inv of invoices) {
    if (inv.paidDate) {
      activity.push({
        id: `a-invp-${inv.id}`,
        kind: "invoice-paid",
        title: `Invoice ${inv.invoiceNumber} marked paid`,
        href: `/projects/${inv.projectId}`,
        at: inv.paidDate,
      })
    }
    if (inv.status !== "DRAFT" && inv.issuedDate) {
      activity.push({
        id: `a-invi-${inv.id}`,
        kind: "invoice-issued",
        title: `Invoice ${inv.invoiceNumber} issued`,
        href: `/projects/${inv.projectId}`,
        at: inv.issuedDate,
      })
    }
  }
  for (const r of revisions) {
    activity.push({
      id: `a-rev-${r.id}`,
      kind: "revision-sent",
      title: "Revision request sent",
      href: `/projects/${r.projectId}`,
      at: r.createdAt,
    })
    if (
      (r.status === "APPROVED" || r.status === "DECLINED") &&
      r.updatedAt !== r.createdAt
    ) {
      activity.push({
        id: `a-revd-${r.id}`,
        kind: "revision-decided",
        title: `Revision ${r.status === "APPROVED" ? "approved" : "declined"}`,
        href: `/projects/${r.resultingProjectId ?? r.projectId}`,
        at: r.updatedAt,
      })
    }
  }
  activity.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))

  /* ----------------------------------------------------------------- stats */
  const active = projects.filter(isActive)
  const overallProgress = active.length
    ? Math.round(active.reduce((sum, p) => sum + p.progress, 0) / active.length)
    : 0
  const stats: OverviewStats = {
    activeCount: active.length,
    overallProgress,
    outstanding: outstandingBalance(invoices),
    openRequests: revisions.filter(
      (r) => r.status === "REQUESTED" || r.status === "IN_REVIEW"
    ).length,
  }

  /* -------------------------------------------------------------- milestones */
  const nowIso = new Date().toISOString()
  const byDueDate = (a: UpcomingMilestone, b: UpcomingMilestone) =>
    a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0

  const milestonesByProject: Record<string, UpcomingMilestone[]> = {}
  for (const p of projects) {
    const upcoming = (p.milestones ?? [])
      .filter((m) => m.status !== "COMPLETED" && m.dueDate)
      .map((m) => ({
        id: m.id,
        title: m.title,
        dueDate: m.dueDate as string,
        projectId: p.id,
        projectName: p.name,
        overdue: (m.dueDate as string) < nowIso,
      }))
      .sort(byDueDate)
    if (upcoming.length > 0) milestonesByProject[p.id] = upcoming
  }
  const milestones: UpcomingMilestone[] = Object.values(milestonesByProject)
    .flat()
    .sort(byDueDate)
    .slice(0, 5)

  /* -------------------------------------------------------------- invoices */
  const recentInvoices = invoices
    .filter((i) => i.status !== "DRAFT")
    .sort((a, b) => {
      const da = a.issuedDate ?? a.createdAt
      const db = b.issuedDate ?? b.createdAt
      return da < db ? 1 : da > db ? -1 : 0
    })

  /* ----------------------------------------------------------- recent work */
  const recentDeliverables: RecentDeliverable[] = deliverables
    .filter((d) => d.status === "READY")
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
    .slice(0, 6)
    .map((d) => ({
      id: d.id,
      title: d.title,
      fileUrl: d.fileUrl,
      externalLink: d.externalLink,
      projectId: d.projectId,
      projectName: projectName(d.projectId),
      uploadedAt: d.uploadedAt,
    }))

  return {
    isLoading: projectsQ.isLoading,
    isError: projectsQ.isError,
    detailsLoading:
      revisionsQ.isLoading || deliverablesQ.isLoading || invoicesQ.isLoading,
    projects,
    attention,
    activity: activity.slice(0, 7),
    stats,
    billing: billingSummary(invoices),
    milestones,
    milestonesByProject,
    recentInvoices,
    recentDeliverables,
  }
}

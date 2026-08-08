"use client"

/**
 * Dashboard data, composed client-side from the domain queries (the API has no
 * aggregate/dashboard endpoint). Produces the `DashboardData` shape the existing
 * dashboard components consume.
 *
 * Gaps vs the mock, per the API: no sparkline history or period deltas (no
 * time-series) — KPI cards show live values only; no milestones list (the API
 * has no GET for milestones) — that panel comes through empty; deliverable
 * reviews are portal-only, so "needs attention" is pending revisions + overdue
 * invoices.
 */

import * as React from "react"

import { convert } from "@/lib/mock/currencies"
import { formatMoney } from "@/lib/mock/clients"
import { formatDate } from "@/lib/format"
import { useSiteCurrency } from "@/hooks/use-site-currency"
import { useProjects } from "@/lib/queries/projects-queries"
import { useClients } from "@/lib/queries/clients-queries"
import { useAllInvoices } from "@/lib/queries/invoices-queries"
import { useRevisions } from "@/lib/queries/revisions-queries"
import { revisionTitle } from "@/components/admin/revisions/revisions-table"
import type {
  DashboardData,
  DashboardKpi,
  ActiveProject,
  AttentionItem,
  Phase,
} from "@/lib/mock/dashboard"
import type { Project, ProjectStatus } from "@/lib/api/models"

const NO_DELTA = { label: "", direction: "up" as const, good: true }

const isLive = (p: Project) =>
  !p.archived && p.status !== "COMPLETED" && p.status !== "CANCELLED"

/** Map the API project status to the dashboard's coarse health dot. */
function health(status: ProjectStatus): ActiveProject["status"] {
  if (status === "ON_HOLD") return "at-risk"
  if (status === "PLANNING") return "kickoff"
  return "on-track"
}

/** Rough relative age, e.g. "3d" / "2w". */
function ago(iso: string | null | undefined): string {
  if (!iso) return "—"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "—"
  const days = Math.max(0, Math.round((Date.now() - then) / 86_400_000))
  if (days < 1) return "today"
  if (days < 14) return `${days}d`
  if (days < 60) return `${Math.round(days / 7)}w`
  return `${Math.round(days / 30)}mo`
}

export function useDashboardData(): {
  data: DashboardData | null
  isLoading: boolean
  isError: boolean
} {
  const [display] = useSiteCurrency()
  const projectsQ = useProjects()
  const clientsQ = useClients()
  const invoicesAll = useAllInvoices()
  const revisionsQ = useRevisions()

  const isLoading =
    projectsQ.isLoading || invoicesAll.isLoading || revisionsQ.isLoading
  const isError = projectsQ.isError || revisionsQ.isError

  const data = React.useMemo<DashboardData | null>(() => {
    if (!projectsQ.data) return null

    const projects = projectsQ.data
    const clientName = (id: string) =>
      clientsQ.data?.find((c) => c.id === id)?.company ?? "—"
    const projectName = (id: string) =>
      projects.find((p) => p.id === id)?.name ?? "—"
    const projectClientName = (projectId: string) => {
      const p = projects.find((x) => x.id === projectId)
      return p ? clientName(p.clientId) : "—"
    }

    const invoices = invoicesAll.invoices
    const revisions = revisionsQ.data ?? []

    const live = projects.filter(isLive)
    const outstanding = invoices
      .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
      .reduce((s, i) => s + convert(i.amount, i.currency, display), 0)
    const paid = invoices
      .filter((i) => i.status === "PAID")
      .reduce((s, i) => s + convert(i.amount, i.currency, display), 0)
    const overdue = invoices.filter((i) => i.status === "OVERDUE")
    const pendingRevisions = revisions.filter(
      (r) => r.status === "REQUESTED" || r.status === "IN_REVIEW"
    )
    const needsAction = pendingRevisions.length + overdue.length

    const kpis: DashboardKpi[] = [
      { key: "projects", label: "Active projects", value: String(live.length), bars: [], delta: NO_DELTA, footer: "in flight", href: "/admin/projects", accent: "lime" },
      { key: "revenue", label: "Paid", value: formatMoney(paid, display), bars: [], delta: NO_DELTA, footer: "collected", href: "/admin/invoices", accent: "lime" },
      { key: "outstanding", label: "Outstanding", value: formatMoney(outstanding, display), bars: [], delta: NO_DELTA, footer: "awaiting payment", href: "/admin/invoices", accent: "neutral" },
      { key: "attention", label: "Needs action", value: String(needsAction), bars: [], delta: NO_DELTA, footer: "revisions + overdue", href: "/admin/revisions", accent: needsAction > 0 ? "red" : "neutral" },
    ]

    const activeProjects: ActiveProject[] = live.slice(0, 8).map((p) => ({
      id: p.id,
      name: p.name,
      client: clientName(p.clientId),
      phase: p.phase as Phase,
      progress: p.progress,
      value: formatMoney(p.totalValue, p.currency),
      budget: p.totalValue,
      status: health(p.status),
    }))

    const attention: AttentionItem[] = [
      ...pendingRevisions.map((r) => ({
        id: `rev-${r.id}`,
        kind: "revision" as const,
        client: clientName(r.clientId),
        project: projectName(r.projectId),
        title: revisionTitle(r.description),
        status: r.status === "REQUESTED" ? "Requested" : "In review",
        urgency: (r.status === "REQUESTED" ? "high" : "normal") as "high" | "normal",
        age: ago(r.createdAt),
        action: "Review",
        href: `/admin/revisions/${r.id}`,
      })),
      ...overdue.map((i) => ({
        id: `inv-${i.id}`,
        kind: "invoice" as const,
        client: projectClientName(i.projectId),
        project: projectName(i.projectId),
        title: i.invoiceNumber,
        status: "Overdue",
        urgency: "high" as const,
        age: ago(i.dueDate),
        action: "View",
        href: `/admin/invoices/${i.id}`,
      })),
    ]

    return {
      greetingName: "",
      today: formatDate(new Date().toISOString(), "medium"),
      kpis,
      attention,
      milestones: [], // no GET-milestones endpoint
      projects: activeProjects,
    }
  }, [projectsQ.data, clientsQ.data, invoicesAll.invoices, revisionsQ.data, display])

  return { data, isLoading, isError }
}

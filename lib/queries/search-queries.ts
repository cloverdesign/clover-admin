"use client"

/**
 * Live cross-entity search index for the command palette — composed client-side
 * from the domain queries (clients, projects, invoices, revisions, deliverables,
 * CMS pages) so results always match what the app shows. There's no search
 * endpoint on the API.
 *
 * The per-project fan-outs (invoices, deliverables) are gated behind `enabled`
 * so navigating the app doesn't fan out on every page — they only run while the
 * palette is open.
 */

import * as React from "react"

import { useClients } from "@/lib/queries/clients-queries"
import { useProjects } from "@/lib/queries/projects-queries"
import { useAllInvoices } from "@/lib/queries/invoices-queries"
import { useRevisions } from "@/lib/queries/revisions-queries"
import { useAllDeliverables } from "@/lib/queries/deliverables-queries"
import { usePages } from "@/lib/queries/cms-queries"
import { revisionTitle } from "@/components/admin/revisions/revisions-table"

export type SearchType =
  | "client"
  | "project"
  | "invoice"
  | "revision"
  | "deliverable"
  | "page"

export type SearchEntity = {
  id: string
  type: SearchType
  title: string
  subtitle?: string
  href: string
  /** Lowercased searchable blob (title + related names + status). */
  keywords: string
}

export function useSearchIndex(enabled: boolean): {
  index: SearchEntity[]
  isLoading: boolean
} {
  const clientsQ = useClients()
  const projectsQ = useProjects()
  const revisionsQ = useRevisions()
  const pagesQ = usePages()
  const invoicesAll = useAllInvoices({ enabled })
  const deliverablesAll = useAllDeliverables({ enabled })

  const index = React.useMemo<SearchEntity[]>(() => {
    const clients = clientsQ.data ?? []
    const projects = projectsQ.data ?? []
    const revisions = revisionsQ.data ?? []
    const pages = pagesQ.data ?? []

    const clientName = (id: string) =>
      clients.find((c) => c.id === id)?.company ?? "—"
    const project = (id: string) => projects.find((p) => p.id === id)
    const projectName = (id: string) => project(id)?.name ?? "—"
    const projectClientName = (id: string) => {
      const p = project(id)
      return p ? clientName(p.clientId) : "—"
    }

    const out: SearchEntity[] = []

    for (const c of clients) {
      out.push({
        id: `client-${c.id}`,
        type: "client",
        title: c.company,
        subtitle: [c.name, c.email].filter(Boolean).join(" · "),
        href: `/admin/clients?c=${c.id}`,
        keywords: `${c.company} ${c.name} ${c.email}`.toLowerCase(),
      })
    }

    for (const p of projects) {
      out.push({
        id: `project-${p.id}`,
        type: "project",
        title: p.name,
        subtitle: `${clientName(p.clientId)} · ${p.phase}`,
        href: `/admin/projects/${p.id}`,
        keywords: `${p.name} ${clientName(p.clientId)} ${p.phase} ${p.status}`.toLowerCase(),
      })
    }

    for (const i of invoicesAll.invoices) {
      out.push({
        id: `invoice-${i.id}`,
        type: "invoice",
        title: i.invoiceNumber,
        subtitle: `${projectClientName(i.projectId)} · ${projectName(i.projectId)}`,
        href: `/admin/invoices/${i.id}`,
        keywords: `${i.invoiceNumber} ${projectClientName(i.projectId)} ${projectName(i.projectId)} ${i.status}`.toLowerCase(),
      })
    }

    for (const r of revisions) {
      out.push({
        id: `revision-${r.id}`,
        type: "revision",
        title: revisionTitle(r.description),
        subtitle: `${clientName(r.clientId)} · ${projectName(r.projectId)}`,
        href: `/admin/revisions/${r.id}`,
        keywords: `${r.description} ${clientName(r.clientId)} ${projectName(r.projectId)} ${r.status}`.toLowerCase(),
      })
    }

    for (const d of deliverablesAll.deliverables) {
      out.push({
        id: `deliverable-${d.id}`,
        type: "deliverable",
        title: `${d.title} · v${d.version}`,
        subtitle: `${projectClientName(d.projectId)} · ${projectName(d.projectId)}`,
        href: `/admin/deliverables/${d.id}`,
        keywords: `${d.title} ${projectClientName(d.projectId)} ${projectName(d.projectId)} ${d.status}`.toLowerCase(),
      })
    }

    for (const pg of pages) {
      out.push({
        id: `page-${pg.id}`,
        type: "page",
        title: pg.title,
        subtitle: `/${pg.slug} · ${pg.isPublished ? "Published" : "Draft"}`,
        href: `/admin/cms/pages/${pg.id}`,
        keywords: `${pg.title} ${pg.slug} ${pg.isPublished ? "published" : "draft"}`.toLowerCase(),
      })
    }

    return out
  }, [
    clientsQ.data,
    projectsQ.data,
    revisionsQ.data,
    pagesQ.data,
    invoicesAll.invoices,
    deliverablesAll.deliverables,
  ])

  return {
    index,
    isLoading:
      clientsQ.isLoading ||
      projectsQ.isLoading ||
      (enabled && (invoicesAll.isLoading || deliverablesAll.isLoading)),
  }
}

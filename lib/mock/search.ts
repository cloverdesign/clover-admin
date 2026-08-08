/**
 * A flat, cross-entity search index for the global command palette — clients,
 * their projects, and the open invoices / revisions / deliverables from the
 * dashboard. Built from the same mock modules so results stay in sync. Swap for
 * a real search endpoint later.
 */

import { CLIENTS } from "@/lib/mock/clients"
import { DASHBOARD_DATA } from "@/lib/mock/dashboard"
import { INVOICES } from "@/lib/mock/invoices"
import { REVISIONS, revisionTitle } from "@/lib/mock/revisions"
import { DELIVERABLES } from "@/lib/mock/deliverables"

export type SearchType =
  | "client"
  | "project"
  | "invoice"
  | "revision"
  | "deliverable"

export type SearchEntity = {
  id: string
  type: SearchType
  title: string
  subtitle?: string
  href: string
  /** Lowercased searchable blob (title + related names + status). */
  keywords: string
}

function buildIndex(): SearchEntity[] {
  const out: SearchEntity[] = []

  for (const c of CLIENTS) {
    out.push({
      id: `client-${c.id}`,
      type: "client",
      title: c.company,
      subtitle: [c.name, c.location].filter(Boolean).join(" · "),
      href: `/admin/clients?c=${c.id}`,
      keywords: `${c.company} ${c.name} ${c.email} ${c.location ?? ""}`.toLowerCase(),
    })
    for (const p of c.projects) {
      out.push({
        id: `project-${p.id}`,
        type: "project",
        title: p.name,
        subtitle: `${c.company} · ${p.phase}`,
        href: `/admin/projects/${p.id}`,
        keywords: `${p.name} ${c.company} ${p.phase}`.toLowerCase(),
      })
    }
  }

  for (const i of INVOICES) {
    out.push({
      id: `invoice-${i.id}`,
      type: "invoice",
      title: i.invoiceNumber,
      subtitle: `${i.client} · ${i.projectName}`,
      href: `/admin/invoices/${i.id}`,
      keywords: `${i.invoiceNumber} ${i.client} ${i.projectName} ${i.status}`.toLowerCase(),
    })
  }

  for (const r of REVISIONS) {
    out.push({
      id: `revision-${r.id}`,
      type: "revision",
      title: revisionTitle(r),
      subtitle: `${r.client} · ${r.projectName}`,
      href: `/admin/revisions/${r.id}`,
      keywords: `${r.description} ${r.client} ${r.projectName} ${r.status}`.toLowerCase(),
    })
  }

  for (const d of DELIVERABLES) {
    out.push({
      id: `deliverable-${d.id}`,
      type: "deliverable",
      title: `${d.title} · v${d.version}`,
      subtitle: `${d.client} · ${d.projectName}`,
      href: `/admin/deliverables/${d.id}`,
      keywords: `${d.title} ${d.client} ${d.projectName} ${d.status}`.toLowerCase(),
    })
  }

  for (const a of DASHBOARD_DATA.attention) {
    out.push({
      id: `att-${a.id}`,
      type: a.kind,
      title: a.title,
      subtitle: `${a.client} · ${a.project}`,
      href: a.href,
      keywords: `${a.title} ${a.client} ${a.project} ${a.status}`.toLowerCase(),
    })
  }

  return out
}

export const SEARCH_INDEX: SearchEntity[] = buildIndex()

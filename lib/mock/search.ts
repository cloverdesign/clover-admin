/**
 * A flat, cross-entity search index for the global command palette — clients,
 * their projects, and the open invoices / revisions / deliverables from the
 * dashboard. Built from the same mock modules so results stay in sync. Swap for
 * a real search endpoint later.
 */

import { CLIENTS } from "@/lib/mock/clients"
import { DASHBOARD_DATA } from "@/lib/mock/dashboard"

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
      subtitle: [c.contactName, c.location].filter(Boolean).join(" · "),
      href: `/admin/clients/${c.id}`,
      keywords: `${c.company} ${c.contactName} ${c.email} ${c.location ?? ""}`.toLowerCase(),
    })
    for (const p of c.projects) {
      out.push({
        id: `project-${p.id}`,
        type: "project",
        title: p.name,
        subtitle: `${c.company} · ${p.phase}`,
        href: `/admin/clients/${c.id}`,
        keywords: `${p.name} ${c.company} ${p.phase}`.toLowerCase(),
      })
    }
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

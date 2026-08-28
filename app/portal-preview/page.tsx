"use client"

/**
 * DEV-ONLY design harness for the client portal.
 *
 * The portal's real routes live behind an OTP session against the live API, so
 * they can't be rendered locally. This page mounts the real portal components
 * over a private QueryClient whose cache is pre-seeded with fixtures under the
 * `portal` query keys — no network, no session, same components.
 *
 * `?view=home|projects|project|files|invoices|requests|login` picks the screen.
 * Delete this directory once the portal design work lands.
 */

import * as React from "react"
import { notFound, useSearchParams } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { PortalShell } from "@/components/portal/shell/portal-shell"
import { PortalHome } from "@/components/portal/home/portal-home"
import { PortalProjects } from "@/components/portal/projects/portal-projects"
import { PortalProject } from "@/components/portal/projects/portal-project"
import { PortalRequests } from "@/components/portal/requests/portal-requests"
import { PortalFiles } from "@/components/portal/files/portal-files"
import { PortalBilling } from "@/components/portal/invoices/portal-billing"
import { PortalLogin } from "@/components/portal/auth/portal-login"
import {
  CLIENT,
  PROJECTS,
  PROJECT_DETAIL,
  INVOICES,
  DELIVERABLES,
  REVISIONS,
} from "./fixtures"

function seeded(): QueryClient {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, refetchOnMount: false },
    },
  })
  qc.setQueryData(queryKeys.portal.me, CLIENT)
  qc.setQueryData(queryKeys.portal.projects, PROJECTS)
  qc.setQueryData(queryKeys.portal.revisions, REVISIONS)
  // Client-wide reads the dashboard uses, plus the per-project keys the project
  // view still reads.
  qc.setQueryData(
    queryKeys.portal.invoices,
    PROJECTS.flatMap((p) => INVOICES[p.id] ?? []).filter((i) => i.status !== "DRAFT")
  )
  // Superseded versions included: the Files panel groups them under the current
  // one, and the derivations that only want current work filter on status.
  qc.setQueryData(
    queryKeys.portal.deliverables,
    PROJECTS.flatMap((p) => DELIVERABLES[p.id] ?? [])
  )
  for (const p of PROJECTS) {
    qc.setQueryData(queryKeys.portal.project(p.id), PROJECT_DETAIL[p.id])
    qc.setQueryData(queryKeys.portal.projectInvoices(p.id), INVOICES[p.id] ?? [])
    qc.setQueryData(queryKeys.portal.projectDeliverables(p.id), DELIVERABLES[p.id] ?? [])
  }
  return qc
}

export default function PortalPreviewPage() {
  // Local design tool only — never reachable on a deployed build.
  if (process.env.NODE_ENV === "production") notFound()

  const [qc] = React.useState(seeded)
  const params = useSearchParams()
  const view = params.get("view") ?? "home"
  const id = params.get("id") ?? "p-1"

  const screen =
    view === "projects" ? (
      <PortalProjects />
    ) : view === "project" ? (
      <PortalProject id={id} />
    ) : view === "files" ? (
      <PortalFiles />
    ) : view === "invoices" ? (
      <PortalBilling />
    ) : view === "requests" ? (
      <PortalRequests />
    ) : (
      <PortalHome />
    )

  return (
    <QueryClientProvider client={qc}>
      {view === "login" ? <PortalLogin /> : <PortalShell>{screen}</PortalShell>}
    </QueryClientProvider>
  )
}

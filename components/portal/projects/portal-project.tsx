"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { formatMoney } from "@/lib/mock/clients"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  usePortalProject,
  usePortalProjectDeliverables,
  usePortalProjectInvoices,
  usePortalRevisions,
} from "@/lib/queries/portal-queries"
import { ProjectStatusBadge } from "@/components/portal/parts"
import { PortalMilestones } from "@/components/portal/projects/portal-milestones"
import { PortalRevisions } from "@/components/portal/projects/portal-revisions"
import { DeliverableList } from "@/components/portal/deliverables/deliverable-list"
import { InvoiceList, visibleInvoices } from "@/components/portal/invoices/invoice-list"
import { SegmentedProgress } from "@/components/ui/segmented-progress"

/**
 * Client project view. The brief, phase and timeline lead; files, invoices and
 * revision requests sit behind tabs.
 *
 * This was one page stacking six sections — brief, details, timeline,
 * deliverables, invoices, revisions — so the thing a client most often came for
 * (a file to review) was the furthest down. The tabs make each a destination
 * instead of a scroll depth.
 */
export function PortalProject({ id }: { id: string }) {
  const { data: project, isLoading, isError } = usePortalProject(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !project) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load this project.</p>
        <Button variant="outline" size="sm" render={<Link href="/projects" />}>
          Back to projects
        </Button>
      </div>
    )
  }

  const details: { label: string; value: string }[] = [
    { label: "Stage", value: project.phase || "—" },
    { label: "Type", value: project.type || "—" },
    { label: "Started", value: formatDate(project.startDate) },
    { label: "Target finish", value: formatDate(project.endDate) },
  ]
  if (project.totalValue) {
    details.push({
      label: "Project value",
      value: formatMoney(project.totalValue, project.currency),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <ProjectStatusBadge status={project.status} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {Math.round(project.progress)}%
            </span>
            <span className="text-sm text-muted-foreground">
              {project.phase || "In progress"}
            </span>
          </div>
          <SegmentedProgress value={project.progress} className="h-10 max-w-md" />
        </div>
      </div>

      <ProjectTabs
        projectId={project.id}
        overview={
          <div className="flex flex-col gap-4">
            {project.description && (
              <section className="rounded-2xl border bg-card p-5">
                <h2 className="font-heading text-sm font-medium">Brief</h2>
                <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {project.description}
                </p>
              </section>
            )}

            <section className="rounded-2xl border bg-card p-5">
              <h2 className="font-heading text-sm font-medium">Details</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                {details.map((d) => (
                  <div key={d.label} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{d.label}</dt>
                    <dd className="mt-0.5 truncate text-sm">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <PortalMilestones milestones={project.milestones ?? []} />
          </div>
        }
      />
    </div>
  )
}

const TAB_KEYS = ["overview", "files", "invoices", "requests"] as const
type TabKey = (typeof TAB_KEYS)[number]

function ProjectTabs({
  projectId,
  overview,
}: {
  projectId: string
  overview: React.ReactNode
}) {
  const [tab, setTab] = React.useState<TabKey>("overview")

  const deliverablesQ = usePortalProjectDeliverables(projectId)
  const invoicesQ = usePortalProjectInvoices(projectId)
  const revisionsQ = usePortalRevisions()

  const deliverables = deliverablesQ.data ?? []
  const invoices = invoicesQ.data ?? []
  const requests = (revisionsQ.data ?? []).filter((r) => r.projectId === projectId)

  const counts: Record<TabKey, number | null> = {
    overview: null,
    files: deliverables.filter((d) => d.status === "READY").length,
    invoices: visibleInvoices(invoices).length,
    requests: requests.length,
  }

  const labels: Record<TabKey, string> = {
    overview: "Overview",
    files: "Files",
    invoices: "Invoices",
    requests: "Requests",
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
      <TabsList className="max-w-full overflow-x-auto">
        {TAB_KEYS.map((key) => (
          <TabsTrigger key={key} value={key}>
            {labels[key]}
            {counts[key] ? (
              <span className="ml-1.5 text-xs tabular-nums opacity-60">
                {counts[key]}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">{overview}</TabsContent>

      <TabsContent value="files">
        {deliverablesQ.isLoading ? (
          <TabLoading />
        ) : (
          <DeliverableList
            deliverables={deliverables}
            emptyMessage="Nothing shipped on this project yet."
          />
        )}
      </TabsContent>

      <TabsContent value="invoices">
        {invoicesQ.isLoading ? (
          <TabLoading />
        ) : (
          <InvoiceList
            invoices={invoices}
            emptyMessage="No invoices on this project yet."
          />
        )}
      </TabsContent>

      <TabsContent value="requests">
        <PortalRevisions projectId={projectId} bare />
      </TabsContent>
    </Tabs>
  )
}

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
    </div>
  )
}

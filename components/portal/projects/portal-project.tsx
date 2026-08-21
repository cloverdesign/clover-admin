"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { formatMoney } from "@/lib/mock/clients"
import { Button } from "@/components/ui/button"
import { usePortalProject } from "@/lib/queries/portal-queries"
import { ProjectStatusBadge } from "@/components/portal/parts"
import { PortalMilestones } from "@/components/portal/projects/portal-milestones"
import { PortalDeliverables } from "@/components/portal/projects/portal-deliverables"
import { PortalInvoices } from "@/components/portal/projects/portal-invoices"
import { PortalRevisions } from "@/components/portal/projects/portal-revisions"
import { SegmentedProgress } from "@/components/ui/segmented-progress"

/**
 * Client project view — the read-only overview of one project: brief, current
 * phase, progress, and key details. Deliverables and revision requests attach to
 * this page as their own sections.
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
      <Link
        href="/projects"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        All projects
      </Link>

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

      <PortalDeliverables projectId={project.id} />

      <PortalInvoices projectId={project.id} />

      <PortalRevisions projectId={project.id} />
    </div>
  )
}

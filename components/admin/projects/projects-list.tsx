"use client"

import * as React from "react"
import { Folder01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/mock/clients"
import { convert } from "@/lib/mock/currencies"
import { useSiteCurrency } from "@/hooks/use-site-currency"
import { useProjects } from "@/lib/queries/projects-queries"
import { useClients } from "@/lib/queries/clients-queries"
import type { Project } from "@/lib/api/models"
import { Button } from "@/components/ui/button"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { ProjectsTable } from "@/components/admin/projects/projects-table"

const isLive = (p: Project) =>
  !p.archived && p.status !== "COMPLETED" && p.status !== "CANCELLED"

/**
 * Projects list — a metrics strip over a sortable table. Projects come from the
 * API; client names are composed from the clients list (the Project carries only
 * clientId). Only the table body scrolls.
 */
export function ProjectsList() {
  const [display] = useSiteCurrency()
  const projectsQ = useProjects()
  const clientsQ = useClients()

  const clientName = React.useCallback(
    (id: string) =>
      clientsQ.data?.find((c) => c.id === id)?.company ?? "—",
    [clientsQ.data]
  )

  if (projectsQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (projectsQ.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load projects.</p>
        <Button variant="outline" size="sm" onClick={() => projectsQ.refetch()}>Retry</Button>
      </div>
    )
  }

  const list = [...(projectsQ.data ?? [])]
    .filter((p) => !p.archived)
    .sort((a, b) => Number(isLive(b)) - Number(isLive(a)))

  const active = list.filter(isLive).length
  const onHold = list.filter((p) => p.status === "ON_HOLD").length
  const pipeline = list
    .filter(isLive)
    .reduce((s, p) => s + convert(p.totalValue, p.currency, display), 0)

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
        <Metric label="Projects" value={String(list.length)} />
        <Metric label="Active" value={String(active)} />
        <Metric label="On hold" value={String(onHold)} tone={onHold ? "warning" : undefined} />
        <Metric label="Pipeline" value={formatMoney(pipeline, display)} />
      </div>

      <PanelCard
        icon={Folder01Icon}
        title="All projects"
        className="min-h-0 flex-1"
        bodyClassName="min-h-0 overflow-y-auto px-2"
      >
        {list.length ? (
          <ProjectsTable data={list} clientName={clientName} />
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No projects yet.
          </div>
        )}
      </PanelCard>
    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "warning"
}) {
  return (
    <div className="bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-xl font-semibold tracking-tight tabular-nums",
          tone === "warning" && "text-warning"
        )}
      >
        {value}
      </div>
    </div>
  )
}

"use client"

import { Folder01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/mock/clients"
import { convert } from "@/lib/mock/currencies"
import { PROJECTS, isLive } from "@/lib/mock/projects"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { ProjectsTable } from "@/components/admin/projects/projects-table"

/** Non-archived, live projects first. */
const LIST = [...PROJECTS]
  .filter((p) => !p.archived)
  .sort((a, b) => Number(isLive(b)) - Number(isLive(a)))

/**
 * Projects list — a metrics strip over a clean sortable table (dashboard feel).
 * The timeline column carries each project's milestone track; only the table
 * body scrolls, the page stays put.
 */
export function ProjectsList() {
  const active = LIST.filter(isLive).length
  const onHold = LIST.filter((p) => p.status === "ON_HOLD").length
  const pipeline = LIST.filter(isLive).reduce(
    (s, p) => s + convert(p.value, p.currency, "USD"),
    0
  )

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Summary strip — lifted cells split by hairlines (matches Clients) */}
      <div className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
        <Metric label="Projects" value={String(LIST.length)} />
        <Metric label="Active" value={String(active)} />
        <Metric label="On hold" value={String(onHold)} tone={onHold ? "warning" : undefined} />
        <Metric label="Pipeline" value={formatMoney(pipeline, "USD")} />
      </div>

      {/* Table panel — only the body scrolls */}
      <PanelCard
        icon={Folder01Icon}
        title="All projects"
        className="min-h-0 flex-1"
        bodyClassName="min-h-0 overflow-y-auto px-2"
      >
        <ProjectsTable data={LIST} />
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

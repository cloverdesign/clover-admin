import Link from "next/link"
import {
  Task01Icon,
  Clock01Icon,
  Folder01Icon,
  ChartLineData01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import type { DashboardData } from "@/lib/mock/dashboard"
import { hasDashboardData } from "@/lib/mock/dashboard"
import { StatCard, PanelCard } from "@/components/admin/dashboard/cards"
import {
  AttentionList,
  MilestonesList,
} from "@/components/admin/dashboard/sections"
import { PhaseGauge } from "@/components/admin/dashboard/phase-charts"
import { ProjectsDataTable } from "@/components/admin/dashboard/projects-data-table"
import { DashboardEmpty } from "@/components/admin/dashboard/dashboard-empty"

/**
 * Admin dashboard — table-first layout (§1.4). KPI row → projects data table →
 * a three-up row of needs-attention / upcoming milestones / project phases.
 * Renders the empty state when the studio has no projects. Purely
 * presentational — `DashboardView` composes the live data and passes it in;
 * lib/mock/dashboard is now only the shared types plus a fixture.
 */
export function Dashboard({ data }: { data: DashboardData }) {
  if (!hasDashboardData(data)) return <DashboardEmpty />

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((k) => (
          <StatCard key={k.key} kpi={k} />
        ))}
      </div>

      <PanelCard
        icon={Folder01Icon}
        title="Active projects"
        bodyClassName="px-2"
        action={
          <Button variant="outline" size="sm" render={<Link href="/admin/projects" />}>
            All projects
          </Button>
        }
      >
        <ProjectsDataTable data={data.projects} />
      </PanelCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <PanelCard
          icon={Task01Icon}
          title="Needs attention"
          className="lg:col-span-6"
          bodyClassName="p-0"
          action={
            <Button variant="outline" size="sm" render={<Link href="/admin/revisions" />}>
              View all
            </Button>
          }
        >
          <AttentionList items={data.attention} />
        </PanelCard>

        <PanelCard
          icon={Clock01Icon}
          title="Upcoming milestones"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <MilestonesList items={data.milestones} />
        </PanelCard>

        <PanelCard
          icon={ChartLineData01Icon}
          title="Project phases"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <PhaseGauge projects={data.projects} />
        </PanelCard>
      </div>
    </div>
  )
}

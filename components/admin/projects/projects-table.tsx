"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import { formatMoney } from "@/lib/mock/clients"
import {
  PROJECT_STATUS_LABEL,
  type Project,
  type ProjectStatus,
  type MilestoneStatus,
} from "@/lib/mock/projects"
import { PhaseBadge } from "@/components/admin/dashboard/atoms"

const STATUS_DOT: Record<ProjectStatus, string> = {
  PLANNING: "bg-muted-foreground/50",
  IN_PROGRESS: "bg-lime-500",
  REVIEW: "bg-amber-500",
  COMPLETED: "bg-info",
  ON_HOLD: "bg-warning",
  CANCELLED: "bg-destructive",
}

function StatusCell({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", STATUS_DOT[status])} />
      <span className="text-xs text-muted-foreground">{PROJECT_STATUS_LABEL[status]}</span>
    </span>
  )
}

const MS_DOT: Record<MilestoneStatus, string> = {
  COMPLETED: "bg-primary",
  IN_PROGRESS: "bg-primary/40",
  PENDING: "bg-border",
}

/** The timeline column — a compact milestone track with the next up beneath. */
function MilestoneTrack({ project }: { project: Project }) {
  const next = project.milestones.find((m) => m.status !== "COMPLETED")
  return (
    <div className="w-[200px]">
      <div className="flex items-center">
        {project.milestones.map((m, i) => (
          <React.Fragment key={m.id}>
            {i > 0 && (
              <div
                className={cn(
                  "h-px flex-1",
                  m.status === "COMPLETED" ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full ring-2 ring-card",
                MS_DOT[m.status]
              )}
              title={`${m.title} · ${formatDate(m.dueDate, "compact")}`}
            />
          </React.Fragment>
        ))}
      </div>
      <div className="mt-1.5 truncate text-xs text-muted-foreground">
        {next
          ? `Next: ${next.title} · ${formatDate(next.dueDate, "compact")}`
          : "All milestones complete"}
      </div>
    </div>
  )
}

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableSortHeader column={column} title="Project" />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="text-sm font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.client}</div>
      </div>
    ),
  },
  {
    accessorKey: "phase",
    header: "Phase",
    cell: ({ row }) => <PhaseBadge phase={row.original.phase} />,
  },
  {
    id: "timeline",
    header: "Timeline",
    enableSorting: false,
    cell: ({ row }) => <MilestoneTrack project={row.original} />,
  },
  {
    id: "value",
    accessorFn: (p) => p.totalValue,
    header: ({ column }) => <DataTableSortHeader column={column} title="Value" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatMoney(row.original.totalValue, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableSortHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
]

export function ProjectsTable({ data }: { data: Project[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(p) => router.push(`/admin/projects/${p.id}`)}
    />
  )
}

"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import { formatMoney } from "@/lib/mock/clients"
import { PROJECT_STATUS_LABEL } from "@/lib/mock/projects"
import { Badge } from "@/components/ui/badge"
import type { Project, ProjectStatus } from "@/lib/api/models"

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

/** Column set is built with a client-name resolver composed from the clients
 * list (the API Project carries only clientId). */
function makeColumns(clientName: (id: string) => string): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableSortHeader column={column} title="Project" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="text-sm font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">
            {clientName(row.original.clientId)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phase",
      header: "Phase",
      cell: ({ row }) => <Badge variant="secondary">{row.original.phase}</Badge>,
    },
    {
      id: "timeline",
      header: "Timeline",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.startDate, "month")} — {formatDate(row.original.endDate, "month")}
        </span>
      ),
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
}

export function ProjectsTable({
  data,
  clientName,
}: {
  data: Project[]
  clientName: (id: string) => string
}) {
  const router = useRouter()
  return (
    <DataTable
      columns={makeColumns(clientName)}
      data={data}
      onRowClick={(p) => router.push(`/admin/projects/${p.id}`)}
    />
  )
}

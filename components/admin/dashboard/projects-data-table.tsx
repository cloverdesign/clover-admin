"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import type { ActiveProject } from "@/lib/mock/dashboard"
import {
  PhaseBadge,
  SegmentMeter,
  ProjectStatusDot,
} from "@/components/admin/dashboard/atoms"

const columns: ColumnDef<ActiveProject>[] = [
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
    id: "progress",
    accessorFn: (p) => p.progress,
    header: ({ column }) => <DataTableSortHeader column={column} title="Progress" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <SegmentMeter value={row.original.progress} />
        <span className="w-9 font-mono text-xs text-muted-foreground">
          {row.original.progress}%
        </span>
      </div>
    ),
  },
  {
    id: "value",
    accessorFn: (p) => p.budget,
    header: ({ column }) => <DataTableSortHeader column={column} title="Value" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.value}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableSortHeader column={column} title="Status" />,
    cell: ({ row }) => <ProjectStatusDot status={row.original.status} withLabel />,
  },
]

export function ProjectsDataTable({ data }: { data: ActiveProject[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={() => router.push("/admin/projects")}
    />
  )
}

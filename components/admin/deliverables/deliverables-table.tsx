"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon, File01Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import type { Deliverable } from "@/lib/api/models"

export type DeliverableRefs = {
  projectName: (projectId: string) => string
  clientName: (projectId: string) => string
  /** Whether this row is the current (live) version among its title siblings. */
  isCurrent: (d: Deliverable) => boolean
  hasSiblings: (d: Deliverable) => boolean
}

function makeColumns(refs: DeliverableRefs): ColumnDef<Deliverable>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableSortHeader column={column} title="Deliverable" />,
      cell: ({ row }) => {
        const d = row.original
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <HugeiconsIcon icon={d.externalLink ? LinkSquare02Icon : File01Icon} className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium">{d.title}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">v{d.version}</span>
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {refs.clientName(d.projectId)} · {refs.projectName(d.projectId)}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: "version",
      accessorFn: (d) => d.status,
      header: "Version",
      cell: ({ row }) => {
        const d = row.original
        if (!refs.hasSiblings(d)) return <span className="text-sm text-muted-foreground">—</span>
        return refs.isCurrent(d) ? (
          <Badge variant="success">Current version</Badge>
        ) : (
          <Badge variant="secondary">Older version</Badge>
        )
      },
    },
    {
      id: "uploaded",
      accessorFn: (d) => d.uploadedAt,
      header: ({ column }) => <DataTableSortHeader column={column} title="Uploaded" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.uploadedAt)}</span>
      ),
    },
  ]
}

export function DeliverablesTable({ data, refs }: { data: Deliverable[]; refs: DeliverableRefs }) {
  const router = useRouter()
  return (
    <DataTable
      columns={makeColumns(refs)}
      data={data}
      onRowClick={(d) => router.push(`/admin/deliverables/${d.id}`)}
    />
  )
}

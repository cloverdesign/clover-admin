"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Attachment01Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import {
  REVISION_STATUS_LABEL,
  REVISION_STATUS_VARIANT,
  revisionTitle,
  type RevisionRequest,
} from "@/lib/mock/revisions"

const columns: ColumnDef<RevisionRequest>[] = [
  {
    id: "request",
    accessorFn: (r) => revisionTitle(r),
    header: ({ column }) => <DataTableSortHeader column={column} title="Request" />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{revisionTitle(row.original)}</span>
          {row.original.attachments.length > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Attachment01Icon} className="size-3.5" />
              {row.original.attachments.length}
            </span>
          )}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {row.original.client} · {row.original.projectName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableSortHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={REVISION_STATUS_VARIANT[row.original.status]}>
        {REVISION_STATUS_LABEL[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: "timeframe",
    header: "Timeframe",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.targetTimeframe ?? "—"}</span>
    ),
  },
  {
    id: "requested",
    accessorFn: (r) => r.createdAt,
    header: ({ column }) => <DataTableSortHeader column={column} title="Requested" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
]

export function RevisionsTable({ data }: { data: RevisionRequest[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(r) => router.push(`/admin/revisions/${r.id}`)}
    />
  )
}

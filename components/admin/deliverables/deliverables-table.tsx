"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon, File01Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import {
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_VARIANT,
  reviewFor,
  versionBadge,
  type Deliverable,
} from "@/lib/mock/deliverables"

const columns: ColumnDef<Deliverable>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableSortHeader column={column} title="Deliverable" />,
    cell: ({ row }) => {
      const d = row.original
      return (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HugeiconsIcon
              icon={d.externalLink ? LinkSquare02Icon : File01Icon}
              className="size-4"
            />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">{d.title}</span>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                v{d.version}
              </span>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {d.client} · {d.projectName}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableSortHeader column={column} title="Version" />,
    cell: ({ row }) => {
      const badge = versionBadge(row.original)
      if (!badge) return <span className="text-sm text-muted-foreground">—</span>
      return <Badge variant={badge.variant}>{badge.label}</Badge>
    },
  },
  {
    id: "review",
    accessorFn: (d) => reviewFor(d.id)?.status ?? "",
    header: "Review",
    cell: ({ row }) => {
      const review = reviewFor(row.original.id)
      if (!review) {
        return <span className="text-sm text-muted-foreground">—</span>
      }
      return (
        <Badge variant={REVIEW_STATUS_VARIANT[review.status]}>
          {REVIEW_STATUS_LABEL[review.status]}
        </Badge>
      )
    },
  },
  {
    id: "uploaded",
    accessorFn: (d) => d.uploadedAt,
    header: ({ column }) => <DataTableSortHeader column={column} title="Uploaded" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.uploadedAt)}
      </span>
    ),
  },
]

export function DeliverablesTable({ data }: { data: Deliverable[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(d) => router.push(`/admin/deliverables/${d.id}`)}
    />
  )
}

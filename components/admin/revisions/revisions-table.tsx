"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Attachment01Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import { REVISION_STATUS_LABEL, REVISION_STATUS_VARIANT } from "@/lib/mock/revisions"
import type { RevisionRequest } from "@/lib/api/models"

/** Derive a short title from the first sentence of the description (the API has
 * no title field). */
export function revisionTitle(description: string): string {
  const first = description.split(/(?<=[.!?])\s/)[0].trim()
  return first.length > 64 ? first.slice(0, 61).trimEnd() + "…" : first
}

export type RevisionRefs = {
  clientName: (clientId: string) => string
  projectName: (projectId: string) => string
}

function makeColumns(refs: RevisionRefs): ColumnDef<RevisionRequest>[] {
  return [
    {
      id: "request",
      accessorFn: (r) => revisionTitle(r.description),
      header: ({ column }) => <DataTableSortHeader column={column} title="Request" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{revisionTitle(row.original.description)}</span>
            {row.original.attachments.length > 0 && (
              <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                <HugeiconsIcon icon={Attachment01Icon} className="size-3.5" />
                {row.original.attachments.length}
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {refs.clientName(row.original.clientId)} · {refs.projectName(row.original.projectId)}
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
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
  ]
}

export function RevisionsTable({ data, refs }: { data: RevisionRequest[]; refs: RevisionRefs }) {
  const router = useRouter()
  return (
    <DataTable
      columns={makeColumns(refs)}
      data={data}
      onRowClick={(r) => router.push(`/admin/revisions/${r.id}`)}
    />
  )
}

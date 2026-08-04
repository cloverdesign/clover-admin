"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  formatFull,
  type Invoice,
} from "@/lib/mock/invoices"

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "number",
    header: ({ column }) => <DataTableSortHeader column={column} title="Invoice" />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-mono text-sm font-medium">{row.original.number}</div>
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
      <Badge variant={INVOICE_STATUS_VARIANT[row.original.status]}>
        {INVOICE_STATUS_LABEL[row.original.status]}
      </Badge>
    ),
  },
  {
    id: "issued",
    accessorFn: (i) => i.ageDays,
    header: ({ column }) => <DataTableSortHeader column={column} title="Issued" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.issued}</span>
    ),
  },
  {
    accessorKey: "due",
    header: "Due",
    cell: ({ row }) => (
      <span
        className={cn(
          "text-sm",
          row.original.status === "OVERDUE" ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {row.original.due}
      </span>
    ),
  },
  {
    id: "amount",
    accessorFn: (i) => i.amount,
    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Amount" className="justify-end" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono text-sm font-medium">
        {formatFull(row.original.amount, row.original.currency)}
      </div>
    ),
  },
]

export function InvoicesTable({ data }: { data: Invoice[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(i) => router.push(`/admin/invoices/${i.id}`)}
    />
  )
}

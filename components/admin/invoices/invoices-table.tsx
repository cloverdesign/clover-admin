"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_VARIANT, formatFull } from "@/lib/mock/invoices"
import type { Invoice } from "@/lib/api/models"

/** Name resolvers composed from the projects + clients lists (the API Invoice
 * carries only projectId). */
export type InvoiceRefs = {
  projectName: (projectId: string) => string
  clientName: (projectId: string) => string
}

function makeColumns(refs: InvoiceRefs): ColumnDef<Invoice>[] {
  return [
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => <DataTableSortHeader column={column} title="Invoice" />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-mono text-sm font-medium">{row.original.invoiceNumber}</div>
          <div className="truncate text-xs text-muted-foreground">
            {refs.clientName(row.original.projectId)} · {refs.projectName(row.original.projectId)}
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
      accessorFn: (i) => i.issuedDate ?? "",
      header: ({ column }) => <DataTableSortHeader column={column} title="Issued" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.issuedDate)}</span>
      ),
    },
    {
      accessorKey: "due",
      header: "Due",
      cell: ({ row }) => (
        <span className={cn("text-sm", row.original.status === "OVERDUE" ? "text-destructive" : "text-muted-foreground")}>
          {formatDate(row.original.dueDate)}
        </span>
      ),
    },
    {
      id: "amount",
      accessorFn: (i) => i.amount,
      header: ({ column }) => <DataTableSortHeader column={column} title="Amount" className="justify-end" />,
      cell: ({ row }) => (
        <div className="text-right font-mono text-sm font-medium">
          {formatFull(row.original.amount, row.original.currency)}
        </div>
      ),
    },
  ]
}

export function InvoicesTable({ data, refs }: { data: Invoice[]; refs: InvoiceRefs }) {
  const router = useRouter()
  return (
    <DataTable
      columns={makeColumns(refs)}
      data={data}
      onRowClick={(i) => router.push(`/admin/invoices/${i.id}`)}
    />
  )
}

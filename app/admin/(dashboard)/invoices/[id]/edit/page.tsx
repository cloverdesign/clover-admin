import type { Metadata } from "next"

import { EditInvoicePage } from "@/components/admin/invoices/edit-invoice/edit-invoice-page"

export const metadata: Metadata = {
  title: "Edit invoice — Clover Admin",
}

export default async function EditInvoiceRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditInvoicePage id={id} />
}

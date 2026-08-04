import type { Metadata } from "next"

import { getInvoice } from "@/lib/mock/invoices"
import { EditInvoicePage } from "@/components/admin/invoices/edit-invoice/edit-invoice-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const invoice = getInvoice(id)
  return {
    title: invoice ? `Edit ${invoice.number} — Clover Admin` : "Edit invoice — Clover Admin",
  }
}

export default async function EditInvoiceRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditInvoicePage id={id} />
}

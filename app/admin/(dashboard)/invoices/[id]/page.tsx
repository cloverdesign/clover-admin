import type { Metadata } from "next"

import { getInvoice } from "@/lib/mock/invoices"
import { InvoiceDetail } from "@/components/admin/invoices/invoice-detail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const invoice = getInvoice(id)
  return {
    title: invoice ? `${invoice.invoiceNumber} — Clover Admin` : "Invoice — Clover Admin",
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <InvoiceDetail id={id} />
}

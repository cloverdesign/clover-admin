import type { Metadata } from "next"

import { InvoiceDetail } from "@/components/admin/invoices/invoice-detail"

export const metadata: Metadata = {
  title: "Invoice — Clover Admin",
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <InvoiceDetail id={id} />
}

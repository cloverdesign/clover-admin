import type { Metadata } from "next"

import { NewInvoicePage } from "@/components/admin/invoices/new-invoice/new-invoice-page"

export const metadata: Metadata = {
  title: "New invoice — Clover Admin",
}

export default async function NewInvoiceRoute({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const { project } = await searchParams
  return <NewInvoicePage projectId={project} />
}

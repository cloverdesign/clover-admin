import type { Metadata } from "next"

import { InvoicesList } from "@/components/admin/invoices/invoices-list"

export const metadata: Metadata = {
  title: "Invoices — Clover Admin",
}

export default function InvoicesPage() {
  return <InvoicesList />
}

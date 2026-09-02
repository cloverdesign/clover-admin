import type { Metadata } from "next"

import { PortalBilling } from "@/components/portal/invoices/portal-billing"

export const metadata: Metadata = {
  title: "Invoices — Clover Portal",
}

export default function PortalInvoicesPage() {
  return <PortalBilling />
}

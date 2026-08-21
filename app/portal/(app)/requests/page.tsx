import type { Metadata } from "next"

import { PortalRequests } from "@/components/portal/requests/portal-requests"

export const metadata: Metadata = {
  title: "Revision requests — Clover Portal",
}

export default function PortalRequestsPage() {
  return <PortalRequests />
}

import type { Metadata } from "next"

import { DeliverablesList } from "@/components/admin/deliverables/deliverables-list"

export const metadata: Metadata = {
  title: "Deliverables — Clover Admin",
}

export default function DeliverablesPage() {
  return <DeliverablesList />
}

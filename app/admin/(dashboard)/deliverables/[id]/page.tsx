import type { Metadata } from "next"

import { DeliverableDetail } from "@/components/admin/deliverables/deliverable-detail"

export const metadata: Metadata = {
  title: "Deliverable — Clover Admin",
}

export default async function DeliverableRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DeliverableDetail id={id} />
}

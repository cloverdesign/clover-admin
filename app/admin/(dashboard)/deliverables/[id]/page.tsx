import type { Metadata } from "next"

import { getDeliverable } from "@/lib/mock/deliverables"
import { DeliverableDetail } from "@/components/admin/deliverables/deliverable-detail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const deliverable = getDeliverable(id)
  return {
    title: deliverable
      ? `${deliverable.title} — Clover Admin`
      : "Deliverable — Clover Admin",
  }
}

export default async function DeliverableRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DeliverableDetail id={id} />
}

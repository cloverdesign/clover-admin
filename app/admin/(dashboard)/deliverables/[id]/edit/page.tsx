import type { Metadata } from "next"

import { getDeliverable } from "@/lib/mock/deliverables"
import { EditDeliverablePage } from "@/components/admin/deliverables/edit-deliverable/edit-deliverable-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const deliverable = getDeliverable(id)
  return {
    title: deliverable
      ? `Edit ${deliverable.title} — Clover Admin`
      : "Edit deliverable — Clover Admin",
  }
}

export default async function EditDeliverableRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditDeliverablePage id={id} />
}

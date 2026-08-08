import type { Metadata } from "next"

import { EditDeliverablePage } from "@/components/admin/deliverables/edit-deliverable/edit-deliverable-page"

export const metadata: Metadata = {
  title: "Edit deliverable — Clover Admin",
}

export default async function EditDeliverableRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditDeliverablePage id={id} />
}

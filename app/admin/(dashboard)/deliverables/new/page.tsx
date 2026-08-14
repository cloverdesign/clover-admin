import type { Metadata } from "next"

import { NewDeliverablePage } from "@/components/admin/deliverables/new-deliverable/new-deliverable-page"

export const metadata: Metadata = {
  title: "New deliverable — Clover Admin",
}

export default async function NewDeliverableRoute({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const { project } = await searchParams
  return <NewDeliverablePage projectId={project} />
}

import type { Metadata } from "next"

import { RevisionDetail } from "@/components/admin/revisions/revision-detail"

export const metadata: Metadata = {
  title: "Revision request — Clover Admin",
}

export default async function RevisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <RevisionDetail id={id} />
}
